-- Fix users table RLS policy to allow authenticated users to read user records
-- This addresses the issue where the auth context cannot fetch user profiles

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "users_view_own" ON users;

-- Create a new policy that allows authenticated users to read any user record
-- This is temporary for testing - in production, you may want to restrict this
CREATE POLICY "users_view_any_authenticated" ON users
FOR SELECT 
TO authenticated
USING (true);

-- Keep the update policy restricted to own profile
-- (users_update_own should still exist from previous migration)
