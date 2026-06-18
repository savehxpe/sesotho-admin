-- Admin users table for Supabase Auth integration
-- Run this in your Supabase SQL editor after enabling Auth

CREATE TABLE IF NOT EXISTS admin_users (
  email      TEXT PRIMARY KEY,
  role       TEXT NOT NULL DEFAULT 'read_only_viewer'
    CHECK (role IN ('super_admin', 'accounting_admin', 'marketing_admin', 'security_admin', 'read_only_viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert existing admin users (passwords managed via Supabase Auth UI)
INSERT INTO admin_users (email, role) VALUES
  ('team@outworldcreative.com', 'super_admin'),
  ('sammyoppenheimer3@gmail.com', 'read_only_viewer'),
  ('accounting@sesothofashioning.ls', 'accounting_admin'),
  ('marketing@sesothofashioning.ls', 'marketing_admin'),
  ('security@sesothofashioning.ls', 'security_admin'),
  ('viewer@sesothofashioning.ls', 'read_only_viewer')
ON CONFLICT (email) DO NOTHING;

-- Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can read the admin_users table
CREATE POLICY "admins_can_read_admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Only super_admin can insert/update/delete
CREATE POLICY "super_admin_can_manage_admin_users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    auth.email() IN (
      SELECT email FROM admin_users WHERE role = 'super_admin'
    )
  );
