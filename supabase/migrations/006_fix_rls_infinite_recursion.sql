-- =====================================================
-- DOUROU (دورو) - Phase 6: Fix RLS Infinite Recursion
-- =====================================================
-- Purpose: Break circular RLS policy dependencies
-- Issue: tontines_select queries tontine_members, which queries tontines
-- Solution: SECURITY DEFINER helper functions to bypass RLS
-- =====================================================

-- =====================================================
-- 1. SECURITY DEFINER HELPER FUNCTIONS
-- =====================================================

-- Helper function to check if a user is a member of a tontine
-- This function bypasses RLS internally to prevent recursion
CREATE OR REPLACE FUNCTION is_tontine_member(p_user_id UUID, p_tontine_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_is_member BOOLEAN;
BEGIN
  -- Check if user is a member of the tontine
  SELECT EXISTS (
    SELECT 1 FROM tontine_members
    WHERE tontine_id = p_tontine_id
    AND user_id = p_user_id
  ) INTO v_is_member;

  RETURN v_is_member;
END;
$$;

-- Helper function to check if a user is the creator of a tontine
-- This function bypasses RLS internally to prevent recursion
CREATE OR REPLACE FUNCTION is_tontine_creator(p_user_id UUID, p_tontine_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_is_creator BOOLEAN;
BEGIN
  -- Check if user is the creator of the tontine
  SELECT EXISTS (
    SELECT 1 FROM tontines
    WHERE id = p_tontine_id
    AND creator_id = p_user_id
  ) INTO v_is_creator;

  RETURN v_is_creator;
END;
$$;

-- Helper function to check if a user is an admin of a tontine (creator or admin role)
-- This function bypasses RLS internally to prevent recursion
CREATE OR REPLACE FUNCTION is_tontine_admin(p_user_id UUID, p_tontine_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is the creator OR has admin role in tontine_members
  SELECT EXISTS (
    SELECT 1 FROM tontines
    WHERE id = p_tontine_id
    AND creator_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM tontine_members
    WHERE tontine_id = p_tontine_id
    AND user_id = p_user_id
    AND role = 'admin'
  ) INTO v_is_admin;

  RETURN v_is_admin;
END;
$$;

COMMENT ON FUNCTION is_tontine_member IS 'SECURITY DEFINER: Check if user is a member of a tontine (bypasses RLS to prevent recursion)';
COMMENT ON FUNCTION is_tontine_creator IS 'SECURITY DEFINER: Check if user is the creator of a tontine (bypasses RLS to prevent recursion)';
COMMENT ON FUNCTION is_tontine_admin IS 'SECURITY DEFINER: Check if user is an admin of a tontine (bypasses RLS to prevent recursion)';

-- =====================================================
-- 2. DROP OLD RLS POLICIES (CIRCULAR DEPENDENCIES)
-- =====================================================

-- Drop old tontines policies
DROP POLICY IF EXISTS "tontines_select" ON tontines;
DROP POLICY IF EXISTS "tontines_insert" ON tontines;
DROP POLICY IF EXISTS "tontines_update" ON tontines;
DROP POLICY IF EXISTS "tontines_delete" ON tontines;
DROP POLICY IF EXISTS "admins_can_view_all_tontines" ON tontines;
DROP POLICY IF EXISTS "admins_can_update_all_tontines" ON tontines;
DROP POLICY IF EXISTS "admins_can_delete_all_tontines" ON tontines;

-- Drop old tontine_members policies
DROP POLICY IF EXISTS "tontine_members_select" ON tontine_members;
DROP POLICY IF EXISTS "tontine_members_insert" ON tontine_members;
DROP POLICY IF EXISTS "tontine_members_update" ON tontine_members;
DROP POLICY IF EXISTS "tontine_members_delete" ON tontine_members;
DROP POLICY IF EXISTS "admins_can_view_all_members" ON tontine_members;
DROP POLICY IF EXISTS "admins_can_insert_members" ON tontine_members;
DROP POLICY IF EXISTS "admins_can_update_all_members" ON tontine_members;
DROP POLICY IF EXISTS "admins_can_delete_all_members" ON tontine_members;

-- Drop old rounds policies (also had circular dependencies)
DROP POLICY IF EXISTS "rounds_select" ON rounds;
DROP POLICY IF EXISTS "rounds_insert" ON rounds;
DROP POLICY IF EXISTS "rounds_update" ON rounds;
DROP POLICY IF EXISTS "admins_can_view_all_rounds" ON rounds;
DROP POLICY IF EXISTS "admins_can_insert_rounds" ON rounds;
DROP POLICY IF EXISTS "admins_can_update_all_rounds" ON rounds;

-- Drop old payments policies (also had circular dependencies)
DROP POLICY IF EXISTS "payments_select" ON payments;
DROP POLICY IF EXISTS "payments_insert" ON payments;
DROP POLICY IF EXISTS "payments_update" ON payments;
DROP POLICY IF EXISTS "admins_can_view_all_payments" ON payments;
DROP POLICY IF EXISTS "admins_can_insert_payments" ON payments;
DROP POLICY IF EXISTS "admins_can_update_all_payments" ON payments;

-- Drop old audit_log policies
DROP POLICY IF EXISTS "audit_log_select" ON audit_log;

-- =====================================================
-- 3. CREATE NEW RLS POLICIES (NO CIRCULAR DEPENDENCIES)
-- =====================================================

-- ===========================
-- Tontines Policies
-- ===========================

-- Users can view tontines they created OR are members of
CREATE POLICY "tontines_select_v2" ON tontines
  FOR SELECT TO authenticated
  USING (
    creator_id = auth.uid()
    OR is_tontine_member(auth.uid(), id)
    OR is_admin(auth.uid())
  );

-- Users can create tontines (they become the creator)
CREATE POLICY "tontines_insert_v2" ON tontines
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own tontines
CREATE POLICY "tontines_update_v2" ON tontines
  FOR UPDATE TO authenticated
  USING (
    creator_id = auth.uid()
    OR is_admin(auth.uid())
  );

-- Creators can delete their own tontines
CREATE POLICY "tontines_delete_v2" ON tontines
  FOR DELETE TO authenticated
  USING (
    creator_id = auth.uid()
    OR is_admin(auth.uid())
  );

-- ===========================
-- Tontine Members Policies
-- ===========================

-- Users can view members of tontines they are part of
CREATE POLICY "tontine_members_select_v2" ON tontine_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_tontine_member(auth.uid(), tontine_id)
    OR is_tontine_creator(auth.uid(), tontine_id)
    OR is_admin(auth.uid())
  );

-- Tontine creators can add members
CREATE POLICY "tontine_members_insert_v2" ON tontine_members
  FOR INSERT TO authenticated
  WITH CHECK (
    is_tontine_creator(auth.uid(), tontine_id)
    OR is_admin(auth.uid())
  );

-- Tontine creators and the member themselves can update
CREATE POLICY "tontine_members_update_v2" ON tontine_members
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR is_tontine_creator(auth.uid(), tontine_id)
    OR is_admin(auth.uid())
  );

-- Tontine creators can remove members
CREATE POLICY "tontine_members_delete_v2" ON tontine_members
  FOR DELETE TO authenticated
  USING (
    is_tontine_creator(auth.uid(), tontine_id)
    OR is_admin(auth.uid())
  );

-- ===========================
-- Rounds Policies
-- ===========================

-- Users can view rounds for tontines they are part of
CREATE POLICY "rounds_select_v2" ON rounds
  FOR SELECT TO authenticated
  USING (
    is_tontine_member(auth.uid(), tontine_id)
    OR is_tontine_creator(auth.uid(), tontine_id)
    OR is_admin(auth.uid())
  );

-- Tontine creators can create rounds
CREATE POLICY "rounds_insert_v2" ON rounds
  FOR INSERT TO authenticated
  WITH CHECK (
    is_tontine_creator(auth.uid(), tontine_id)
    OR is_admin(auth.uid())
  );

-- Tontine creators can update rounds
CREATE POLICY "rounds_update_v2" ON rounds
  FOR UPDATE TO authenticated
  USING (
    is_tontine_creator(auth.uid(), tontine_id)
    OR is_admin(auth.uid())
  );

-- ===========================
-- Payments Policies
-- ===========================

-- Users can view payments for tontines they are part of
CREATE POLICY "payments_select_v2" ON payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = payments.round_id
      AND (
        is_tontine_member(auth.uid(), rounds.tontine_id)
        OR is_tontine_creator(auth.uid(), rounds.tontine_id)
      )
    )
    OR is_admin(auth.uid())
  );

-- Members can create payments (declare their own payments)
CREATE POLICY "payments_insert_v2" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tontine_members
      WHERE tontine_members.id = payments.member_id
      AND tontine_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = payments.round_id
      AND is_tontine_creator(auth.uid(), rounds.tontine_id)
    )
    OR is_admin(auth.uid())
  );

-- Members can update their own payments, creators can confirm
CREATE POLICY "payments_update_v2" ON payments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tontine_members
      WHERE tontine_members.id = payments.member_id
      AND tontine_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = payments.round_id
      AND is_tontine_creator(auth.uid(), rounds.tontine_id)
    )
    OR is_admin(auth.uid())
  );

-- ===========================
-- Audit Log Policies
-- ===========================

-- Users can view audit logs for tontines they are part of
CREATE POLICY "audit_log_select_v2" ON audit_log
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      tontine_id IS NOT NULL
      AND (
        is_tontine_member(auth.uid(), tontine_id)
        OR is_tontine_creator(auth.uid(), tontine_id)
      )
    )
    OR is_admin(auth.uid())
  );

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION is_tontine_member TO authenticated;
GRANT EXECUTE ON FUNCTION is_tontine_creator TO authenticated;
GRANT EXECUTE ON FUNCTION is_tontine_admin TO authenticated;

-- =====================================================
-- 5. VALIDATION COMMENTS
-- =====================================================

COMMENT ON POLICY "tontines_select_v2" ON tontines IS
  'V2: Uses SECURITY DEFINER helper to prevent RLS recursion';
COMMENT ON POLICY "tontine_members_select_v2" ON tontine_members IS
  'V2: Uses SECURITY DEFINER helper to prevent RLS recursion';
COMMENT ON POLICY "rounds_select_v2" ON rounds IS
  'V2: Uses SECURITY DEFINER helper to prevent RLS recursion';
COMMENT ON POLICY "payments_select_v2" ON payments IS
  'V2: Uses SECURITY DEFINER helper to prevent RLS recursion';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
