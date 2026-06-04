-- Migration: New features (email logs viewer, sender blocklist, alias categories, password reset)

-- Sender blocklist table
CREATE TABLE IF NOT EXISTS sender_blocklist (
    id TEXT PRIMARY KEY,
    alias_id TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (alias_id) REFERENCES aliases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blocklist_alias_id ON sender_blocklist(alias_id);
CREATE INDEX IF NOT EXISTS idx_blocklist_sender ON sender_blocklist(sender_email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_blocklist_unique ON sender_blocklist(alias_id, sender_email);

-- Add category column to aliases (Shopping, Social, Finance, Work, Travel, Other)
ALTER TABLE aliases ADD COLUMN category TEXT DEFAULT '';

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_user ON password_reset_tokens(user_id);
