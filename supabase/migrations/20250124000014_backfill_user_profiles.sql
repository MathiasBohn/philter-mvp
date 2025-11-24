-- =============================================
-- BACKFILL USER PROFILES
-- Migration: 20250124000014_backfill_user_profiles.sql
-- Description: Create missing user profiles for auth users who don't have them
-- =============================================

-- Insert missing user profiles for auth users who don't have a profile yet
INSERT INTO public.users (
  id,
  role,
  first_name,
  last_name,
  phone
)
SELECT
  au.id,
  COALESCE((au.raw_user_meta_data->>'role')::role_enum, 'APPLICANT'),
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  au.raw_user_meta_data->>'phone'
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Log how many profiles were created
DO $$
DECLARE
  created_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO created_count
  FROM auth.users au
  JOIN public.users pu ON au.id = pu.id
  WHERE pu.created_at > NOW() - INTERVAL '5 seconds';

  IF created_count > 0 THEN
    RAISE NOTICE 'Created % missing user profile(s)', created_count;
  ELSE
    RAISE NOTICE 'No missing user profiles found - all auth users have profiles';
  END IF;
END $$;
