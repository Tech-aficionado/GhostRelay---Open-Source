/**
 * Password Reset handler
 * Sends reset link via Resend, validates tokens, updates password
 */

const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const MAX_RESET_REQUESTS_PER_HOUR = 3;
const HASH_ITERATIONS = 100;

export async function handlePasswordReset(request, env, path) {
    const method = request.method;

    // POST /api/auth/forgot-password — request reset link
    if (method === 'POST' && path === '/api/auth/forgot-password') {
        let body;
        try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
        return requestReset(body, env);
    }

    // POST /api/auth/reset-password — use token to set new password
    if (method === 'POST' && path === '/api/auth/reset-password') {
        let body;
        try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
        return resetPassword(body, env);
    }

    // GET /api/auth/verify-reset-token?token=xxx — check if token is valid
    if (method === 'GET' && path === '/api/auth/verify-reset-token') {
        const url = new URL(request.url);
        const token = url.searchParams.get('token');
        return verifyResetToken(token, env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

/**
 * Request a password reset — sends email with reset link
 */
async function requestReset({ email }, env) {
    if (!email || typeof email !== 'string') {
        return Response.json({ error: 'Email required' }, { status: 400 });
    }

    email = email.trim().toLowerCase();

    // Always return success to prevent email enumeration
    const successResponse = Response.json({
        message: 'If an account with that email exists, a reset link has been sent.',
    });

    // Look up user
    const user = await env.DB.prepare(
        'SELECT id, email FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
        return successResponse;
    }

    // Rate limit: max 3 reset requests per hour
    const recentCount = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM password_reset_tokens 
        WHERE user_id = ? AND created_at > datetime('now', '-1 hour')
    `).bind(user.id).first();

    if (recentCount && recentCount.count >= MAX_RESET_REQUESTS_PER_HOUR) {
        return successResponse; // Silently rate-limit
    }

    // Generate reset token
    const token = generateSecureToken();
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY).toISOString();

    await env.DB.prepare(
        'INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), user.id, tokenHash, expiresAt, new Date().toISOString()).run();

    // Send reset email via Resend
    if (env.RESEND_API_KEY) {
        const domain = env.EMAIL_DOMAIN || 'ghostrelay.me';
        const resetUrl = `https://www.ghostrelay.me/dashboard?reset_token=${encodeURIComponent(token)}`;

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
                    subject: 'Reset your GhostRelay password',
                    html: buildResetEmail(resetUrl),
                    text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
                }),
            });
        } catch (error) {
            console.error('Failed to send reset email:', error);
        }
    }

    return successResponse;
}

/**
 * Reset password using the token
 */
async function resetPassword({ token, newPassword }, env) {
    if (!token || typeof token !== 'string') {
        return Response.json({ error: 'Reset token required' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string') {
        return Response.json({ error: 'New password required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
        return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    if (newPassword.length > 128) {
        return Response.json({ error: 'Password too long' }, { status: 400 });
    }

    const tokenHash = await sha256Hex(token);

    const resetEntry = await env.DB.prepare(
        'SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token_hash = ?'
    ).bind(tokenHash).first();

    if (!resetEntry) {
        return Response.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }

    if (resetEntry.used) {
        return Response.json({ error: 'This reset link has already been used' }, { status: 400 });
    }

    if (new Date(resetEntry.expires_at) < new Date()) {
        return Response.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Update password
    const newSalt = crypto.randomUUID();
    const newHash = await hashPassword(newPassword, newSalt);

    await env.DB.prepare(
        'UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?'
    ).bind(newHash, newSalt, new Date().toISOString(), resetEntry.user_id).run();

    // Mark token as used
    await env.DB.prepare(
        'UPDATE password_reset_tokens SET used = 1 WHERE id = ?'
    ).bind(resetEntry.id).run();

    // Revoke all sessions (force re-login)
    await env.DB.prepare(
        'UPDATE sessions SET revoked = 1 WHERE user_id = ?'
    ).bind(resetEntry.user_id).run();

    return Response.json({ success: true, message: 'Password reset successfully. Please log in with your new password.' });
}

/**
 * Verify if a reset token is still valid (for frontend to show/hide form)
 */
async function verifyResetToken(token, env) {
    if (!token || typeof token !== 'string') {
        return Response.json({ valid: false, error: 'Token required' }, { status: 400 });
    }

    const tokenHash = await sha256Hex(token);

    const resetEntry = await env.DB.prepare(
        'SELECT expires_at, used FROM password_reset_tokens WHERE token_hash = ?'
    ).bind(tokenHash).first();

    if (!resetEntry) {
        return Response.json({ valid: false, error: 'Invalid token' });
    }

    if (resetEntry.used) {
        return Response.json({ valid: false, error: 'Token already used' });
    }

    if (new Date(resetEntry.expires_at) < new Date()) {
        return Response.json({ valid: false, error: 'Token expired' });
    }

    return Response.json({ valid: true });
}

// ===== Helpers =====

function buildResetEmail(resetUrl) {
    return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;padding:32px;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="width:48px;height:48px;background:linear-gradient(135deg,#6366f1,#8b5cf6,#f97316);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px;">G</div>
  </div>
  <h1 style="font-size:20px;font-weight:bold;color:#1e293b;text-align:center;margin-bottom:8px;">Reset your password</h1>
  <p style="color:#64748b;text-align:center;font-size:14px;margin-bottom:24px;">Click the button below to set a new password for your GhostRelay account.</p>
  <div style="text-align:center;margin-bottom:24px;">
    <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:#6366f1;color:white;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">Reset Password</a>
  </div>
  <p style="color:#94a3b8;font-size:12px;text-align:center;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
  <p style="color:#94a3b8;font-size:11px;text-align:center;">GhostRelay — Privacy-first email aliasing</p>
</div>`;
}

async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    let data = encoder.encode(salt + password + salt);
    for (let i = 0; i < HASH_ITERATIONS; i++) {
        data = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
    }
    const hashArray = Array.from(data);
    return 'v2:' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSecureToken() {
    const bytes = new Uint8Array(48);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

async function sha256Hex(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
