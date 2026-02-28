-- =====================================================
-- RUN THIS in your Supabase SQL Editor
-- Adds background media columns to personal_info
-- =====================================================

ALTER TABLE personal_info
  ADD COLUMN IF NOT EXISTS hero_bg_type TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS hero_bg_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_bg_overlay_opacity NUMERIC DEFAULT 0.6,
  ADD COLUMN IF NOT EXISTS contact_bg_type TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS contact_bg_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_bg_overlay_opacity NUMERIC DEFAULT 0.7;
