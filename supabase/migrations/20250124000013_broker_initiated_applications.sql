-- =============================================
-- BROKER-INITIATED APPLICATIONS
-- Migration: 20250124000013_broker_initiated_applications.sql
-- Description: Add support for broker-initiated application workflow
-- =============================================

-- Add broker_owned flag to applications table
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS broker_owned BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS primary_applicant_email TEXT,
ADD COLUMN IF NOT EXISTS primary_applicant_id UUID REFERENCES auth.users(id);

-- Add index for broker-owned applications
CREATE INDEX IF NOT EXISTS idx_applications_broker_owned ON applications(broker_owned) WHERE broker_owned = TRUE;
CREATE INDEX IF NOT EXISTS idx_applications_primary_applicant ON applications(primary_applicant_id);

-- Add comment to clarify the columns
COMMENT ON COLUMN applications.broker_owned IS 'TRUE if application was created by a broker on behalf of an applicant';
COMMENT ON COLUMN applications.primary_applicant_email IS 'Email of the primary applicant (used for invitation if not yet registered)';
COMMENT ON COLUMN applications.primary_applicant_id IS 'User ID of the primary applicant once they accept invitation';

-- =============================================
-- UPDATE RLS POLICIES FOR BROKER-OWNED APPLICATIONS
-- =============================================

-- Drop the existing applicants_own_applications policy
DROP POLICY IF EXISTS "applicants_own_applications" ON applications;

-- Recreate policy to include broker-owned applications where user is primary applicant
CREATE POLICY "applicants_own_applications" ON applications
FOR ALL USING (
  -- Applications created by the applicant
  created_by = auth.uid()
  OR
  -- Broker-owned applications where user is the primary applicant
  (broker_owned = TRUE AND primary_applicant_id = auth.uid())
)
WITH CHECK (
  -- Can only create non-broker-owned applications
  created_by = auth.uid() AND broker_owned = FALSE
);

-- Update brokers_managed_applications policy to include applications they created
DROP POLICY IF EXISTS "brokers_managed_applications" ON applications;

CREATE POLICY "brokers_managed_applications" ON applications
FOR ALL USING (
  -- Broker created the application (broker-owned apps)
  (broker_owned = TRUE AND created_by = auth.uid())
  OR
  -- Broker is listed as participant
  EXISTS (
    SELECT 1 FROM application_participants
    WHERE application_id = applications.id
      AND user_id = auth.uid()
      AND role = 'BROKER'
  )
)
WITH CHECK (
  -- Brokers can create broker-owned applications
  (broker_owned = TRUE AND created_by = auth.uid())
  OR
  -- Or modify applications they participate in
  EXISTS (
    SELECT 1 FROM application_participants
    WHERE application_id = applications.id
      AND user_id = auth.uid()
      AND role = 'BROKER'
  )
);

-- =============================================
-- FUNCTIONS FOR BROKER WORKFLOW
-- =============================================

-- Function to check if user can submit an application
-- Only broker can submit broker-owned applications
CREATE OR REPLACE FUNCTION can_submit_application(app_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  app_record RECORD;
  user_role role_enum;
BEGIN
  -- Get application details
  SELECT broker_owned, created_by, primary_applicant_id
  INTO app_record
  FROM applications
  WHERE id = app_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get user's role
  SELECT role INTO user_role FROM users WHERE id = auth.uid();

  -- If broker-owned, only the broker (creator) can submit
  IF app_record.broker_owned = TRUE THEN
    RETURN app_record.created_by = auth.uid();
  END IF;

  -- If not broker-owned, applicant (creator) can submit
  RETURN app_record.created_by = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- UPDATE APPLICATION_INVITATIONS POLICIES
-- =============================================

-- Anyone can view invitations sent to their email (for registration flow)
DROP POLICY IF EXISTS "view_invitations_by_email" ON application_invitations;

CREATE POLICY "view_invitations_by_email" ON application_invitations
FOR SELECT USING (
  -- User's email matches invitation email
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR
  -- Has access to the application (broker or applicant)
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = application_invitations.application_id
      AND (
        a.created_by = auth.uid()
        OR
        a.primary_applicant_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
      )
  )
);

-- Brokers can create invitations for their applications
DROP POLICY IF EXISTS "create_invitations" ON application_invitations;

CREATE POLICY "create_invitations" ON application_invitations
FOR INSERT WITH CHECK (
  invited_by = auth.uid()
  AND
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = application_invitations.application_id
      AND (
        -- Broker-owned applications
        (a.broker_owned = TRUE AND a.created_by = auth.uid())
        OR
        -- Applicant-owned applications
        (a.broker_owned = FALSE AND a.created_by = auth.uid())
      )
  )
);

-- =============================================
-- VERIFICATION
-- =============================================

-- Verify the new columns exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications'
    AND column_name = 'broker_owned'
  ) THEN
    RAISE EXCEPTION 'Column broker_owned was not added to applications table';
  END IF;

  RAISE NOTICE 'Migration completed successfully: broker_initiated_applications';
END $$;
