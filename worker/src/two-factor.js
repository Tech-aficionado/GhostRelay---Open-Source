/**
 * Two-Factor Authentication handler (Email OTP)
 * Sends 6-digit codes via email for enable/disable/login verification
 */

import { authenticateRequest } from './auth.js';

const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_REQUESTS_PER_HOUR = 5;

export async function handleTwoFactor(request, env, path) {
    const method = request.method;

    // POST /api/auth/2fa/send-code — send OTP to user's email
    if (method === 'POST' && path === '/api/auth/2fa/send-code') {
        return sendCode(request, env);
    }

    // POST /api/auth/2fa/enable — verify code and enable 2FA
    if (method === 'POST' && path === '/api/auth/2fa/enable') {
        return enable2FA(request, env);
    }

    // POST /api/auth/2fa/disable — verify code and disable 2FA
    if (method === 'POST' && path === '/api/auth/2fa/disable') {
        return disable2FA(request, env);
    }

    // GET /api/auth/2fa/status — check if 2FA is enabled
    if (method === 'GET' && path === '/api/auth/2fa/status') {
        return get2FAStatus(request, env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

/**
 * Send a 6-digit OTP code to the user's email
 */
async function sendCode(request, env) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try { body = await request.json(); } catch { body = {}; }

    const purpose = body.purpose || 'enable'; // 'enable' | 'disable'
    if (!['enable', 'disable'].includes(purpose)) {
        return Response.json({ error: 'Invalid purpose' }, { status: 400 });
    }

    // Get user email
    let user;
    try {
        user = await env.DB.prepare(
            'SELECT email, two_factor_enabled FROM users WHERE id = ?'
        ).bind(userId).first();
    } catch {
        // Fallback if two_factor_enabled column doesn't exist
        user = await env.DB.prepare(
            'SELECT email FROM users WHERE id = ?'
        ).bind(userId).first();
        if (user) user.two_factor_enabled = 0;
    }

    if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate purpose matches state
    if (purpose === 'enable' && user.two_factor_enabled) {
        return Response.json({ error: '2FA is already enabled' }, { status: 400 });
    }
    if (purpose === 'disable' && !user.two_factor_enabled) {
        return Response.json({ error: '2FA is already disabled' }, { status: 400 });
    }

    // Rate limit: max 5 OTP requests per hour
    try {
        const recentCount = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM two_factor_codes 
            WHERE user_id = ? AND created_at > datetime('now', '-1 hour')
        `).bind(userId).first();

        if (recentCount && recentCount.count >= MAX_OTP_REQUESTS_PER_HOUR) {
            return Response.json({ error: 'Too many code requests. Please wait before trying again.' }, { status: 429 });
        }
    } catch {
        // Table might not exist — skip rate limit check
    }

    // Generate 6-digit code
    const code = generateOTP();
    const codeHash = await sha256Hex(code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY).toISOString();

    try {
        // Invalidate previous unused codes for same purpose
        await env.DB.prepare(
            'UPDATE two_factor_codes SET used = 1 WHERE user_id = ? AND purpose = ? AND used = 0'
        ).bind(userId, purpose).run();

        // Store new code
        await env.DB.prepare(
            'INSERT INTO two_factor_codes (id, user_id, code_hash, purpose, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), userId, codeHash, purpose, expiresAt, new Date().toISOString()).run();
    } catch (error) {
        console.error('2FA code storage error:', error.message || error);
        return Response.json({ error: 'Service not available. Please run the 2FA migration first.' }, { status: 503 });
    }

    // Send code via email
    if (env.RESEND_API_KEY) {
        const domain = env.EMAIL_DOMAIN || 'ghostrelay.me';
        const actionText = purpose === 'enable' ? 'enable two-factor authentication' : 'disable two-factor authentication';

        try {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: `GhostRelay <noreply@${domain}>`,
                    to: [user.email],
                    subject: `Your GhostRelay verification code: ${code}`,
                    html: buildOTPEmail(code, actionText),
                    text: `Your verification code is: ${code}\n\nUse this code to ${actionText}. It expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
                }),
            });
        } catch (error) {
            console.error('Failed to send 2FA code email:', error);
            return Response.json({ error: 'Failed to send verification code' }, { status: 500 });
        }
    }

    return Response.json({
        message: 'Verification code sent to your email',
        expiresIn: OTP_EXPIRY / 1000,
    });
}

/**
 * Verify code and enable 2FA
 */
async function enable2FA(request, env) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const { code } = body;
    if (!code || typeof code !== 'string' || code.length !== 6) {
        return Response.json({ error: 'Invalid code format. Must be 6 digits.' }, { status: 400 });
    }

    // Check current status
    const user = await env.DB.prepare(
        'SELECT two_factor_enabled FROM users WHERE id = ?'
    ).bind(userId).first();

    if (user && user.two_factor_enabled) {
        return Response.json({ error: '2FA is already enabled' }, { status: 400 });
    }

    // Verify code
    const codeHash = await sha256Hex(code);
    const validCode = await env.DB.prepare(
        'SELECT id FROM two_factor_codes WHERE user_id = ? AND code_hash = ? AND purpose = ? AND used = 0 AND expires_at > ?'
    ).bind(userId, codeHash, 'enable', new Date().toISOString()).first();

    if (!validCode) {
        return Response.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Mark code as used
    await env.DB.prepare(
        'UPDATE two_factor_codes SET used = 1 WHERE id = ?'
    ).bind(validCode.id).run();

    // Enable 2FA
    await env.DB.prepare(
        'UPDATE users SET two_factor_enabled = 1, updated_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), userId).run();

    return Response.json({ success: true, message: 'Two-factor authentication enabled' });
}

/**
 * Verify code and disable 2FA
 */
async function disable2FA(request, env) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const { code } = body;
    if (!code || typeof code !== 'string' || code.length !== 6) {
        return Response.json({ error: 'Invalid code format. Must be 6 digits.' }, { status: 400 });
    }

    // Check current status
    const user = await env.DB.prepare(
        'SELECT two_factor_enabled FROM users WHERE id = ?'
    ).bind(userId).first();

    if (user && !user.two_factor_enabled) {
        return Response.json({ error: '2FA is already disabled' }, { status: 400 });
    }

    // Verify code
    const codeHash = await sha256Hex(code);
    const validCode = await env.DB.prepare(
        'SELECT id FROM two_factor_codes WHERE user_id = ? AND code_hash = ? AND purpose = ? AND used = 0 AND expires_at > ?'
    ).bind(userId, codeHash, 'disable', new Date().toISOString()).first();

    if (!validCode) {
        return Response.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Mark code as used
    await env.DB.prepare(
        'UPDATE two_factor_codes SET used = 1 WHERE id = ?'
    ).bind(validCode.id).run();

    // Disable 2FA
    await env.DB.prepare(
        'UPDATE users SET two_factor_enabled = 0, updated_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), userId).run();

    return Response.json({ success: true, message: 'Two-factor authentication disabled' });
}

/**
 * Get 2FA status for current user
 */
async function get2FAStatus(request, env) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await env.DB.prepare(
            'SELECT two_factor_enabled FROM users WHERE id = ?'
        ).bind(userId).first();

        return Response.json({
            enabled: !!(user && user.two_factor_enabled),
        });
    } catch {
        // Column might not exist yet — default to disabled
        return Response.json({ enabled: false });
    }
}

// ===== Helpers =====

function generateOTP() {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    const num = ((array[0] << 16) | (array[1] << 8) | array[2]) % 1000000;
    return num.toString().padStart(6, '0');
}

async function sha256Hex(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function buildOTPEmail(code, actionText) {
    return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;padding:32px;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="width:48px;height:48px;background:linear-gradient(135deg,#6366f1,#8b5cf6,#f97316);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px;">G</div>
  </div>
  <h1 style="font-size:20px;font-weight:bold;color:#1e293b;text-align:center;margin-bottom:8px;">Verification Code</h1>
  <p style="color:#64748b;text-align:center;font-size:14px;margin-bottom:24px;">Use this code to ${actionText}:</p>
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;padding:16px 32px;background:#f1f5f9;border-radius:12px;letter-spacing:8px;font-size:32px;font-weight:bold;color:#1e293b;font-family:monospace;">${code}</div>
  </div>
  <p style="color:#94a3b8;font-size:12px;text-align:center;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
  <p style="color:#94a3b8;font-size:11px;text-align:center;">GhostRelay — Privacy-first email aliasing</p>
</div>`;
}
