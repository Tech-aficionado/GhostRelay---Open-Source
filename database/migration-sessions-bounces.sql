-- Migration: Add sessions table (token revocation + device tracking) and bounce tracking
-- Run with: npx wrangler d1 execute ghostrelay-db --file=../database/migration-sessions-bounces.sql

-- ===== Sessions (refresh tokens + device-aware sessions) =====
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,                    -- session UUID
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,               -- SHA-256 hash of refresh token (never store raw)
    device_name TEXT DEFAULT '',            -- e.g. "Chrome on Windows"
    ip_address TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    last_used_at TEXT NOT NULL,
    revoked INTEGER DEFAULT 0,             -- 1 = revoked
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ===== Bounce tracking =====
CREATE TABLE IF NOT EXISTS email_bounces (
    id TEXT PRIMARY KEY,
    alias_id TEXT NOT NULL,
    recipient_email TEXT NOT NULL,          -- the forwarding destination that bounced
    bounce_type TEXT DEFAULT 'hard',        -- 'hard' | 'soft' | 'complaint'
    bounce_reason TEXT DEFAULT '',
    original_sender TEXT DEFAULT '',
    original_subject TEXT DEFAULT '',
    bounced_at TEXT NOT NULL,
    acknowledged INTEGER DEFAULT 0,        -- 1 = user has seen/dismissed it
    FOREIGN KEY (alias_id) REFERENCES aliases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bounces_alias_id ON email_bounces(alias_id);
CREATE INDEX IF NOT EXISTS idx_bounces_user ON email_bounces(recipient_email);
CREATE INDEX IF NOT EXISTS idx_bounces_bounced_at ON email_bounces(bounced_at);

-- Add bounce_count to aliases for quick stats
ALTER TABLE aliases ADD COLUMN bounce_count INTEGER DEFAULT 0;
