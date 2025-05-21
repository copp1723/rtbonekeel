-- 003_policies.sql: Drop default/public policies and create desired policies

-- Drop default/public policies if they exist
DROP POLICY IF EXISTS "Public read/write access" ON credential_vault;
DROP POLICY IF EXISTS "Users can read their own audit logs" ON audit_log;

-- Create policies for audit_log
CREATE POLICY "Users can read their own audit logs"
  ON audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit logs"
  ON audit_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
