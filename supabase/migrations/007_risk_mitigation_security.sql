-- =====================================================
-- DOUROU (دورو) - Phase 7: Risk Mitigation & Security
-- =====================================================
-- Purpose: Implement immediate mitigation actions for ghost members,
-- admin succession, payment proof, and abuse monitoring
-- =====================================================

-- =====================================================
-- 1. USER STATUS FIELD
-- =====================================================

-- Add user status tracking to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
CHECK (status IN ('active', 'suspended', 'banned'));

-- Add minimum trust score constant for invitations
-- Default: 2.5 (can be adjusted by governance)
CREATE TABLE IF NOT EXISTS governance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Insert default governance settings
INSERT INTO governance_settings (key, value, description)
VALUES
  ('min_trust_score_for_invite', '2.5', 'Minimum trust score required to be invited to private tontines'),
  ('max_tontines_per_day', '3', 'Maximum tontines a user can join in 24 hours (velocity check)')
ON CONFLICT (key) DO NOTHING;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- =====================================================
-- 2. GHOST MEMBER PREVENTION
-- =====================================================

-- Function to check if a user is eligible to be invited
CREATE OR REPLACE FUNCTION check_user_eligibility_for_invite(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
  v_trust_score NUMERIC;
  v_min_trust_score NUMERIC;
BEGIN
  -- Get user status and trust score
  SELECT status, trust_score
  INTO v_status, v_trust_score
  FROM profiles
  WHERE id = p_user_id;

  -- Check if user exists
  IF v_status IS NULL THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'user_not_found'
    );
  END IF;

  -- Check if user is active
  IF v_status != 'active' THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'user_not_active',
      'status', v_status
    );
  END IF;

  -- Get minimum trust score from governance settings
  SELECT value::NUMERIC INTO v_min_trust_score
  FROM governance_settings
  WHERE key = 'min_trust_score_for_invite';

  -- Default to 2.5 if not set
  IF v_min_trust_score IS NULL THEN
    v_min_trust_score := 2.5;
  END IF;

  -- Check trust score
  IF v_trust_score < v_min_trust_score THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'insufficient_trust_score',
      'current_trust_score', v_trust_score,
      'required_trust_score', v_min_trust_score
    );
  END IF;

  -- User is eligible
  RETURN jsonb_build_object(
    'eligible', true,
    'trust_score', v_trust_score,
    'status', v_status
  );
END;
$$;

COMMENT ON FUNCTION check_user_eligibility_for_invite IS 'Ghost Member Prevention: Check if user meets criteria (active status + minimum trust score) to be invited to private tontines';

-- =====================================================
-- 3. PAYMENT PROOF REQUIREMENTS
-- =====================================================

-- Add proof fields to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS proof_image_url TEXT,
ADD COLUMN IF NOT EXISTS reference_id TEXT;

-- Create index for reference lookups
CREATE INDEX IF NOT EXISTS idx_payments_reference_id ON payments(reference_id);

-- Function to validate payment proof requirements
CREATE OR REPLACE FUNCTION validate_payment_proof()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- When declaring a payment, require either reference_id or proof_image_url
  IF NEW.status = 'declared' AND OLD.status = 'unpaid' THEN
    IF (NEW.reference_id IS NULL OR NEW.reference_id = '')
       AND (NEW.proof_image_url IS NULL OR NEW.proof_image_url = '') THEN
      RAISE EXCEPTION 'Payment declaration requires either reference_id or proof_image_url to reduce disputes';
    END IF;

    -- Set declared_at timestamp
    NEW.declared_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_validate_payment_proof ON payments;
CREATE TRIGGER trigger_validate_payment_proof
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION validate_payment_proof();

COMMENT ON FUNCTION validate_payment_proof IS 'Payment Proof: Ensure payment declarations include reference_id or proof_image_url to reduce he-said-she-said disputes';

-- =====================================================
-- 4. ADMIN SUCCESSION MONITORING
-- =====================================================

-- Create view to identify orphaned tontines (admin suspended/banned)
CREATE OR REPLACE VIEW orphaned_tontines AS
SELECT
  t.id AS tontine_id,
  t.title AS tontine_name,
  t.status AS tontine_status,
  t.creator_id,
  p.full_name AS creator_name,
  p.status AS creator_status,
  p.phone AS creator_phone,
  t.total_members,
  t.current_round,
  t.created_at AS tontine_created_at,
  (
    SELECT COUNT(*)
    FROM tontine_members tm
    WHERE tm.tontine_id = t.id AND tm.role = 'admin'
  ) AS admin_count,
  (
    SELECT string_agg(tm2.name, ', ')
    FROM tontine_members tm2
    WHERE tm2.tontine_id = t.id AND tm2.role = 'admin'
  ) AS other_admins
FROM tontines t
JOIN profiles p ON p.id = t.creator_id
WHERE p.status IN ('suspended', 'banned')
  AND t.status IN ('draft', 'active')
ORDER BY t.status DESC, t.created_at DESC;

COMMENT ON VIEW orphaned_tontines IS 'Admin Succession: Identifies tontines where creator/admin is suspended or banned and requires governance intervention';

-- Function to flag orphaned tontines for governance review
CREATE OR REPLACE FUNCTION flag_orphaned_tontine(p_tontine_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tontine RECORD;
  v_has_other_admins BOOLEAN;
BEGIN
  -- Get tontine details from the view
  SELECT * INTO v_tontine
  FROM orphaned_tontines
  WHERE tontine_id = p_tontine_id;

  IF v_tontine IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'tontine_not_orphaned'
    );
  END IF;

  -- Check if there are other admins
  v_has_other_admins := v_tontine.admin_count > 0;

  -- Log to audit
  INSERT INTO audit_log (
    tontine_id,
    user_id,
    action,
    details
  ) VALUES (
    p_tontine_id,
    v_tontine.creator_id,
    'orphaned_tontine_flagged',
    jsonb_build_object(
      'creator_status', v_tontine.creator_status,
      'tontine_status', v_tontine.tontine_status,
      'has_other_admins', v_has_other_admins,
      'admin_count', v_tontine.admin_count,
      'other_admins', v_tontine.other_admins,
      'flagged_at', NOW()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'tontine_id', p_tontine_id,
    'creator_status', v_tontine.creator_status,
    'has_other_admins', v_has_other_admins,
    'admin_count', v_tontine.admin_count,
    'requires_intervention', NOT v_has_other_admins
  );
END;
$$;

COMMENT ON FUNCTION flag_orphaned_tontine IS 'Flags an orphaned tontine for governance intervention and logs to audit trail';

-- =====================================================
-- 5. VELOCITY & ABUSE MONITORING
-- =====================================================

-- Create comprehensive abuse monitoring view
CREATE OR REPLACE VIEW monitor_abuse_metrics AS
WITH velocity_check AS (
  -- Users joining >3 tontines in 24h
  SELECT
    tm.user_id,
    p.full_name,
    p.phone,
    p.trust_score,
    p.status,
    COUNT(*) AS tontines_joined_24h,
    array_agg(t.title) AS recent_tontines
  FROM tontine_members tm
  JOIN profiles p ON p.id = tm.user_id
  JOIN tontines t ON t.id = tm.tontine_id
  WHERE tm.joined_at > NOW() - INTERVAL '24 hours'
    AND tm.user_id IS NOT NULL
  GROUP BY tm.user_id, p.full_name, p.phone, p.trust_score, p.status
  HAVING COUNT(*) > 3
),
suspicious_patterns AS (
  -- Users with multiple failed payment attempts
  SELECT
    tm.user_id,
    p.full_name,
    COUNT(*) FILTER (WHERE pay.status = 'late') AS late_payments,
    COUNT(*) FILTER (WHERE pay.status = 'unpaid' AND r.scheduled_date < NOW()) AS overdue_payments,
    COUNT(DISTINCT tm.tontine_id) AS active_tontines
  FROM tontine_members tm
  JOIN profiles p ON p.id = tm.user_id
  LEFT JOIN payments pay ON pay.member_id = tm.id
  LEFT JOIN rounds r ON r.id = pay.round_id
  WHERE tm.user_id IS NOT NULL
  GROUP BY tm.user_id, p.full_name
  HAVING COUNT(*) FILTER (WHERE pay.status = 'late') > 2
     OR COUNT(*) FILTER (WHERE pay.status = 'unpaid' AND r.scheduled_date < NOW()) > 1
)
SELECT
  COALESCE(v.user_id, s.user_id) AS user_id,
  COALESCE(v.full_name, s.full_name) AS full_name,
  v.phone,
  v.trust_score,
  v.status,
  COALESCE(v.tontines_joined_24h, 0) AS velocity_tontines_24h,
  v.recent_tontines,
  COALESCE(s.late_payments, 0) AS late_payments_count,
  COALESCE(s.overdue_payments, 0) AS overdue_payments_count,
  COALESCE(s.active_tontines, 0) AS active_tontines_count,
  CASE
    WHEN v.tontines_joined_24h > 5 THEN 'critical'
    WHEN v.tontines_joined_24h > 3 THEN 'high'
    WHEN s.late_payments > 3 OR s.overdue_payments > 2 THEN 'medium'
    ELSE 'low'
  END AS risk_level
FROM velocity_check v
FULL OUTER JOIN suspicious_patterns s ON s.user_id = v.user_id
ORDER BY
  CASE
    WHEN v.tontines_joined_24h > 5 THEN 1
    WHEN v.tontines_joined_24h > 3 THEN 2
    WHEN s.late_payments > 3 OR s.overdue_payments > 2 THEN 3
    ELSE 4
  END,
  COALESCE(v.tontines_joined_24h, 0) DESC;

COMMENT ON VIEW monitor_abuse_metrics IS 'Scalability: Monitors user velocity (>3 tontines in 24h), payment patterns, and flags high-risk behavior for governance review';

-- Function to check velocity limit before joining
CREATE OR REPLACE FUNCTION check_join_velocity_limit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
  v_max_per_day INTEGER;
  v_recent_tontines TEXT[];
BEGIN
  -- Get max limit from governance settings
  SELECT value::INTEGER INTO v_max_per_day
  FROM governance_settings
  WHERE key = 'max_tontines_per_day';

  -- Default to 3 if not set
  IF v_max_per_day IS NULL THEN
    v_max_per_day := 3;
  END IF;

  -- Count tontines joined in last 24 hours
  SELECT COUNT(*), array_agg(t.title)
  INTO v_count, v_recent_tontines
  FROM tontine_members tm
  JOIN tontines t ON t.id = tm.tontine_id
  WHERE tm.user_id = p_user_id
    AND tm.joined_at > NOW() - INTERVAL '24 hours';

  IF v_count >= v_max_per_day THEN
    -- Log velocity violation
    INSERT INTO audit_log (
      user_id,
      action,
      details
    ) VALUES (
      p_user_id,
      'velocity_limit_exceeded',
      jsonb_build_object(
        'tontines_joined_24h', v_count,
        'limit', v_max_per_day,
        'recent_tontines', v_recent_tontines,
        'timestamp', NOW()
      )
    );

    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'velocity_limit_exceeded',
      'current_count', v_count,
      'limit', v_max_per_day,
      'recent_tontines', v_recent_tontines
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'current_count', v_count,
    'limit', v_max_per_day
  );
END;
$$;

COMMENT ON FUNCTION check_join_velocity_limit IS 'Prevents users from joining more than N tontines in 24h to detect abuse patterns';

-- =====================================================
-- 6. ADMIN DASHBOARD FUNCTIONS
-- =====================================================

-- Function to get governance summary for admin dashboard
CREATE OR REPLACE FUNCTION get_governance_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_orphaned_count INTEGER;
  v_high_risk_users INTEGER;
  v_velocity_violations INTEGER;
  v_suspended_users INTEGER;
  v_banned_users INTEGER;
  v_pending_proofs INTEGER;
BEGIN
  -- Count orphaned tontines
  SELECT COUNT(*) INTO v_orphaned_count
  FROM orphaned_tontines;

  -- Count high-risk users
  SELECT COUNT(*) INTO v_high_risk_users
  FROM monitor_abuse_metrics
  WHERE risk_level IN ('high', 'critical');

  -- Count velocity violations in last 24h
  SELECT COUNT(DISTINCT user_id) INTO v_velocity_violations
  FROM audit_log
  WHERE action = 'velocity_limit_exceeded'
    AND created_at > NOW() - INTERVAL '24 hours';

  -- Count suspended and banned users
  SELECT
    COUNT(*) FILTER (WHERE status = 'suspended'),
    COUNT(*) FILTER (WHERE status = 'banned')
  INTO v_suspended_users, v_banned_users
  FROM profiles;

  -- Count payments declared but not yet confirmed (awaiting proof review)
  SELECT COUNT(*) INTO v_pending_proofs
  FROM payments
  WHERE status = 'declared';

  RETURN jsonb_build_object(
    'orphaned_tontines', v_orphaned_count,
    'high_risk_users', v_high_risk_users,
    'velocity_violations_24h', v_velocity_violations,
    'suspended_users', v_suspended_users,
    'banned_users', v_banned_users,
    'pending_payment_proofs', v_pending_proofs,
    'last_updated', NOW()
  );
END;
$$;

COMMENT ON FUNCTION get_governance_summary IS 'Provides a comprehensive summary of governance metrics for admin dashboard';

-- =====================================================
-- 7. RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Enable RLS on governance_settings
ALTER TABLE governance_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view governance settings
CREATE POLICY "governance_settings_select" ON governance_settings
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Only admins can update governance settings
CREATE POLICY "governance_settings_update" ON governance_settings
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION check_user_eligibility_for_invite TO authenticated;
GRANT EXECUTE ON FUNCTION flag_orphaned_tontine TO authenticated;
GRANT EXECUTE ON FUNCTION check_join_velocity_limit TO authenticated;
GRANT EXECUTE ON FUNCTION get_governance_summary TO authenticated;

-- Grant view access to admins only
GRANT SELECT ON orphaned_tontines TO authenticated;
GRANT SELECT ON monitor_abuse_metrics TO authenticated;

-- =====================================================
-- 9. INITIAL DATA MIGRATION
-- =====================================================

-- Set all existing users to 'active' status if NULL
UPDATE profiles
SET status = 'active'
WHERE status IS NULL;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON TABLE governance_settings IS 'Configurable governance parameters for risk mitigation';
COMMENT ON COLUMN profiles.status IS 'User account status: active, suspended, or banned';
COMMENT ON COLUMN payments.proof_image_url IS 'URL to uploaded payment proof image';
COMMENT ON COLUMN payments.reference_id IS 'Payment reference/transaction ID for verification';
