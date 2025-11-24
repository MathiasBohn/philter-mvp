-- =============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- Migration: 20250124000009_fix_infinite_recursion.sql
-- Description: Fix infinite recursion in get_user_role() function
-- =============================================

-- Drop and recreate get_user_role() to set search_path and avoid recursion
DROP FUNCTION IF EXISTS get_user_role();

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS role_enum
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  user_role public.role_enum;
BEGIN
  -- Query the users table without triggering RLS policies
  -- SECURITY DEFINER with search_path = '' ensures this bypasses RLS
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();

  RETURN user_role;
EXCEPTION
  WHEN OTHERS THEN
    -- Return NULL if user not found or error occurs
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION get_user_role IS 'Returns the role of the current user (bypasses RLS to prevent infinite recursion)';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role() TO service_role;
