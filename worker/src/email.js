/**
 * Email forwarding handler
 * Processes incoming emails via Cloudflare Email Routing
 */

export async function handleEmail(message, env) {
    const recipientAddress = message.to;

    // Look up alias in database
    const alias = await env.DB.prepare(
        'SELECT a.id, a.active, a.user_id, u.email as forward_to FROM aliases a JOIN users u ON a.user_id = u.id WHERE a.address = ?'
    ).bind(recipientAddress).first();

    // If alias doesn't exist, reject the email
    if (!alias) {
        message.setReject('Address not found');
        return;
    }

    // If alias is disabled, reject the email
    if (!alias.active) {
        message.setReject('Address is disabled');
        return;
    }

    // Forward the email to the user's real address
    try {
        await message.forward(alias.forward_to);

        // Increment forwarded counter
        await env.DB.prepare(
            'UPDATE aliases SET forwarded_count = forwarded_count + 1 WHERE id = ?'
        ).bind(alias.id).run();

        // Log the forwarding event
        await env.DB.prepare(
            'INSERT INTO email_logs (id, alias_id, sender, subject, forwarded_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(
            crypto.randomUUID(),
            alias.id,
            message.from,
            message.headers.get('subject') || '(no subject)',
            new Date().toISOString()
        ).run();
    } catch (error) {
        console.error('Failed to forward email:', error);
        message.setReject('Forwarding failed');
    }
}
