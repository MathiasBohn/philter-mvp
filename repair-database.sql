-- =====================================================
-- REPAIR SCRIPT - Safely add missing database objects
-- =====================================================
-- This script uses CREATE IF NOT EXISTS to safely add missing objects
-- without failing if they already exist
-- =====================================================

-- First, check what we have:
DO $$
BEGIN
    RAISE NOTICE '=== Checking existing objects ===';

    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
        RAISE NOTICE '✓ role_enum exists';
    ELSE
        RAISE NOTICE '✗ role_enum missing';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE '✓ users table exists';
    ELSE
        RAISE NOTICE '✗ users table missing';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_user_profile') THEN
        RAISE NOTICE '✓ create_user_profile function exists';
    ELSE
        RAISE NOTICE '✗ create_user_profile function missing';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') THEN
        RAISE NOTICE '✓ on_auth_user_created trigger exists';
    ELSE
        RAISE NOTICE '✗ on_auth_user_created trigger missing - THIS IS THE CRITICAL ONE!';
    END IF;
END $$;

-- =====================================================
-- Create the critical trigger if it doesn't exist
-- =====================================================

-- Create or replace the user profile creation function
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
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
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if user already exists

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_user_profile IS 'Automatically creates user profile when new auth user is created';

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- =====================================================
-- Verify the fix
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== Verification ===';

    IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') THEN
        RAISE NOTICE '✓ SUCCESS: on_auth_user_created trigger is now active!';
        RAISE NOTICE '  Sign-ups should now work correctly.';
    ELSE
        RAISE NOTICE '✗ ERROR: Trigger was not created. Check for errors above.';
    END IF;
END $$;
