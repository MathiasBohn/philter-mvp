-- =============================================
-- ENABLE ROW-LEVEL SECURITY ON ALL TABLES
-- Migration: 20250101000002_enable_rls.sql
-- Description: Enable RLS on all tables to enforce access control
-- =============================================

-- Enable RLS on Core Tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_participants ENABLE ROW LEVEL SECURITY;

-- Enable RLS on Embedded Entity Tables
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE address_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE disclosures ENABLE ROW LEVEL SECURITY;

-- Enable RLS on Document & Communication Tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfi_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_notes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on Decision & Audit Tables
ALTER TABLE decision_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- VERIFICATION QUERY
-- =============================================
-- Run this to verify RLS is enabled on all tables:
--
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public' AND rowsecurity = true
-- ORDER BY tablename;
