-- =====================================================
-- Diagnose and Fix Database Issues
-- =====================================================

-- Check if RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'applications', 'buildings')
ORDER BY tablename;

-- Check if current user has a profile
-- (Run this after checking your user ID)
-- SELECT * FROM auth.users LIMIT 1;  -- Get your user ID first
-- SELECT * FROM users WHERE id = 'YOUR_USER_ID_HERE';

-- =====================================================
-- Enable RLS on all tables
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE disclosures ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfi_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_participants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Create basic RLS policies for users table
-- =====================================================

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- Create basic RLS policies for applications
-- =====================================================

-- Users can view their own applications
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT
  USING (auth.uid() = created_by);

-- Users can create applications
DROP POLICY IF EXISTS "Users can create applications" ON applications;
CREATE POLICY "Users can create applications" ON applications
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own applications
DROP POLICY IF EXISTS "Users can update own applications" ON applications;
CREATE POLICY "Users can update own applications" ON applications
  FOR UPDATE
  USING (auth.uid() = created_by);

-- =====================================================
-- Create basic RLS policies for buildings (public read)
-- =====================================================

-- Anyone can view buildings
DROP POLICY IF EXISTS "Anyone can view buildings" ON buildings;
CREATE POLICY "Anyone can view buildings" ON buildings
  FOR SELECT
  USING (true);

-- =====================================================
-- Success message
-- =====================================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ RLS enabled and basic policies created!';
END $$;
