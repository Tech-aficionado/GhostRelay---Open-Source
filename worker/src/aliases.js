/**
 * Alias CRUD operations handler
 */

import { authenticateRequest } from './auth.js';

const MAX_FREE_ALIASES = 5;

export async function handleAliases(request, env, path) {
    // Authenticate
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    // GET /api/aliases - List all aliases
    if (method === 'GET' && path === '/api/aliases') {
        return listAliases(userId, env);
    }

    // POST /api/aliases - Create new alias
    if (method === 'POST' && path === '/api/aliases') {
        return createAlias(request, userId, env);
    }

    // PATCH /api/aliases/:id - Toggle alias active state
    const patchMatch = path.match(/^\/api\/aliases\/([a-zA-Z0-9-]+)$/);
    if (method === 'PATCH' && patchMatch) {
        return updateAlias(request, userId, patchMatch[1], env);
    }

    // DELETE /api/aliases/:id - Delete alias
    const deleteMatch = path.match(/^\/api\/aliases\/([a-zA-Z0-9-]+)$/);
    if (method === 'DELETE' && deleteMatch) {
        return deleteAlias(userId, deleteMatch[1], env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

async function listAliases(userId, env) {
    const { results } = await env.DB.prepare(
        'SELECT id, address, label, active, forwarded_count, created_at FROM aliases WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();

    return Response.json({
        aliases: results.map(row => ({
            id: row.id,
            address: row.address,
            label: row.label,
            active: Boolean(row.active),
            forwarded: row.forwarded_count,
            createdAt: row.created_at,
        })),
        count: results.length,
        limit: MAX_FREE_ALIASES,
    });
}

async function createAlias(request, userId, env) {
    // Check alias count limit
    const { count } = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM aliases WHERE user_id = ?'
    ).bind(userId).first();

    if (count >= MAX_FREE_ALIASES) {
        return Response.json(
            { error: `Free tier limit reached (${MAX_FREE_ALIASES} aliases). Upgrade to Pro for unlimited.` },
            { status: 403 }
        );
    }

    const body = await request.json();
    const label = body.label || '';

    // Generate random alias address
    const aliasLocal = generateRandomAlias();
    const domain = env.EMAIL_DOMAIN || 'ghostrelay.me';
    const address = `${aliasLocal}@${domain}`;

    // Ensure uniqueness
    const existing = await env.DB.prepare(
        'SELECT id FROM aliases WHERE address = ?'
    ).bind(address).first();

    if (existing) {
        // Extremely unlikely with 8 random chars, but handle it
        return createAlias(request, userId, env); // Retry
    }

    const aliasId = crypto.randomUUID();
    await env.DB.prepare(
        'INSERT INTO aliases (id, user_id, address, label, active, forwarded_count, created_at) VALUES (?, ?, ?, ?, 1, 0, ?)'
    ).bind(aliasId, userId, address, label, new Date().toISOString()).run();

    return Response.json({
        alias: {
            id: aliasId,
            address,
            label,
            active: true,
            forwarded: 0,
            createdAt: new Date().toISOString(),
        },
    }, { status: 201 });
}

async function updateAlias(request, userId, aliasId, env) {
    // Verify ownership
    const alias = await env.DB.prepare(
        'SELECT id, active FROM aliases WHERE id = ? AND user_id = ?'
    ).bind(aliasId, userId).first();

    if (!alias) {
        return Response.json({ error: 'Alias not found' }, { status: 404 });
    }

    const body = await request.json();

    if (typeof body.active === 'boolean') {
        await env.DB.prepare(
            'UPDATE aliases SET active = ? WHERE id = ?'
        ).bind(body.active ? 1 : 0, aliasId).run();
    }

    if (typeof body.label === 'string') {
        await env.DB.prepare(
            'UPDATE aliases SET label = ? WHERE id = ?'
        ).bind(body.label, aliasId).run();
    }

    return Response.json({ success: true });
}

async function deleteAlias(userId, aliasId, env) {
    // Verify ownership
    const alias = await env.DB.prepare(
        'SELECT id FROM aliases WHERE id = ? AND user_id = ?'
    ).bind(aliasId, userId).first();

    if (!alias) {
        return Response.json({ error: 'Alias not found' }, { status: 404 });
    }

    await env.DB.prepare(
        'DELETE FROM aliases WHERE id = ?'
    ).bind(aliasId).run();

    return Response.json({ success: true });
}

// ===== Helper =====
function generateRandomAlias() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
}
