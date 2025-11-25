-- =====================================================
-- Notifications System Migration
-- Phase 5: Real-Time Features
-- =====================================================

-- Create notification type enum
DO $$ BEGIN
  CREATE TYPE notification_type_enum AS ENUM (
    'APPLICATION_SUBMITTED',
    'RFI_CREATED',
    'RFI_MESSAGE',
    'RFI_RESOLVED',
    'DECISION_MADE',
    'DOCUMENT_UPLOADED',
    'APPLICATION_STATUS_CHANGED',
    'INVITATION_RECEIVED',
    'INVITATION_ACCEPTED',
    'SYSTEM_ANNOUNCEMENT'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type_enum NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(500),
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- For grouping related notifications
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  rfi_id UUID REFERENCES rfis(id) ON DELETE SET NULL,

  -- For tracking notification origin
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_application_id ON notifications(application_id);

-- Enable Row-Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- Only the system (service role) can create notifications
CREATE POLICY "Service role can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Add notification_preferences column to users table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE users ADD COLUMN notification_preferences JSONB DEFAULT '{
      "email": {
        "application_submitted": true,
        "rfi_created": true,
        "rfi_message": true,
        "decision_made": true,
        "document_uploaded": false
      },
      "in_app": {
        "application_submitted": true,
        "rfi_created": true,
        "rfi_message": true,
        "decision_made": true,
        "document_uploaded": true,
        "application_status_changed": true
      }
    }'::jsonb;
  END IF;
END $$;

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type_enum,
  p_title VARCHAR(255),
  p_message TEXT DEFAULT NULL,
  p_link VARCHAR(500) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_application_id UUID DEFAULT NULL,
  p_rfi_id UUID DEFAULT NULL,
  p_triggered_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_user_prefs JSONB;
BEGIN
  -- Check if user wants in-app notifications for this type
  SELECT notification_preferences->'in_app'->lower(p_type::text)
  INTO v_user_prefs
  FROM users
  WHERE id = p_user_id;

  -- If no preference or preference is true, create notification
  IF v_user_prefs IS NULL OR v_user_prefs::boolean = true THEN
    INSERT INTO notifications (
      user_id, type, title, message, link, metadata,
      application_id, rfi_id, triggered_by
    ) VALUES (
      p_user_id, p_type, p_title, p_message, p_link, p_metadata,
      p_application_id, p_rfi_id, p_triggered_by
    )
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE, read_at = NOW()
  WHERE id = p_notification_id AND user_id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = TRUE, read_at = NOW()
  WHERE user_id = auth.uid() AND read = FALSE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = p_user_id AND read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to create notifications on application submission
CREATE OR REPLACE FUNCTION notify_on_application_submit()
RETURNS TRIGGER AS $$
DECLARE
  v_broker_id UUID;
  v_app_details RECORD;
BEGIN
  -- Only trigger when status changes to SUBMITTED
  IF NEW.status = 'SUBMITTED' AND (OLD.status IS NULL OR OLD.status != 'SUBMITTED') THEN
    -- Get application details
    SELECT
      a.unit,
      b.name as building_name
    INTO v_app_details
    FROM applications a
    LEFT JOIN buildings b ON b.id = a.building_id
    WHERE a.id = NEW.id;

    -- Notify any brokers on this application
    FOR v_broker_id IN
      SELECT user_id FROM application_participants
      WHERE application_id = NEW.id AND role = 'BROKER'
    LOOP
      PERFORM create_notification(
        v_broker_id,
        'APPLICATION_SUBMITTED',
        'Application Submitted',
        format('Application for %s at %s has been submitted',
               COALESCE(v_app_details.unit, 'unit'),
               COALESCE(v_app_details.building_name, 'building')),
        format('/broker/%s/qa', NEW.id),
        jsonb_build_object('application_id', NEW.id),
        NEW.id,
        NULL,
        NEW.created_by
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for application submission notifications
DROP TRIGGER IF EXISTS trigger_notify_application_submit ON applications;
CREATE TRIGGER trigger_notify_application_submit
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_application_submit();

-- Trigger function to create notifications on RFI creation
CREATE OR REPLACE FUNCTION notify_on_rfi_created()
RETURNS TRIGGER AS $$
DECLARE
  v_app_owner_id UUID;
  v_app_details RECORD;
BEGIN
  -- Get application owner and details
  SELECT
    a.created_by,
    a.unit,
    b.name as building_name
  INTO v_app_details
  FROM applications a
  LEFT JOIN buildings b ON b.id = a.building_id
  WHERE a.id = NEW.application_id;

  -- Notify the application owner
  IF v_app_details.created_by IS NOT NULL AND v_app_details.created_by != NEW.created_by THEN
    PERFORM create_notification(
      v_app_details.created_by,
      'RFI_CREATED',
      'Information Requested',
      format('New request for information on your application for %s',
             COALESCE(v_app_details.unit, 'your unit')),
      format('/applications/%s/review', NEW.application_id),
      jsonb_build_object('rfi_id', NEW.id, 'section_key', NEW.section_key),
      NEW.application_id,
      NEW.id,
      NEW.created_by
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for RFI creation notifications
DROP TRIGGER IF EXISTS trigger_notify_rfi_created ON rfis;
CREATE TRIGGER trigger_notify_rfi_created
  AFTER INSERT ON rfis
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_rfi_created();

-- Trigger function to create notifications on RFI message
CREATE OR REPLACE FUNCTION notify_on_rfi_message()
RETURNS TRIGGER AS $$
DECLARE
  v_rfi RECORD;
  v_participant UUID;
BEGIN
  -- Get RFI details
  SELECT
    r.application_id,
    r.created_by as rfi_creator,
    a.created_by as app_owner
  INTO v_rfi
  FROM rfis r
  JOIN applications a ON a.id = r.application_id
  WHERE r.id = NEW.rfi_id;

  -- Notify RFI creator if not the message author
  IF v_rfi.rfi_creator IS NOT NULL AND v_rfi.rfi_creator != NEW.author_id THEN
    PERFORM create_notification(
      v_rfi.rfi_creator,
      'RFI_MESSAGE',
      'New RFI Response',
      format('%s replied to your request', NEW.author_name),
      format('/applications/%s/review', v_rfi.application_id),
      jsonb_build_object('rfi_id', NEW.rfi_id, 'message_id', NEW.id),
      v_rfi.application_id,
      NEW.rfi_id,
      NEW.author_id
    );
  END IF;

  -- Notify application owner if not the message author
  IF v_rfi.app_owner IS NOT NULL
     AND v_rfi.app_owner != NEW.author_id
     AND v_rfi.app_owner != v_rfi.rfi_creator THEN
    PERFORM create_notification(
      v_rfi.app_owner,
      'RFI_MESSAGE',
      'New RFI Response',
      format('%s replied to your request', NEW.author_name),
      format('/applications/%s/review', v_rfi.application_id),
      jsonb_build_object('rfi_id', NEW.rfi_id, 'message_id', NEW.id),
      v_rfi.application_id,
      NEW.rfi_id,
      NEW.author_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for RFI message notifications
DROP TRIGGER IF EXISTS trigger_notify_rfi_message ON rfi_messages;
CREATE TRIGGER trigger_notify_rfi_message
  AFTER INSERT ON rfi_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_rfi_message();

-- Trigger function to create notifications on decision
CREATE OR REPLACE FUNCTION notify_on_decision()
RETURNS TRIGGER AS $$
DECLARE
  v_app_owner_id UUID;
  v_app_details RECORD;
  v_decision_text VARCHAR(50);
BEGIN
  -- Get application owner and details
  SELECT
    a.created_by,
    a.unit,
    b.name as building_name
  INTO v_app_details
  FROM applications a
  LEFT JOIN buildings b ON b.id = a.building_id
  WHERE a.id = NEW.application_id;

  -- Format decision text
  v_decision_text := CASE NEW.decision
    WHEN 'APPROVE' THEN 'approved'
    WHEN 'CONDITIONAL' THEN 'conditionally approved'
    WHEN 'DENY' THEN 'denied'
    ELSE 'decided'
  END;

  -- Notify the application owner
  IF v_app_details.created_by IS NOT NULL THEN
    PERFORM create_notification(
      v_app_details.created_by,
      'DECISION_MADE',
      format('Application %s', initcap(v_decision_text)),
      format('Your application for %s at %s has been %s',
             COALESCE(v_app_details.unit, 'the unit'),
             COALESCE(v_app_details.building_name, 'the building'),
             v_decision_text),
      format('/applications/%s/review', NEW.application_id),
      jsonb_build_object('decision_id', NEW.id, 'decision', NEW.decision),
      NEW.application_id,
      NULL,
      NEW.decided_by
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for decision notifications
DROP TRIGGER IF EXISTS trigger_notify_decision ON decision_records;
CREATE TRIGGER trigger_notify_decision
  AFTER INSERT ON decision_records
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_decision();

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

COMMENT ON TABLE notifications IS 'User notifications for in-app alerts and email notifications';
COMMENT ON FUNCTION create_notification IS 'Creates a notification respecting user preferences';
COMMENT ON FUNCTION mark_notification_read IS 'Marks a single notification as read';
COMMENT ON FUNCTION mark_all_notifications_read IS 'Marks all notifications as read for the current user';
