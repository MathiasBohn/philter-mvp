-- =====================================================================================
-- Migration: Create Performance Indexes
-- Description: Adds indexes on frequently queried columns to optimize performance
-- Version: 1.0
-- Date: 2025-01-22
-- =====================================================================================

-- =====================================================================================
-- SECTION 1: APPLICATION INDEXES
-- =====================================================================================

-- Index on applications.created_by for user's application queries
CREATE INDEX IF NOT EXISTS idx_applications_created_by
ON applications(created_by)
WHERE deleted_at IS NULL;

-- Index on applications.building_id for building-specific queries
CREATE INDEX IF NOT EXISTS idx_applications_building_id
ON applications(building_id)
WHERE deleted_at IS NULL;

-- Index on applications.status for status filtering
CREATE INDEX IF NOT EXISTS idx_applications_status
ON applications(status)
WHERE deleted_at IS NULL;

-- Index on applications.submitted_at for chronological sorting
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at
ON applications(submitted_at DESC)
WHERE submitted_at IS NOT NULL;

-- Composite index for common query pattern (status + submitted_at)
CREATE INDEX IF NOT EXISTS idx_applications_status_submitted
ON applications(status, submitted_at DESC)
WHERE deleted_at IS NULL;

-- Composite index for user's applications by status
CREATE INDEX IF NOT EXISTS idx_applications_user_status
ON applications(created_by, status)
WHERE deleted_at IS NULL;

-- Index for full-text search
CREATE INDEX IF NOT EXISTS idx_applications_search_vector
ON applications USING GIN(search_vector);

-- =====================================================================================
-- SECTION 2: APPLICATION PARTICIPANTS INDEXES
-- =====================================================================================

-- Index on application_participants.user_id for user's participated applications
CREATE INDEX IF NOT EXISTS idx_application_participants_user_id
ON application_participants(user_id);

-- Index on application_participants.application_id for application's participants
CREATE INDEX IF NOT EXISTS idx_application_participants_application_id
ON application_participants(application_id);

-- Composite index for user role queries
CREATE INDEX IF NOT EXISTS idx_application_participants_user_role
ON application_participants(user_id, role);

-- =====================================================================================
-- SECTION 3: PEOPLE & EMBEDDED ENTITY INDEXES
-- =====================================================================================

-- Index on people.application_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_people_application_id
ON people(application_id);

-- Index on people.role for role-based queries
CREATE INDEX IF NOT EXISTS idx_people_role
ON people(role);

-- Index on people.ssn_last4 for quick SSN lookup
CREATE INDEX IF NOT EXISTS idx_people_ssn_last4
ON people(ssn_last4);

-- Index on address_history.person_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_address_history_person_id
ON address_history(person_id);

-- Index on address_history.is_current for current address queries
CREATE INDEX IF NOT EXISTS idx_address_history_is_current
ON address_history(person_id, is_current)
WHERE is_current = true;

-- Index on emergency_contacts.person_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_person_id
ON emergency_contacts(person_id);

-- Index on employment_records.application_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_employment_records_application_id
ON employment_records(application_id);

-- Index on employment_records.person_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_employment_records_person_id
ON employment_records(person_id);

-- Index on employment_records.is_current for current employment
CREATE INDEX IF NOT EXISTS idx_employment_records_is_current
ON employment_records(person_id, is_current)
WHERE is_current = true;

-- Index on financial_entries.application_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_financial_entries_application_id
ON financial_entries(application_id);

-- Index on financial_entries.entry_type for filtering by type
CREATE INDEX IF NOT EXISTS idx_financial_entries_entry_type
ON financial_entries(application_id, entry_type);

-- Index on real_estate_properties.application_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_real_estate_properties_application_id
ON real_estate_properties(application_id);

-- Index on disclosures.application_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_disclosures_application_id
ON disclosures(application_id);

-- Index on disclosures.acknowledged for incomplete disclosure queries
CREATE INDEX IF NOT EXISTS idx_disclosures_acknowledged
ON disclosures(application_id, acknowledged)
WHERE acknowledged = false;

-- =====================================================================================
-- SECTION 4: DOCUMENT INDEXES
-- =====================================================================================

-- Index on documents.application_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_documents_application_id
ON documents(application_id)
WHERE deleted_at IS NULL;

-- Index on documents.category for category filtering
CREATE INDEX IF NOT EXISTS idx_documents_category
ON documents(application_id, category)
WHERE deleted_at IS NULL;

-- Index on documents.uploaded_by for user's uploaded documents
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by
ON documents(uploaded_by)
WHERE deleted_at IS NULL;

-- Index on documents.uploaded_at for chronological sorting
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at
ON documents(uploaded_at DESC);

-- =====================================================================================
-- SECTION 5: RFI INDEXES
-- =====================================================================================

-- Index on rfis.application_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_rfis_application_id
ON rfis(application_id);

-- Index on rfis.status for filtering by status
CREATE INDEX IF NOT EXISTS idx_rfis_status
ON rfis(status);

-- Index on rfis.created_by (foreign key)
CREATE INDEX IF NOT EXISTS idx_rfis_created_by
ON rfis(created_by);

-- Composite index for application's open RFIs
CREATE INDEX IF NOT EXISTS idx_rfis_application_status
ON rfis(application_id, status)
WHERE status = 'OPEN';

-- Index on rfi_messages.rfi_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_rfi_messages_rfi_id
ON rfi_messages(rfi_id);

-- Index on rfi_messages.author_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_rfi_messages_author_id
ON rfi_messages(author_id);

-- Index on rfi_messages.created_at for chronological order
CREATE INDEX IF NOT EXISTS idx_rfi_messages_created_at
ON rfi_messages(rfi_id, created_at);

-- =====================================================================================
-- SECTION 6: BOARD NOTES INDEXES
-- =====================================================================================

-- Index on board_notes.application_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_board_notes_application_id
ON board_notes(application_id)
WHERE deleted_at IS NULL;

-- Index on board_notes.board_member_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_board_notes_board_member_id
ON board_notes(board_member_id)
WHERE deleted_at IS NULL;

-- Composite index for board member's notes on application
CREATE INDEX IF NOT EXISTS idx_board_notes_member_application
ON board_notes(board_member_id, application_id)
WHERE deleted_at IS NULL;

-- =====================================================================================
-- SECTION 7: DECISION RECORDS INDEXES
-- =====================================================================================

-- Index on decision_records.application_id (foreign key, should be unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_decision_records_application_id
ON decision_records(application_id);

-- Index on decision_records.decided_by (foreign key)
CREATE INDEX IF NOT EXISTS idx_decision_records_decided_by
ON decision_records(decided_by);

-- Index on decision_records.decided_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_decision_records_decided_at
ON decision_records(decided_at DESC);

-- Index on decision_records.decision for filtering by decision type
CREATE INDEX IF NOT EXISTS idx_decision_records_decision
ON decision_records(decision);

-- =====================================================================================
-- SECTION 8: ACTIVITY LOG INDEXES
-- =====================================================================================

-- Index on activity_log.user_id for user activity queries
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id
ON activity_log(user_id);

-- Index on activity_log.application_id for application audit trail
CREATE INDEX IF NOT EXISTS idx_activity_log_application_id
ON activity_log(application_id);

-- Index on activity_log.created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at
ON activity_log(created_at DESC);

-- Composite index for application audit trail (most common query)
CREATE INDEX IF NOT EXISTS idx_activity_log_application_created
ON activity_log(application_id, created_at DESC);

-- Index on activity_log.action for filtering by action type
CREATE INDEX IF NOT EXISTS idx_activity_log_action
ON activity_log(action);

-- =====================================================================================
-- SECTION 9: BOARD ASSIGNMENTS INDEXES
-- =====================================================================================

-- Index on board_assignments.application_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_board_assignments_application_id
ON board_assignments(application_id);

-- Index on board_assignments.board_member_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_board_assignments_board_member_id
ON board_assignments(board_member_id);

-- Index on board_assignments.assigned_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_board_assignments_assigned_at
ON board_assignments(assigned_at DESC);

-- =====================================================================================
-- SECTION 10: APPLICATION INVITATIONS INDEXES
-- =====================================================================================

-- Index on application_invitations.application_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_application_invitations_application_id
ON application_invitations(application_id);

-- Index on application_invitations.email for email lookup
CREATE INDEX IF NOT EXISTS idx_application_invitations_email
ON application_invitations(email);

-- Index on application_invitations.token for token validation (unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_application_invitations_token
ON application_invitations(token);

-- Index on application_invitations.status for filtering by status
CREATE INDEX IF NOT EXISTS idx_application_invitations_status
ON application_invitations(status);

-- Composite index for expired invitations cleanup
CREATE INDEX IF NOT EXISTS idx_application_invitations_status_expires
ON application_invitations(status, expires_at)
WHERE status = 'PENDING';

-- =====================================================================================
-- SECTION 11: NOTIFICATIONS INDEXES
-- =====================================================================================

-- Index on notifications.user_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
ON notifications(user_id);

-- Index on notifications.read for unread notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
ON notifications(user_id, read)
WHERE read = false;

-- Index on notifications.created_at for chronological order
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
ON notifications(created_at DESC);

-- Composite index for user's unread notifications (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
ON notifications(user_id, read, created_at DESC);

-- =====================================================================================
-- SECTION 12: BUILDINGS & TEMPLATES INDEXES
-- =====================================================================================

-- Index on templates.building_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_templates_building_id
ON templates(building_id);

-- Index on templates.is_published for published template queries
CREATE INDEX IF NOT EXISTS idx_templates_is_published
ON templates(building_id, is_published)
WHERE is_published = true;

-- Index on buildings.building_type for filtering by type
CREATE INDEX IF NOT EXISTS idx_buildings_building_type
ON buildings(building_type)
WHERE deleted_at IS NULL;

-- =====================================================================================
-- SECTION 13: USERS INDEXES
-- =====================================================================================

-- Index on users.role for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role
ON users(role);

-- =====================================================================================
-- VERIFICATION
-- =====================================================================================

-- Count all indexes created
SELECT
    schemaname,
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Show summary
DO $$
DECLARE
    total_indexes integer;
BEGIN
    SELECT COUNT(*) INTO total_indexes
    FROM pg_indexes
    WHERE schemaname = 'public';

    RAISE NOTICE '✅ Performance indexes created successfully!';
    RAISE NOTICE 'Total indexes in public schema: %', total_indexes;
END $$;
