/**
 * User Settings handler
 * Profile settings, data export, and account deletion
 */

import { authenticateRequest } from './auth.js';

export async function handleSettings(request, env, path) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    // GET /api/settings — get user settings
    if (method === 'GET' && path === '/api/settings') {
        return getSettings(userId, env);
    }

    // PATCH /api/settings — update user settings
    if (method === 'PATCH' && path === '/api/settings') {
        let body;
        try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
        return updateSettings(userId, body, env);
    }

    // GET /api/settings/export — export all user data
    if (method === 'GET' && path === '/api/settings/export') {
        return exportData(userId, env);
    }

    // DELETE /api/settings/delete-account — permanently delete account
    if (method === 'DELETE' && path === '/api/settings/delete-account') {
        return deleteAccount(userId, env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

async function getSettings(userId, env) {
    try {
        const user = await env.DB.prepare(
            'SELECT display_name, email_notifications, weekly_report, bounce_alerts FROM users WHERE id = ?'
        ).bind(userId).first();

        return Response.json({
            displayName: user?.display_name || '',
            emailNotifications: user?.email_notifications !== 0,
            weeklyReport: user?.weekly_report === 1,
            bounceAlerts: user?.bounce_alerts !== 0,
        });
    } catch {
        // Columns might not exist yet — return defaults
        return Response.json({
            displayName: '',
            emailNotifications: true,
            weeklyReport: false,
            bounceAlerts: true,
        });
    }
}

async function updateSettings(userId, body, env) {
    const updates = [];
    const bindings = [];

    if (body.displayName !== undefined) {
        const name = String(body.displayName || '').trim().substring(0, 50);
        updates.push('display_name = ?');
        bindings.push(name);
    }

    if (body.emailNotifications !== undefined) {
        updates.push('email_notifications = ?');
        bindings.push(body.emailNotifications ? 1 : 0);
    }

    if (body.weeklyReport !== undefined) {
        updates.push('weekly_report = ?');
        bindings.push(body.weeklyReport ? 1 : 0);
    }

    if (body.bounceAlerts !== undefined) {
        updates.push('bounce_alerts = ?');
        bindings.push(body.bounceAlerts ? 1 : 0);
    }

    if (updates.length === 0) {
        return Response.json({ success: true });
    }

    updates.push('updated_at = ?');
    bindings.push(new Date().toISOString());
    bindings.push(userId);

    await env.DB.prepare(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...bindings).run();

    return Response.json({ success: true });
}

async function exportData(userId, env) {
    // Get user info
    const user = await env.DB.prepare(
        'SELECT id, email, display_name, created_at FROM users WHERE id = ?'
    ).bind(userId).first();

    // Get aliases
    const { results: aliases } = await env.DB.prepare(
        'SELECT id, address, label, notes, category, active, forwarded_count, created_at, expires_at FROM aliases WHERE user_id = ?'
    ).bind(userId).all();

    // Get wildcard rules
    const { results: wildcards } = await env.DB.prepare(
        'SELECT id, pattern, label, notes, active, forwarded_count, created_at FROM wildcard_rules WHERE user_id = ?'
    ).bind(userId).all();

    // Get recent email logs (last 500)
    const { results: logs } = await env.DB.prepare(
        'SELECT l.id, l.sender, l.subject, l.forwarded_at, a.address as alias_address FROM email_logs l JOIN aliases a ON l.alias_id = a.id WHERE a.user_id = ? ORDER BY l.forwarded_at DESC LIMIT 500'
    ).bind(userId).all();

    return Response.json({
        exportedAt: new Date().toISOString(),
        user: {
            id: user?.id,
            email: user?.email,
            displayName: user?.display_name || '',
            createdAt: user?.created_at,
        },
        aliases: aliases || [],
        wildcardRules: wildcards || [],
        emailLogs: logs || [],
    });
}

async function deleteAccount(userId, env) {
    try {
        // Delete in proper order due to foreign keys
        // 1. Email logs (via aliases)
        await env.DB.prepare(
            'DELETE FROM email_logs WHERE alias_id IN (SELECT id FROM aliases WHERE user_id = ?)'
        ).bind(userId).run();

        // 2. Bounces (via aliases)
        await env.DB.prepare(
            'DELETE FROM email_bounces WHERE alias_id IN (SELECT id FROM aliases WHERE user_id = ?)'
        ).bind(userId).run();

        // 3. Alias destinations
        await env.DB.prepare(
            'DELETE FROM alias_destinations WHERE alias_id IN (SELECT id FROM aliases WHERE user_id = ?)'
        ).bind(userId).run();

        // 4. Blocklists (via alias)
        try {
            await env.DB.prepare(
                'DELETE FROM sender_blocklist WHERE alias_id IN (SELECT id FROM aliases WHERE user_id = ?)'
            ).bind(userId).run();
        } catch { /* table might not exist */ }

        // 5. Aliases
        await env.DB.prepare(
            'DELETE FROM aliases WHERE user_id = ?'
        ).bind(userId).run();

        // 6. Wildcard rules
        await env.DB.prepare(
            'DELETE FROM wildcard_rules WHERE user_id = ?'
        ).bind(userId).run();

        // 7. Sessions
        await env.DB.prepare(
            'DELETE FROM sessions WHERE user_id = ?'
        ).bind(userId).run();

        // 8. Push subscriptions
        await env.DB.prepare(
            'DELETE FROM push_subscriptions WHERE user_id = ?'
        ).bind(userId).run();

        // 9. 2FA codes
        try {
            await env.DB.prepare(
                'DELETE FROM two_factor_codes WHERE user_id = ?'
            ).bind(userId).run();
        } catch { /* table might not exist */ }

        // 10. Password reset tokens
        try {
            await env.DB.prepare(
                'DELETE FROM password_reset_tokens WHERE user_id = ?'
            ).bind(userId).run();
        } catch { /* table might not exist */ }

        // 11. User record
        await env.DB.prepare(
            'DELETE FROM users WHERE id = ?'
        ).bind(userId).run();

        return Response.json({ success: true });
    } catch (error) {
        console.error('Account deletion error:', error.message || error);
        return Response.json({ error: 'Failed to delete account. Please contact support.' }, { status: 500 });
    }
}
