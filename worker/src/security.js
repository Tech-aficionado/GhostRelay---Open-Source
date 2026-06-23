/**
 * Security handler
 * Security score calculation + revoke-all-sessions
 */

import { authenticateRequest } from './auth.js';

export async function handleSecurity(request, env, path) {
    const method = request.method;

    // GET /api/security/score — compute security score
    if (method === 'GET' && path === '/api/security/score') {
        return getSecurityScore(request, env);
    }

    // POST /api/auth/sessions/revoke-all — revoke all other sessions
    if (method === 'POST' && path === '/api/auth/sessions/revoke-all') {
        return revokeAllOtherSessions(request, env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

/**
 * Calculate security score based on account factors:
 * - Has a strong password (assumed if registered) +20
 * - 2FA enabled +30
 * - Account age > 7 days (established account) +10
 * - Active session count <= 3 (fewer sessions = less risk) +15
 * - No bounced emails (account health) +10
 * - Has at least one alias (using the service) +15
 */
async function getSecurityScore(request, env) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await env.DB.prepare(
            'SELECT created_at, two_factor_enabled FROM users WHERE id = ?'
        ).bind(userId).first();

        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        let score = 0;
        const factors = [];

        // Base score: has account with password (+20)
        score += 20;
        factors.push({ label: 'Password set', points: 20, achieved: true });

        // 2FA enabled (+30)
        const has2FA = !!(user.two_factor_enabled);
        if (has2FA) {
            score += 30;
        }
        factors.push({ label: 'Two-factor authentication', points: 30, achieved: has2FA });

        // Account age > 7 days (+10)
        const accountAge = Date.now() - new Date(user.created_at).getTime();
        const isEstablished = accountAge > 7 * 24 * 60 * 60 * 1000;
        if (isEstablished) {
            score += 10;
        }
        factors.push({ label: 'Established account (7+ days)', points: 10, achieved: isEstablished });

        // Active sessions <= 3 (+15)
        let fewSessions = true;
        try {
            const sessionCount = await env.DB.prepare(
                'SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND revoked = 0 AND expires_at > ?'
            ).bind(userId, new Date().toISOString()).first();
            fewSessions = (sessionCount?.count || 0) <= 3;
        } catch { /* sessions table might not exist */ }
        if (fewSessions) {
            score += 15;
        }
        factors.push({ label: 'Limited active sessions (≤3)', points: 15, achieved: fewSessions });

        // No unacknowledged bounces (+10)
        let noBounces = true;
        try {
            const bounceCount = await env.DB.prepare(`
                SELECT COUNT(*) as count FROM email_bounces eb 
                JOIN aliases a ON eb.alias_id = a.id 
                WHERE a.user_id = ? AND eb.acknowledged = 0
            `).bind(userId).first();
            noBounces = (bounceCount?.count || 0) === 0;
        } catch { /* bounces table might not exist */ }
        if (noBounces) {
            score += 10;
        }
        factors.push({ label: 'No unresolved bounces', points: 10, achieved: noBounces });

        // Has at least one alias (+15)
        let hasAliases = false;
        try {
            const aliasCount = await env.DB.prepare(
                'SELECT COUNT(*) as count FROM aliases WHERE user_id = ?'
            ).bind(userId).first();
            hasAliases = (aliasCount?.count || 0) > 0;
        } catch { /* unlikely */ }
        if (hasAliases) {
            score += 15;
        }
        factors.push({ label: 'Using email aliases', points: 15, achieved: hasAliases });

        // Determine rating
        let rating;
        if (score >= 90) rating = 'Excellent';
        else if (score >= 70) rating = 'Good';
        else if (score >= 50) rating = 'Fair';
        else rating = 'Needs Improvement';

        return Response.json({ score, maxScore: 100, rating, factors });
    } catch (error) {
        console.error('Security score error:', error.message || error);
        // Fallback: return a basic score if the query fails (missing columns)
        return Response.json({
            score: 20,
            maxScore: 100,
            rating: 'Fair',
            factors: [
                { label: 'Password set', points: 20, achieved: true },
                { label: 'Two-factor authentication', points: 30, achieved: false },
                { label: 'Established account (7+ days)', points: 10, achieved: false },
                { label: 'Limited active sessions (≤3)', points: 15, achieved: true },
                { label: 'No unresolved bounces', points: 10, achieved: true },
                { label: 'Using email aliases', points: 15, achieved: false },
            ],
        });
    }
}

/**
 * Revoke all sessions except the current one
 */
async function revokeAllOtherSessions(request, env) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get current session ID from the access token
        const token = request.headers.get('Authorization')?.substring(7)?.trim();
        const payload = await decodeTokenPayload(token);

        const currentSessionId = payload?.sid || null;

        let result;
        if (currentSessionId) {
            // Revoke all except current
            result = await env.DB.prepare(
                'UPDATE sessions SET revoked = 1 WHERE user_id = ? AND id != ? AND revoked = 0'
            ).bind(userId, currentSessionId).run();
        } else {
            // No current session ID available, revoke all
            result = await env.DB.prepare(
                'UPDATE sessions SET revoked = 1 WHERE user_id = ? AND revoked = 0'
            ).bind(userId).run();
        }

        return Response.json({
            success: true,
            revokedCount: result.meta.changes || 0,
            message: `Revoked ${result.meta.changes || 0} other session(s)`,
        });
    } catch (error) {
        console.error('Revoke all sessions error:', error.message || error);
        return Response.json({ error: 'Failed to revoke sessions' }, { status: 500 });
    }
}

/**
 * Decode token payload (without verification — just to extract session ID)
 */
async function decodeTokenPayload(token) {
    try {
        if (!token || typeof token !== 'string') return null;
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        return JSON.parse(atob(parts[0]));
    } catch {
        return null;
    }
}
