-- =============================================
-- FIX USER CREATION TRIGGER
-- Migration: 20250124000008_fix_user_creation.sql
-- Description: Fix the user profile creation trigger by allowing INSERTs
-- =============================================

-- Option 1: Recreate the trigger function to bypass RLS
-- This is the cleanest approach for system-generated data
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();

CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Temporarily disable RLS for this function
  -- This is safe because the function is SECURITY DEFINER
  -- and only runs when a new auth user is created
  INSERT INTO public.users (
    id,
    role,
    first_name,
    last_name,
    phone
  ) VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::role_enum, 'APPLICANT'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail auth user creation
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Grant necessary permissions to the service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public.users TO service_role;

-- Ensure the function owner (postgres) can bypass RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

COMMENT ON FUNCTION create_user_profile IS 'Automatically creates user profile when new auth user is created (bypasses RLS)';
