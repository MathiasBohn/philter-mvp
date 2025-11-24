-- =====================================================
-- Create ALL Missing Enum Types
-- Skips enums that already exist
-- =====================================================

-- Financial entry type enum
DO $$ BEGIN
  CREATE TYPE financial_entry_type_enum AS ENUM (
    'ASSET',
    'LIABILITY',
    'INCOME',
    'EXPENSE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Property type enum
DO $$ BEGIN
  CREATE TYPE property_type_enum AS ENUM (
    'HOUSE',
    'CONDO',
    'COOP',
    'TOWNHOUSE',
    'LAND',
    'COMMERCIAL',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Disclosure type enum
DO $$ BEGIN
  CREATE TYPE disclosure_type_enum AS ENUM (
    'LEAD_PAINT',
    'LOCAL_LAW_144',
    'LOCAL_LAW_97',
    'FCRA_AUTHORIZATION',
    'BACKGROUND_CHECK_CONSENT',
    'CREDIT_CHECK_AUTHORIZATION',
    'INCOME_VERIFICATION',
    'REFERENCE_CHECK',
    'SUBLET_TERMS',
    'LEASE_TERMS',
    'HOUSE_RULES',
    'ALTERATION_POLICY',
    'PET_POLICY',
    'SMOKING_POLICY'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Asset category enum
DO $$ BEGIN
  CREATE TYPE asset_category_enum AS ENUM (
    'CHECKING',
    'SAVINGS',
    'MONEY_MARKET',
    'CD',
    'STOCKS',
    'BONDS',
    'MUTUAL_FUNDS',
    'RETIREMENT_401K',
    'RETIREMENT_IRA',
    'RETIREMENT_PENSION',
    'REAL_ESTATE',
    'VEHICLE',
    'JEWELRY',
    'ART',
    'BUSINESS_INTEREST',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Liability category enum
DO $$ BEGIN
  CREATE TYPE liability_category_enum AS ENUM (
    'MORTGAGE',
    'HOME_EQUITY_LOAN',
    'AUTO_LOAN',
    'STUDENT_LOAN',
    'PERSONAL_LOAN',
    'CREDIT_CARD',
    'MEDICAL_DEBT',
    'BUSINESS_DEBT',
    'TAX_DEBT',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Income category enum
DO $$ BEGIN
  CREATE TYPE income_category_enum AS ENUM (
    'SALARY',
    'WAGES',
    'BONUS',
    'COMMISSION',
    'TIPS',
    'OVERTIME',
    'SELF_EMPLOYMENT',
    'RENTAL_INCOME',
    'INVESTMENT_INCOME',
    'DIVIDEND',
    'INTEREST',
    'PENSION',
    'SOCIAL_SECURITY',
    'DISABILITY',
    'ALIMONY',
    'CHILD_SUPPORT',
    'TRUST',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Expense category enum
DO $$ BEGIN
  CREATE TYPE expense_category_enum AS ENUM (
    'RENT',
    'MORTGAGE',
    'UTILITIES',
    'INSURANCE',
    'PROPERTY_TAX',
    'HOA_COOP_FEE',
    'MAINTENANCE',
    'CHILDCARE',
    'EDUCATION',
    'TRANSPORTATION',
    'FOOD',
    'HEALTHCARE',
    'DEBT_PAYMENT',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Invitation status enum
DO $$ BEGIN
  CREATE TYPE invitation_status_enum AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'EXPIRED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$ 
BEGIN
  RAISE NOTICE 'All enum types created successfully!';
END $$;
