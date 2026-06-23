-- Migration: 2FA (email OTP) and security score support
-- Run with: npx wrangler d1 execute ghostrelay-db --file=../database/migration-2fa-security.sql

-- Add 2FA enabled flag to users
ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0;

-- OTP codes table for email-based 2FA
CREATE TABLE IF NOT EXISTS two_factor_codes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    code_hash TEXT NOT NULL,          -- SHA-256 hash of the 6-digit code
    purpose TEXT NOT NULL DEFAULT 'enable',  -- 'enable' | 'login' | 'disable'
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_2fa_codes_user_id ON two_factor_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_codes_expires ON two_factor_codes(expires_at);
