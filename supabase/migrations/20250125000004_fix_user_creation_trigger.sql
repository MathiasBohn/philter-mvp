-- =====================================================
-- Migration: Fix user creation trigger
-- Created: 2025-11-25
-- Purpose: Fix the create_user_profile trigger to handle all errors gracefully
-- =====================================================

-- The issue: The current trigger only catches unique_violation errors.
-- If there's any other error (RLS, enum casting, etc.), it fails the entire signup.
--
-- The fix: Catch ALL exceptions and log them, allowing auth user creation to proceed.

CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role role_enum;
BEGIN
  -- Safely cast the role, defaulting to APPLICANT if invalid
  BEGIN
    user_role := COALESCE((NEW.raw_user_meta_data->>'role')::role_enum, 'APPLICANT');
  EXCEPTION WHEN OTHERS THEN
    user_role := 'APPLICANT';
  END;

  -- Insert the user profile
  INSERT INTO public.users (
    id,
    email,
    role,
    first_name,
    last_name,
    phone
  ) VALUES (
    NEW.id,
    NEW.email,
    user_role,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone'
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists (race condition), just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail auth user creation
    -- This allows the user to sign up even if profile creation fails
    -- The application layer will create the profile as a fallback
    RAISE WARNING 'Failed to create user profile for %: % (SQLSTATE: %)',
      NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Ensure the trigger is properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public.users TO service_role;

COMMENT ON FUNCTION create_user_profile IS 'Creates user profile when new auth user is created. Handles all errors gracefully to prevent signup failures.';
