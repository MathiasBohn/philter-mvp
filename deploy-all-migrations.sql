-- =====================================================
-- Deploy All Migrations to Production
-- Run this script to create the complete database schema
-- =====================================================

-- This script combines all migrations in order:
-- 1. Initial schema (enums, tables)
-- 2. Functions and triggers
-- 3. Enable RLS
-- 4. RLS policies
-- 5. Indexes
-- 6. Seed data
-- 7. Storage policies

-- NOTE: Run the individual migration files in order:
-- 20250101000000_initial_schema.sql
-- 20250101000001_create_functions_and_triggers.sql
-- 20250101000002_enable_rls.sql
-- 20250101000003_create_rls_policies.sql
-- 20250101000005_create_indexes.sql
-- 20250101000006_seed_data.sql
-- 20250123000007_create_storage_policies.sql

-- To deploy via Supabase CLI:
-- npx supabase db push

-- Or manually via SQL Editor in Supabase Dashboard:
-- Copy and paste each migration file in order
