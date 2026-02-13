-- =============================================
-- PHASE 4.5: Refined Payment States & Logic Consistency
-- =============================================
-- This migration implements:
-- 1. Updated payment states: unpaid, declared, paid, late
-- 2. Updated trust score calculation for new payment states
-- 3. Minimum member count validation (3 minimum, 50 maximum)
-- =============================================

-- =============================================
-- 1. UPDATE PAYMENT STATUS ENUM
-- =============================================

-- Drop the existing CHECK constraint on payments.status
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

-- Add new CHECK constraint with refined payment states
ALTER TABLE payments ADD CONSTRAINT payments_status_check
  CHECK (status IN ('unpaid', 'declared', 'paid', 'late'));

-- Update default value to 'unpaid'
ALTER TABLE payments ALTER COLUMN status SET DEFAULT 'unpaid';

-- Migrate existing 'pending' statuses to appropriate new statuses
-- If declared_at exists but not confirmed_at, it's 'declared'
-- Otherwise, it's 'unpaid'
UPDATE payments
SET status = 'declared'
WHERE status = 'pending'
  AND declared_at IS NOT NULL
  AND confirmed_at IS NULL;

UPDATE payments
SET status = 'unpaid'
WHERE status = 'pending'
  AND (declared_at IS NULL OR confirmed_at IS NOT NULL);

-- =============================================
-- 2. UPDATE TRUST SCORE CALCULATION
-- =============================================

-- Updated trust score calculation with new payment states
CREATE OR REPLACE FUNCTION calculate_trust_score(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_payments INTEGER;
  v_paid_payments INTEGER;
  v_late_payments INTEGER;
  v_overdue_unpaid INTEGER;
  v_score NUMERIC;
BEGIN
  -- Get payment statistics for the user across all their tontine memberships
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'paid') as paid,
    COUNT(*) FILTER (WHERE status = 'late') as late,
    COUNT(*) FILTER (
      WHERE status = 'unpaid'
      AND EXISTS (
        SELECT 1 FROM rounds r
        WHERE r.id = payments.round_id
        AND r.scheduled_date < NOW()
      )
    ) as overdue_unpaid
  INTO v_total_payments, v_paid_payments, v_late_payments, v_overdue_unpaid
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

  -- Deduct points for overdue unpaid payments (0.15 per overdue)
  v_score := v_score - (v_overdue_unpaid * 0.15);

  -- Ensure score is within bounds [1.0, 5.0]
  v_score := GREATEST(1.0, LEAST(5.0, v_score));

  RETURN ROUND(v_score, 2);
END;
$$;

COMMENT ON FUNCTION calculate_trust_score IS 'Calculates user trust score with refined payment states: unpaid, declared, paid, late. Range: 1.0-5.0';

-- =============================================
-- 3. UPDATE MEMBER COUNT VALIDATION
-- =============================================

-- Drop existing constraint if it exists
ALTER TABLE tontines DROP CONSTRAINT IF EXISTS tontines_total_members_check;

-- Add new constraint: minimum 3, maximum 50 members
ALTER TABLE tontines ADD CONSTRAINT tontines_total_members_check
  CHECK (total_members >= 3 AND total_members <= 50);

-- =============================================
-- 4. UPDATE NOTIFICATION TRIGGER FOR DECLARED PAYMENTS
-- =============================================

-- Update payment notification trigger to handle 'declared' status
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
  -- Trigger when status changes to 'paid' and confirmed_at is set
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_notify_payment_confirmed ON payments;
CREATE TRIGGER trigger_notify_payment_confirmed
  AFTER UPDATE OF status, confirmed_at ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_confirmed();

-- =============================================
-- 5. RECALCULATE ALL TRUST SCORES
-- =============================================

-- Recalculate all existing trust scores with the updated logic
DO $$
DECLARE
  v_profile RECORD;
BEGIN
  FOR v_profile IN
    SELECT DISTINCT id FROM profiles
    WHERE id IN (
      SELECT DISTINCT user_id FROM tontine_members WHERE user_id IS NOT NULL
    )
  LOOP
    UPDATE profiles
    SET trust_score = calculate_trust_score(v_profile.id),
        updated_at = NOW()
    WHERE id = v_profile.id;
  END LOOP;
END $$;

-- =============================================
-- 6. ADD COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE tontines IS 'Tontine groups with member limits: 3 minimum, 50 maximum';
COMMENT ON COLUMN payments.status IS 'Payment status: unpaid (round started, no declaration), declared (proof submitted), paid (admin confirmed), late (deadline passed)';

-- =============================================
-- 7. VALIDATION SUMMARY
-- =============================================

-- To verify the migration:
-- 1. Check payment statuses: SELECT DISTINCT status FROM payments;
-- 2. Check tontine member counts: SELECT id, total_members FROM tontines;
-- 3. Check trust scores: SELECT id, trust_score FROM profiles LIMIT 10;
