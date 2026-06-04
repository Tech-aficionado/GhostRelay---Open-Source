-- Email Alias Project - Database Schema (Cloudflare D1 / SQLite)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT
);

-- Email aliases table
CREATE TABLE IF NOT EXISTS aliases (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    address TEXT UNIQUE NOT NULL,
    label TEXT DEFAULT '',
    active INTEGER DEFAULT 1,
    forwarded_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Email forwarding logs
CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    alias_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    subject TEXT DEFAULT '',
    forwarded_at TEXT NOT NULL,
    FOREIGN KEY (alias_id) REFERENCES aliases(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_aliases_user_id ON aliases(user_id);
CREATE INDEX IF NOT EXISTS idx_aliases_address ON aliases(address);
CREATE INDEX IF NOT EXISTS idx_email_logs_alias_id ON email_logs(alias_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_forwarded_at ON email_logs(forwarded_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
