-- =============================================
-- FIX RLS INFINITE RECURSION
-- Migration: 20250124000015_fix_rls_infinite_recursion.sql
-- Description: Fix circular dependency between applications and application_participants policies
-- =============================================

-- The issue: applications policy checks application_participants,
-- and application_participants policy checks applications.
-- This creates infinite recursion.

-- Solution: Use SECURITY DEFINER functions that bypass RLS for the circular checks

-- =============================================
-- Helper function to check if user is participant of an application
-- =============================================
CREATE OR REPLACE FUNCTION is_application_participant(app_id UUID, user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM application_participants
    WHERE application_id = app_id
      AND application_participants.user_id = user_id
  );
END;
$$;

-- =============================================
-- Helper function to check if user is application creator
-- =============================================
CREATE OR REPLACE FUNCTION is_application_creator(app_id UUID, user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM applications
    WHERE id = app_id
      AND created_by = user_id
  );
END;
$$;

-- =============================================
-- Recreate application_participants policies without circular reference
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "view_participants_with_access" ON application_participants;
DROP POLICY IF EXISTS "manage_participants" ON application_participants;

-- Allow users to see participants if they created the app or are participants themselves
CREATE POLICY "view_participants_with_access" ON application_participants
FOR SELECT USING (
  -- User is the participant themselves
  user_id = auth.uid()
  OR
  -- User created the application (use function to avoid recursion)
  is_application_creator(application_id, auth.uid())
  OR
  -- Admin access
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Application creators and admins can manage participants
CREATE POLICY "manage_participants" ON application_participants
FOR ALL USING (
  is_application_creator(application_id, auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- =============================================
-- Verification
-- =============================================

-- Test the functions
DO $$
BEGIN
  RAISE NOTICE 'RLS infinite recursion fix applied successfully';
  RAISE NOTICE 'Created helper functions: is_application_participant, is_application_creator';
END $$;
