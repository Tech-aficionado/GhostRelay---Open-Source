-- Migration: User settings columns
-- Run with: npx wrangler d1 execute ghostrelay-db --remote --file=./database/migration-settings.sql

-- Add settings columns to users table
ALTER TABLE users ADD COLUMN display_name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN email_notifications INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN weekly_report INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN bounce_alerts INTEGER DEFAULT 1;
