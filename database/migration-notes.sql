-- Migration: Add notes/description field to aliases table
-- This allows users to store a longer description for each alias

ALTER TABLE aliases ADD COLUMN notes TEXT DEFAULT '';
