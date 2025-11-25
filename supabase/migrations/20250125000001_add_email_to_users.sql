-- =====================================================
-- Migration: Add email to users table (denormalization)
-- Created: 2025-01-25
-- Purpose: Fix N+1 query issue by denormalizing email from auth.users
-- =====================================================

-- Add email column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update existing users with their email from auth.users
UPDATE users u
SET email = (
  SELECT au.email
  FROM auth.users au
  WHERE au.id = u.id
)
WHERE u.email IS NULL;

-- Update the create_user_profile function to include email
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (
    id,
    email,
    role,
    first_name,
    last_name,
    phone
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::role_enum, 'APPLICANT'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
EXCEPTION WHEN unique_violation THEN
  -- Profile already exists (race condition), just return
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_user_profile IS 'Creates user profile with email when new auth user is created';

-- Create function to sync email when auth.users.email changes
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if email actually changed
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE users
    SET email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION sync_user_email IS 'Syncs email from auth.users to users table on email change';

-- Create trigger to sync email on auth.users update
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email();

-- Add comment to users table documenting the email column
COMMENT ON COLUMN users.email IS 'Denormalized from auth.users for query performance';
