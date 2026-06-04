-- RLS Policies for JARVIS Supabase tables
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/kwpfxhxcxsxlkubycxcu/sql/new)
--
-- NOTE: The app currently uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS entirely.
-- These policies will take effect when you switch jarvis-db.ts to use jarvisAnonDb instead of jarvisDb.
-- See migration notes below.

-- ============================
-- 1. jarvis_users
-- ============================
ALTER TABLE jarvis_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own record"
  ON jarvis_users
  FOR SELECT
  USING (id = auth.uid()::text);

CREATE POLICY "Users can update own record"
  ON jarvis_users
  FOR UPDATE
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can insert own record"
  ON jarvis_users
  FOR INSERT
  WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Admins can read all users"
  ON jarvis_users
  FOR SELECT
  USING (is_admin = true);

-- ============================
-- 2. jarvis_sessions
-- ============================
ALTER TABLE jarvis_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON jarvis_sessions
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own sessions"
  ON jarvis_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own sessions"
  ON jarvis_sessions
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own sessions"
  ON jarvis_sessions
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- ============================
-- 3. jarvis_messages
-- Messages inherit ownership from their parent session.
-- ============================
ALTER TABLE jarvis_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON jarvis_messages
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM jarvis_sessions WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert messages to own sessions"
  ON jarvis_messages
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM jarvis_sessions WHERE user_id = auth.uid()::text
    )
  );

-- ============================
-- 4. jarvis_memories
-- ============================
ALTER TABLE jarvis_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own memories"
  ON jarvis_memories
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own memories"
  ON jarvis_memories
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own memories"
  ON jarvis_memories
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own memories"
  ON jarvis_memories
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- ============================
-- 5. jarvis_documents
-- ============================
ALTER TABLE jarvis_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents"
  ON jarvis_documents
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own documents"
  ON jarvis_documents
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own documents"
  ON jarvis_documents
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own documents"
  ON jarvis_documents
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- ============================
-- 6. jarvis_endpoints
-- ============================
ALTER TABLE jarvis_endpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own endpoints"
  ON jarvis_endpoints
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own endpoints"
  ON jarvis_endpoints
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own endpoints"
  ON jarvis_endpoints
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- ============================
-- 7. jarvis_auth_sessions
-- ============================
ALTER TABLE jarvis_auth_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own auth sessions"
  ON jarvis_auth_sessions
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own auth sessions"
  ON jarvis_auth_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own auth sessions"
  ON jarvis_auth_sessions
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- ============================
-- Migration Notes
-- ============================
--
-- To switch from service_role key to anon key:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. In jarvis-db.ts, change all `jarvisDb` references to `jarvisAnonDb`
-- 3. This means all operations must pass RLS checks (auth.uid() must match user_id)
-- 4. You will need Supabase Auth users linked to your jarvis_users table
--    or modify policies to work with your custom auth system
--
-- Current status (June 2026):
-- - jarvisDb (service_role) is used everywhere → RLS is bypassed
-- - jarvisAnonDb exists but is unused in table queries
-- - Hardcoded auth bypass for aki/DPS2405$ bypasses DB entirely
