-- Migration: Advanced features
-- Multiple forwarding destinations, catch-all wildcards, temporary/expiring aliases, push subscriptions
-- Run with: npx wrangler d1 execute ghostrelay-db --file=../database/migration-advanced-features.sql

-- ===== Multiple Forwarding Destinations =====
-- Each alias can forward to multiple email addresses (team use case)
CREATE TABLE IF NOT EXISTS alias_destinations (
    id TEXT PRIMARY KEY,
    alias_id TEXT NOT NULL,
    email TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    FOREIGN KEY (alias_id) REFERENCES aliases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_destinations_alias_id ON alias_destinations(alias_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_destinations_unique ON alias_destinations(alias_id, email);

-- ===== Catch-All Wildcard Aliases =====
-- Patterns like *-shopping@ghostrelay.me automatically match incoming emails
CREATE TABLE IF NOT EXISTS wildcard_rules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    pattern TEXT NOT NULL,           -- e.g. '*-shopping' or 'team-*'
    label TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    active INTEGER DEFAULT 1,
    forwarded_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wildcards_user_id ON wildcard_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_wildcards_pattern ON wildcard_rules(pattern);

-- ===== Temporary/Expiring Aliases =====
-- Add expiration columns to aliases table
ALTER TABLE aliases ADD COLUMN expires_at TEXT DEFAULT NULL;
ALTER TABLE aliases ADD COLUMN max_emails INTEGER DEFAULT NULL;
ALTER TABLE aliases ADD COLUMN is_temporary INTEGER DEFAULT 0;

-- ===== Push Notification Subscriptions (PWA) =====
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_push_user_id ON push_subscriptions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_endpoint ON push_subscriptions(endpoint);
