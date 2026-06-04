/**
 * Sender Blocklist API handler
 * Allows users to block specific senders on a per-alias basis
 */

import { authenticateRequest } from './auth.js';

const MAX_BLOCKS_PER_ALIAS = 50;
const MAX_EMAIL_LENGTH = 254;

export async function handleBlocklist(request, env, path) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    // GET /api/blocklist/:aliasId — list blocked senders for an alias
    const listMatch = path.match(/^\/api\/blocklist\/([a-f0-9-]+)$/i);
    if (method === 'GET' && listMatch) {
        return listBlocked(userId, listMatch[1], env);
    }

    // POST /api/blocklist/:aliasId — add a sender to blocklist
    const addMatch = path.match(/^\/api\/blocklist\/([a-f0-9-]+)$/i);
    if (method === 'POST' && addMatch) {
        return addBlocked(request, userId, addMatch[1], env);
    }

    // DELETE /api/blocklist/:aliasId/:blockId — remove a sender from blocklist
    const deleteMatch = path.match(/^\/api\/blocklist\/([a-f0-9-]+)\/([a-f0-9-]+)$/i);
    if (method === 'DELETE' && deleteMatch) {
        return removeBlocked(userId, deleteMatch[1], deleteMatch[2], env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

/**
 * Check if a sender is blocked for a given alias (used by email handler)
 */
export async function isSenderBlocked(aliasId, senderEmail, env) {
    const normalizedSender = senderEmail.toLowerCase().trim();
    
    const blocked = await env.DB.prepare(
        'SELECT id FROM sender_blocklist WHERE alias_id = ? AND sender_email = ?'
    ).bind(aliasId, normalizedSender).first();

    return !!blocked;
}

async function listBlocked(userId, aliasId, env) {
    // Verify ownership
    const alias = await env.DB.prepare(
        'SELECT id FROM aliases WHERE id = ? AND user_id = ?'
    ).bind(aliasId, userId).first();

    if (!alias) {
        return Response.json({ error: 'Alias not found' }, { status: 404 });
    }

    const { results } = await env.DB.prepare(
        'SELECT id, sender_email, created_at FROM sender_blocklist WHERE alias_id = ? ORDER BY created_at DESC'
    ).bind(aliasId).all();

    return Response.json({
        blocked: results.map(b => ({
            id: b.id,
            senderEmail: b.sender_email,
            createdAt: b.created_at,
        })),
        count: results.length,
    });
}

async function addBlocked(request, userId, aliasId, env) {
    // Verify ownership
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
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const senderEmail = (body.senderEmail || '').toLowerCase().trim();

    if (!senderEmail || senderEmail.length > MAX_EMAIL_LENGTH) {
        return Response.json({ error: 'Invalid sender email' }, { status: 400 });
    }

    // Basic email format check
    if (!senderEmail.includes('@') || senderEmail.length < 3) {
        return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check limit
    const countResult = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM sender_blocklist WHERE alias_id = ?'
    ).bind(aliasId).first();

    if (countResult && countResult.count >= MAX_BLOCKS_PER_ALIAS) {
        return Response.json(
            { error: `Maximum ${MAX_BLOCKS_PER_ALIAS} blocked senders per alias` },
            { status: 403 }
        );
    }

    // Check for duplicate
    const existing = await env.DB.prepare(
        'SELECT id FROM sender_blocklist WHERE alias_id = ? AND sender_email = ?'
    ).bind(aliasId, senderEmail).first();

    if (existing) {
        return Response.json({ error: 'Sender already blocked' }, { status: 409 });
    }

    const id = crypto.randomUUID();
    await env.DB.prepare(
        'INSERT INTO sender_blocklist (id, alias_id, sender_email, created_at) VALUES (?, ?, ?, ?)'
    ).bind(id, aliasId, senderEmail, new Date().toISOString()).run();

    return Response.json({
        blocked: { id, senderEmail, createdAt: new Date().toISOString() },
    }, { status: 201 });
}

async function removeBlocked(userId, aliasId, blockId, env) {
    // Verify ownership through alias
    const alias = await env.DB.prepare(
        'SELECT id FROM aliases WHERE id = ? AND user_id = ?'
    ).bind(aliasId, userId).first();

    if (!alias) {
        return Response.json({ error: 'Alias not found' }, { status: 404 });
    }

    const result = await env.DB.prepare(
        'DELETE FROM sender_blocklist WHERE id = ? AND alias_id = ?'
    ).bind(blockId, aliasId).run();

    if (result.meta.changes === 0) {
        return Response.json({ error: 'Block entry not found' }, { status: 404 });
    }

    return Response.json({ success: true });
}
