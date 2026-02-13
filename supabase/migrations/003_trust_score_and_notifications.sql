-- =============================================
-- PHASE 3: Trust Score & Notifications System
-- =============================================
-- This migration adds:
-- 1. Trust score calculation function
-- 2. Automatic trust score updates on payment status changes
-- 3. Notification creation functions
-- 4. Metadata field for notifications
-- =============================================

-- =============================================
-- 1. ADD METADATA TO NOTIFICATIONS
-- =============================================

-- Add metadata field to notifications table for additional data (round_id, payment_id, etc.)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================
-- 2. TRUST SCORE CALCULATION FUNCTION
-- =============================================

-- Calculate trust score based on payment history
-- Formula: Base score of 3.0, +0.1 for each on-time payment, -0.2 for each late payment
-- Score range: 1.0 (minimum) to 5.0 (maximum)
CREATE OR REPLACE FUNCTION calculate_trust_score(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_payments INTEGER;
  v_paid_payments INTEGER;
  v_late_payments INTEGER;
  v_pending_overdue INTEGER;
  v_score NUMERIC;
BEGIN
  -- Get payment statistics for the user across all their tontine memberships
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'paid') as paid,
    COUNT(*) FILTER (WHERE status = 'late') as late,
    COUNT(*) FILTER (
      WHERE status = 'pending'
      AND EXISTS (
        SELECT 1 FROM rounds r
        WHERE r.id = payments.round_id
        AND r.scheduled_date < NOW()
      )
    ) as overdue
  INTO v_total_payments, v_paid_payments, v_late_payments, v_pending_overdue
  FROM payments
  INNER JOIN tontine_members ON tontine_members.id = payments.member_id
  WHERE tontine_members.user_id = p_user_id;

  -- If no payment history, return default score
  IF v_total_payments = 0 THEN
    RETURN 3.0;
  END IF;

  -- Calculate score based on payment behavior
  -- Start with base score of 3.0
  v_score := 3.0;

  -- Add points for on-time payments (0.1 per payment, max +2.0)
  v_score := v_score + LEAST(v_paid_payments * 0.1, 2.0);

  -- Deduct points for late payments (0.2 per late payment)
  v_score := v_score - (v_late_payments * 0.2);

  -- Deduct points for overdue pending payments (0.15 per overdue)
  v_score := v_score - (v_pending_overdue * 0.15);

  -- Ensure score is within bounds [1.0, 5.0]
  v_score := GREATEST(1.0, LEAST(5.0, v_score));

  RETURN ROUND(v_score, 2);
END;
$$;

COMMENT ON FUNCTION calculate_trust_score IS 'Calculates a user trust score based on payment history. Range: 1.0-5.0';

-- =============================================
-- 3. AUTO-UPDATE TRUST SCORE TRIGGER
-- =============================================

-- Function to update trust score when payment status changes
CREATE OR REPLACE FUNCTION update_member_trust_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_new_score NUMERIC;
BEGIN
  -- Get the user_id from the member
  SELECT user_id INTO v_user_id
  FROM tontine_members
  WHERE id = NEW.member_id;

  -- Only update if member is linked to a user
  IF v_user_id IS NOT NULL THEN
    -- Calculate new trust score
    v_new_score := calculate_trust_score(v_user_id);

    -- Update the profile
    UPDATE profiles
    SET trust_score = v_new_score,
        updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_trust_score ON payments;
CREATE TRIGGER trigger_update_trust_score
  AFTER INSERT OR UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_member_trust_score();

-- =============================================
-- 4. NOTIFICATION HELPER FUNCTIONS
-- =============================================

-- Create notification for a user
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_tontine_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, body, tontine_id, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_tontine_id, p_metadata)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

COMMENT ON FUNCTION create_notification IS 'Creates a notification for a specific user';

-- Notify all tontine members
CREATE OR REPLACE FUNCTION notify_tontine_members(
  p_tontine_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_exclude_user_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  v_member RECORD;
BEGIN
  -- Loop through all members with user_id
  FOR v_member IN
    SELECT DISTINCT user_id
    FROM tontine_members
    WHERE tontine_id = p_tontine_id
    AND user_id IS NOT NULL
    AND (p_exclude_user_id IS NULL OR user_id != p_exclude_user_id)
  LOOP
    PERFORM create_notification(
      v_member.user_id,
      p_type,
      p_title,
      p_body,
      p_tontine_id,
      p_metadata
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION notify_tontine_members IS 'Creates notifications for all members of a tontine';

-- =============================================
-- 5. AUTO-NOTIFICATION TRIGGERS
-- =============================================

-- Notify when payment is confirmed
CREATE OR REPLACE FUNCTION notify_payment_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_tontine_id UUID;
  v_tontine_name TEXT;
  v_round_number INTEGER;
BEGIN
  -- Only trigger when status changes to 'paid' and confirmed_at is set
  IF NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.confirmed_at IS NOT NULL THEN
    -- Get member's user_id and tontine info
    SELECT tm.user_id, t.id, t.title, r.round_number
    INTO v_user_id, v_tontine_id, v_tontine_name, v_round_number
    FROM tontine_members tm
    JOIN rounds r ON r.tontine_id = tm.tontine_id
    JOIN tontines t ON t.id = tm.tontine_id
    WHERE tm.id = NEW.member_id AND r.id = NEW.round_id;

    -- Create notification if user is linked
    IF v_user_id IS NOT NULL THEN
      PERFORM create_notification(
        v_user_id,
        'payment_confirmed',
        'Payment Confirmed',
        'Your payment for round ' || v_round_number || ' of ' || v_tontine_name || ' has been confirmed.',
        v_tontine_id,
        jsonb_build_object('payment_id', NEW.id, 'round_id', NEW.round_id, 'amount', NEW.amount)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_payment_confirmed ON payments;
CREATE TRIGGER trigger_notify_payment_confirmed
  AFTER UPDATE OF status, confirmed_at ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_confirmed();

-- Notify when new round starts
CREATE OR REPLACE FUNCTION notify_new_round()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tontine_name TEXT;
  v_beneficiary_name TEXT;
BEGIN
  -- Only trigger when status changes to 'current'
  IF NEW.status = 'current' AND (OLD.status IS NULL OR OLD.status != 'current') THEN
    -- Get tontine and beneficiary info
    SELECT t.title, tm.name
    INTO v_tontine_name, v_beneficiary_name
    FROM tontines t
    LEFT JOIN tontine_members tm ON tm.id = NEW.beneficiary_id
    WHERE t.id = NEW.tontine_id;

    -- Notify all members
    PERFORM notify_tontine_members(
      NEW.tontine_id,
      'round_started',
      'New Round Started',
      'Round ' || NEW.round_number || ' of ' || v_tontine_name || ' has started. Beneficiary: ' || COALESCE(v_beneficiary_name, 'TBD'),
      jsonb_build_object('round_id', NEW.id, 'round_number', NEW.round_number, 'beneficiary_id', NEW.beneficiary_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_round ON rounds;
CREATE TRIGGER trigger_notify_new_round
  AFTER INSERT OR UPDATE OF status ON rounds
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_round();

-- Notify when user joins tontine
CREATE OR REPLACE FUNCTION notify_member_joined()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tontine_name TEXT;
  v_creator_id UUID;
BEGIN
  -- Only trigger when user_id is set (user has joined)
  IF NEW.user_id IS NOT NULL THEN
    -- Get tontine info
    SELECT title, creator_id
    INTO v_tontine_name, v_creator_id
    FROM tontines
    WHERE id = NEW.tontine_id;

    -- Notify the member who joined
    PERFORM create_notification(
      NEW.user_id,
      'joined_tontine',
      'Welcome to ' || v_tontine_name,
      'You have successfully joined ' || v_tontine_name || '!',
      NEW.tontine_id,
      jsonb_build_object('member_id', NEW.id)
    );

    -- Notify the creator (if different from the joined member)
    IF v_creator_id != NEW.user_id THEN
      PERFORM create_notification(
        v_creator_id,
        'member_joined',
        'New Member Joined',
        NEW.name || ' has joined ' || v_tontine_name || '.',
        NEW.tontine_id,
        jsonb_build_object('member_id', NEW.id, 'member_name', NEW.name)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_member_joined ON tontine_members;
CREATE TRIGGER trigger_notify_member_joined
  AFTER INSERT OR UPDATE OF user_id ON tontine_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_member_joined();

-- =============================================
-- 6. BATCH RECALCULATE ALL TRUST SCORES
-- =============================================

-- Function to recalculate all user trust scores (useful for initial setup or data migration)
CREATE OR REPLACE FUNCTION recalculate_all_trust_scores()
RETURNS TABLE (user_id UUID, old_score NUMERIC, new_score NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  FOR v_profile IN SELECT id, trust_score FROM profiles WHERE id IN (
    SELECT DISTINCT user_id FROM tontine_members WHERE user_id IS NOT NULL
  )
  LOOP
    RETURN QUERY
    SELECT
      v_profile.id,
      v_profile.trust_score,
      calculate_trust_score(v_profile.id);

    UPDATE profiles
    SET trust_score = calculate_trust_score(v_profile.id),
        updated_at = NOW()
    WHERE id = v_profile.id;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION recalculate_all_trust_scores IS 'Batch recalculate trust scores for all users';

-- =============================================
-- 7. ENABLE REALTIME FOR NOTIFICATIONS
-- =============================================

-- Enable realtime updates for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================
-- 8. GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION calculate_trust_score TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION notify_tontine_members TO authenticated;
