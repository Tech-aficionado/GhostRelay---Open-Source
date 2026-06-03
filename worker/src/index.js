/**
 * Email Alias Service - Cloudflare Worker
 * Main entry point and router
 */

import { handleAuth } from './auth.js';
import { handleAliases } from './aliases.js';
import { handleEmail } from './email.js';

export default {
    /**
     * HTTP request handler
     */
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // Handle preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            let response;

            // Route requests
            if (path.startsWith('/api/auth')) {
                response = await handleAuth(request, env, path);
            } else if (path.startsWith('/api/aliases')) {
                response = await handleAliases(request, env, path);
            } else if (path === '/api/health') {
                response = Response.json({ status: 'ok', timestamp: Date.now() });
            } else {
                response = Response.json({ error: 'Not found' }, { status: 404 });
            }

            // Add CORS headers to response
            const newHeaders = new Headers(response.headers);
            Object.entries(corsHeaders).forEach(([key, value]) => {
                newHeaders.set(key, value);
            });

            return new Response(response.body, {
                status: response.status,
                headers: newHeaders,
            });
        } catch (error) {
            console.error('Worker error:', error);
            return Response.json(
                { error: 'Internal server error' },
                { status: 500, headers: corsHeaders }
            );
        }
    },

    /**
     * Email message handler (Cloudflare Email Routing)
     * This handles incoming emails to your aliases
     */
    async email(message, env, ctx) {
        await handleEmail(message, env);
    },
};
