-- Migration: Add plan column to users table
-- Applied manually via ALTER TABLE

ALTER TABLE users ADD COLUMN IF NOT EXISTS "plan" character varying NOT NULL DEFAULT 'free';
