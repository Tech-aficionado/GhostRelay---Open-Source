/**
 * Wildcard/Catch-All Rules CRUD handler
 * Allows users to create patterns like *-shopping that auto-create aliases
 */

import { authenticateRequest } from './auth.js';

const MAX_WILDCARDS = 10;
const MAX_PATTERN_LENGTH = 50;
const PATTERN_REGEX = /^[a-z0-9.*_-]+$/;

export async function handleWildcards(request, env, path) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    // GET /api/wildcards
    if (method === 'GET' && path === '/api/wildcards') {
        return listWildcards(userId, env);
    }

    // POST /api/wildcards
    if (method === 'POST' && path === '/api/wildcards') {
        return createWildcard(request, userId, env);
    }

    // PATCH /api/wildcards/:id
    const patchMatch = path.match(/^\/api\/wildcards\/([a-f0-9-]+)$/i);
    if (method === 'PATCH' && patchMatch) {
        return updateWildcard(request, userId, patchMatch[1], env);
    }

    // DELETE /api/wildcards/:id
    const deleteMatch = path.match(/^\/api\/wildcards\/([a-f0-9-]+)$/i);
    if (method === 'DELETE' && deleteMatch) {
        return deleteWildcard(userId, deleteMatch[1], env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

async function listWildcards(userId, env) {
    const { results } = await env.DB.prepare(
        'SELECT id, pattern, label, notes, active, forwarded_count, created_at FROM wildcard_rules WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();

    return Response.json({
        wildcards: results.map(row => ({
            id: row.id,
            pattern: row.pattern,
            label: row.label || '',
            notes: row.notes || '',
            active: Boolean(row.active),
            forwarded: row.forwarded_count,
            createdAt: row.created_at,
        })),
        count: results.length,
        limit: MAX_WILDCARDS,
    });
}

async function createWildcard(request, userId, env) {
    const countResult = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM wildcard_rules WHERE user_id = ?'
    ).bind(userId).first();

    if ((countResult?.count ?? 0) >= MAX_WILDCARDS) {
        return Response.json(
            { error: `Wildcard rule limit reached (${MAX_WILDCARDS}).` },
            { status: 403 }
        );
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const pattern = (body.pattern || '').toLowerCase().trim();

    if (!pattern) {
        return Response.json({ error: 'Pattern is required' }, { status: 400 });
    }

    if (pattern.length > MAX_PATTERN_LENGTH) {
        return Response.json({ error: `Pattern must be ${MAX_PATTERN_LENGTH} chars or less` }, { status: 400 });
    }

    if (!PATTERN_REGEX.test(pattern)) {
        return Response.json({ error: 'Pattern can only contain lowercase letters, numbers, dots, hyphens, underscores, and * wildcard' }, { status: 400 });
    }

    if (!pattern.includes('*')) {
        return Response.json({ error: 'Pattern must include at least one * wildcard' }, { status: 400 });
    }

    // Check for duplicate pattern
    const existing = await env.DB.prepare(
        'SELECT id FROM wildcard_rules WHERE user_id = ? AND pattern = ?'
    ).bind(userId, pattern).first();

    if (existing) {
        return Response.json({ error: 'This pattern already exists' }, { status: 409 });
    }

    const label = (body.label || '').replace(/<[^>]*>/g, '').trim().substring(0, 100);
    const notes = (body.notes || '').replace(/<[^>]*>/g, '').trim().substring(0, 500);

    const id = crypto.randomUUID();
    await env.DB.prepare(
        'INSERT INTO wildcard_rules (id, user_id, pattern, label, notes, active, forwarded_count, created_at) VALUES (?, ?, ?, ?, ?, 1, 0, ?)'
    ).bind(id, userId, pattern, label, notes, new Date().toISOString()).run();

    return Response.json({
        wildcard: {
            id,
            pattern,
            label,
            notes,
            active: true,
            forwarded: 0,
            createdAt: new Date().toISOString(),
        },
    }, { status: 201 });
}

async function updateWildcard(request, userId, wildcardId, env) {
    const rule = await env.DB.prepare(
        'SELECT id FROM wildcard_rules WHERE id = ? AND user_id = ?'
    ).bind(wildcardId, userId).first();

    if (!rule) {
        return Response.json({ error: 'Wildcard rule not found' }, { status: 404 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (typeof body.active === 'boolean') {
        await env.DB.prepare(
            'UPDATE wildcard_rules SET active = ? WHERE id = ? AND user_id = ?'
        ).bind(body.active ? 1 : 0, wildcardId, userId).run();
    }

    if (typeof body.label === 'string') {
        const sanitized = body.label.replace(/<[^>]*>/g, '').trim().substring(0, 100);
        await env.DB.prepare(
            'UPDATE wildcard_rules SET label = ? WHERE id = ? AND user_id = ?'
        ).bind(sanitized, wildcardId, userId).run();
    }

    if (typeof body.notes === 'string') {
        const sanitized = body.notes.replace(/<[^>]*>/g, '').trim().substring(0, 500);
        await env.DB.prepare(
            'UPDATE wildcard_rules SET notes = ? WHERE id = ? AND user_id = ?'
        ).bind(sanitized, wildcardId, userId).run();
    }

    return Response.json({ success: true });
}

async function deleteWildcard(userId, wildcardId, env) {
    const result = await env.DB.prepare(
        'DELETE FROM wildcard_rules WHERE id = ? AND user_id = ?'
    ).bind(wildcardId, userId).run();

    if (result.meta.changes === 0) {
        return Response.json({ error: 'Wildcard rule not found' }, { status: 404 });
    }

    return Response.json({ success: true });
}
