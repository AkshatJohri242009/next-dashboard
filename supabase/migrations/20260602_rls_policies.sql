-- ============================
-- Custom Auth RLS for JARVIS Tables
-- ============================
-- This migration enables RLS using a custom auth approach.
-- Instead of auth.uid() (Supabase Auth), we use a PG session variable
-- set via set_config() from the application.

-- 1. Helper function to set the current user ID
CREATE OR REPLACE FUNCTION set_app_user(p_user_id text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_id', p_user_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- 2. jarvis_users
-- ============================
ALTER TABLE jarvis_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own record" ON jarvis_users;
CREATE POLICY "Users can read own record"
  ON jarvis_users
  FOR SELECT
  USING (id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can update own record" ON jarvis_users;
CREATE POLICY "Users can update own record"
  ON jarvis_users
  FOR UPDATE
  USING (id = current_setting('app.user_id', true))
  WITH CHECK (id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can insert own record" ON jarvis_users;
CREATE POLICY "Users can insert own record"
  ON jarvis_users
  FOR INSERT
  WITH CHECK (id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Admins can read all users" ON jarvis_users;
CREATE POLICY "Admins can read all users"
  ON jarvis_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jarvis_users
      WHERE id = current_setting('app.user_id', true) AND is_admin = true
    )
  );

-- Allow unauthenticated inserts during signup (no app.user_id set)
DROP POLICY IF EXISTS "Allow signup inserts" ON jarvis_users;
CREATE POLICY "Allow signup inserts"
  ON jarvis_users
  FOR INSERT
  WITH CHECK (current_setting('app.user_id', true) = '' OR current_setting('app.user_id', true) IS NULL);

-- ============================
-- 3. jarvis_sessions
-- ============================
ALTER TABLE jarvis_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own sessions" ON jarvis_sessions;
CREATE POLICY "Users can read own sessions"
  ON jarvis_sessions
  FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can create own sessions" ON jarvis_sessions;
CREATE POLICY "Users can create own sessions"
  ON jarvis_sessions
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can update own sessions" ON jarvis_sessions;
CREATE POLICY "Users can update own sessions"
  ON jarvis_sessions
  FOR UPDATE
  USING (user_id = current_setting('app.user_id', true))
  WITH CHECK (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can delete own sessions" ON jarvis_sessions;
CREATE POLICY "Users can delete own sessions"
  ON jarvis_sessions
  FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

-- ============================
-- 4. jarvis_messages
-- ============================
ALTER TABLE jarvis_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own messages" ON jarvis_messages;
CREATE POLICY "Users can read own messages"
  ON jarvis_messages
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM jarvis_sessions WHERE user_id = current_setting('app.user_id', true)
    )
  );

DROP POLICY IF EXISTS "Users can insert messages to own sessions" ON jarvis_messages;
CREATE POLICY "Users can insert messages to own sessions"
  ON jarvis_messages
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM jarvis_sessions WHERE user_id = current_setting('app.user_id', true)
    )
  );

-- ============================
-- 5. jarvis_memories
-- ============================
ALTER TABLE jarvis_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own memories" ON jarvis_memories;
CREATE POLICY "Users can read own memories"
  ON jarvis_memories
  FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can create own memories" ON jarvis_memories;
CREATE POLICY "Users can create own memories"
  ON jarvis_memories
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can update own memories" ON jarvis_memories;
CREATE POLICY "Users can update own memories"
  ON jarvis_memories
  FOR UPDATE
  USING (user_id = current_setting('app.user_id', true))
  WITH CHECK (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can delete own memories" ON jarvis_memories;
CREATE POLICY "Users can delete own memories"
  ON jarvis_memories
  FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

-- ============================
-- 6. jarvis_documents
-- ============================
ALTER TABLE jarvis_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own documents" ON jarvis_documents;
CREATE POLICY "Users can read own documents"
  ON jarvis_documents
  FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can create own documents" ON jarvis_documents;
CREATE POLICY "Users can create own documents"
  ON jarvis_documents
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can update own documents" ON jarvis_documents;
CREATE POLICY "Users can update own documents"
  ON jarvis_documents
  FOR UPDATE
  USING (user_id = current_setting('app.user_id', true))
  WITH CHECK (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can delete own documents" ON jarvis_documents;
CREATE POLICY "Users can delete own documents"
  ON jarvis_documents
  FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

-- ============================
-- 7. jarvis_endpoints
-- ============================
ALTER TABLE jarvis_endpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own endpoints" ON jarvis_endpoints;
CREATE POLICY "Users can read own endpoints"
  ON jarvis_endpoints
  FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can create own endpoints" ON jarvis_endpoints;
CREATE POLICY "Users can create own endpoints"
  ON jarvis_endpoints
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can delete own endpoints" ON jarvis_endpoints;
CREATE POLICY "Users can delete own endpoints"
  ON jarvis_endpoints
  FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

-- ============================
-- 8. jarvis_auth_sessions
-- ============================
ALTER TABLE jarvis_auth_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own auth sessions" ON jarvis_auth_sessions;
CREATE POLICY "Users can read own auth sessions"
  ON jarvis_auth_sessions
  FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can create own auth sessions" ON jarvis_auth_sessions;
CREATE POLICY "Users can create own auth sessions"
  ON jarvis_auth_sessions
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can delete own auth sessions" ON jarvis_auth_sessions;
CREATE POLICY "Users can delete own auth sessions"
  ON jarvis_auth_sessions
  FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

-- ============================
-- Migration Notes
-- ============================
-- To enable RLS:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. In jarvis-db.ts, the app will call supabase.rpc('set_app_user', { p_user_id }) 
--    before each request to set the user context
-- 3. The jarvis-db.ts `getAuthedDb(userId)` helper handles this automatically
--
-- Once RLS is enabled, the app must set app.user_id on every request
-- or all operations will be rejected. The helper function handles this.
