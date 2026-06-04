-- Truncate all tables (SQLite doesn't have TRUNCATE, use DELETE)
-- Order matters due to foreign keys

DELETE FROM email_logs;
DELETE FROM aliases;
DELETE FROM users;
