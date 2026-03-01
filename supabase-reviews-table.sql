-- =====================================================
-- RUN THIS in your Supabase SQL Editor
-- Creates the reviews table for client testimonials
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  reviewer_avatar TEXT DEFAULT '',
  reviewer_company TEXT DEFAULT '',
  reviewer_location TEXT DEFAULT '',
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews only
DROP POLICY IF EXISTS "Public can read approved reviews" ON reviews;
CREATE POLICY "Public can read approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

-- Public can insert new reviews (pending by default)
DROP POLICY IF EXISTS "Public can submit reviews" ON reviews;
CREATE POLICY "Public can submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (status = 'pending');

-- Service role has full access (for admin operations)
DROP POLICY IF EXISTS "Service role full access on reviews" ON reviews;
CREATE POLICY "Service role full access on reviews"
  ON reviews FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated users (admin) can manage all reviews
DROP POLICY IF EXISTS "Authenticated users manage reviews" ON reviews;
CREATE POLICY "Authenticated users manage reviews"
  ON reviews FOR ALL
  USING (auth.role() = 'authenticated');

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- =====================================================
-- Add reviews header columns to personal_info
-- (run this if you already have the personal_info table)
-- =====================================================
ALTER TABLE personal_info
  ADD COLUMN IF NOT EXISTS reviews_title TEXT DEFAULT 'Client Reviews',
  ADD COLUMN IF NOT EXISTS reviews_subtitle TEXT DEFAULT 'What people say about working with me',
  ADD COLUMN IF NOT EXISTS reviews_bg_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviews_bg_overlay_opacity NUMERIC DEFAULT 0.7;
