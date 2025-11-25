-- =====================================================
-- Migration: Transaction Support RPC Functions
-- Created: 2025-01-25
-- Purpose: Provide atomic database operations for multi-step workflows
-- =====================================================

-- =====================================================
-- SECTION 1: Application Submission (atomic)
-- =====================================================

-- Submit application with all validations in a single transaction
CREATE OR REPLACE FUNCTION submit_application(
  p_application_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_app RECORD;
  v_is_complete BOOLEAN;
  v_result JSONB;
BEGIN
  -- Lock the application row to prevent concurrent modifications
  SELECT * INTO v_app
  FROM applications
  WHERE id = p_application_id
  FOR UPDATE;

  -- Check if application exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application not found'
    );
  END IF;

  -- Check if user has permission (must be creator)
  IF v_app.created_by != auth.uid() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied'
    );
  END IF;

  -- Check if already submitted
  IF v_app.status != 'IN_PROGRESS' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application already submitted or in review'
    );
  END IF;

  -- Check if application is complete
  v_is_complete := is_application_complete(p_application_id);
  IF NOT v_is_complete THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application is incomplete. Please fill in all required sections.'
    );
  END IF;

  -- Update application status atomically
  UPDATE applications
  SET
    status = 'SUBMITTED',
    submitted_at = NOW(),
    is_locked = true,
    updated_at = NOW()
  WHERE id = p_application_id;

  -- Log the submission
  INSERT INTO activity_log (
    user_id,
    application_id,
    action,
    entity_type,
    entity_id,
    new_values
  ) VALUES (
    auth.uid(),
    p_application_id,
    'SUBMIT',
    'application',
    p_application_id,
    jsonb_build_object('status', 'SUBMITTED', 'submitted_at', NOW())
  );

  RETURN jsonb_build_object(
    'success', true,
    'application_id', p_application_id,
    'status', 'SUBMITTED',
    'submitted_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION submit_application IS 'Atomically submits an application with validation and logging';

-- =====================================================
-- SECTION 2: Application Decision (atomic)
-- =====================================================

-- Record application decision with all updates in a single transaction
CREATE OR REPLACE FUNCTION record_application_decision(
  p_application_id UUID,
  p_decision TEXT, -- 'APPROVE', 'CONDITIONAL', 'DENY'
  p_conditions TEXT DEFAULT NULL,
  p_reason_codes JSONB DEFAULT NULL,
  p_uses_consumer_report BOOLEAN DEFAULT false,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_app RECORD;
  v_decision decision_enum;
  v_new_status application_status_enum;
  v_decision_id UUID;
BEGIN
  -- Validate decision value
  BEGIN
    v_decision := p_decision::decision_enum;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid decision value. Must be APPROVE, CONDITIONAL, or DENY'
    );
  END;

  -- Lock the application row
  SELECT * INTO v_app
  FROM applications
  WHERE id = p_application_id
  FOR UPDATE;

  -- Check if application exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application not found'
    );
  END IF;

  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied. Only admins can record decisions.'
    );
  END IF;

  -- Check if application is in reviewable state
  IF v_app.status NOT IN ('SUBMITTED', 'IN_REVIEW', 'RFI') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application is not in a reviewable state'
    );
  END IF;

  -- Determine new status
  v_new_status := CASE v_decision
    WHEN 'APPROVE' THEN 'APPROVED'::application_status_enum
    WHEN 'CONDITIONAL' THEN 'CONDITIONAL'::application_status_enum
    WHEN 'DENY' THEN 'DENIED'::application_status_enum
  END;

  -- Create decision record
  INSERT INTO decision_records (
    application_id,
    decision,
    conditions,
    reason_codes,
    uses_consumer_report,
    adverse_action_required,
    decided_by,
    notes
  ) VALUES (
    p_application_id,
    v_decision,
    p_conditions,
    p_reason_codes,
    p_uses_consumer_report,
    v_decision = 'DENY' AND p_uses_consumer_report,
    auth.uid(),
    p_notes
  )
  RETURNING id INTO v_decision_id;

  -- Update application status (trigger will also do this, but we do it explicitly for clarity)
  UPDATE applications
  SET
    status = v_new_status,
    is_locked = true,
    updated_at = NOW()
  WHERE id = p_application_id;

  -- Log the decision
  INSERT INTO activity_log (
    user_id,
    application_id,
    action,
    entity_type,
    entity_id,
    new_values
  ) VALUES (
    auth.uid(),
    p_application_id,
    'DECISION',
    'decision_record',
    v_decision_id,
    jsonb_build_object(
      'decision', v_decision,
      'conditions', p_conditions,
      'uses_consumer_report', p_uses_consumer_report
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'decision_id', v_decision_id,
    'application_id', p_application_id,
    'decision', v_decision,
    'status', v_new_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION record_application_decision IS 'Atomically records a decision with status update and audit logging';

-- =====================================================
-- SECTION 3: Document Upload with Metadata (atomic)
-- =====================================================

-- Create document metadata after successful storage upload
CREATE OR REPLACE FUNCTION create_document_metadata(
  p_application_id UUID,
  p_filename TEXT,
  p_storage_path TEXT,
  p_category TEXT,
  p_size INTEGER,
  p_mime_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_app RECORD;
  v_doc_id UUID;
  v_category document_category_enum;
BEGIN
  -- Validate category
  BEGIN
    v_category := p_category::document_category_enum;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid document category'
    );
  END;

  -- Lock the application row to check access
  SELECT * INTO v_app
  FROM applications
  WHERE id = p_application_id
  FOR SHARE;

  -- Check if application exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application not found'
    );
  END IF;

  -- Check if user has upload permission
  IF v_app.created_by != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM application_participants
    WHERE application_id = p_application_id
      AND user_id = auth.uid()
      AND role = 'BROKER'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied'
    );
  END IF;

  -- Check if application is editable
  IF v_app.is_locked THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application is locked and cannot be modified'
    );
  END IF;

  -- Create document record
  INSERT INTO documents (
    application_id,
    filename,
    storage_path,
    category,
    size,
    mime_type,
    status,
    uploaded_by
  ) VALUES (
    p_application_id,
    p_filename,
    p_storage_path,
    v_category,
    p_size,
    p_mime_type,
    'COMPLETE',
    auth.uid()
  )
  RETURNING id INTO v_doc_id;

  -- Log the upload
  INSERT INTO activity_log (
    user_id,
    application_id,
    action,
    entity_type,
    entity_id,
    new_values
  ) VALUES (
    auth.uid(),
    p_application_id,
    'UPLOAD',
    'document',
    v_doc_id,
    jsonb_build_object(
      'filename', p_filename,
      'category', p_category,
      'size', p_size
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'document_id', v_doc_id,
    'filename', p_filename,
    'category', p_category
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_document_metadata IS 'Creates document metadata record with validation and logging';

-- =====================================================
-- SECTION 4: Delete Document (atomic with cleanup)
-- =====================================================

-- Delete document with proper cleanup
CREATE OR REPLACE FUNCTION delete_document(
  p_document_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_doc RECORD;
  v_app RECORD;
BEGIN
  -- Lock the document row
  SELECT * INTO v_doc
  FROM documents
  WHERE id = p_document_id
  FOR UPDATE;

  -- Check if document exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Document not found'
    );
  END IF;

  -- Get the application
  SELECT * INTO v_app
  FROM applications
  WHERE id = v_doc.application_id;

  -- Check if user has permission (uploader, creator, or admin)
  IF v_doc.uploaded_by != auth.uid()
     AND v_app.created_by != auth.uid()
     AND NOT EXISTS (
       SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
     ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied'
    );
  END IF;

  -- Check if application is locked (admins can still delete)
  IF v_app.is_locked AND NOT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application is locked and cannot be modified'
    );
  END IF;

  -- Soft delete the document
  UPDATE documents
  SET deleted_at = NOW()
  WHERE id = p_document_id;

  -- Log the deletion
  INSERT INTO activity_log (
    user_id,
    application_id,
    action,
    entity_type,
    entity_id,
    old_values
  ) VALUES (
    auth.uid(),
    v_doc.application_id,
    'DELETE',
    'document',
    p_document_id,
    jsonb_build_object(
      'filename', v_doc.filename,
      'category', v_doc.category,
      'storage_path', v_doc.storage_path
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'document_id', p_document_id,
    'storage_path', v_doc.storage_path
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION delete_document IS 'Soft deletes document with permission check and logging';

-- =====================================================
-- SECTION 5: Bulk Update Financial Entries (atomic)
-- =====================================================

-- Update all financial entries for an application atomically
CREATE OR REPLACE FUNCTION update_financial_entries(
  p_application_id UUID,
  p_entries JSONB -- Array of entries to upsert
)
RETURNS JSONB AS $$
DECLARE
  v_app RECORD;
  v_entry JSONB;
  v_entry_id UUID;
  v_processed INTEGER := 0;
BEGIN
  -- Lock the application row
  SELECT * INTO v_app
  FROM applications
  WHERE id = p_application_id
  FOR UPDATE;

  -- Check if application exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application not found'
    );
  END IF;

  -- Check permission
  IF v_app.created_by != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM application_participants
    WHERE application_id = p_application_id
      AND user_id = auth.uid()
      AND role = 'BROKER'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied'
    );
  END IF;

  -- Check if editable
  IF v_app.is_locked THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application is locked'
    );
  END IF;

  -- Delete existing entries for this application
  DELETE FROM financial_entries WHERE application_id = p_application_id;

  -- Insert new entries
  FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries)
  LOOP
    INSERT INTO financial_entries (
      application_id,
      entry_type,
      category,
      amount,
      institution,
      account_number_last4,
      description,
      is_liquid,
      monthly_payment
    ) VALUES (
      p_application_id,
      (v_entry->>'entry_type')::financial_entry_type_enum,
      v_entry->>'category',
      (v_entry->>'amount')::numeric,
      v_entry->>'institution',
      v_entry->>'account_number_last4',
      v_entry->>'description',
      COALESCE((v_entry->>'is_liquid')::boolean, false),
      (v_entry->>'monthly_payment')::numeric
    );
    v_processed := v_processed + 1;
  END LOOP;

  -- Log the update
  INSERT INTO activity_log (
    user_id,
    application_id,
    action,
    entity_type,
    entity_id,
    new_values
  ) VALUES (
    auth.uid(),
    p_application_id,
    'BULK_UPDATE',
    'financial_entries',
    p_application_id,
    jsonb_build_object('entries_count', v_processed)
  );

  RETURN jsonb_build_object(
    'success', true,
    'application_id', p_application_id,
    'entries_processed', v_processed
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_financial_entries IS 'Atomically replaces all financial entries for an application';

-- =====================================================
-- SECTION 6: Create RFI with Initial Message (atomic)
-- =====================================================

-- Create an RFI with its initial message atomically
CREATE OR REPLACE FUNCTION create_rfi_with_message(
  p_application_id UUID,
  p_section_key TEXT,
  p_message TEXT,
  p_assignee_role TEXT DEFAULT 'APPLICANT'
)
RETURNS JSONB AS $$
DECLARE
  v_app RECORD;
  v_user RECORD;
  v_rfi_id UUID;
  v_message_id UUID;
  v_assignee_role role_enum;
BEGIN
  -- Validate assignee role
  BEGIN
    v_assignee_role := p_assignee_role::role_enum;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid assignee role'
    );
  END;

  -- Check if user is admin
  SELECT * INTO v_user
  FROM users
  WHERE id = auth.uid();

  IF v_user.role != 'ADMIN' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only admins can create RFIs'
    );
  END IF;

  -- Lock the application
  SELECT * INTO v_app
  FROM applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application not found'
    );
  END IF;

  -- Create the RFI
  INSERT INTO rfis (
    application_id,
    section_key,
    status,
    assignee_role,
    created_by
  ) VALUES (
    p_application_id,
    p_section_key,
    'OPEN',
    v_assignee_role,
    auth.uid()
  )
  RETURNING id INTO v_rfi_id;

  -- Create the initial message
  INSERT INTO rfi_messages (
    rfi_id,
    author_id,
    author_name,
    author_role,
    message
  ) VALUES (
    v_rfi_id,
    auth.uid(),
    v_user.first_name || ' ' || v_user.last_name,
    v_user.role,
    p_message
  )
  RETURNING id INTO v_message_id;

  -- Log the RFI creation
  INSERT INTO activity_log (
    user_id,
    application_id,
    action,
    entity_type,
    entity_id,
    new_values
  ) VALUES (
    auth.uid(),
    p_application_id,
    'CREATE',
    'rfi',
    v_rfi_id,
    jsonb_build_object(
      'section_key', p_section_key,
      'assignee_role', p_assignee_role,
      'message', p_message
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'rfi_id', v_rfi_id,
    'message_id', v_message_id,
    'application_id', p_application_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_rfi_with_message IS 'Atomically creates an RFI with its initial message';

-- =====================================================
-- SECTION 7: Grant execute permissions
-- =====================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION submit_application(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_application_decision(UUID, TEXT, TEXT, JSONB, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_document_metadata(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_document(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_financial_entries(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_rfi_with_message(UUID, TEXT, TEXT, TEXT) TO authenticated;
