/**
 * Usage Analytics API handler
 * Provides aggregated forwarding data for charts and insights
 */

import { authenticateRequest } from './auth.js';

export async function handleAnalytics(request, env, path) {
    const userId = await authenticateRequest(request, env);
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    // GET /api/analytics/overview — general stats
    if (method === 'GET' && path === '/api/analytics/overview') {
        return getOverview(userId, env);
    }

    // GET /api/analytics/volume — forwarding volume over time (last 30 days)
    if (method === 'GET' && path === '/api/analytics/volume') {
        return getVolume(userId, env, request);
    }

    // GET /api/analytics/top-aliases — most active aliases
    if (method === 'GET' && path === '/api/analytics/top-aliases') {
        return getTopAliases(userId, env);
    }

    // GET /api/analytics/busiest-days — busiest days of the week
    if (method === 'GET' && path === '/api/analytics/busiest-days') {
        return getBusiestDays(userId, env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

async function getOverview(userId, env) {
    // Total aliases, active aliases, total forwarded
    const aliasStats = await env.DB.prepare(`
        SELECT 
            COUNT(*) as total_aliases,
            SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active_aliases,
            SUM(forwarded_count) as total_forwarded
        FROM aliases WHERE user_id = ?
    `).bind(userId).first();

    // Emails in last 24h
    const last24h = await env.DB.prepare(`
        SELECT COUNT(*) as count
        FROM email_logs l
        JOIN aliases a ON l.alias_id = a.id
        WHERE a.user_id = ? AND l.forwarded_at > datetime('now', '-1 day')
    `).bind(userId).first();

    // Emails in last 7 days
    const last7d = await env.DB.prepare(`
        SELECT COUNT(*) as count
        FROM email_logs l
        JOIN aliases a ON l.alias_id = a.id
        WHERE a.user_id = ? AND l.forwarded_at > datetime('now', '-7 days')
    `).bind(userId).first();

    // Unique senders last 30 days
    const uniqueSenders = await env.DB.prepare(`
        SELECT COUNT(DISTINCT l.sender) as count
        FROM email_logs l
        JOIN aliases a ON l.alias_id = a.id
        WHERE a.user_id = ? AND l.forwarded_at > datetime('now', '-30 days')
    `).bind(userId).first();

    return Response.json({
        totalAliases: aliasStats?.total_aliases || 0,
        activeAliases: aliasStats?.active_aliases || 0,
        totalForwarded: aliasStats?.total_forwarded || 0,
        last24h: last24h?.count || 0,
        last7d: last7d?.count || 0,
        uniqueSenders30d: uniqueSenders?.count || 0,
    });
}

async function getVolume(userId, env, request) {
    const url = new URL(request.url);
    const days = Math.min(parseInt(url.searchParams.get('days') || '30'), 90);

    const { results } = await env.DB.prepare(`
        SELECT 
            DATE(l.forwarded_at) as date,
            COUNT(*) as count
        FROM email_logs l
        JOIN aliases a ON l.alias_id = a.id
        WHERE a.user_id = ? AND l.forwarded_at > datetime('now', '-' || ? || ' days')
        GROUP BY DATE(l.forwarded_at)
        ORDER BY date ASC
    `).bind(userId, days).all();

    return Response.json({
        volume: results.map(r => ({
            date: r.date,
            count: r.count,
        })),
        days,
    });
}

async function getTopAliases(userId, env) {
    const { results } = await env.DB.prepare(`
        SELECT 
            a.id, a.address, a.label, a.forwarded_count,
            COUNT(l.id) as recent_count
        FROM aliases a
        LEFT JOIN email_logs l ON l.alias_id = a.id AND l.forwarded_at > datetime('now', '-30 days')
        WHERE a.user_id = ?
        GROUP BY a.id
        ORDER BY recent_count DESC
        LIMIT 10
    `).bind(userId).all();

    return Response.json({
        aliases: results.map(a => ({
            id: a.id,
            address: a.address,
            label: a.label,
            totalForwarded: a.forwarded_count,
            recentCount: a.recent_count,
        })),
    });
}

async function getBusiestDays(userId, env) {
    // SQLite strftime %w = day of week (0=Sunday, 6=Saturday)
    const { results } = await env.DB.prepare(`
        SELECT 
            CAST(strftime('%w', l.forwarded_at) AS INTEGER) as day_of_week,
            COUNT(*) as count
        FROM email_logs l
        JOIN aliases a ON l.alias_id = a.id
        WHERE a.user_id = ? AND l.forwarded_at > datetime('now', '-30 days')
        GROUP BY day_of_week
        ORDER BY day_of_week ASC
    `).bind(userId).all();

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Fill in all 7 days (some may have 0)
    const fullWeek = dayNames.map((name, i) => {
        const found = results.find(r => r.day_of_week === i);
        return { day: name, dayIndex: i, count: found?.count || 0 };
    });

    return Response.json({ days: fullWeek });
}
