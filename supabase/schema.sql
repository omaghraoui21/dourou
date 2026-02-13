-- =============================================
-- DOUROU (دورو) - Tontine Management Platform
-- Complete Database Schema - Portability Kit
-- =============================================
-- This SQL file is replayable on any standard Supabase instance.
-- Execute in order: tables, indexes, RLS, triggers, realtime.
-- =============================================

-- =============================================
-- 1. TABLES
-- =============================================

-- Profiles: User details linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  trust_score NUMERIC DEFAULT 3.0,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tontines: Core group settings (Minimum 3, Maximum 50 members)
CREATE TABLE IF NOT EXISTS tontines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  currency TEXT DEFAULT 'TND',
  total_members INTEGER NOT NULL CHECK (total_members >= 3 AND total_members <= 50),
  current_round INTEGER DEFAULT 1,
  distribution_logic TEXT DEFAULT 'fixed' CHECK (distribution_logic IN ('fixed', 'random', 'trust')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  start_date TIMESTAMPTZ,
  next_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tontine Members: Linking users to groups
CREATE TABLE IF NOT EXISTS tontine_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tontine_id UUID REFERENCES tontines(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  payout_order INTEGER NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tontine_id, phone),
  UNIQUE(tontine_id, payout_order) DEFERRABLE INITIALLY DEFERRED
);

-- Invitations: Unique codes for joining groups
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tontine_id UUID REFERENCES tontines(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rounds: Generated when a tontine is launched
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tontine_id UUID REFERENCES tontines(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  beneficiary_id UUID REFERENCES tontine_members(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('current', 'upcoming', 'completed')),
  scheduled_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tontine_id, round_number)
);

-- Payments: Individual contribution tracking
-- Payment States: unpaid (round started, no declaration), declared (proof submitted),
--                 paid (admin confirmed), late (deadline passed)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES tontine_members(id) NOT NULL,
  amount INTEGER NOT NULL,
  method TEXT CHECK (method IN ('cash', 'bank', 'd17', 'flouci')),
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'declared', 'paid', 'late')),
  reference TEXT,
  declared_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications: Activity tracking per user
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  tontine_id UUID REFERENCES tontines(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log: System-wide activity tracking
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tontine_id UUID REFERENCES tontines(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_tontine_members_tontine_id ON tontine_members(tontine_id);
CREATE INDEX IF NOT EXISTS idx_tontine_members_user_id ON tontine_members(user_id);
CREATE INDEX IF NOT EXISTS idx_rounds_tontine_id ON rounds(tontine_id);
CREATE INDEX IF NOT EXISTS idx_payments_round_id ON payments(round_id);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(code);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_tontine_id ON audit_log(tontine_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =============================================
-- 3. ADMIN HELPER FUNCTION
-- =============================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id;

  RETURN user_role = 'admin' OR user_role = 'super_admin';
END;
$$;

COMMENT ON FUNCTION is_admin IS 'Helper function to check if a user has admin or super_admin role';

-- =============================================
-- 4. ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tontines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tontine_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "admins_can_view_all_profiles" ON profiles
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "admins_can_update_all_profiles" ON profiles
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- Tontines Policies
CREATE POLICY "tontines_select" ON tontines
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tontine_members
      WHERE tontine_members.tontine_id = tontines.id
      AND tontine_members.user_id = auth.uid()
    )
    OR creator_id = auth.uid()
  );
CREATE POLICY "tontines_insert" ON tontines
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "tontines_update" ON tontines
  FOR UPDATE TO authenticated
  USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "tontines_delete" ON tontines
  FOR DELETE TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "admins_can_view_all_tontines" ON tontines
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "admins_can_update_all_tontines" ON tontines
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "admins_can_delete_all_tontines" ON tontines
  FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Tontine Members Policies
CREATE POLICY "tontine_members_select" ON tontine_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tontine_members AS tm
      WHERE tm.tontine_id = tontine_members.tontine_id
      AND tm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM tontines
      WHERE tontines.id = tontine_members.tontine_id
      AND tontines.creator_id = auth.uid()
    )
  );
CREATE POLICY "tontine_members_insert" ON tontine_members
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tontines
      WHERE tontines.id = tontine_id
      AND tontines.creator_id = auth.uid()
    )
  );
CREATE POLICY "tontine_members_update" ON tontine_members
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tontines
      WHERE tontines.id = tontine_members.tontine_id
      AND tontines.creator_id = auth.uid()
    )
    OR user_id = auth.uid()
  );
CREATE POLICY "tontine_members_delete" ON tontine_members
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tontines
      WHERE tontines.id = tontine_members.tontine_id
      AND tontines.creator_id = auth.uid()
    )
  );
CREATE POLICY "admins_can_view_all_members" ON tontine_members
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "admins_can_insert_members" ON tontine_members
  FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "admins_can_update_all_members" ON tontine_members
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "admins_can_delete_all_members" ON tontine_members
  FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Invitations Policies
CREATE POLICY "invitations_select" ON invitations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "invitations_insert" ON invitations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tontines
      WHERE tontines.id = tontine_id
      AND tontines.creator_id = auth.uid()
    )
  );
CREATE POLICY "invitations_update" ON invitations
  FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "invitations_delete" ON invitations
  FOR DELETE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "admins_can_update_invitations" ON invitations
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "admins_can_delete_invitations" ON invitations
  FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Rounds Policies
CREATE POLICY "rounds_select" ON rounds
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tontine_members
      WHERE tontine_members.tontine_id = rounds.tontine_id
      AND tontine_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM tontines
      WHERE tontines.id = rounds.tontine_id
      AND tontines.creator_id = auth.uid()
    )
  );
CREATE POLICY "rounds_insert" ON rounds
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tontines
      WHERE tontines.id = tontine_id
      AND tontines.creator_id = auth.uid()
    )
  );
CREATE POLICY "rounds_update" ON rounds
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tontines
      WHERE tontines.id = rounds.tontine_id
      AND tontines.creator_id = auth.uid()
    )
  );
CREATE POLICY "admins_can_view_all_rounds" ON rounds
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "admins_can_insert_rounds" ON rounds
  FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "admins_can_update_all_rounds" ON rounds
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- Payments Policies
CREATE POLICY "payments_select" ON payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rounds
      JOIN tontine_members ON tontine_members.tontine_id = rounds.tontine_id
      WHERE rounds.id = payments.round_id
      AND tontine_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM rounds
      JOIN tontines ON tontines.id = rounds.tontine_id
      WHERE rounds.id = payments.round_id
      AND tontines.creator_id = auth.uid()
    )
  );
CREATE POLICY "payments_insert" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tontine_members
      WHERE tontine_members.id = member_id
      AND tontine_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM rounds
      JOIN tontines ON tontines.id = rounds.tontine_id
      WHERE rounds.id = round_id
      AND tontines.creator_id = auth.uid()
    )
  );
CREATE POLICY "payments_update" ON payments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tontine_members
      WHERE tontine_members.id = payments.member_id
      AND tontine_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM rounds
      JOIN tontines ON tontines.id = rounds.tontine_id
      WHERE rounds.id = payments.round_id
      AND tontines.creator_id = auth.uid()
    )
  );
CREATE POLICY "admins_can_view_all_payments" ON payments
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "admins_can_insert_payments" ON payments
  FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "admins_can_update_all_payments" ON payments
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- Notifications Policies
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins_can_view_all_notifications" ON notifications
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Audit Log Policies
CREATE POLICY "audit_log_select" ON audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tontine_members
      WHERE tontine_members.tontine_id = audit_log.tontine_id
      AND tontine_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM tontines
      WHERE tontines.id = audit_log.tontine_id
      AND tontines.creator_id = auth.uid()
    )
  );
CREATE POLICY "audit_log_insert" ON audit_log
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admins_can_view_all_audit_logs" ON audit_log
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Immutable Audit Log: Explicitly deny UPDATE and DELETE for all users (including admins)
CREATE POLICY "audit_log_immutable_no_update" ON audit_log
  FOR UPDATE TO authenticated USING (false);
CREATE POLICY "audit_log_immutable_no_delete" ON audit_log
  FOR DELETE TO authenticated USING (false);

-- =============================================
-- 5. FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.phone
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = CASE
      WHEN public.profiles.full_name = '' OR public.profiles.full_name IS NULL
      THEN COALESCE(NEW.raw_user_meta_data->>'full_name', '')
      ELSE public.profiles.full_name
    END,
    phone = COALESCE(NEW.phone, public.profiles.phone),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_tontines
  BEFORE UPDATE ON tontines
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trust score calculation (updated for refined payment states)
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

-- Auto-update trust score trigger
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

DROP TRIGGER IF EXISTS trigger_update_trust_score ON payments;
CREATE TRIGGER trigger_update_trust_score
  AFTER INSERT OR UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_member_trust_score();

-- =============================================
-- 6. REALTIME
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE tontines;
ALTER PUBLICATION supabase_realtime ADD TABLE tontine_members;
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
