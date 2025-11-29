-- Migration: Create Audit Log Table
-- Purpose: Comprehensive audit logging for sensitive operations
-- Created: 2025-11-28

-- Create audit_log table for tracking sensitive operations
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Action performed
  action TEXT NOT NULL,

  -- User who performed the action (nullable for system actions)
  user_id UUID REFERENCES auth.users(id),

  -- Resource information
  resource_type TEXT NOT NULL,
  resource_id TEXT,

  -- Additional context
  reason TEXT,
  metadata JSONB,

  -- Request context for forensics
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Anyone can insert audit logs (service role will be used)
-- This allows the application to log events
CREATE POLICY "Service can insert audit logs" ON audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE audit_log IS 'Audit log for tracking sensitive operations like SSN access, document views, and admin actions';
COMMENT ON COLUMN audit_log.action IS 'Type of action: DOCUMENT_VIEW, SSN_DECRYPT, ADMIN_ACTION, etc.';
COMMENT ON COLUMN audit_log.resource_type IS 'Type of resource: application, document, user, etc.';
COMMENT ON COLUMN audit_log.metadata IS 'Additional context data (avoid storing PII)';
