-- =====================================================
-- DATABASE RESET AND RESEED
-- Migration: 20250125000005_reset_and_reseed.sql
-- Created: 2025-11-25
-- Purpose: Clear all user and application data, reseed with fresh test data
-- =====================================================

-- =====================================================
-- STEP 1: Clear all existing data (in dependency order)
-- =====================================================

-- Disable triggers temporarily to avoid issues
SET session_replication_role = replica;

-- Clear notifications
TRUNCATE TABLE notifications CASCADE;

-- Clear board-related data
TRUNCATE TABLE board_notes CASCADE;
TRUNCATE TABLE board_assignments CASCADE;

-- Clear decision and activity logs
TRUNCATE TABLE decision_records CASCADE;
TRUNCATE TABLE activity_log CASCADE;

-- Clear RFI data
TRUNCATE TABLE rfi_messages CASCADE;
TRUNCATE TABLE rfis CASCADE;

-- Clear documents
TRUNCATE TABLE documents CASCADE;

-- Clear application data
TRUNCATE TABLE disclosures CASCADE;
TRUNCATE TABLE real_estate_properties CASCADE;
TRUNCATE TABLE financial_entries CASCADE;
TRUNCATE TABLE employment_records CASCADE;
TRUNCATE TABLE emergency_contacts CASCADE;
TRUNCATE TABLE address_history CASCADE;
TRUNCATE TABLE people CASCADE;
TRUNCATE TABLE application_invitations CASCADE;
TRUNCATE TABLE application_participants CASCADE;
TRUNCATE TABLE applications CASCADE;

-- Clear user profiles (not auth.users - those need manual deletion)
TRUNCATE TABLE users CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- =====================================================
-- STEP 2: Ensure we have buildings
-- =====================================================

-- Clear and reseed buildings
TRUNCATE TABLE templates CASCADE;
TRUNCATE TABLE buildings CASCADE;

-- Insert sample buildings (including code column) using valid UUIDs
INSERT INTO buildings (id, name, address, building_type, policies, code) VALUES
  ('00000001-0001-0000-0000-000000000001', 'The Windermere',
   '{"street": "400 West End Avenue", "unit": null, "city": "New York", "state": "NY", "zip": "10024"}'::jsonb,
   'COOP',
   '{"maxFinancePercent": 80, "allowGuarantors": true, "allowPiedATerre": false, "allowCorpOwnership": false, "allowTrustOwnership": true}'::jsonb,
   'WIND'),

  ('00000001-0002-0000-0000-000000000002', 'One Beacon Court',
   '{"street": "151 East 58th Street", "unit": null, "city": "New York", "state": "NY", "zip": "10022"}'::jsonb,
   'CONDO',
   '{"maxFinancePercent": 90, "allowGuarantors": true, "allowPiedATerre": true, "allowCorpOwnership": true, "allowTrustOwnership": true}'::jsonb,
   'OBC'),

  ('00000001-0003-0000-0000-000000000003', 'The Majestic',
   '{"street": "115 Central Park West", "unit": null, "city": "New York", "state": "NY", "zip": "10023"}'::jsonb,
   'COOP',
   '{"maxFinancePercent": 75, "allowGuarantors": false, "allowPiedATerre": false, "allowCorpOwnership": false, "allowTrustOwnership": false}'::jsonb,
   'MAJ'),

  ('00000001-0004-0000-0000-000000000004', 'Park Imperial',
   '{"street": "230 West 56th Street", "unit": null, "city": "New York", "state": "NY", "zip": "10019"}'::jsonb,
   'CONDO',
   '{"maxFinancePercent": 85, "allowGuarantors": true, "allowPiedATerre": true, "allowCorpOwnership": true, "allowTrustOwnership": true}'::jsonb,
   'PIMP'),

  ('00000001-0005-0000-0000-000000000005', 'The Ansonia',
   '{"street": "2109 Broadway", "unit": null, "city": "New York", "state": "NY", "zip": "10023"}'::jsonb,
   'RENTAL',
   '{"maxFinancePercent": 0, "allowGuarantors": true, "allowPiedATerre": false, "allowCorpOwnership": false, "allowTrustOwnership": false}'::jsonb,
   'ANS');

-- =====================================================
-- STEP 3: Create templates for buildings
-- =====================================================

INSERT INTO templates (id, building_id, name, is_published, sections, required_documents) VALUES
  ('00000002-0001-0000-0000-000000000001', '00000001-0001-0000-0000-000000000001',
   'Standard Co-op Purchase Application', true,
   '["profile", "parties", "people", "income", "financials", "real-estate", "documents", "disclosures", "cover-letter", "review"]'::jsonb,
   '["GOVERNMENT_ID", "BANK_STATEMENT", "TAX_RETURN", "EMPLOYMENT_LETTER", "REFERENCE_LETTER"]'::jsonb),

  ('00000002-0002-0000-0000-000000000002', '00000001-0002-0000-0000-000000000002',
   'Standard Condo Purchase Application', true,
   '["profile", "parties", "people", "income", "financials", "documents", "disclosures", "review"]'::jsonb,
   '["GOVERNMENT_ID", "BANK_STATEMENT", "TAX_RETURN"]'::jsonb),

  ('00000002-0003-0000-0000-000000000003', '00000001-0005-0000-0000-000000000005',
   'Standard Rental Application', true,
   '["profile", "parties", "income", "lease-terms", "documents", "building-policies", "disclosures", "review"]'::jsonb,
   '["GOVERNMENT_ID", "BANK_STATEMENT", "PAY_STUB"]'::jsonb);

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  building_count INTEGER;
  template_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO building_count FROM buildings;
  SELECT COUNT(*) INTO template_count FROM templates;

  RAISE NOTICE 'Database reset complete:';
  RAISE NOTICE '- All user data cleared';
  RAISE NOTICE '- All applications cleared';
  RAISE NOTICE '- % buildings seeded', building_count;
  RAISE NOTICE '- % templates seeded', template_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Delete auth users manually in Supabase Dashboard > Authentication > Users';
  RAISE NOTICE '2. Create new test users by signing up through the app';
  RAISE NOTICE '3. New users will automatically get profiles via the trigger';
END $$;
