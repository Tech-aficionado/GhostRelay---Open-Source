/**
 * Email forwarding handler
 * - Receives via Cloudflare Email Routing
 * - Forwards via Resend API with DKIM signing
 * - Detects and records bounces
 * - Handles bounce notification emails (DSN)
 */

import { isSenderBlocked } from './blocklist.js';

const MAX_EMAIL_SIZE = 256 * 1024; // 256KB max email body

// Organization emails that should NOT be used as aliases.
// All mail to these addresses is forwarded to the admin/owner inbox,
// which is configured via the ORG_FORWARD_TO environment variable.
const ORG_EMAILS = [
    'support@ghostrelay.me',
    'sales@ghostrelay.me',
    'legal@ghostrelay.me',
    'privacy@ghostrelay.me',
    'dmarc@ghostrelay.me',
];

export async function handleEmail(message, env) {
    // Validate Resend API key exists
    if (!env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
        message.setReject('Service misconfigured');
        return;
    }

    const recipientAddress = message.to.toLowerCase().trim();
    const senderAddress = message.from;
    const subject = (message.headers.get('subject') || '(no subject)').substring(0, 998);

    // Check if this is a bounce notification (DSN)
    if (isBounceNotification(message)) {
        await handleBounceNotification(message, env);
        return;
    }

    // Intercept organization emails — forward directly to admin, never treat as alias
    if (ORG_EMAILS.includes(recipientAddress)) {
        await forwardOrgEmail(message, env, recipientAddress, senderAddress, subject);
        return;
    }

    // Validate recipient format
    if (!recipientAddress.includes('@') || recipientAddress.length > 254) {
        message.setReject('Invalid address');
        return;
    }

    // Look up alias (direct match first)
    let alias = await env.DB.prepare(
        'SELECT a.id, a.active, a.user_id, a.expires_at, a.max_emails, a.forwarded_count, a.is_temporary, u.email as forward_to FROM aliases a JOIN users u ON a.user_id = u.id WHERE LOWER(a.address) = ?'
    ).bind(recipientAddress).first();

    // If no direct match, try wildcard/catch-all rules
    if (!alias) {
        alias = await matchWildcardAlias(recipientAddress, env);
    }

    if (!alias) {
        message.setReject('Address not found');
        return;
    }

    if (!alias.active) {
        message.setReject('Address is disabled');
        return;
    }

    // Check if alias has expired (temporary alias support)
    if (alias.expires_at && new Date(alias.expires_at) < new Date()) {
        // Auto-disable expired alias
        await env.DB.prepare('UPDATE aliases SET active = 0 WHERE id = ?').bind(alias.id).run();
        message.setReject('Address has expired');
        return;
    }

    // Check if alias has hit its max email limit
    if (alias.max_emails && alias.forwarded_count >= alias.max_emails) {
        await env.DB.prepare('UPDATE aliases SET active = 0 WHERE id = ?').bind(alias.id).run();
        message.setReject('Address has reached its email limit');
        return;
    }

    // Check sender blocklist
    if (await isSenderBlocked(alias.id, senderAddress, env)) {
        message.setReject('Sender blocked');
        return;
    }

    // Read and parse email body (with size limit)
    const rawBody = await readStream(message.raw, MAX_EMAIL_SIZE);
    const { text: emailText, html: emailHtml } = extractBodyParts(rawBody);

    // Sanitize sender name for the From header
    const senderName = sanitizeHeaderValue(extractName(senderAddress));

    // Forward via Resend with DKIM (Resend handles DKIM signing automatically
    // when you verify your domain in their dashboard — SPF + DKIM + DMARC)
    const domain = env.EMAIL_DOMAIN || 'ghostrelay.me';
    const fromAddress = `${recipientAddress.split('@')[0]}@${domain}`;

    // Determine all forwarding destinations
    const destinations = await getForwardingDestinations(alias.id, alias.forward_to, env);

    try {
        // Build forwarded email content
        const forwardedHtml = emailHtml
            ? buildHtmlWrapper(senderAddress, recipientAddress, emailHtml)
            : buildHtml(senderAddress, recipientAddress, emailText);

        const resendPayload = {
            from: `${senderName} via GhostRelay <${fromAddress}>`,
            to: destinations,
            reply_to: senderAddress,
            subject: subject,
            html: forwardedHtml,
            text: emailText || stripHtml(emailHtml || ''),
            headers: {
                // Custom headers for bounce tracking
                'X-GhostRelay-Alias-ID': alias.id,
                'X-GhostRelay-Original-From': senderAddress,
                // List-Unsubscribe for better deliverability
                'List-Unsubscribe': `<mailto:unsubscribe@${domain}?subject=unsubscribe-${alias.id}>`,
            },
        };

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resendPayload),
        });

        if (!res.ok) {
            const errBody = await res.text();
            console.error(`Resend ${res.status}: ${errBody}`);

            // Detect bounce-like failures from Resend API
            if (res.status === 422 || res.status === 400) {
                await recordBounce(env, alias.id, destinations[0], 'hard',
                    `API rejection: ${errBody.substring(0, 200)}`,
                    senderAddress, subject);
            }

            message.setReject('Forwarding failed');
            return;
        }

        // Parse Resend response for email ID (for webhook bounce tracking)
        let resendResponse;
        try {
            resendResponse = await res.clone().json();
        } catch { /* ignore */ }

        // Update stats
        await env.DB.prepare(
            'UPDATE aliases SET forwarded_count = forwarded_count + 1 WHERE id = ?'
        ).bind(alias.id).run();

        await env.DB.prepare(
            'INSERT INTO email_logs (id, alias_id, sender, subject, forwarded_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), alias.id, senderAddress, subject, new Date().toISOString()).run();

        // Retain only the last 1000 logs per user to prevent unbounded growth
        // Runs probabilistically (~10% of the time) to avoid overhead on every email
        if (Math.random() < 0.1) {
            try {
                await env.DB.prepare(`
                    DELETE FROM email_logs WHERE id IN (
                        SELECT l.id FROM email_logs l
                        JOIN aliases a ON l.alias_id = a.id
                        WHERE a.user_id = ?
                        ORDER BY l.forwarded_at DESC
                        LIMIT -1 OFFSET 1000
                    )
                `).bind(alias.user_id).run();
            } catch { /* non-critical — skip silently */ }
        }

        // Send push notifications to user
        await sendPushNotification(env, alias.user_id, {
            title: `New email via ${recipientAddress}`,
            body: `From: ${senderAddress}\n${subject}`,
            tag: alias.id,
        });

    } catch (error) {
        console.error('Forward failed:', error.message || error);
        message.setReject('Forwarding failed');
    }
}

/**
 * Forward organization emails (support@, sales@, legal@, privacy@, dmarc@)
 * directly to the admin inbox without alias lookup.
 */
async function forwardOrgEmail(message, env, recipientAddress, senderAddress, subject) {
    const orgForwardTo = env.ORG_FORWARD_TO;
    if (!orgForwardTo) {
        console.error('ORG_FORWARD_TO not configured — cannot forward organization email');
        message.setReject('Service misconfigured');
        return;
    }

    const rawBody = await readStream(message.raw, MAX_EMAIL_SIZE);
    const { text: emailText, html: emailHtml } = extractBodyParts(rawBody);
    const senderName = sanitizeHeaderValue(extractName(senderAddress));
    const domain = env.EMAIL_DOMAIN || 'ghostrelay.me';
    const fromAddress = `${recipientAddress.split('@')[0]}@${domain}`;

    const forwardedHtml = emailHtml
        ? buildHtmlWrapper(senderAddress, recipientAddress, emailHtml)
        : buildHtml(senderAddress, recipientAddress, emailText);

    try {
        const resendPayload = {
            from: `${senderName} via GhostRelay <${fromAddress}>`,
            to: [orgForwardTo],
            reply_to: senderAddress,
            subject: `[${recipientAddress.split('@')[0]}] ${subject}`,
            html: forwardedHtml,
            text: emailText || stripHtml(emailHtml || ''),
            headers: {
                'X-GhostRelay-Org-Email': recipientAddress,
                'X-GhostRelay-Original-From': senderAddress,
            },
        };

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resendPayload),
        });

        if (!res.ok) {
            const errBody = await res.text();
            console.error(`Org email forward failed (${recipientAddress}): Resend ${res.status}: ${errBody}`);
            message.setReject('Forwarding failed');
            return;
        }

        console.log(`Org email forwarded: ${recipientAddress} from ${senderAddress} -> ${orgForwardTo}`);
    } catch (error) {
        console.error('Org email forward error:', error.message || error);
        message.setReject('Forwarding failed');
    }
}

/**
 * Handle Resend webhook for bounce/complaint notifications
 * Called from the main router for POST /api/webhooks/email-events
 */
export async function handleEmailWebhook(request, env) {
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Verify webhook signature if RESEND_WEBHOOK_SECRET is set
    if (env.RESEND_WEBHOOK_SECRET) {
        const signature = request.headers.get('svix-signature');
        const timestamp = request.headers.get('svix-timestamp');
        const svixId = request.headers.get('svix-id');

        if (!signature || !timestamp || !svixId) {
            return Response.json({ error: 'Missing webhook signature' }, { status: 401 });
        }

        // Validate timestamp is within 5 minutes (prevent replay)
        const webhookTime = parseInt(timestamp) * 1000;
        if (Math.abs(Date.now() - webhookTime) > 300000) {
            return Response.json({ error: 'Webhook timestamp expired' }, { status: 401 });
        }
    }

    const eventType = body.type;
    const data = body.data;

    if (!eventType || !data) {
        return Response.json({ error: 'Invalid event payload' }, { status: 400 });
    }

    // Handle bounce events
    if (eventType === 'email.bounced') {
        await processBounceEvent(data, env);
    }

    // Handle complaint events (user marked as spam)
    if (eventType === 'email.complained') {
        await processComplaintEvent(data, env);
    }

    // Handle delivery failures
    if (eventType === 'email.delivery_delayed') {
        await processSoftBounce(data, env);
    }

    return Response.json({ received: true });
}

// ===== Bounce Processing =====

/**
 * Check if an incoming email is a bounce notification (DSN - Delivery Status Notification)
 */
function isBounceNotification(message) {
    const from = message.from.toLowerCase();
    const contentType = message.headers.get('content-type') || '';
    const subject = (message.headers.get('subject') || '').toLowerCase();

    // Common bounce indicators
    if (from.includes('mailer-daemon') || from.includes('postmaster')) return true;
    if (contentType.includes('delivery-status')) return true;
    if (subject.includes('delivery status notification')) return true;
    if (subject.includes('undeliverable') || subject.includes('undelivered')) return true;
    if (subject.includes('mail delivery failed')) return true;
    if (subject.includes('returned mail')) return true;

    return false;
}

/**
 * Handle DSN (bounce notification) emails received directly
 */
async function handleBounceNotification(message, env) {
    const recipientAddress = message.to.toLowerCase().trim();
    const subject = message.headers.get('subject') || '';

    // Try to find the alias this bounce relates to
    const alias = await env.DB.prepare(
        'SELECT a.id, u.email as forward_to FROM aliases a JOIN users u ON a.user_id = u.id WHERE LOWER(a.address) = ?'
    ).bind(recipientAddress).first();

    if (!alias) return; // Can't associate this bounce

    // Determine bounce type from subject/content
    const subjectLower = subject.toLowerCase();
    let bounceType = 'hard';
    if (subjectLower.includes('delayed') || subjectLower.includes('temporary')) {
        bounceType = 'soft';
    }

    // Read body for reason
    const rawBody = await readStream(message.raw, 32768); // Smaller limit for bounce messages
    const bodyText = extractBody(rawBody);
    const reason = extractBounceReason(bodyText, subject);

    await recordBounce(env, alias.id, alias.forward_to, bounceType, reason, message.from, subject);
}

/**
 * Process a bounce event from Resend webhook
 */
async function processBounceEvent(data, env) {
    const aliasId = extractAliasIdFromHeaders(data);
    const recipientEmail = data.to?.[0] || '';
    const reason = data.bounce?.description || data.bounce?.message || 'Hard bounce';

    if (aliasId) {
        await recordBounce(env, aliasId, recipientEmail, 'hard', reason, '', '');
    }
}

/**
 * Process a complaint event (spam report) from Resend webhook
 */
async function processComplaintEvent(data, env) {
    const aliasId = extractAliasIdFromHeaders(data);
    const recipientEmail = data.to?.[0] || '';

    if (aliasId) {
        await recordBounce(env, aliasId, recipientEmail, 'complaint',
            'Recipient marked email as spam', '', '');
    }
}

/**
 * Process a soft bounce (temporary delivery failure)
 */
async function processSoftBounce(data, env) {
    const aliasId = extractAliasIdFromHeaders(data);
    const recipientEmail = data.to?.[0] || '';
    const reason = data.delayed?.description || 'Temporary delivery failure';

    if (aliasId) {
        await recordBounce(env, aliasId, recipientEmail, 'soft', reason, '', '');
    }
}

/**
 * Extract alias ID from custom headers in webhook data
 */
function extractAliasIdFromHeaders(data) {
    // Resend includes custom headers in webhook payloads
    if (data.headers) {
        for (const header of data.headers) {
            if (header.name === 'X-GhostRelay-Alias-ID') {
                return header.value;
            }
        }
    }
    return null;
}

/**
 * Record a bounce event in the database
 */
async function recordBounce(env, aliasId, recipientEmail, bounceType, reason, originalSender, originalSubject) {
    try {
        await env.DB.prepare(
            'INSERT INTO email_bounces (id, alias_id, recipient_email, bounce_type, bounce_reason, original_sender, original_subject, bounced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
            crypto.randomUUID(),
            aliasId,
            recipientEmail,
            bounceType,
            reason.substring(0, 500),
            originalSender.substring(0, 254),
            originalSubject.substring(0, 200),
            new Date().toISOString()
        ).run();

        // Increment bounce count on alias
        await env.DB.prepare(
            'UPDATE aliases SET bounce_count = COALESCE(bounce_count, 0) + 1 WHERE id = ?'
        ).bind(aliasId).run();

        // Auto-disable alias after 5 hard bounces (deliverability protection)
        const bounceCount = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM email_bounces WHERE alias_id = ? AND bounce_type = 'hard'"
        ).bind(aliasId).first();

        if (bounceCount && bounceCount.count >= 5) {
            await env.DB.prepare(
                'UPDATE aliases SET active = 0 WHERE id = ?'
            ).bind(aliasId).run();
            console.log(`Auto-disabled alias ${aliasId} after 5 hard bounces`);
        }
    } catch (error) {
        console.error('Failed to record bounce:', error.message || error);
    }
}

/**
 * Extract a human-readable bounce reason from DSN body
 */
function extractBounceReason(body, subject) {
    // Look for common bounce reason patterns
    const patterns = [
        /(?:reason|diagnostic)[:\s]*(.{10,200})/i,
        /(?:550|551|552|553|554)\s+(.{10,200})/i,
        /(?:user unknown|mailbox not found|does not exist)(.{0,100})/i,
        /(?:over quota|mailbox full)(.{0,100})/i,
    ];

    for (const pattern of patterns) {
        const match = body.match(pattern);
        if (match) return match[0].trim().substring(0, 300);
    }

    // Fallback to subject
    return subject.substring(0, 200) || 'Delivery failed';
}

// ===== Helpers =====

function extractName(email) {
    const match = email.match(/^"?([^"<]+)"?\s*</);
    if (match) return match[1].trim();
    return email.split('@')[0];
}

function buildHtml(from, alias, body) {
    return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;">
<div style="white-space:pre-wrap;font-size:14px;line-height:1.6;color:#1a1a1a;">${esc(body)}</div>
<div style="margin-top:24px;padding-top:12px;border-top:1px solid #e5e5e5;font-size:11px;color:#999;">
This email was sent to <strong>${esc(alias)}</strong> and forwarded by <a href="https://ghostrelay.me" style="color:#7c3aed;text-decoration:none;">GhostRelay</a>.
Original sender: ${esc(from)}
</div>
</div>`;
}

function esc(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sanitizeHeaderValue(str) {
    return str.replace(/[\r\n\t]/g, '').replace(/[^\x20-\x7E]/g, '').substring(0, 64);
}

async function readStream(stream, maxSize) {
    const reader = stream.getReader();
    const chunks = [];
    let totalSize = 0;
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
            totalSize += value.length;
            if (totalSize > maxSize) {
                reader.cancel();
                break;
            }
            chunks.push(value);
        }
    }
    const total = chunks.reduce((sum, c) => sum + c.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
}

function extractBody(rawBytes) {
    const { text } = extractBodyParts(rawBytes);
    return text;
}

/**
 * Extract both text/plain and text/html parts from a raw email.
 * Returns { text, html } where either may be empty string.
 */
function extractBodyParts(rawBytes) {
    const raw = new TextDecoder().decode(rawBytes);
    const sep = raw.includes('\r\n\r\n') ? '\r\n\r\n' : '\n\n';
    const headerEnd = raw.indexOf(sep);
    if (headerEnd === -1) return { text: '', html: '' };

    const headers = raw.substring(0, headerEnd);
    let body = raw.substring(headerEnd + sep.length);

    const boundaryMatch = headers.match(/boundary="?([^"\r\n;]+)"?/i);
    if (boundaryMatch) {
        const boundary = boundaryMatch[1];
        const parts = body.split('--' + boundary);
        let text = '';
        let html = '';

        for (const part of parts) {
            const partLower = part.toLowerCase();
            const partSep = part.includes('\r\n\r\n') ? '\r\n\r\n' : '\n\n';
            const partStart = part.indexOf(partSep);
            if (partStart === -1) continue;

            const partContent = part.substring(partStart + partSep.length).trim();

            // Handle nested multipart (e.g. multipart/alternative inside multipart/mixed)
            const nestedBoundaryMatch = part.match(/boundary="?([^"\r\n;]+)"?/i);
            if (nestedBoundaryMatch) {
                const nestedParts = partContent.split('--' + nestedBoundaryMatch[1]);
                for (const nested of nestedParts) {
                    const nestedLower = nested.toLowerCase();
                    const nSep = nested.includes('\r\n\r\n') ? '\r\n\r\n' : '\n\n';
                    const nStart = nested.indexOf(nSep);
                    if (nStart === -1) continue;
                    const nestedContent = nested.substring(nStart + nSep.length).trim();

                    if (nestedLower.includes('content-type: text/plain') && !text) {
                        text = decodePartContent(nested, nestedContent).substring(0, 50000);
                    } else if (nestedLower.includes('content-type: text/html') && !html) {
                        html = decodePartContent(nested, nestedContent).substring(0, 100000);
                    }
                }
                continue;
            }

            if (partLower.includes('content-type: text/plain') && !text) {
                text = decodePartContent(part, partContent).substring(0, 50000);
            } else if (partLower.includes('content-type: text/html') && !html) {
                html = decodePartContent(part, partContent).substring(0, 100000);
            }
        }

        return { text, html };
    }

    // Non-multipart: check Content-Type in headers
    const ctLower = headers.toLowerCase();
    if (ctLower.includes('content-type: text/html') || ctLower.includes('content-type:text/html')) {
        return { text: '', html: body.trim().substring(0, 100000) };
    }

    return { text: body.trim().substring(0, 50000), html: '' };
}

/**
 * Decode MIME part content based on Content-Transfer-Encoding
 */
function decodePartContent(partHeaders, content) {
    const headersLower = partHeaders.toLowerCase();

    if (headersLower.includes('content-transfer-encoding: quoted-printable')) {
        return decodeQuotedPrintable(content);
    }
    if (headersLower.includes('content-transfer-encoding: base64')) {
        try {
            return atob(content.replace(/\s/g, ''));
        } catch {
            return content;
        }
    }
    return content;
}

/**
 * Decode quoted-printable encoded content
 */
function decodeQuotedPrintable(str) {
    return str
        .replace(/=\r?\n/g, '') // soft line breaks
        .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Strip HTML tags for plain text fallback
 */
function stripHtml(html) {
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 50000);
}

/**
 * Wrap original HTML email with GhostRelay footer (preserves original rendering)
 */
function buildHtmlWrapper(from, alias, originalHtml) {
    const footer = `<div style="margin-top:24px;padding-top:12px;border-top:1px solid #e5e5e5;font-size:11px;color:#999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
This email was sent to <strong>${esc(alias)}</strong> and forwarded by <a href="https://ghostrelay.me" style="color:#7c3aed;text-decoration:none;">GhostRelay</a>.
Original sender: ${esc(from)}
</div>`;

    // Insert footer before </body> if it exists, otherwise append
    if (originalHtml.toLowerCase().includes('</body>')) {
        return originalHtml.replace(/<\/body>/i, `${footer}</body>`);
    }
    return originalHtml + footer;
}

// ===== Multiple Destinations =====

/**
 * Get all active forwarding destinations for an alias.
 * Falls back to the user's primary email if no custom destinations exist.
 */
async function getForwardingDestinations(aliasId, defaultEmail, env) {
    const { results } = await env.DB.prepare(
        'SELECT email FROM alias_destinations WHERE alias_id = ? AND active = 1'
    ).bind(aliasId).all();

    if (results && results.length > 0) {
        return results.map(r => r.email);
    }

    // Default: forward to user's primary email
    return [defaultEmail];
}

// ===== Wildcard/Catch-All Matching =====

/**
 * Match an incoming email address against wildcard rules.
 * Patterns use * as a wildcard (e.g. '*-shopping' matches 'anything-shopping').
 * Returns an alias-like object if matched, or null.
 */
async function matchWildcardAlias(recipientAddress, env) {
    const localPart = recipientAddress.split('@')[0];
    const domain = recipientAddress.split('@')[1];

    // Get all active wildcard rules
    const { results } = await env.DB.prepare(
        'SELECT wr.id, wr.user_id, wr.pattern, wr.active, wr.forwarded_count, u.email as forward_to FROM wildcard_rules wr JOIN users u ON wr.user_id = u.id WHERE wr.active = 1'
    ).all();

    if (!results || results.length === 0) return null;

    for (const rule of results) {
        if (matchPattern(localPart, rule.pattern)) {
            // Auto-create the alias for tracking (so future emails go through direct lookup)
            const aliasId = crypto.randomUUID();
            const aliasAddress = recipientAddress;

            try {
                await env.DB.prepare(
                    'INSERT OR IGNORE INTO aliases (id, user_id, address, label, notes, active, forwarded_count, created_at) VALUES (?, ?, ?, ?, ?, 1, 0, ?)'
                ).bind(aliasId, rule.user_id, aliasAddress, `Auto: ${rule.pattern}`, `Created by wildcard rule: ${rule.pattern}`, new Date().toISOString()).run();

                // Update wildcard forwarded count
                await env.DB.prepare(
                    'UPDATE wildcard_rules SET forwarded_count = forwarded_count + 1 WHERE id = ?'
                ).bind(rule.id).run();
            } catch (e) {
                // If alias already exists (race condition), look it up
                const existing = await env.DB.prepare(
                    'SELECT a.id, a.active, a.user_id, u.email as forward_to FROM aliases a JOIN users u ON a.user_id = u.id WHERE LOWER(a.address) = ?'
                ).bind(aliasAddress).first();
                if (existing) return existing;
            }

            return {
                id: aliasId,
                active: true,
                user_id: rule.user_id,
                forward_to: rule.forward_to,
                expires_at: null,
                max_emails: null,
                forwarded_count: 0,
                is_temporary: 0,
            };
        }
    }

    return null;
}

/**
 * Match a local part against a wildcard pattern.
 * '*' matches any sequence of characters.
 */
function matchPattern(input, pattern) {
    // Convert wildcard pattern to regex
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const regexStr = '^' + escaped.replace(/\*/g, '.*') + '$';
    try {
        const regex = new RegExp(regexStr, 'i');
        return regex.test(input);
    } catch {
        return false;
    }
}

// ===== Push Notifications =====

/**
 * Send push notification to all of a user's subscribed devices
 */
async function sendPushNotification(env, userId, payload) {
    if (!env.VAPID_PRIVATE_KEY || !env.VAPID_PUBLIC_KEY) return;

    try {
        const { results } = await env.DB.prepare(
            'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?'
        ).bind(userId).all();

        if (!results || results.length === 0) return;

        for (const sub of results) {
            try {
                // Use Web Push protocol via fetch
                await sendWebPush(env, sub, JSON.stringify(payload));
            } catch (err) {
                // If endpoint is gone (410), remove subscription
                if (err.status === 410 || err.status === 404) {
                    await env.DB.prepare(
                        'DELETE FROM push_subscriptions WHERE endpoint = ?'
                    ).bind(sub.endpoint).run();
                }
            }
        }
    } catch (err) {
        console.error('Push notification error:', err.message || err);
    }
}

/**
 * Minimal Web Push implementation for Cloudflare Workers
 */
async function sendWebPush(env, subscription, payload) {
    // For a production implementation, use the web-push protocol with VAPID.
    // This is a simplified version that sends via the push endpoint.
    const res = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'TTL': '86400',
        },
        body: payload,
    });

    if (!res.ok) {
        const err = new Error(`Push failed: ${res.status}`);
        err.status = res.status;
        throw err;
    }
}
