-- =====================================================
-- RUN THIS in your Supabase SQL Editor to fix
-- overly permissive RLS policies
-- =====================================================

-- =====================
-- 1. blog_subscribers
-- =====================

-- Drop old and new policies (safe to re-run)
DROP POLICY IF EXISTS "Read by unsubscribe token" ON blog_subscribers;
DROP POLICY IF EXISTS "Update status by token" ON blog_subscribers;
DROP POLICY IF EXISTS "No anon reads" ON blog_subscribers;
DROP POLICY IF EXISTS "No anon updates" ON blog_subscribers;

-- Block anon from reading subscriber data (subscribe/unsubscribe APIs use service_role)
CREATE POLICY "No anon reads" ON blog_subscribers
  FOR SELECT
  TO anon
  USING (false);

-- Block anon from updating subscriber data (unsubscribe API uses service_role)
CREATE POLICY "No anon updates" ON blog_subscribers
  FOR UPDATE
  TO anon
  USING (false);

-- =====================
-- 2. legal_documents
-- =====================

-- Enable RLS on legal_documents
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Drop if they already exist (safe to re-run)
DROP POLICY IF EXISTS "Service role has full access" ON legal_documents;
DROP POLICY IF EXISTS "Public read access" ON legal_documents;

-- Service role has full access (for admin editing)
CREATE POLICY "Service role has full access" ON legal_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anon can only read (for public terms/privacy pages)
CREATE POLICY "Public read access" ON legal_documents
  FOR SELECT
  TO anon
  USING (true);
