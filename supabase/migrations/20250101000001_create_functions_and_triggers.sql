-- =====================================================
-- Philter MVP Database Functions & Triggers
-- Created: 2025-01-21
-- Purpose: Automated timestamp updates, audit logging, and business logic
-- =====================================================

-- =====================================================
-- SECTION 1: TIMESTAMP TRIGGER FUNCTION
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically updates the updated_at column on row updates';

-- =====================================================
-- SECTION 2: APPLY TIMESTAMP TRIGGERS TO ALL TABLES
-- =====================================================

-- Users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Buildings table
CREATE TRIGGER update_buildings_updated_at
  BEFORE UPDATE ON buildings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Templates table
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Applications table
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- People table
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Address history table
CREATE TRIGGER update_address_history_updated_at
  BEFORE UPDATE ON address_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Emergency contacts table
CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Employment records table
CREATE TRIGGER update_employment_records_updated_at
  BEFORE UPDATE ON employment_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Financial entries table
CREATE TRIGGER update_financial_entries_updated_at
  BEFORE UPDATE ON financial_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Real estate properties table
CREATE TRIGGER update_real_estate_properties_updated_at
  BEFORE UPDATE ON real_estate_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Disclosures table
CREATE TRIGGER update_disclosures_updated_at
  BEFORE UPDATE ON disclosures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Documents table
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RFIs table
CREATE TRIGGER update_rfis_updated_at
  BEFORE UPDATE ON rfis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Board notes table
CREATE TRIGGER update_board_notes_updated_at
  BEFORE UPDATE ON board_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: AUDIT LOGGING FUNCTION
-- =====================================================

-- Function to log application changes to activity_log
CREATE OR REPLACE FUNCTION log_application_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  old_data JSONB;
  new_data JSONB;
BEGIN
  -- Determine action type
  IF (TG_OP = 'INSERT') THEN
    action_type := 'CREATE';
    old_data := NULL;
    new_data := to_jsonb(NEW);
  ELSIF (TG_OP = 'UPDATE') THEN
    action_type := 'UPDATE';
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF (TG_OP = 'DELETE') THEN
    action_type := 'DELETE';
    old_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;

  -- Insert audit log entry
  INSERT INTO activity_log (
    user_id,
    application_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  ) VALUES (
    COALESCE(NEW.created_by, OLD.created_by), -- User who made the change
    COALESCE(NEW.id, OLD.id), -- Application ID
    action_type,
    'application',
    COALESCE(NEW.id, OLD.id),
    old_data,
    new_data
  );

  -- Return appropriate value based on operation
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_application_changes IS 'Automatically logs all changes to applications table in activity_log';

-- Apply audit logging trigger to applications table
CREATE TRIGGER audit_application_changes
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION log_application_changes();

-- =====================================================
-- SECTION 4: APPLICATION COMPLETION CALCULATION
-- =====================================================

-- Function to calculate application completion percentage
CREATE OR REPLACE FUNCTION get_application_completion_percentage(app_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_sections INTEGER := 13; -- Total number of sections in application
  completed_sections INTEGER := 0;
  completion_pct INTEGER;
BEGIN
  -- Section 1: Profile (check if people exist)
  IF EXISTS (SELECT 1 FROM people WHERE application_id = app_id LIMIT 1) THEN
    completed_sections := completed_sections + 1;
  END IF;

  -- Section 2: Parties (check if people exist)
  IF EXISTS (SELECT 1 FROM people WHERE application_id = app_id LIMIT 1) THEN
    completed_sections := completed_sections + 1;
  END IF;

  -- Section 3: People (check if people exist)
  IF EXISTS (SELECT 1 FROM people WHERE application_id = app_id LIMIT 1) THEN
    completed_sections := completed_sections + 1;
  END IF;

  -- Section 4: Income (check if employment records exist)
  IF EXISTS (SELECT 1 FROM employment_records WHERE application_id = app_id LIMIT 1) THEN
    completed_sections := completed_sections + 1;
  END IF;

  -- Section 5: Financials (check if financial entries exist)
  IF EXISTS (SELECT 1 FROM financial_entries WHERE application_id = app_id LIMIT 1) THEN
    completed_sections := completed_sections + 1;
  END IF;

  -- Section 6: Real Estate (can be optional)
  completed_sections := completed_sections + 1; -- Always count as complete if section is optional

  -- Section 7: Lease Terms (check metadata)
  IF (SELECT metadata->>'lease_terms_complete' FROM applications WHERE id = app_id) = 'true' THEN
    completed_sections := completed_sections + 1;
  END IF;

  -- Section 8: Building Policies (check disclosures)
  IF EXISTS (SELECT 1 FROM disclosures WHERE application_id = app_id AND disclosure_type = 'PET_POLICY') THEN
    completed_sections := completed_sections + 1;
  END IF;

  -- Section 9: Documents (check if documents uploaded)
  IF EXISTS (SELECT 1 FROM documents WHERE application_id = app_id LIMIT 1) THEN
    completed_sections := completed_sections + 1;
  END IF;

  -- Section 10: Disclosures (check if all required disclosures acknowledged)
  IF (SELECT COUNT(*) FROM disclosures WHERE application_id = app_id AND acknowledged = true) >= 3 THEN
    completed_sections := completed_sections + 1;
  END IF;

  -- Section 11: Cover Letter (check metadata)
  IF (SELECT metadata->>'cover_letter' FROM applications WHERE id = app_id) IS NOT NULL THEN
    completed_sections := completed_sections + 1;
  END IF;

  -- Section 12: Overview (always complete if application exists)
  completed_sections := completed_sections + 1;

  -- Section 13: Review (always complete if application exists)
  completed_sections := completed_sections + 1;

  -- Calculate percentage
  completion_pct := (completed_sections * 100) / total_sections;

  RETURN completion_pct;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_application_completion_percentage IS 'Calculates completion percentage based on filled sections';

-- =====================================================
-- SECTION 5: APPLICATION VALIDATION
-- =====================================================

-- Function to check if application is complete and ready for submission
CREATE OR REPLACE FUNCTION is_application_complete(app_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  app_record RECORD;
  has_people BOOLEAN;
  has_employment BOOLEAN;
  has_financials BOOLEAN;
  has_documents BOOLEAN;
  has_disclosures BOOLEAN;
BEGIN
  -- Get application record
  SELECT * INTO app_record FROM applications WHERE id = app_id;

  -- Check if application exists
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check required embedded entities
  SELECT EXISTS(SELECT 1 FROM people WHERE application_id = app_id) INTO has_people;
  SELECT EXISTS(SELECT 1 FROM employment_records WHERE application_id = app_id) INTO has_employment;
  SELECT EXISTS(SELECT 1 FROM financial_entries WHERE application_id = app_id) INTO has_financials;
  SELECT EXISTS(SELECT 1 FROM documents WHERE application_id = app_id AND category IN ('GOVERNMENT_ID', 'BANK_STATEMENT')) INTO has_documents;
  SELECT (COUNT(*) >= 3) INTO has_disclosures FROM disclosures WHERE application_id = app_id AND acknowledged = true;

  -- Application is complete if all required sections have data
  RETURN has_people AND has_employment AND has_financials AND has_documents AND has_disclosures;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION is_application_complete IS 'Validates if application meets submission requirements';

-- =====================================================
-- SECTION 6: FULL-TEXT SEARCH VECTOR UPDATE
-- =====================================================

-- Function to update search vector for applications
CREATE OR REPLACE FUNCTION update_application_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  -- Update search vector with unit number and metadata notes
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.unit, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.metadata->>'notes', '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.metadata->>'cover_letter', '')), 'C');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_application_search_vector IS 'Updates full-text search vector for applications';

-- Apply search vector trigger
CREATE TRIGGER update_applications_search_vector
  BEFORE INSERT OR UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_application_search_vector();

-- =====================================================
-- SECTION 7: USER PROFILE CREATION
-- =====================================================

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (
    id,
    role,
    first_name,
    last_name,
    phone
  ) VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::role_enum, 'APPLICANT'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_user_profile IS 'Automatically creates user profile when new auth user is created';

-- Apply user profile creation trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- =====================================================
-- SECTION 8: INVITATION STATUS UPDATE
-- =====================================================

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE application_invitations
  SET status = 'EXPIRED'
  WHERE status = 'PENDING'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION expire_old_invitations IS 'Marks expired invitations as EXPIRED status';

-- =====================================================
-- SECTION 9: APPLICATION STATUS UPDATE ON RFI
-- =====================================================

-- Function to update application status when RFI is created or resolved
CREATE OR REPLACE FUNCTION update_application_status_on_rfi()
RETURNS TRIGGER AS $$
DECLARE
  open_rfi_count INTEGER;
BEGIN
  -- Count open RFIs for this application
  SELECT COUNT(*) INTO open_rfi_count
  FROM rfis
  WHERE application_id = COALESCE(NEW.application_id, OLD.application_id)
    AND status = 'OPEN';

  -- Update application status based on open RFIs
  IF open_rfi_count > 0 THEN
    UPDATE applications
    SET status = 'RFI'
    WHERE id = COALESCE(NEW.application_id, OLD.application_id)
      AND status NOT IN ('APPROVED', 'CONDITIONAL', 'DENIED'); -- Don't override final decisions
  ELSE
    -- If no open RFIs, revert to IN_REVIEW (if was in RFI status)
    UPDATE applications
    SET status = 'IN_REVIEW'
    WHERE id = COALESCE(NEW.application_id, OLD.application_id)
      AND status = 'RFI';
  END IF;

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_application_status_on_rfi IS 'Updates application status to RFI when RFIs are created or resolved';

-- Apply RFI status trigger
CREATE TRIGGER update_app_status_on_rfi_change
  AFTER INSERT OR UPDATE OR DELETE ON rfis
  FOR EACH ROW
  EXECUTE FUNCTION update_application_status_on_rfi();

-- =====================================================
-- SECTION 10: DECISION RECORD APPLICATION STATUS UPDATE
-- =====================================================

-- Function to update application status when decision is made
CREATE OR REPLACE FUNCTION update_application_status_on_decision()
RETURNS TRIGGER AS $$
BEGIN
  -- Update application status to match decision
  UPDATE applications
  SET
    status = CASE NEW.decision
      WHEN 'APPROVE' THEN 'APPROVED'::application_status_enum
      WHEN 'CONDITIONAL' THEN 'CONDITIONAL'::application_status_enum
      WHEN 'DENY' THEN 'DENIED'::application_status_enum
    END,
    is_locked = true -- Lock application after decision
  WHERE id = NEW.application_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_application_status_on_decision IS 'Updates application status when decision is recorded';

-- Apply decision trigger
CREATE TRIGGER update_app_status_on_decision
  AFTER INSERT ON decision_records
  FOR EACH ROW
  EXECUTE FUNCTION update_application_status_on_decision();

-- =====================================================
-- SECTION 11: COMPLETION PERCENTAGE AUTO-UPDATE
-- =====================================================

-- Function to auto-update completion percentage
CREATE OR REPLACE FUNCTION auto_update_completion_percentage()
RETURNS TRIGGER AS $$
DECLARE
  app_id UUID;
  new_percentage INTEGER;
BEGIN
  -- Get application ID from the triggering table
  IF TG_TABLE_NAME = 'applications' THEN
    app_id := NEW.id;
  ELSIF TG_TABLE_NAME IN ('people', 'employment_records', 'financial_entries',
                           'real_estate_properties', 'documents', 'disclosures') THEN
    app_id := NEW.application_id;
  ELSE
    RETURN NEW;
  END IF;

  -- Calculate new completion percentage
  new_percentage := get_application_completion_percentage(app_id);

  -- Update application
  UPDATE applications
  SET completion_percentage = new_percentage
  WHERE id = app_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_update_completion_percentage IS 'Automatically recalculates completion percentage when data changes';

-- Apply completion percentage triggers to relevant tables
CREATE TRIGGER update_completion_on_people_change
  AFTER INSERT OR UPDATE OR DELETE ON people
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_completion_percentage();

CREATE TRIGGER update_completion_on_employment_change
  AFTER INSERT OR UPDATE OR DELETE ON employment_records
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_completion_percentage();

CREATE TRIGGER update_completion_on_financials_change
  AFTER INSERT OR UPDATE OR DELETE ON financial_entries
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_completion_percentage();

CREATE TRIGGER update_completion_on_documents_change
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_completion_percentage();

CREATE TRIGGER update_completion_on_disclosures_change
  AFTER INSERT OR UPDATE OR DELETE ON disclosures
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_completion_percentage();

-- =====================================================
-- END OF FUNCTIONS AND TRIGGERS
-- =====================================================
