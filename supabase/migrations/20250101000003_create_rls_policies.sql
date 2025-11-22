-- =============================================
-- ROW-LEVEL SECURITY POLICIES
-- Migration: 20250101000003_create_rls_policies.sql
-- Description: Create RLS policies for all tables based on user roles
-- =============================================

-- =============================================
-- HELPER FUNCTION: Get Current User Role
-- =============================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS role_enum AS $$
BEGIN
  RETURN (SELECT role FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "users_view_own" ON users
FOR SELECT USING (id = auth.uid());

-- Users can update their own profile (but not their role)
CREATE POLICY "users_update_own" ON users
FOR UPDATE USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can view all users
CREATE POLICY "admins_view_all_users" ON users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- =============================================
-- BUILDINGS TABLE POLICIES
-- =============================================

-- Authenticated users can view all buildings (for application creation)
CREATE POLICY "authenticated_view_buildings" ON buildings
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can create/update/delete buildings
CREATE POLICY "admins_manage_buildings" ON buildings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- =============================================
-- TEMPLATES TABLE POLICIES
-- =============================================

-- Authenticated users can view published templates
CREATE POLICY "authenticated_view_published_templates" ON templates
FOR SELECT USING (
  auth.uid() IS NOT NULL AND is_published = true
);

-- Admins can view all templates (including drafts)
CREATE POLICY "admins_view_all_templates" ON templates
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Admins can manage templates
CREATE POLICY "admins_manage_templates" ON templates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- =============================================
-- APPLICATIONS TABLE POLICIES
-- =============================================

-- Applicants can view and edit applications they created
CREATE POLICY "applicants_own_applications" ON applications
FOR ALL USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Brokers can view and edit applications they participate in
CREATE POLICY "brokers_managed_applications" ON applications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM application_participants
    WHERE application_id = applications.id
      AND user_id = auth.uid()
      AND role = 'BROKER'
  )
);

-- Admins can view all applications
CREATE POLICY "admins_view_all_applications" ON applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Admins can update applications (for review and decisions)
CREATE POLICY "admins_update_applications" ON applications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Board members can view assigned applications
CREATE POLICY "board_view_assigned_applications" ON applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM board_assignments
    WHERE application_id = applications.id
      AND board_member_id = auth.uid()
  )
);

-- =============================================
-- APPLICATION_PARTICIPANTS TABLE POLICIES
-- =============================================

-- Users can view participants for applications they have access to
CREATE POLICY "view_participants_with_access" ON application_participants
FOR SELECT USING (
  -- Creator access
  EXISTS (
    SELECT 1 FROM applications
    WHERE id = application_participants.application_id
      AND created_by = auth.uid()
  )
  OR
  -- Participant access
  user_id = auth.uid()
  OR
  -- Admin access
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Application creators and admins can add participants
CREATE POLICY "manage_participants" ON application_participants
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM applications
    WHERE id = application_participants.application_id
      AND (created_by = auth.uid() OR auth.uid() IN (
        SELECT id FROM users WHERE role = 'ADMIN'
      ))
  )
);

-- =============================================
-- PEOPLE TABLE POLICIES
-- =============================================

-- Users can view people in applications they have access to
CREATE POLICY "view_people_with_application_access" ON people
FOR SELECT USING (
  -- Creator access
  EXISTS (
    SELECT 1 FROM applications
    WHERE id = people.application_id
      AND created_by = auth.uid()
  )
  OR
  -- Broker access
  EXISTS (
    SELECT 1 FROM application_participants ap
    JOIN applications a ON a.id = ap.application_id
    WHERE a.id = people.application_id
      AND ap.user_id = auth.uid()
      AND ap.role = 'BROKER'
  )
  OR
  -- Admin access
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
  OR
  -- Board member access (SSN will be redacted in application layer)
  EXISTS (
    SELECT 1 FROM board_assignments
    WHERE application_id = people.application_id
      AND board_member_id = auth.uid()
  )
);

-- Users can manage people in applications they have edit access to
CREATE POLICY "manage_people_with_application_access" ON people
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM applications
    WHERE id = people.application_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = applications.id
            AND user_id = auth.uid()
            AND role = 'BROKER'
        )
      )
  )
);

-- =============================================
-- ADDRESS_HISTORY TABLE POLICIES
-- =============================================

-- Inherit access from people table
CREATE POLICY "view_address_history_with_person_access" ON address_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM people p
    JOIN applications a ON a.id = p.application_id
    WHERE p.id = address_history.person_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
        OR
        EXISTS (
          SELECT 1 FROM board_assignments
          WHERE application_id = a.id AND board_member_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "manage_address_history" ON address_history
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM people p
    JOIN applications a ON a.id = p.application_id
    WHERE p.id = address_history.person_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
            AND role = 'BROKER'
        )
      )
  )
);

-- =============================================
-- EMERGENCY_CONTACTS TABLE POLICIES
-- =============================================

-- Inherit access from people table
CREATE POLICY "view_emergency_contacts_with_person_access" ON emergency_contacts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM people p
    JOIN applications a ON a.id = p.application_id
    WHERE p.id = emergency_contacts.person_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
        OR
        EXISTS (
          SELECT 1 FROM board_assignments
          WHERE application_id = a.id AND board_member_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "manage_emergency_contacts" ON emergency_contacts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM people p
    JOIN applications a ON a.id = p.application_id
    WHERE p.id = emergency_contacts.person_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
            AND role = 'BROKER'
        )
      )
  )
);

-- =============================================
-- EMPLOYMENT_RECORDS TABLE POLICIES
-- =============================================

CREATE POLICY "view_employment_with_application_access" ON employment_records
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = employment_records.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
        OR
        EXISTS (
          SELECT 1 FROM board_assignments
          WHERE application_id = a.id AND board_member_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "manage_employment" ON employment_records
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = employment_records.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
            AND role = 'BROKER'
        )
      )
  )
);

-- =============================================
-- FINANCIAL_ENTRIES TABLE POLICIES
-- =============================================

CREATE POLICY "view_financials_with_application_access" ON financial_entries
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = financial_entries.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
        OR
        EXISTS (
          SELECT 1 FROM board_assignments
          WHERE application_id = a.id AND board_member_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "manage_financials" ON financial_entries
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = financial_entries.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
            AND role = 'BROKER'
        )
      )
  )
);

-- =============================================
-- REAL_ESTATE_PROPERTIES TABLE POLICIES
-- =============================================

CREATE POLICY "view_properties_with_application_access" ON real_estate_properties
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = real_estate_properties.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
        OR
        EXISTS (
          SELECT 1 FROM board_assignments
          WHERE application_id = a.id AND board_member_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "manage_properties" ON real_estate_properties
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = real_estate_properties.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
            AND role = 'BROKER'
        )
      )
  )
);

-- =============================================
-- DISCLOSURES TABLE POLICIES
-- =============================================

CREATE POLICY "view_disclosures_with_application_access" ON disclosures
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = disclosures.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
        OR
        EXISTS (
          SELECT 1 FROM board_assignments
          WHERE application_id = a.id AND board_member_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "manage_disclosures" ON disclosures
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = disclosures.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
            AND role = 'BROKER'
        )
      )
  )
);

-- =============================================
-- DOCUMENTS TABLE POLICIES
-- =============================================

-- Users can view documents for applications they have access to
CREATE POLICY "view_documents_with_application_access" ON documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = documents.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
        OR
        EXISTS (
          SELECT 1 FROM board_assignments
          WHERE application_id = a.id AND board_member_id = auth.uid()
        )
      )
  )
);

-- Users can upload documents only if they're applicant or broker
CREATE POLICY "upload_documents" ON documents
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = documents.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
            AND role = 'BROKER'
        )
      )
  )
  AND uploaded_by = auth.uid()
);

-- Users can delete only documents they uploaded
CREATE POLICY "delete_own_documents" ON documents
FOR DELETE USING (uploaded_by = auth.uid());

-- Admins can delete any document
CREATE POLICY "admins_delete_documents" ON documents
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- =============================================
-- RFIS TABLE POLICIES
-- =============================================

-- View RFIs if have application access
CREATE POLICY "view_rfis_with_application_access" ON rfis
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = rfis.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
      )
  )
);

-- Only admins can create RFIs
CREATE POLICY "admins_create_rfis" ON rfis
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
  AND created_by = auth.uid()
);

-- Admins can update RFI status
CREATE POLICY "admins_update_rfis" ON rfis
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- =============================================
-- RFI_MESSAGES TABLE POLICIES
-- =============================================

-- View RFI messages if have RFI access
CREATE POLICY "view_rfi_messages_with_rfi_access" ON rfi_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM rfis r
    JOIN applications a ON a.id = r.application_id
    WHERE r.id = rfi_messages.rfi_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
      )
  )
);

-- Post RFI messages if assigned or admin
CREATE POLICY "post_rfi_messages" ON rfi_messages
FOR INSERT WITH CHECK (
  author_id = auth.uid()
  AND
  EXISTS (
    SELECT 1 FROM rfis r
    JOIN applications a ON a.id = r.application_id
    WHERE r.id = rfi_messages.rfi_id
      AND (
        -- Assigned applicant/broker
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
        )
        OR
        -- Admin
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
      )
  )
);

-- =============================================
-- BOARD_NOTES TABLE POLICIES
-- =============================================

-- Board members can only see their own notes
CREATE POLICY "board_notes_private" ON board_notes
FOR ALL USING (board_member_id = auth.uid())
WITH CHECK (board_member_id = auth.uid());

-- Admins can view all board notes
CREATE POLICY "admins_view_board_notes" ON board_notes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- =============================================
-- DECISION_RECORDS TABLE POLICIES
-- =============================================

-- View decisions if have application access
CREATE POLICY "view_decisions_with_application_access" ON decision_records
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = decision_records.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
      )
  )
);

-- Only admins can create decisions
CREATE POLICY "admins_create_decisions" ON decision_records
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
  AND decided_by = auth.uid()
);

-- Decisions cannot be updated or deleted (immutable for audit)

-- =============================================
-- ACTIVITY_LOG TABLE POLICIES
-- =============================================

-- Admins can view all activity logs
CREATE POLICY "admins_view_activity_log" ON activity_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Users can view their own activity
CREATE POLICY "users_view_own_activity" ON activity_log
FOR SELECT USING (user_id = auth.uid());

-- Activity logs are system-generated (no INSERT/UPDATE/DELETE by users)

-- =============================================
-- BOARD_ASSIGNMENTS TABLE POLICIES
-- =============================================

-- Board members can view their own assignments
CREATE POLICY "board_view_own_assignments" ON board_assignments
FOR SELECT USING (board_member_id = auth.uid());

-- Admins can manage all board assignments
CREATE POLICY "admins_manage_board_assignments" ON board_assignments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- =============================================
-- APPLICATION_INVITATIONS TABLE POLICIES
-- =============================================

-- View invitations for applications you have access to
CREATE POLICY "view_invitations_with_application_access" ON application_invitations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = application_invitations.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
            AND role = 'BROKER'
        )
        OR
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
      )
  )
);

-- Create invitations if you have application access
CREATE POLICY "create_invitations" ON application_invitations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = application_invitations.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
            AND role = 'BROKER'
        )
      )
  )
  AND invited_by = auth.uid()
);

-- Update invitations (accept/revoke)
CREATE POLICY "update_invitations" ON application_invitations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = application_invitations.application_id
      AND (
        a.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM application_participants
          WHERE application_id = a.id
            AND user_id = auth.uid()
            AND role = 'BROKER'
        )
      )
  )
);

-- =============================================
-- NOTIFICATIONS TABLE POLICIES
-- =============================================

-- Users can only view their own notifications
CREATE POLICY "users_view_own_notifications" ON notifications
FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "users_update_own_notifications" ON notifications
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Notifications are system-generated (INSERT via triggers/functions)
-- Users can delete their own notifications
CREATE POLICY "users_delete_own_notifications" ON notifications
FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify policies are created:
--
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- Count policies per table:
-- SELECT tablename, COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY tablename
-- ORDER BY tablename;
