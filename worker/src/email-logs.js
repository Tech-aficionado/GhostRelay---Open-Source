/**
 * Email Logs API handler
 * Exposes forwarding history per alias to the frontend
 */

import { authenticateRequest } from './auth.js';

export async function handleEmailLogs(request, env, path) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    // GET /api/email-logs — list recent logs across all aliases
    if (method === 'GET' && path === '/api/email-logs') {
        return listAllLogs(userId, env, request);
    }

    // GET /api/email-logs/:aliasId — list logs for a specific alias
    const aliasMatch = path.match(/^\/api\/email-logs\/([a-f0-9-]+)$/i);
    if (method === 'GET' && aliasMatch) {
        return listAliasLogs(userId, aliasMatch[1], env, request);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

/**
 * List recent email logs across all of the user's aliases
 */
async function listAllLogs(userId, env, request) {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

    const { results } = await env.DB.prepare(`
        SELECT 
            l.id, l.alias_id, l.sender, l.subject, l.forwarded_at,
            a.address as alias_address, a.label as alias_label
        FROM email_logs l
        JOIN aliases a ON l.alias_id = a.id
        WHERE a.user_id = ?
        ORDER BY l.forwarded_at DESC
        LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();

    const countResult = await env.DB.prepare(`
        SELECT COUNT(*) as total
        FROM email_logs l
        JOIN aliases a ON l.alias_id = a.id
        WHERE a.user_id = ?
    `).bind(userId).first();

    return Response.json({
        logs: results.map(l => ({
            id: l.id,
            aliasId: l.alias_id,
            aliasAddress: l.alias_address,
            aliasLabel: l.alias_label,
            sender: l.sender,
            subject: l.subject,
            forwardedAt: l.forwarded_at,
        })),
        total: countResult?.total || 0,
        limit,
        offset,
    });
}

/**
 * List email logs for a specific alias (owned by user)
 */
async function listAliasLogs(userId, aliasId, env, request) {
    // Verify ownership
    const alias = await env.DB.prepare(
        'SELECT id FROM aliases WHERE id = ? AND user_id = ?'
    ).bind(aliasId, userId).first();

    if (!alias) {
        return Response.json({ error: 'Alias not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

    const { results } = await env.DB.prepare(`
        SELECT id, sender, subject, forwarded_at
        FROM email_logs
        WHERE alias_id = ?
        ORDER BY forwarded_at DESC
        LIMIT ? OFFSET ?
    `).bind(aliasId, limit, offset).all();

    return Response.json({
        logs: results.map(l => ({
            id: l.id,
            sender: l.sender,
            subject: l.subject,
            forwardedAt: l.forwarded_at,
        })),
        count: results.length,
    });
}
