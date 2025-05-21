
-- (All RLS and policy statements for credentials have been moved to modular migration files.)
-- You may keep utility functions or add new indexes here as needed.

-- Grant appropriate permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE credentials TO authenticated;
GRANT USAGE ON SEQUENCE credentials_id_seq TO authenticated;