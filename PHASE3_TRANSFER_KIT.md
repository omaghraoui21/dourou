# PHASE 3: Notifications & Trust Score - Transfer Kit

## Overview
This document provides a complete transfer kit for Phase 3 implementation of the Dourou tontine management platform, including trust score calculation and notification systems.

## Impacted Tables

### Modified Tables
1. **notifications** - Added `metadata` JSONB column for storing additional notification data
2. **profiles** - Uses existing `trust_score` column (already present in schema)

### New Indexes
- `idx_notifications_read` - Speed up queries filtering by user and read status
- `idx_notifications_created_at` - Optimize ordering by creation date

### New Database Functions
1. `calculate_trust_score(user_id)` - Calculate trust score based on payment history
2. `recalculate_all_trust_scores()` - Batch recalculate all user trust scores
3. `create_notification(...)` - Create a notification for a specific user
4. `notify_tontine_members(...)` - Send notifications to all tontine members
5. `update_member_trust_score()` - Trigger function to auto-update trust scores
6. `notify_payment_confirmed()` - Trigger function for payment confirmations
7. `notify_new_round()` - Trigger function for new round notifications
8. `notify_member_joined()` - Trigger function for member join notifications

### New Triggers
1. `trigger_update_trust_score` - Auto-update trust score when payment status changes
2. `trigger_notify_payment_confirmed` - Send notification when payment is confirmed
3. `trigger_notify_new_round` - Send notification when a new round starts
4. `trigger_notify_member_joined` - Send notification when a member joins

## Complete Updated Schema

```sql
-- =============================================
-- DOUROU (دورو) - Tontine Management Platform
-- Complete Database Schema - Phase 3 Update
-- =============================================

-- =============================================
-- STEP 1: Apply Migration (ADD ONLY NEW ELEMENTS)
-- =============================================

-- Add metadata field to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add new indexes
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================
-- STEP 2: TRUST SCORE FUNCTIONS
-- =============================================

-- Calculate trust score based on payment history
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

-- Batch recalculate all user trust scores
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

-- =============================================
-- STEP 3: NOTIFICATION FUNCTIONS
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

-- =============================================
-- STEP 4: TRIGGER FUNCTIONS
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

-- =============================================
-- STEP 5: CREATE TRIGGERS
-- =============================================

DROP TRIGGER IF EXISTS trigger_update_trust_score ON payments;
CREATE TRIGGER trigger_update_trust_score
  AFTER INSERT OR UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_member_trust_score();

DROP TRIGGER IF EXISTS trigger_notify_payment_confirmed ON payments;
CREATE TRIGGER trigger_notify_payment_confirmed
  AFTER UPDATE OF status, confirmed_at ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_confirmed();

DROP TRIGGER IF EXISTS trigger_notify_new_round ON rounds;
CREATE TRIGGER trigger_notify_new_round
  AFTER INSERT OR UPDATE OF status ON rounds
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_round();

DROP TRIGGER IF EXISTS trigger_notify_member_joined ON tontine_members;
CREATE TRIGGER trigger_notify_member_joined
  AFTER INSERT OR UPDATE OF user_id ON tontine_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_member_joined();

-- =============================================
-- STEP 6: ENABLE REALTIME
-- =============================================

-- Enable realtime updates for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================
-- STEP 7: GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION calculate_trust_score TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION notify_tontine_members TO authenticated;
```

## Migration Procedure

### Prerequisites
- Backup current database before applying migration
- Supabase project with existing Phase 1 & 2 schema
- Admin access to Supabase SQL editor

### Step-by-Step Migration

#### 1. Backup Current Database
```bash
# Using Supabase CLI (recommended)
supabase db dump -f backup_pre_phase3.sql

# Or via pg_dump
pg_dump -h <supabase-host> -U postgres -d postgres -f backup_pre_phase3.sql
```

#### 2. Apply Migration Script
```bash
# Execute migration file
psql -h <supabase-host> -U postgres -d postgres -f supabase/migrations/003_trust_score_and_notifications.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase/migrations/003_trust_score_and_notifications.sql`
3. Execute the script

#### 3. Verify Migration
```sql
-- Check new column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notifications' AND column_name = 'metadata';

-- Check functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'calculate_trust_score',
  'create_notification',
  'notify_tontine_members',
  'recalculate_all_trust_scores'
);

-- Check triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%trust_score%' OR trigger_name LIKE '%notify%';
```

#### 4. Initial Data Migration (Optional)
If you have existing users with payment history:
```sql
-- Recalculate all trust scores based on existing payment data
SELECT * FROM recalculate_all_trust_scores();
```

#### 5. Test Notifications
```sql
-- Test notification creation
SELECT create_notification(
  '<user_id>'::uuid,
  'test',
  'Test Notification',
  'This is a test notification',
  NULL,
  '{}'::jsonb
);

-- Verify notification was created
SELECT * FROM notifications WHERE type = 'test' ORDER BY created_at DESC LIMIT 1;
```

## Table Dependencies & Order

When exporting/importing data, follow this order to maintain referential integrity:

### Export Order
1. **profiles** (base user table)
2. **tontines** (references profiles)
3. **tontine_members** (references tontines and profiles)
4. **invitations** (references tontines and profiles)
5. **rounds** (references tontines and tontine_members)
6. **payments** (references rounds and tontine_members)
7. **notifications** (references profiles and tontines)
8. **audit_log** (references tontines and profiles)

### Import Order
Same as export order (1→8)

### Export Command Example
```bash
# Export all tables in correct order
pg_dump -h <host> -U postgres -d postgres \
  -t profiles \
  -t tontines \
  -t tontine_members \
  -t invitations \
  -t rounds \
  -t payments \
  -t notifications \
  -t audit_log \
  --data-only --column-inserts -f data_export.sql
```

### Import Command Example
```bash
# Import data (schema must already exist)
psql -h <host> -U postgres -d postgres -f data_export.sql
```

## RLS Policies (No Changes)

Phase 3 does not modify any existing RLS policies. All notification policies from the base schema remain active:

- **notifications_select**: Users can only see their own notifications
- **notifications_insert**: Any authenticated user can create notifications
- **notifications_update**: Users can only update their own notifications
- **admins_can_view_all_notifications**: Admins can see all notifications

## Testing Checklist

- [ ] Migration script executes without errors
- [ ] New `metadata` column exists in notifications table
- [ ] All new indexes are created
- [ ] All functions are created and executable
- [ ] All triggers are active
- [ ] Trust scores are calculated correctly for test users
- [ ] Notifications are created when:
  - [ ] Payment is confirmed
  - [ ] New round starts
  - [ ] Member joins tontine
- [ ] Realtime updates work for notifications
- [ ] Trust score updates automatically when payment status changes

## Rollback Procedure

If issues occur after migration:

```sql
-- Drop all triggers
DROP TRIGGER IF EXISTS trigger_update_trust_score ON payments;
DROP TRIGGER IF EXISTS trigger_notify_payment_confirmed ON payments;
DROP TRIGGER IF EXISTS trigger_notify_new_round ON rounds;
DROP TRIGGER IF EXISTS trigger_notify_member_joined ON tontine_members;

-- Drop all functions
DROP FUNCTION IF EXISTS notify_member_joined;
DROP FUNCTION IF EXISTS notify_new_round;
DROP FUNCTION IF EXISTS notify_payment_confirmed;
DROP FUNCTION IF EXISTS update_member_trust_score;
DROP FUNCTION IF EXISTS notify_tontine_members;
DROP FUNCTION IF EXISTS create_notification;
DROP FUNCTION IF EXISTS recalculate_all_trust_scores;
DROP FUNCTION IF EXISTS calculate_trust_score;

-- Remove new indexes
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_read;

-- Remove new column
ALTER TABLE notifications DROP COLUMN IF EXISTS metadata;

-- Restore from backup
-- psql -h <host> -U postgres -d postgres -f backup_pre_phase3.sql
```

## Support & Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure you're connected as superuser (postgres)
   - Check that SECURITY DEFINER is set on all functions

2. **Trigger Not Firing**
   - Verify trigger is active: `SELECT * FROM pg_trigger WHERE tgname LIKE '%trust%'`
   - Check that trigger function has no errors

3. **Realtime Not Working**
   - Verify publication includes notifications: `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime'`
   - Check client subscription is correctly configured

4. **Trust Score Not Updating**
   - Manually recalculate: `SELECT recalculate_all_trust_scores()`
   - Check payment records exist for the user

## Contact
For technical support or questions about this migration:
- Check logs in `.fastshot-logs/` directory
- Review Supabase project logs
- Consult Phase 3 implementation documentation
