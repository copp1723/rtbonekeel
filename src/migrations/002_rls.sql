-- 002_rls.sql: Enable Row Level Security (RLS) on tables

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
-- Add more ALTER TABLE ... ENABLE ROW LEVEL SECURITY; as needed for other tables
