-- =====================================================
-- Drop and Recreate All Tables
-- WARNING: This will delete all data!
-- =====================================================

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS application_participants CASCADE;
DROP TABLE IF EXISTS decision_records CASCADE;
DROP TABLE IF EXISTS rfi_messages CASCADE;
DROP TABLE IF EXISTS rfis CASCADE;
DROP TABLE IF EXISTS disclosures CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS real_estate_properties CASCADE;
DROP TABLE IF EXISTS financial_entries CASCADE;
DROP TABLE IF EXISTS employment_records CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- Recreate all tables
-- =====================================================

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_enum NOT NULL DEFAULT 'APPLICANT',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Buildings table
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  building_type building_type_enum NOT NULL,
  total_units INTEGER,
  year_built INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  metadata JSONB DEFAULT '{}'::jsonb,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

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
  ssn_encrypted TEXT,
  current_address JSONB,
  address_history JSONB DEFAULT '[]'::jsonb,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employment records table
CREATE TABLE employment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  employer_name TEXT NOT NULL,
  position TEXT NOT NULL,
  employment_status employment_status_enum NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  base_salary DECIMAL(15,2),
  pay_cadence pay_cadence_enum,
  supervisor_name TEXT,
  supervisor_phone TEXT,
  address JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial entries table (assets, liabilities, income, expenses)
CREATE TABLE financial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  entry_type financial_entry_type_enum NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL,
  institution TEXT,
  account_number_last4 TEXT,
  is_liquid BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Real estate properties table
CREATE TABLE real_estate_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  property_type property_type_enum NOT NULL,
  address JSONB NOT NULL,
  ownership_percentage DECIMAL(5,2),
  purchase_price DECIMAL(15,2),
  purchase_date DATE,
  current_value DECIMAL(15,2),
  outstanding_mortgage DECIMAL(15,2),
  monthly_payment DECIMAL(10,2),
  rental_income DECIMAL(10,2),
  is_primary_residence BOOLEAN DEFAULT FALSE,
  landlord_info JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  category document_category_enum NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  status document_status_enum NOT NULL DEFAULT 'UPLOADING',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disclosures table
CREATE TABLE disclosures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  disclosure_type disclosure_type_enum NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RFIs (Request for Information) table
CREATE TABLE rfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  status rfi_status_enum NOT NULL DEFAULT 'OPEN',
  subject TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RFI messages table
CREATE TABLE rfi_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfi_id UUID NOT NULL REFERENCES rfis(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Decision records table
CREATE TABLE decision_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  decided_by UUID NOT NULL REFERENCES auth.users(id),
  decision decision_enum NOT NULL,
  conditions TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Application participants table (tracks who can access an application)
CREATE TABLE application_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_enum NOT NULL,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(application_id, user_id)
);

-- =====================================================
-- Create indexes
-- =====================================================

-- Users
CREATE INDEX idx_users_role ON users(role);

-- Applications
CREATE INDEX idx_applications_created_by ON applications(created_by);
CREATE INDEX idx_applications_building ON applications(building_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_transaction_type ON applications(transaction_type);

-- People
CREATE INDEX idx_people_application ON people(application_id);
CREATE INDEX idx_people_role ON people(role);

-- Employment
CREATE INDEX idx_employment_person ON employment_records(person_id);

-- Financial entries
CREATE INDEX idx_financial_person ON financial_entries(person_id);
CREATE INDEX idx_financial_type ON financial_entries(entry_type);

-- Real estate
CREATE INDEX idx_real_estate_person ON real_estate_properties(person_id);

-- Documents
CREATE INDEX idx_documents_application ON documents(application_id);
CREATE INDEX idx_documents_person ON documents(person_id);

-- RFIs
CREATE INDEX idx_rfis_application ON rfis(application_id);
CREATE INDEX idx_rfis_status ON rfis(status);

-- Application participants
CREATE INDEX idx_participants_application ON application_participants(application_id);
CREATE INDEX idx_participants_user ON application_participants(user_id);

-- =====================================================
-- Success message
-- =====================================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ All tables and indexes created successfully!';
END $$;
