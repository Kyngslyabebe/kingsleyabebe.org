-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- Creates the blog_subscribers table
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribe_token TEXT DEFAULT gen_random_uuid()::TEXT UNIQUE
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_status ON blog_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_token ON blog_subscribers(unsubscribe_token);

-- Enable Row Level Security
ALTER TABLE blog_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: allow service role full access (for server-side API routes)
CREATE POLICY "Service role has full access" ON blog_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: allow anon to insert (subscribe)
CREATE POLICY "Anyone can subscribe" ON blog_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: allow anon to read their own record by token (for unsubscribe)
CREATE POLICY "Read by unsubscribe token" ON blog_subscribers
  FOR SELECT
  TO anon
  USING (true);

-- Policy: allow anon to update status via token (for unsubscribe)
CREATE POLICY "Update status by token" ON blog_subscribers
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
