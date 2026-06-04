/**
 * Multiple Forwarding Destinations handler
 * Allows an alias to forward to multiple email addresses (team use case)
 */

import { authenticateRequest } from './auth.js';

const MAX_DESTINATIONS_PER_ALIAS = 5;
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export async function handleDestinations(request, env, path) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    // GET /api/aliases/:aliasId/destinations
    const listMatch = path.match(/^\/api\/aliases\/([a-f0-9-]+)\/destinations$/i);
    if (method === 'GET' && listMatch) {
        return listDestinations(userId, listMatch[1], env);
    }

    // POST /api/aliases/:aliasId/destinations
    if (method === 'POST' && listMatch) {
        return addDestination(request, userId, listMatch[1], env);
    }

    // DELETE /api/aliases/:aliasId/destinations/:destId
    const deleteMatch = path.match(/^\/api\/aliases\/([a-f0-9-]+)\/destinations\/([a-f0-9-]+)$/i);
    if (method === 'DELETE' && deleteMatch) {
        return removeDestination(userId, deleteMatch[1], deleteMatch[2], env);
    }

    // PATCH /api/aliases/:aliasId/destinations/:destId
    const patchMatch = path.match(/^\/api\/aliases\/([a-f0-9-]+)\/destinations\/([a-f0-9-]+)$/i);
    if (method === 'PATCH' && patchMatch) {
        return toggleDestination(request, userId, patchMatch[1], patchMatch[2], env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

async function listDestinations(userId, aliasId, env) {
    // Verify alias ownership
    const alias = await env.DB.prepare(
        'SELECT id FROM aliases WHERE id = ? AND user_id = ?'
    ).bind(aliasId, userId).first();

    if (!alias) {
        return Response.json({ error: 'Alias not found' }, { status: 404 });
    }

    const { results } = await env.DB.prepare(
        'SELECT id, email, active, created_at FROM alias_destinations WHERE alias_id = ? ORDER BY created_at ASC'
    ).bind(aliasId).all();

    // Also get the user's primary email as the default destination
    const user = await env.DB.prepare(
        'SELECT email FROM users WHERE id = ?'
    ).bind(userId).first();

    return Response.json({
        destinations: results.map(row => ({
            id: row.id,
            email: row.email,
            active: Boolean(row.active),
            createdAt: row.created_at,
        })),
        primaryEmail: user?.email || '',
        count: results.length,
        limit: MAX_DESTINATIONS_PER_ALIAS,
    });
}

async function addDestination(request, userId, aliasId, env) {
    // Verify alias ownership
    const alias = await env.DB.prepare(
        'SELECT id FROM aliases WHERE id = ? AND user_id = ?'
    ).bind(aliasId, userId).first();

    if (!alias) {
        return Response.json({ error: 'Alias not found' }, { status: 404 });
    }

    // Check destination count
    const countResult = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM alias_destinations WHERE alias_id = ?'
    ).bind(aliasId).first();

    if ((countResult?.count ?? 0) >= MAX_DESTINATIONS_PER_ALIAS) {
        return Response.json(
            { error: `Maximum ${MAX_DESTINATIONS_PER_ALIAS} destinations per alias` },
            { status: 403 }
        );
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const email = (body.email || '').trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
        return Response.json({ error: 'Valid email address required' }, { status: 400 });
    }

    if (email.length > 254) {
        return Response.json({ error: 'Email too long' }, { status: 400 });
    }

    // Prevent adding the domain's own addresses as destinations (loop prevention)
    const domain = env.EMAIL_DOMAIN || 'ghostrelay.me';
    if (email.endsWith(`@${domain}`)) {
        return Response.json({ error: 'Cannot forward to another GhostRelay alias' }, { status: 400 });
    }

    // Check for duplicate
    const existing = await env.DB.prepare(
        'SELECT id FROM alias_destinations WHERE alias_id = ? AND email = ?'
    ).bind(aliasId, email).first();

    if (existing) {
        return Response.json({ error: 'This destination already exists' }, { status: 409 });
    }

    const id = crypto.randomUUID();
    await env.DB.prepare(
        'INSERT INTO alias_destinations (id, alias_id, email, active, created_at) VALUES (?, ?, ?, 1, ?)'
    ).bind(id, aliasId, email, new Date().toISOString()).run();

    return Response.json({
        destination: {
            id,
            email,
            active: true,
            createdAt: new Date().toISOString(),
        },
    }, { status: 201 });
}

async function removeDestination(userId, aliasId, destId, env) {
    // Verify alias ownership
    const alias = await env.DB.prepare(
        'SELECT id FROM aliases WHERE id = ? AND user_id = ?'
    ).bind(aliasId, userId).first();

    if (!alias) {
        return Response.json({ error: 'Alias not found' }, { status: 404 });
    }

    const result = await env.DB.prepare(
        'DELETE FROM alias_destinations WHERE id = ? AND alias_id = ?'
    ).bind(destId, aliasId).run();

    if (result.meta.changes === 0) {
        return Response.json({ error: 'Destination not found' }, { status: 404 });
    }

    return Response.json({ success: true });
}

async function toggleDestination(request, userId, aliasId, destId, env) {
    // Verify alias ownership
    const alias = await env.DB.prepare(
        'SELECT id FROM aliases WHERE id = ? AND user_id = ?'
    ).bind(aliasId, userId).first();

    if (!alias) {
        return Response.json({ error: 'Alias not found' }, { status: 404 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (typeof body.active !== 'boolean') {
        return Response.json({ error: 'active (boolean) required' }, { status: 400 });
    }

    const result = await env.DB.prepare(
        'UPDATE alias_destinations SET active = ? WHERE id = ? AND alias_id = ?'
    ).bind(body.active ? 1 : 0, destId, aliasId).run();

    if (result.meta.changes === 0) {
        return Response.json({ error: 'Destination not found' }, { status: 404 });
    }

    return Response.json({ success: true });
}
