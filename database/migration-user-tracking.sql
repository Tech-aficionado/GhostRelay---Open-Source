-- Migration: Add last_login_at column for user login tracking
-- Run with: npx wrangler d1 execute ghostrelay-db --remote --file=./database/migration-user-tracking.sql

ALTER TABLE users ADD COLUMN last_login_at TEXT DEFAULT NULL;
