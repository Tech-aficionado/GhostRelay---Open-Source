/**
 * Push Notification Subscriptions handler
 * Manages Web Push subscriptions for PWA notifications
 */

import { authenticateRequest } from './auth.js';

export async function handlePush(request, env, path) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    // GET /api/push/vapid-key — return public VAPID key
    if (method === 'GET' && path === '/api/push/vapid-key') {
        return Response.json({
            publicKey: env.VAPID_PUBLIC_KEY || '',
        });
    }

    // POST /api/push/subscribe
    if (method === 'POST' && path === '/api/push/subscribe') {
        return subscribe(request, userId, env);
    }

    // DELETE /api/push/unsubscribe
    if (method === 'DELETE' && path === '/api/push/unsubscribe') {
        return unsubscribe(request, userId, env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

async function subscribe(request, userId, env) {
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return Response.json({ error: 'Invalid push subscription data' }, { status: 400 });
    }

    if (endpoint.length > 2048) {
        return Response.json({ error: 'Endpoint URL too long' }, { status: 400 });
    }

    // Upsert subscription
    await env.DB.prepare(
        'INSERT OR REPLACE INTO push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), userId, endpoint, keys.p256dh, keys.auth, new Date().toISOString()).run();

    return Response.json({ success: true }, { status: 201 });
}

async function unsubscribe(request, userId, env) {
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { endpoint } = body;

    if (!endpoint) {
        return Response.json({ error: 'Endpoint required' }, { status: 400 });
    }

    await env.DB.prepare(
        'DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?'
    ).bind(userId, endpoint).run();

    return Response.json({ success: true });
}
