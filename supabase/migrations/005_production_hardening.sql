-- =====================================================
-- DOUROU (دورو) - Phase 5: Production Hardening
-- =====================================================
-- Purpose: Security, Privacy, and Production Readiness
-- - Rate limiting for invitation codes
-- - Immutable audit logs
-- - Phone number masking policies
-- - Account deletion procedures
-- - Africa/Tunis timezone enforcement
-- =====================================================

-- =====================================================
-- 1. RATE LIMITING TABLES
-- =====================================================

-- Track failed invitation attempts (3 strikes rule)
CREATE TABLE IF NOT EXISTS invitation_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_code TEXT NOT NULL,
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('Africa/Tunis', now())
);

CREATE INDEX idx_invitation_attempts_user ON invitation_attempts(user_id);
CREATE INDEX idx_invitation_attempts_created ON invitation_attempts(created_at);

-- Rate limiting for payment declarations
CREATE TABLE IF NOT EXISTS payment_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('Africa/Tunis', now())
);

CREATE INDEX idx_payment_rate_limits_user ON payment_rate_limits(user_id);
CREATE INDEX idx_payment_rate_limits_created ON payment_rate_limits(created_at);

-- =====================================================
-- 2. IMMUTABLE AUDIT LOGS
-- =====================================================

-- Update audit_log table to be immutable
-- Remove UPDATE and DELETE policies
DROP POLICY IF EXISTS "audit_log_update" ON audit_log;
DROP POLICY IF EXISTS "audit_log_delete" ON audit_log;

-- Ensure only INSERT is allowed for audit logs
CREATE POLICY "audit_log_insert" ON audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Prevent direct updates or deletes (immutable)
CREATE POLICY "audit_log_no_update" ON audit_log
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "audit_log_no_delete" ON audit_log
  FOR DELETE
  TO authenticated
  USING (false);

-- Function to log rate limit violations
CREATE OR REPLACE FUNCTION log_rate_limit_violation(
  p_user_id UUID,
  p_action TEXT,
  p_details JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_log (
    user_id,
    action,
    table_name,
    record_id,
    metadata,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    p_user_id,
    'rate_limit_violation',
    p_action,
    NULL,
    jsonb_build_object(
      'action', p_action,
      'details', p_details
    ),
    NULL,
    NULL,
    timezone('Africa/Tunis', now())
  );
END;
$$;

-- =====================================================
-- 3. TIMEZONE ENFORCEMENT: Africa/Tunis
-- =====================================================

-- Function to ensure all timestamps use Africa/Tunis timezone
CREATE OR REPLACE FUNCTION enforce_tunis_timezone()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Enforce Africa/Tunis timezone on created_at
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = timezone('Africa/Tunis', now());
  END IF;

  -- Enforce Africa/Tunis timezone on updated_at if column exists
  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME IN ('profiles', 'tontines', 'rounds', 'payments') THEN
    NEW.updated_at = timezone('Africa/Tunis', now());
  END IF;

  RETURN NEW;
END;
$$;

-- Apply timezone enforcement to key tables
DROP TRIGGER IF EXISTS enforce_tunis_timezone_tontines ON tontines;
CREATE TRIGGER enforce_tunis_timezone_tontines
  BEFORE INSERT OR UPDATE ON tontines
  FOR EACH ROW
  EXECUTE FUNCTION enforce_tunis_timezone();

DROP TRIGGER IF EXISTS enforce_tunis_timezone_payments ON payments;
CREATE TRIGGER enforce_tunis_timezone_payments
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_tunis_timezone();

DROP TRIGGER IF EXISTS enforce_tunis_timezone_rounds ON rounds;
CREATE TRIGGER enforce_tunis_timezone_rounds
  BEFORE INSERT OR UPDATE ON rounds
  FOR EACH ROW
  EXECUTE FUNCTION enforce_tunis_timezone();

-- =====================================================
-- 4. ACCOUNT DELETION PROCEDURES
-- =====================================================

-- Function to safely delete user account
CREATE OR REPLACE FUNCTION delete_user_account(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_tontines_count INT;
  v_active_tontines_count INT;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'user_not_found'
    );
  END IF;

  -- Count active tontines where user is admin
  SELECT COUNT(*) INTO v_active_tontines_count
  FROM tontines
  WHERE creator_id = p_user_id
    AND status IN ('draft', 'active');

  -- Prevent deletion if user is admin of active tontines
  IF v_active_tontines_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'has_active_tontines',
      'active_count', v_active_tontines_count
    );
  END IF;

  -- Log deletion attempt
  INSERT INTO audit_log (
    user_id,
    action,
    table_name,
    record_id,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    'account_deletion_initiated',
    'profiles',
    p_user_id,
    jsonb_build_object(
      'timestamp', timezone('Africa/Tunis', now())
    ),
    timezone('Africa/Tunis', now())
  );

  -- Remove user from tontine_members (keep tontine intact)
  DELETE FROM tontine_members WHERE user_id = p_user_id;

  -- Delete user notifications
  DELETE FROM notifications WHERE user_id = p_user_id;

  -- Delete user profile
  DELETE FROM profiles WHERE id = p_user_id;

  -- Delete auth user (if using Supabase Auth)
  -- This will cascade delete everything
  DELETE FROM auth.users WHERE id = p_user_id;

  -- Log successful deletion
  INSERT INTO audit_log (
    user_id,
    action,
    table_name,
    record_id,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    'account_deleted',
    'profiles',
    p_user_id,
    jsonb_build_object(
      'timestamp', timezone('Africa/Tunis', now()),
      'success', true
    ),
    timezone('Africa/Tunis', now())
  );

  RETURN jsonb_build_object(
    'success', true,
    'deleted_at', timezone('Africa/Tunis', now())
  );
END;
$$;

-- =====================================================
-- 5. PHONE NUMBER MASKING FUNCTION
-- =====================================================

-- Function to mask phone numbers for privacy
CREATE OR REPLACE FUNCTION mask_phone_number(
  p_phone TEXT,
  p_viewer_id UUID,
  p_owner_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Return full phone if viewer is owner
  IF p_viewer_id = p_owner_id THEN
    RETURN p_phone;
  END IF;

  -- Check if viewer is admin
  SELECT is_admin(p_viewer_id) INTO v_is_admin;

  -- Return full phone if viewer is admin
  IF v_is_admin THEN
    RETURN p_phone;
  END IF;

  -- Mask phone for privacy (e.g., +216 98 123 456 → +216 •• ••• 456)
  IF p_phone LIKE '+216%' THEN
    RETURN '+216 •• ••• ' || RIGHT(REGEXP_REPLACE(p_phone, '[^0-9]', '', 'g'), 3);
  END IF;

  -- Generic masking for non-Tunisian numbers
  DECLARE
    v_digits TEXT;
  BEGIN
    v_digits := REGEXP_REPLACE(p_phone, '[^0-9]', '', 'g');
    IF LENGTH(v_digits) >= 6 THEN
      RETURN LEFT(v_digits, 3) || ' •••• ' || RIGHT(v_digits, 3);
    ELSE
      RETURN '••••••';
    END IF;
  END;
END;
$$;

-- =====================================================
-- 6. RATE LIMITING FUNCTIONS
-- =====================================================

-- Check invitation code rate limit (3 strikes)
CREATE OR REPLACE FUNCTION check_invitation_rate_limit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_failed_attempts INT;
  v_last_attempt TIMESTAMPTZ;
  v_cooldown_minutes INT := 5;
BEGIN
  -- Count failed attempts in the last hour
  SELECT COUNT(*), MAX(created_at)
  INTO v_failed_attempts, v_last_attempt
  FROM invitation_attempts
  WHERE user_id = p_user_id
    AND success = FALSE
    AND created_at > (timezone('Africa/Tunis', now()) - INTERVAL '1 hour');

  -- If 3 or more failures, check cooldown
  IF v_failed_attempts >= 3 THEN
    IF v_last_attempt > (timezone('Africa/Tunis', now()) - (v_cooldown_minutes || ' minutes')::INTERVAL) THEN
      -- Log rate limit violation
      PERFORM log_rate_limit_violation(
        p_user_id,
        'invitation_code',
        jsonb_build_object(
          'failed_attempts', v_failed_attempts,
          'cooldown_minutes', v_cooldown_minutes
        )
      );

      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'rate_limit_exceeded',
        'cooldown_ends_at', v_last_attempt + (v_cooldown_minutes || ' minutes')::INTERVAL,
        'failed_attempts', v_failed_attempts
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('allowed', true, 'failed_attempts', v_failed_attempts);
END;
$$;

-- Log invitation attempt
CREATE OR REPLACE FUNCTION log_invitation_attempt(
  p_user_id UUID,
  p_code TEXT,
  p_success BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO invitation_attempts (user_id, attempt_code, success, created_at)
  VALUES (p_user_id, p_code, p_success, timezone('Africa/Tunis', now()));

  -- Clean old attempts (older than 24 hours)
  DELETE FROM invitation_attempts
  WHERE created_at < (timezone('Africa/Tunis', now()) - INTERVAL '24 hours');
END;
$$;

-- Check payment declaration rate limit (5 per minute)
CREATE OR REPLACE FUNCTION check_payment_rate_limit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_recent_count INT;
  v_max_per_minute INT := 5;
BEGIN
  -- Count declarations in the last minute
  SELECT COUNT(*)
  INTO v_recent_count
  FROM payment_rate_limits
  WHERE user_id = p_user_id
    AND created_at > (timezone('Africa/Tunis', now()) - INTERVAL '1 minute');

  IF v_recent_count >= v_max_per_minute THEN
    -- Log rate limit violation
    PERFORM log_rate_limit_violation(
      p_user_id,
      'payment_declaration',
      jsonb_build_object(
        'declarations_count', v_recent_count,
        'limit', v_max_per_minute
      )
    );

    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit_exceeded',
      'limit', v_max_per_minute,
      'current_count', v_recent_count
    );
  END IF;

  RETURN jsonb_build_object('allowed', true, 'current_count', v_recent_count);
END;
$$;

-- Log payment declaration for rate limiting
CREATE OR REPLACE FUNCTION log_payment_declaration(
  p_user_id UUID,
  p_payment_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO payment_rate_limits (user_id, payment_id, created_at)
  VALUES (p_user_id, p_payment_id, timezone('Africa/Tunis', now()));

  -- Clean old logs (older than 5 minutes)
  DELETE FROM payment_rate_limits
  WHERE created_at < (timezone('Africa/Tunis', now()) - INTERVAL '5 minutes');
END;
$$;

-- =====================================================
-- 7. SECURITY POLICIES FOR NEW TABLES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE invitation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own attempts
CREATE POLICY "invitation_attempts_select" ON invitation_attempts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Users can only see their own rate limits
CREATE POLICY "payment_rate_limits_select" ON payment_rate_limits
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- =====================================================
-- 8. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE invitation_attempts IS 'Tracks invitation code attempts for rate limiting (3 strikes rule)';
COMMENT ON TABLE payment_rate_limits IS 'Tracks payment declarations for rate limiting (5 per minute)';
COMMENT ON FUNCTION delete_user_account IS 'Safely delete user account with validation and audit logging';
COMMENT ON FUNCTION mask_phone_number IS 'Mask phone numbers for privacy in shared views';
COMMENT ON FUNCTION check_invitation_rate_limit IS 'Check if user exceeded invitation attempt limit';
COMMENT ON FUNCTION check_payment_rate_limit IS 'Check if user exceeded payment declaration limit';
COMMENT ON FUNCTION enforce_tunis_timezone IS 'Enforce Africa/Tunis timezone on all timestamps';

-- =====================================================
-- END OF MIGRATION
-- =====================================================

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION delete_user_account TO authenticated;
GRANT EXECUTE ON FUNCTION mask_phone_number TO authenticated;
GRANT EXECUTE ON FUNCTION check_invitation_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_payment_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION log_invitation_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION log_payment_declaration TO authenticated;
