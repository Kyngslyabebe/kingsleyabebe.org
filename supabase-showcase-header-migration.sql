-- Migration: Add header, subheader, and last_updated columns to hero_showcase
-- Run this in your Supabase SQL editor

ALTER TABLE hero_showcase ADD COLUMN IF NOT EXISTS header TEXT;
ALTER TABLE hero_showcase ADD COLUMN IF NOT EXISTS subheader TEXT;
ALTER TABLE hero_showcase ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW();
