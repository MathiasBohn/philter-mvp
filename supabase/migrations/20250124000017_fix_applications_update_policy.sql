-- =============================================
-- FIX APPLICATIONS UPDATE POLICY
-- Migration: 20250124000017_fix_applications_update_policy.sql
-- Description: Fix RLS policy to allow application owners to update their applications
-- =============================================

-- The issue: The "applicants_own_applications" policy uses FOR ALL with WITH CHECK,
-- which can block updates if the update tries to change certain fields.

-- Solution: Split the policy into separate INSERT, UPDATE, and DELETE policies
-- to have more granular control

-- Drop the existing combined policy
DROP POLICY IF EXISTS "applicants_own_applications" ON applications;

-- Create separate policies for each operation

-- 1. INSERT: Applicants can create applications where they are the creator
CREATE POLICY "applicants_insert_applications" ON applications
FOR INSERT 
WITH CHECK (created_by = auth.uid());

-- 2. SELECT: Applicants can view applications they created
CREATE POLICY "applicants_select_applications" ON applications
FOR SELECT 
USING (created_by = auth.uid());

-- 3. UPDATE: Applicants can update applications they created
-- Don't restrict WITH CHECK - allow updating any fields except created_by
CREATE POLICY "applicants_update_applications" ON applications
FOR UPDATE 
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- 4. DELETE: Applicants can delete applications they created (soft delete)
CREATE POLICY "applicants_delete_applications" ON applications
FOR DELETE 
USING (created_by = auth.uid());

-- =============================================
-- Verification
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Applications RLS policies updated successfully';
  RAISE NOTICE 'Split "applicants_own_applications" into separate INSERT, SELECT, UPDATE, DELETE policies';
END $$;
