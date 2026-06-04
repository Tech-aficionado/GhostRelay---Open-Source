/**
 * Alias CRUD operations handler
 * With input validation and security hardening
 */

import { authenticateRequest } from './auth.js';

const MAX_ALIASES = 20;
const MAX_LABEL_LENGTH = 100;
const MAX_NOTES_LENGTH = 500;
const ALIAS_LENGTH = 10; // Longer aliases = harder to guess
const ALIAS_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

// Custom alias validation
const CUSTOM_ALIAS_REGEX = /^[a-z0-9._-]+$/;
const MIN_CUSTOM_ALIAS_LENGTH = 3;
const MAX_CUSTOM_ALIAS_LENGTH = 30;

// Reserved prefixes that cannot be used as custom aliases
const RESERVED_ALIASES = new Set([
    'admin', 'postmaster', 'hostmaster', 'webmaster', 'abuse',
    'noreply', 'no-reply', 'support', 'info', 'contact',
    'security', 'mailer-daemon', 'root', 'www', 'ftp', 'mail',
]);

// UUID v4 format validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function handleAliases(request, env, path) {
    // Authenticate
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    // GET /api/aliases
    if (method === 'GET' && path === '/api/aliases') {
        return listAliases(userId, env);
    }

    // POST /api/aliases
    if (method === 'POST' && path === '/api/aliases') {
        return createAlias(request, userId, env);
    }

    // GET /api/aliases/check-availability?alias=xxx — check if custom alias is available
    if (method === 'GET' && path === '/api/aliases/check-availability') {
        return checkAvailability(request, userId, env);
    }

    // PATCH /api/aliases/:id
    const patchMatch = path.match(/^\/api\/aliases\/([a-f0-9-]+)$/i);
    if (method === 'PATCH' && patchMatch) {
        const aliasId = patchMatch[1];
        if (!UUID_REGEX.test(aliasId)) {
            return Response.json({ error: 'Invalid alias ID' }, { status: 400 });
        }
        return updateAlias(request, userId, aliasId, env);
    }

    // DELETE /api/aliases/:id
    const deleteMatch = path.match(/^\/api\/aliases\/([a-f0-9-]+)$/i);
    if (method === 'DELETE' && deleteMatch) {
        const aliasId = deleteMatch[1];
        if (!UUID_REGEX.test(aliasId)) {
            return Response.json({ error: 'Invalid alias ID' }, { status: 400 });
        }
        return deleteAlias(userId, aliasId, env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

async function listAliases(userId, env) {
    const { results } = await env.DB.prepare(
        'SELECT id, address, label, notes, category, active, forwarded_count, expires_at, max_emails, is_temporary, created_at FROM aliases WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();

    return Response.json({
        aliases: results.map(row => ({
            id: row.id,
            address: row.address,
            label: row.label,
            notes: row.notes || '',
            category: row.category || '',
            active: Boolean(row.active),
            forwarded: row.forwarded_count,
            expiresAt: row.expires_at || null,
            maxEmails: row.max_emails || null,
            isTemporary: Boolean(row.is_temporary),
            createdAt: row.created_at,
        })),
        count: results.length,
        limit: MAX_ALIASES,
    });
}

async function createAlias(request, userId, env) {
    // Check alias count limit
    const countResult = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM aliases WHERE user_id = ?'
    ).bind(userId).first();

    const count = countResult?.count ?? 0;

    if (count >= MAX_ALIASES) {
        return Response.json(
            { error: `Alias limit reached (${MAX_ALIASES}).` },
            { status: 403 }
        );
    }

    // Parse and validate body
    let body;
    try {
        body = await request.json();
    } catch {
        body = {};
    }

    let label = '';
    if (body.label && typeof body.label === 'string') {
        // Sanitize label: strip HTML, limit length
        label = body.label.replace(/<[^>]*>/g, '').trim().substring(0, MAX_LABEL_LENGTH);
    }

    let notes = '';
    if (body.notes && typeof body.notes === 'string') {
        notes = body.notes.replace(/<[^>]*>/g, '').trim().substring(0, MAX_NOTES_LENGTH);
    }

    // Category validation
    const VALID_CATEGORIES = ['', 'shopping', 'social', 'finance', 'work', 'travel', 'other'];
    let category = '';
    if (body.category && typeof body.category === 'string') {
        category = body.category.toLowerCase().trim();
        if (!VALID_CATEGORIES.includes(category)) {
            category = '';
        }
    }

    // Temporary/expiring alias settings
    let expiresAt = null;
    let maxEmails = null;
    let isTemporary = 0;

    if (body.expiresInDays && typeof body.expiresInDays === 'number') {
        const days = Math.min(Math.max(1, Math.floor(body.expiresInDays)), 365);
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        isTemporary = 1;
    }

    if (body.maxEmails && typeof body.maxEmails === 'number') {
        maxEmails = Math.min(Math.max(1, Math.floor(body.maxEmails)), 10000);
        isTemporary = 1;
    }

    // Determine alias address: custom or generated
    const domain = env.EMAIL_DOMAIN || 'ghostrelay.me';
    let finalAddress;
    let finalId = crypto.randomUUID();

    if (body.customAlias && typeof body.customAlias === 'string') {
        // Validate custom alias
        const customAlias = body.customAlias.toLowerCase().trim();

        if (customAlias.length < MIN_CUSTOM_ALIAS_LENGTH) {
            return Response.json(
                { error: `Custom alias must be at least ${MIN_CUSTOM_ALIAS_LENGTH} characters` },
                { status: 400 }
            );
        }

        if (customAlias.length > MAX_CUSTOM_ALIAS_LENGTH) {
            return Response.json(
                { error: `Custom alias must be ${MAX_CUSTOM_ALIAS_LENGTH} characters or less` },
                { status: 400 }
            );
        }

        if (!CUSTOM_ALIAS_REGEX.test(customAlias)) {
            return Response.json(
                { error: 'Custom alias can only contain lowercase letters, numbers, dots, hyphens, and underscores' },
                { status: 400 }
            );
        }

        if (customAlias.startsWith('.') || customAlias.startsWith('-') || customAlias.startsWith('_')) {
            return Response.json(
                { error: 'Custom alias cannot start with a dot, hyphen, or underscore' },
                { status: 400 }
            );
        }

        if (customAlias.endsWith('.') || customAlias.endsWith('-') || customAlias.endsWith('_')) {
            return Response.json(
                { error: 'Custom alias cannot end with a dot, hyphen, or underscore' },
                { status: 400 }
            );
        }

        if (RESERVED_ALIASES.has(customAlias)) {
            return Response.json(
                { error: 'This alias is reserved and cannot be used' },
                { status: 400 }
            );
        }

        finalAddress = `${customAlias}@${domain}`;

        // Check if custom alias is already taken
        const existing = await env.DB.prepare(
            'SELECT id FROM aliases WHERE address = ?'
        ).bind(finalAddress).first();

        if (existing) {
            return Response.json(
                { error: 'This alias is already taken. Please choose a different one.' },
                { status: 409 }
            );
        }
    } else {
        // Generate cryptographically random alias
        const aliasLocal = generateSecureAlias();
        finalAddress = `${aliasLocal}@${domain}`;

        // Ensure uniqueness (retry up to 3 times)
        for (let attempt = 0; attempt < 3; attempt++) {
            const existing = await env.DB.prepare(
                'SELECT id FROM aliases WHERE address = ?'
            ).bind(finalAddress).first();

            if (!existing) break;

            // Collision — regenerate
            finalAddress = `${generateSecureAlias()}@${domain}`;
            finalId = crypto.randomUUID();

            if (attempt === 2) {
                return Response.json(
                    { error: 'Failed to generate unique alias. Please try again.' },
                    { status: 500 }
                );
            }
        }
    }

    await env.DB.prepare(
        'INSERT INTO aliases (id, user_id, address, label, notes, category, active, forwarded_count, expires_at, max_emails, is_temporary, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?, ?)'
    ).bind(finalId, userId, finalAddress, label, notes, category, expiresAt, maxEmails, isTemporary, new Date().toISOString()).run();

    return Response.json({
        alias: {
            id: finalId,
            address: finalAddress,
            label,
            notes,
            category,
            active: true,
            forwarded: 0,
            expiresAt,
            maxEmails,
            isTemporary: Boolean(isTemporary),
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

    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (typeof body.active === 'boolean') {
        await env.DB.prepare(
            'UPDATE aliases SET active = ? WHERE id = ? AND user_id = ?'
        ).bind(body.active ? 1 : 0, aliasId, userId).run();
    }

    if (typeof body.label === 'string') {
        const sanitizedLabel = body.label.replace(/<[^>]*>/g, '').trim().substring(0, MAX_LABEL_LENGTH);
        await env.DB.prepare(
            'UPDATE aliases SET label = ? WHERE id = ? AND user_id = ?'
        ).bind(sanitizedLabel, aliasId, userId).run();
    }

    if (typeof body.notes === 'string') {
        const sanitizedNotes = body.notes.replace(/<[^>]*>/g, '').trim().substring(0, MAX_NOTES_LENGTH);
        await env.DB.prepare(
            'UPDATE aliases SET notes = ? WHERE id = ? AND user_id = ?'
        ).bind(sanitizedNotes, aliasId, userId).run();
    }

    if (typeof body.category === 'string') {
        const VALID_CATEGORIES = ['', 'shopping', 'social', 'finance', 'work', 'travel', 'other'];
        let category = body.category.toLowerCase().trim();
        if (!VALID_CATEGORIES.includes(category)) category = '';
        await env.DB.prepare(
            'UPDATE aliases SET category = ? WHERE id = ? AND user_id = ?'
        ).bind(category, aliasId, userId).run();
    }

    return Response.json({ success: true });
}

async function deleteAlias(userId, aliasId, env) {
    // Verify ownership + delete in one step (prevents TOCTOU)
    const result = await env.DB.prepare(
        'DELETE FROM aliases WHERE id = ? AND user_id = ?'
    ).bind(aliasId, userId).run();

    if (result.meta.changes === 0) {
        return Response.json({ error: 'Alias not found' }, { status: 404 });
    }

    return Response.json({ success: true });
}

/**
 * Check if a custom alias is available
 */
async function checkAvailability(request, userId, env) {
    const url = new URL(request.url);
    const alias = (url.searchParams.get('alias') || '').toLowerCase().trim();

    if (!alias) {
        return Response.json({ error: 'Alias parameter required' }, { status: 400 });
    }

    if (alias.length < MIN_CUSTOM_ALIAS_LENGTH) {
        return Response.json({ available: false, reason: `Must be at least ${MIN_CUSTOM_ALIAS_LENGTH} characters` });
    }

    if (alias.length > MAX_CUSTOM_ALIAS_LENGTH) {
        return Response.json({ available: false, reason: `Must be ${MAX_CUSTOM_ALIAS_LENGTH} characters or less` });
    }

    if (!CUSTOM_ALIAS_REGEX.test(alias)) {
        return Response.json({ available: false, reason: 'Only lowercase letters, numbers, dots, hyphens, underscores' });
    }

    if (alias.startsWith('.') || alias.startsWith('-') || alias.startsWith('_')) {
        return Response.json({ available: false, reason: 'Cannot start with dot, hyphen, or underscore' });
    }

    if (alias.endsWith('.') || alias.endsWith('-') || alias.endsWith('_')) {
        return Response.json({ available: false, reason: 'Cannot end with dot, hyphen, or underscore' });
    }

    if (RESERVED_ALIASES.has(alias)) {
        return Response.json({ available: false, reason: 'This alias is reserved' });
    }

    const domain = env.EMAIL_DOMAIN || 'ghostrelay.me';
    const fullAddress = `${alias}@${domain}`;

    const existing = await env.DB.prepare(
        'SELECT id FROM aliases WHERE address = ?'
    ).bind(fullAddress).first();

    if (existing) {
        return Response.json({ available: false, reason: 'Already taken' });
    }

    // Generate suggestions if unavailable (not needed here since it's available)
    return Response.json({ available: true });
}

// ===== Helper =====

/**
 * Generate cryptographically secure random alias
 * Uses crypto.getRandomValues instead of Math.random
 */
function generateSecureAlias() {
    const bytes = new Uint8Array(ALIAS_LENGTH);
    crypto.getRandomValues(bytes);
    let result = '';
    for (let i = 0; i < ALIAS_LENGTH; i++) {
        result += ALIAS_CHARS[bytes[i] % ALIAS_CHARS.length];
    }
    return result;
}
