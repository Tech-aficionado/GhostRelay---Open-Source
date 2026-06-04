/**
 * Bounce tracking API handler
 * Exposes bounce data to the frontend dashboard
 */

import { authenticateRequest } from './auth.js';

export async function handleBounces(request, env, path) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    // GET /api/bounces — list all bounces for user's aliases
    if (method === 'GET' && path === '/api/bounces') {
        return listBounces(userId, env);
    }

    // GET /api/bounces/stats — bounce summary stats
    if (method === 'GET' && path === '/api/bounces/stats') {
        return bounceStats(userId, env);
    }

    // PATCH /api/bounces/:id/acknowledge — mark a bounce as acknowledged
    const ackMatch = path.match(/^\/api\/bounces\/([a-f0-9-]+)\/acknowledge$/i);
    if (method === 'PATCH' && ackMatch) {
        return acknowledgeBounce(userId, ackMatch[1], env);
    }

    // DELETE /api/bounces/:id — delete a bounce record
    const deleteMatch = path.match(/^\/api\/bounces\/([a-f0-9-]+)$/i);
    if (method === 'DELETE' && deleteMatch) {
        return deleteBounce(userId, deleteMatch[1], env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

/**
 * List bounces for all of the user's aliases, most recent first
 */
async function listBounces(userId, env) {
    const { results } = await env.DB.prepare(`
        SELECT 
            b.id, b.alias_id, b.recipient_email, b.bounce_type, 
            b.bounce_reason, b.original_sender, b.original_subject, 
            b.bounced_at, b.acknowledged, a.address as alias_address
        FROM email_bounces b
        JOIN aliases a ON b.alias_id = a.id
        WHERE a.user_id = ?
        ORDER BY b.bounced_at DESC
        LIMIT 100
    `).bind(userId).all();

    return Response.json({
        bounces: results.map(b => ({
            id: b.id,
            aliasId: b.alias_id,
            aliasAddress: b.alias_address,
            recipientEmail: b.recipient_email,
            bounceType: b.bounce_type,
            bounceReason: b.bounce_reason,
            originalSender: b.original_sender,
            originalSubject: b.original_subject,
            bouncedAt: b.bounced_at,
            acknowledged: Boolean(b.acknowledged),
        })),
        count: results.length,
    });
}

/**
 * Get aggregate bounce stats for the user
 */
async function bounceStats(userId, env) {
    const stats = await env.DB.prepare(`
        SELECT 
            COUNT(*) as total_bounces,
            SUM(CASE WHEN b.bounce_type = 'hard' THEN 1 ELSE 0 END) as hard_bounces,
            SUM(CASE WHEN b.bounce_type = 'soft' THEN 1 ELSE 0 END) as soft_bounces,
            SUM(CASE WHEN b.bounce_type = 'complaint' THEN 1 ELSE 0 END) as complaints,
            SUM(CASE WHEN b.acknowledged = 0 THEN 1 ELSE 0 END) as unacknowledged
        FROM email_bounces b
        JOIN aliases a ON b.alias_id = a.id
        WHERE a.user_id = ?
    `).bind(userId).first();

    // Get aliases with most bounces
    const { results: topBouncing } = await env.DB.prepare(`
        SELECT a.address, a.id, COUNT(b.id) as bounce_count
        FROM email_bounces b
        JOIN aliases a ON b.alias_id = a.id
        WHERE a.user_id = ?
        GROUP BY a.id
        ORDER BY bounce_count DESC
        LIMIT 5
    `).bind(userId).all();

    return Response.json({
        totalBounces: stats?.total_bounces || 0,
        hardBounces: stats?.hard_bounces || 0,
        softBounces: stats?.soft_bounces || 0,
        complaints: stats?.complaints || 0,
        unacknowledged: stats?.unacknowledged || 0,
        topBouncingAliases: topBouncing.map(a => ({
            id: a.id,
            address: a.address,
            bounceCount: a.bounce_count,
        })),
    });
}

/**
 * Mark a bounce as acknowledged (user has seen it)
 */
async function acknowledgeBounce(userId, bounceId, env) {
    // Verify ownership through alias → user relationship
    const result = await env.DB.prepare(`
        UPDATE email_bounces SET acknowledged = 1 
        WHERE id = ? AND alias_id IN (SELECT id FROM aliases WHERE user_id = ?)
    `).bind(bounceId, userId).run();

    if (result.meta.changes === 0) {
        return Response.json({ error: 'Bounce not found' }, { status: 404 });
    }

    return Response.json({ success: true });
}

/**
 * Delete a bounce record
 */
async function deleteBounce(userId, bounceId, env) {
    const result = await env.DB.prepare(`
        DELETE FROM email_bounces 
        WHERE id = ? AND alias_id IN (SELECT id FROM aliases WHERE user_id = ?)
    `).bind(bounceId, userId).run();

    if (result.meta.changes === 0) {
        return Response.json({ error: 'Bounce not found' }, { status: 404 });
    }

    return Response.json({ success: true });
}
