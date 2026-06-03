/**
 * Authentication handler
 * Uses simple JWT-like tokens with Web Crypto API
 */

const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function handleAuth(request, env, path) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await request.json();

    if (path === '/api/auth/register') {
        return register(body, env);
    } else if (path === '/api/auth/login') {
        return login(body, env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
}

async function register({ email, password }, env) {
    if (!email || !password) {
        return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (password.length < 8) {
        return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check if user exists
    const existing = await env.DB.prepare(
        'SELECT id FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first();

    if (existing) {
        return Response.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password
    const salt = crypto.randomUUID();
    const passwordHash = await hashPassword(password, salt);

    // Create user
    const userId = crypto.randomUUID();
    await env.DB.prepare(
        'INSERT INTO users (id, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, email.toLowerCase(), passwordHash, salt, new Date().toISOString()).run();

    // Generate token
    const token = await generateToken(userId, env);

    return Response.json({
        user: { id: userId, email: email.toLowerCase() },
        token,
    }, { status: 201 });
}

async function login({ email, password }, env) {
    if (!email || !password) {
        return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Find user
    const user = await env.DB.prepare(
        'SELECT id, email, password_hash, salt FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first();

    if (!user) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const passwordHash = await hashPassword(password, user.salt);
    if (passwordHash !== user.password_hash) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate token
    const token = await generateToken(user.id, env);

    return Response.json({
        user: { id: user.id, email: user.email },
        token,
    });
}

// ===== Token Helpers =====

async function generateToken(userId, env) {
    const payload = {
        sub: userId,
        exp: Date.now() + TOKEN_EXPIRY,
        iat: Date.now(),
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const key = await getSigningKey(env);

    const signature = await crypto.subtle.sign('HMAC', key, data);
    const sigArray = Array.from(new Uint8Array(signature));
    const sigBase64 = btoa(String.fromCharCode(...sigArray));

    return btoa(JSON.stringify(payload)) + '.' + sigBase64;
}

export async function verifyToken(token, env) {
    try {
        const [payloadB64, sigB64] = token.split('.');
        const payload = JSON.parse(atob(payloadB64));

        // Check expiry
        if (payload.exp < Date.now()) {
            return null;
        }

        // Verify signature
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(payload));
        const key = await getSigningKey(env);

        const sigBytes = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0));
        const valid = await crypto.subtle.verify('HMAC', key, sigBytes, data);

        if (!valid) return null;

        return payload;
    } catch {
        return null;
    }
}

export async function authenticateRequest(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token, env);

    if (!payload) return null;

    return payload.sub; // userId
}

// ===== Crypto Helpers =====

async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSigningKey(env) {
    const secret = env.JWT_SECRET || 'default-dev-secret-change-me';
    const encoder = new TextEncoder();
    return crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}
