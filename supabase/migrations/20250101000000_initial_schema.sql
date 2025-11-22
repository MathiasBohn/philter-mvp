-- =====================================================
-- Philter MVP Database Schema - Initial Migration
-- Created: 2025-01-21
-- Purpose: Create all enum types and base tables
-- =====================================================

-- =====================================================
-- SECTION 1: ENUM TYPES
-- =====================================================

-- Role enum (13 values)
CREATE TYPE role_enum AS ENUM (
  'APPLICANT',
  'CO_APPLICANT',
  'GUARANTOR',
  'BROKER',
  'ADMIN',
  'BOARD',
  'TRANSACTION_AGENT',
  'PROPERTY_MANAGER',
  'BUILDING_MANAGER',
  'ATTORNEY',
  'ACCOUNTANT',
  'REFERENCE',
  'LANDLORD'
);

-- Transaction type enum (4 values)
CREATE TYPE transaction_type_enum AS ENUM (
  'COOP_PURCHASE',
  'CONDO_PURCHASE',
  'COOP_SUBLET',
  'CONDO_LEASE'
);

-- Application status enum (7 values)
CREATE TYPE application_status_enum AS ENUM (
  'IN_PROGRESS',
  'SUBMITTED',
  'IN_REVIEW',
  'RFI',
  'APPROVED',
  'CONDITIONAL',
  'DENIED'
);

-- Building type enum (3 values)
CREATE TYPE building_type_enum AS ENUM (
  'RENTAL',
  'COOP',
  'CONDO'
);

-- Document category enum (8 values)
CREATE TYPE document_category_enum AS ENUM (
  'GOVERNMENT_ID',
  'BANK_STATEMENT',
  'TAX_RETURN',
  'PAY_STUB',
  'EMPLOYMENT_LETTER',
  'REFERENCE_LETTER',
  'OTHER_FINANCIAL',
  'OTHER'
);

-- Document status enum (4 values)
CREATE TYPE document_status_enum AS ENUM (
  'UPLOADING',
  'PROCESSING',
  'COMPLETE',
  'ERROR'
);

-- RFI status enum (2 values)
CREATE TYPE rfi_status_enum AS ENUM (
  'OPEN',
  'RESOLVED'
);

-- Decision enum (3 values)
CREATE TYPE decision_enum AS ENUM (
  'APPROVE',
  'CONDITIONAL',
  'DENY'
);

-- Employment status enum
CREATE TYPE employment_status_enum AS ENUM (
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'SELF_EMPLOYED',
  'UNEMPLOYED',
  'RETIRED'
);

-- Pay cadence enum
CREATE TYPE pay_cadence_enum AS ENUM (
  'HOURLY',
  'WEEKLY',
  'BI_WEEKLY',
  'SEMI_MONTHLY',
  'MONTHLY',
  'ANNUALLY'
);

-- Financial entry type enum
CREATE TYPE financial_entry_type_enum AS ENUM (
  'ASSET',
  'LIABILITY',
  'INCOME',
  'EXPENSE'
);

-- Asset category enum
CREATE TYPE asset_category_enum AS ENUM (
  'CHECKING',
  'SAVINGS',
  'STOCKS',
  'BONDS',
  'RETIREMENT',
  'REAL_ESTATE',
  'OTHER'
);

-- Liability category enum
CREATE TYPE liability_category_enum AS ENUM (
  'MORTGAGE',
  'AUTO_LOAN',
  'STUDENT_LOAN',
  'CREDIT_CARD',
  'PERSONAL_LOAN',
  'OTHER'
);

-- Income category enum
CREATE TYPE income_category_enum AS ENUM (
  'SALARY',
  'BONUS',
  'INVESTMENT',
  'RENTAL',
  'BUSINESS',
  'OTHER'
);

-- Expense category enum
CREATE TYPE expense_category_enum AS ENUM (
  'RENT',
  'MORTGAGE',
  'UTILITIES',
  'INSURANCE',
  'CAR_PAYMENT',
  'STUDENT_LOAN',
  'CREDIT_CARD',
  'OTHER'
);

-- Property type enum
CREATE TYPE property_type_enum AS ENUM (
  'SINGLE_FAMILY',
  'CONDO',
  'COOP',
  'MULTI_FAMILY',
  'COMMERCIAL',
  'OTHER'
);

-- Disclosure type enum
CREATE TYPE disclosure_type_enum AS ENUM (
  'LEAD_PAINT',
  'LOCAL_LAW_144',
  'LOCAL_LAW_97',
  'FCRA_AUTHORIZATION',
  'BACKGROUND_CHECK_CONSENT',
  'CREDIT_CHECK_AUTHORIZATION',
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
  'SUBLET_DISCLOSURE',
  'TENANT_DISCLOSURE',
  'PET_POLICY',
  'SMOKING_POLICY',
  'RENOVATION_POLICY',
  'OTHER'
);

-- Invitation status enum
CREATE TYPE invitation_status_enum AS ENUM (
  'PENDING',
  'ACCEPTED',
  'EXPIRED',
  'REVOKED'
);

-- =====================================================
-- SECTION 2: CORE TABLES
-- =====================================================

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_enum NOT NULL DEFAULT 'APPLICANT',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "in_app": true}'::jsonb,
  consent_accepted_at TIMESTAMPTZ,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create index on role for fast lookups
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Buildings table
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address JSONB NOT NULL, -- {street, unit, city, state, zip}
  building_type building_type_enum NOT NULL,
  policies JSONB DEFAULT '{}'::jsonb, -- {pets, smoking, renovations, etc.}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_buildings_type ON buildings(building_type);
CREATE INDEX idx_buildings_deleted_at ON buildings(deleted_at) WHERE deleted_at IS NULL;

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of section configurations
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of required document categories
  custom_disclosures JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of custom disclosure configs
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_building ON templates(building_id);
CREATE INDEX idx_templates_published ON templates(is_published);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  unit TEXT,
  transaction_type transaction_type_enum NOT NULL,
  status application_status_enum NOT NULL DEFAULT 'IN_PROGRESS',
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  current_section TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional flexible data (notes, references, etc.)
  search_vector TSVECTOR, -- For full-text search (to be populated by trigger)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for applications
CREATE INDEX idx_applications_created_by ON applications(created_by);
CREATE INDEX idx_applications_building ON applications(building_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted ON applications(submitted_at);
CREATE INDEX idx_applications_deleted ON applications(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_applications_search ON applications USING GIN (search_vector);

-- Application participants (many-to-many: users <-> applications)
CREATE TABLE application_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_enum NOT NULL,
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(application_id, user_id)
);

CREATE INDEX idx_participants_application ON application_participants(application_id);
CREATE INDEX idx_participants_user ON application_participants(user_id);
CREATE INDEX idx_participants_role ON application_participants(role);

-- =====================================================
-- SECTION 3: EMBEDDED ENTITY TABLES
-- =====================================================

-- People table (applicants, co-applicants, guarantors)
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  role role_enum NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  ssn_encrypted TEXT, -- AES-256 encrypted SSN
  ssn_last4 VARCHAR(4), -- Last 4 digits for display
  current_address JSONB, -- {street, unit, city, state, zip, country}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_people_application ON people(application_id);
CREATE INDEX idx_people_role ON people(role);

-- Address history table
CREATE TABLE address_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  address JSONB NOT NULL, -- {street, unit, city, state, zip, country}
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  landlord_name TEXT,
  landlord_phone TEXT,
  landlord_email TEXT,
  monthly_rent NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_address_history_person ON address_history(person_id);
CREATE INDEX idx_address_history_current ON address_history(is_current);

-- Emergency contacts table
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emergency_contacts_person ON emergency_contacts(person_id);

-- Employment records table
CREATE TABLE employment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  employer_name TEXT NOT NULL,
  job_title TEXT,
  employment_status employment_status_enum NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  annual_income NUMERIC(12, 2),
  pay_cadence pay_cadence_enum,
  supervisor_name TEXT,
  supervisor_phone TEXT,
  supervisor_email TEXT,
  address JSONB, -- Employer address
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employment_application ON employment_records(application_id);
CREATE INDEX idx_employment_person ON employment_records(person_id);
CREATE INDEX idx_employment_current ON employment_records(is_current);

-- Financial entries table (assets, liabilities, income, expenses)
CREATE TABLE financial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  entry_type financial_entry_type_enum NOT NULL,
  category TEXT NOT NULL, -- Will reference appropriate category enum based on entry_type
  amount NUMERIC(15, 2) NOT NULL,
  institution TEXT,
  account_number_last4 VARCHAR(4),
  description TEXT,
  is_liquid BOOLEAN DEFAULT FALSE, -- For assets
  monthly_payment NUMERIC(10, 2), -- For liabilities/expenses
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_financial_application ON financial_entries(application_id);
CREATE INDEX idx_financial_type ON financial_entries(entry_type);

-- Real estate properties table
CREATE TABLE real_estate_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  property_type property_type_enum NOT NULL,
  address JSONB NOT NULL,
  purchase_price NUMERIC(15, 2),
  purchase_date DATE,
  current_value NUMERIC(15, 2),
  mortgage_balance NUMERIC(15, 2),
  monthly_payment NUMERIC(10, 2),
  is_primary_residence BOOLEAN DEFAULT FALSE,
  is_rental BOOLEAN DEFAULT FALSE,
  monthly_rental_income NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_real_estate_application ON real_estate_properties(application_id);

-- Disclosures table
CREATE TABLE disclosures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  disclosure_type disclosure_type_enum NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb, -- Signature data, IP address, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disclosures_application ON disclosures(application_id);
CREATE INDEX idx_disclosures_type ON disclosures(disclosure_type);

-- =====================================================
-- SECTION 4: DOCUMENT & COMMUNICATION TABLES
-- =====================================================

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  category document_category_enum NOT NULL,
  size INTEGER NOT NULL, -- File size in bytes
  mime_type TEXT NOT NULL,
  status document_status_enum NOT NULL DEFAULT 'COMPLETE',
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_documents_application ON documents(application_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_deleted ON documents(deleted_at) WHERE deleted_at IS NULL;

-- RFIs (Request for Information) table
CREATE TABLE rfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  section_key TEXT, -- Which application section this relates to
  status rfi_status_enum NOT NULL DEFAULT 'OPEN',
  assignee_role role_enum NOT NULL, -- Who should respond (APPLICANT, BROKER, etc.)
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rfis_application ON rfis(application_id);
CREATE INDEX idx_rfis_status ON rfis(status);
CREATE INDEX idx_rfis_created_by ON rfis(created_by);

-- RFI messages table
CREATE TABLE rfi_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfi_id UUID NOT NULL REFERENCES rfis(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_name TEXT NOT NULL, -- Denormalized for display
  author_role role_enum NOT NULL, -- Denormalized for display
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of document references
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rfi_messages_rfi ON rfi_messages(rfi_id);
CREATE INDEX idx_rfi_messages_author ON rfi_messages(author_id);
CREATE INDEX idx_rfi_messages_created ON rfi_messages(created_at);

-- Board notes table (private notes only visible to author)
CREATE TABLE board_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_board_notes_application ON board_notes(application_id);
CREATE INDEX idx_board_notes_member ON board_notes(board_member_id);
CREATE INDEX idx_board_notes_composite ON board_notes(application_id, board_member_id);

-- =====================================================
-- SECTION 5: DECISION & AUDIT TABLES
-- =====================================================

-- Decision records table
CREATE TABLE decision_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  decision decision_enum NOT NULL,
  conditions TEXT, -- For conditional approvals
  reason_codes JSONB, -- Array of reason codes for denials (FCRA compliance)
  uses_consumer_report BOOLEAN NOT NULL DEFAULT FALSE,
  adverse_action_required BOOLEAN NOT NULL DEFAULT FALSE,
  adverse_action_sent_at TIMESTAMPTZ,
  decided_by UUID NOT NULL REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_decisions_application ON decision_records(application_id);
CREATE INDEX idx_decisions_decided_by ON decision_records(decided_by);
CREATE INDEX idx_decisions_decided_at ON decision_records(decided_at);

-- Activity log table (audit trail)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'DOWNLOAD'
  entity_type TEXT NOT NULL, -- e.g., 'application', 'document', 'rfi'
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_application ON activity_log(application_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at);
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- Board assignments table
CREATE TABLE board_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(application_id, board_member_id)
);

CREATE INDEX idx_board_assignments_application ON board_assignments(application_id);
CREATE INDEX idx_board_assignments_member ON board_assignments(board_member_id);

-- Application invitations table
CREATE TABLE application_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status invitation_status_enum NOT NULL DEFAULT 'PENDING',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_application ON application_invitations(application_id);
CREATE INDEX idx_invitations_token ON application_invitations(token);
CREATE INDEX idx_invitations_email ON application_invitations(email);
CREATE INDEX idx_invitations_status ON application_invitations(status);

-- Notifications table (for in-app notifications)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- e.g., 'APPLICATION_SUBMITTED', 'RFI_CREATED', 'DECISION_MADE'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Deep link to relevant page
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read, created_at);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'User profiles extending Supabase Auth users';
COMMENT ON TABLE buildings IS 'Building directory with policies and details';
COMMENT ON TABLE templates IS 'Building-specific application templates';
COMMENT ON TABLE applications IS 'Main application records';
COMMENT ON TABLE application_participants IS 'Many-to-many relationship between users and applications';
COMMENT ON TABLE people IS 'Applicants, co-applicants, and guarantors within applications';
COMMENT ON TABLE address_history IS 'Housing history for people';
COMMENT ON TABLE emergency_contacts IS 'Emergency contacts for people';
COMMENT ON TABLE employment_records IS 'Employment and income information';
COMMENT ON TABLE financial_entries IS 'Assets, liabilities, income, and expenses';
COMMENT ON TABLE real_estate_properties IS 'Real estate owned by applicants';
COMMENT ON TABLE disclosures IS 'Legal disclosures and acknowledgments';
COMMENT ON TABLE documents IS 'File metadata for uploaded documents';
COMMENT ON TABLE rfis IS 'Requests for information from agents to applicants/brokers';
COMMENT ON TABLE rfi_messages IS 'Messages within RFI threads';
COMMENT ON TABLE board_notes IS 'Private notes by board members (only visible to author)';
COMMENT ON TABLE decision_records IS 'Application decisions (approve/conditional/deny)';
COMMENT ON TABLE activity_log IS 'Audit trail of all significant actions';
COMMENT ON TABLE board_assignments IS 'Assignment of board members to applications';
COMMENT ON TABLE application_invitations IS 'Email invitations to join applications';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
