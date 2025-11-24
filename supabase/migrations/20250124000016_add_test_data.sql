-- =====================================================
-- TEST DATA SETUP
-- Migration: 20250124000016_add_test_data.sql
-- Description: Add test buildings and data for development
-- =====================================================

-- =====================================================
-- TEST BUILDINGS WITH CODES
-- =====================================================

-- Insert test buildings with building codes for easy testing
INSERT INTO buildings (id, name, code, address, building_type, policies, created_at, updated_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'The Metropolitan Tower',
    'TEST01',
    '{"street": "123 Park Avenue", "city": "New York", "state": "NY", "zip": "10022", "country": "USA"}'::jsonb,
    'COOP',
    '{
      "pets": {
        "allowed": true,
        "restrictions": "Dogs under 25 lbs, cats allowed",
        "depositRequired": true
      },
      "smoking": {
        "allowed": false
      },
      "renovations": {
        "requiresApproval": true,
        "restrictions": "Must use certified contractors"
      },
      "sublets": {
        "allowed": true,
        "minimumOwnership": "2 years",
        "maximumDuration": "3 years"
      }
    }'::jsonb,
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Riverside Condominiums',
    'TEST02',
    '{"street": "456 Riverside Drive", "city": "New York", "state": "NY", "zip": "10024", "country": "USA"}'::jsonb,
    'CONDO',
    '{
      "pets": {
        "allowed": true,
        "restrictions": "No restrictions",
        "depositRequired": false
      },
      "smoking": {
        "allowed": false
      },
      "renovations": {
        "requiresApproval": true,
        "restrictions": "Weekdays 9am-5pm only"
      }
    }'::jsonb,
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Brooklyn Heights Co-op',
    'TEST03',
    '{"street": "789 Montague Street", "city": "Brooklyn", "state": "NY", "zip": "11201", "country": "USA"}'::jsonb,
    'COOP',
    '{
      "pets": {
        "allowed": false
      },
      "smoking": {
        "allowed": false
      },
      "renovations": {
        "requiresApproval": true,
        "restrictions": "Board approval required for all changes"
      },
      "sublets": {
        "allowed": false
      }
    }'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  building_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO building_count FROM buildings WHERE code LIKE 'TEST%';

  RAISE NOTICE 'Test data migration completed';
  RAISE NOTICE 'Added % test buildings with codes: TEST01, TEST02, TEST03', building_count;
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'TEST BUILDING CODES:';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'TEST01 - The Metropolitan Tower (Co-op)';
  RAISE NOTICE 'TEST02 - Riverside Condominiums (Condo)';
  RAISE NOTICE 'TEST03 - Brooklyn Heights Co-op (Co-op)';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'To test the application:';
  RAISE NOTICE '1. Sign up at http://localhost:3000/sign-up';
  RAISE NOTICE '2. Go to "New Application" and use building code TEST01, TEST02, or TEST03';
  RAISE NOTICE '3. Select a transaction type and start your application';
END $$;
