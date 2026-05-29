-- =============================================
-- DOUROU - Seed de demonstration (Supabase)
-- =============================================
-- PREREQUIS:
-- 1. schema.sql applique
-- 2. seed-auth-users.sql execute (comptes e-mail @dourou.demo)
-- =============================================

-- =============================================
-- 1. PROFILS (4 membres)
-- =============================================

INSERT INTO profiles (id, full_name, email, phone, trust_score, role, created_at, updated_at)
VALUES
  ('aaaaaaaa-0001-0001-0001-000000000001', 'Ahmed Trabelsi', 'ahmed@dourou.demo', '+21698000001', 4.5, 'user', NOW() - INTERVAL '30 days', NOW()),
  ('aaaaaaaa-0001-0001-0001-000000000002', 'Fatma Ben Youssef', 'fatma@dourou.demo', '+21698000002', 4.8, 'user', NOW() - INTERVAL '28 days', NOW()),
  ('aaaaaaaa-0001-0001-0001-000000000003', 'Yassine Khelifi', 'yassine@dourou.demo', '+21698000003', 3.5, 'user', NOW() - INTERVAL '25 days', NOW()),
  ('aaaaaaaa-0001-0001-0001-000000000004', 'Nour Chaabane', 'nour@dourou.demo', '+21698000004', 3.0, 'user', NOW() - INTERVAL '20 days', NOW())
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  trust_score = EXCLUDED.trust_score,
  updated_at = NOW();

-- =============================================
-- 2. TONTINE "Equipe du bureau"
-- =============================================

INSERT INTO tontines (id, creator_id, title, amount, frequency, currency, total_members, current_round, distribution_logic, status, start_date, next_deadline, created_at, updated_at)
VALUES (
  'bbbbbbbb-0001-0001-0001-000000000001',
  'aaaaaaaa-0001-0001-0001-000000000001',
  'Equipe du bureau',
  200,
  'monthly',
  'TND',
  4,
  1,
  'fixed',
  'active',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '25 days',
  NOW() - INTERVAL '10 days',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  amount = EXCLUDED.amount,
  status = EXCLUDED.status,
  current_round = EXCLUDED.current_round,
  next_deadline = EXCLUDED.next_deadline,
  updated_at = NOW();

-- =============================================
-- 3. MEMBRES DE LA TONTINE
-- =============================================

INSERT INTO tontine_members (id, tontine_id, user_id, name, phone, payout_order, role, joined_at)
VALUES
  ('cccccccc-0001-0001-0001-000000000001', 'bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-0001-0001-0001-000000000001', 'Ahmed Trabelsi', '+21698000001', 1, 'admin', NOW() - INTERVAL '10 days'),
  ('cccccccc-0001-0001-0001-000000000002', 'bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-0001-0001-0001-000000000002', 'Fatma Ben Youssef', '+21698000002', 2, 'member', NOW() - INTERVAL '9 days'),
  ('cccccccc-0001-0001-0001-000000000003', 'bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-0001-0001-0001-000000000003', 'Yassine Khelifi', '+21698000003', 3, 'member', NOW() - INTERVAL '8 days'),
  ('cccccccc-0001-0001-0001-000000000004', 'bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-0001-0001-0001-000000000004', 'Nour Chaabane', '+21698000004', 4, 'member', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  payout_order = EXCLUDED.payout_order,
  role = EXCLUDED.role;

-- =============================================
-- 4. ROUNDS
-- =============================================

INSERT INTO rounds (id, tontine_id, round_number, beneficiary_id, status, scheduled_date, created_at)
VALUES
  ('dddddddd-0001-0001-0001-000000000001', 'bbbbbbbb-0001-0001-0001-000000000001', 1, 'cccccccc-0001-0001-0001-000000000001', 'current', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('dddddddd-0001-0001-0001-000000000002', 'bbbbbbbb-0001-0001-0001-000000000001', 2, 'cccccccc-0001-0001-0001-000000000002', 'upcoming', NOW() + INTERVAL '25 days', NOW() - INTERVAL '5 days'),
  ('dddddddd-0001-0001-0001-000000000003', 'bbbbbbbb-0001-0001-0001-000000000001', 3, 'cccccccc-0001-0001-0001-000000000003', 'upcoming', NOW() + INTERVAL '55 days', NOW() - INTERVAL '5 days'),
  ('dddddddd-0001-0001-0001-000000000004', 'bbbbbbbb-0001-0001-0001-000000000001', 4, 'cccccccc-0001-0001-0001-000000000004', 'upcoming', NOW() + INTERVAL '85 days', NOW() - INTERVAL '5 days')
ON CONFLICT (tontine_id, round_number) DO UPDATE SET
  beneficiary_id = EXCLUDED.beneficiary_id,
  status = EXCLUDED.status,
  scheduled_date = EXCLUDED.scheduled_date;

-- =============================================
-- 5. PAIEMENTS TOUR 1
-- =============================================

INSERT INTO payments (id, round_id, member_id, amount, method, status, reference, declared_at, confirmed_at, created_at)
VALUES
  (
    'eeeeeeee-0001-0001-0001-000000000001',
    'dddddddd-0001-0001-0001-000000000001',
    'cccccccc-0001-0001-0001-000000000002',
    200,
    'd17',
    'paid',
    'D17-REF-2024-001',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'eeeeeeee-0001-0001-0001-000000000002',
    'dddddddd-0001-0001-0001-000000000001',
    'cccccccc-0001-0001-0001-000000000003',
    200,
    'bank',
    'declared',
    'VIR-BNA-2024-045',
    NOW() - INTERVAL '1 day',
    NULL,
    NOW() - INTERVAL '1 day'
  ),
  (
    'eeeeeeee-0001-0001-0001-000000000003',
    'dddddddd-0001-0001-0001-000000000001',
    'cccccccc-0001-0001-0001-000000000004',
    200,
    NULL,
    'unpaid',
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '5 days'
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  method = EXCLUDED.method,
  reference = EXCLUDED.reference,
  declared_at = EXCLUDED.declared_at,
  confirmed_at = EXCLUDED.confirmed_at;

-- =============================================
-- 6. NOTIFICATIONS
-- =============================================

INSERT INTO notifications (id, user_id, tontine_id, type, title, body, read, created_at)
VALUES
  (
    'ffffffff-0001-0001-0001-000000000001',
    'aaaaaaaa-0001-0001-0001-000000000001',
    'bbbbbbbb-0001-0001-0001-000000000001',
    'payment_received',
    'Paiement recu',
    'Fatma Ben Youssef a confirme son paiement de 200 TND via D17.',
    true,
    NOW() - INTERVAL '2 days'
  ),
  (
    'ffffffff-0001-0001-0001-000000000002',
    'aaaaaaaa-0001-0001-0001-000000000001',
    'bbbbbbbb-0001-0001-0001-000000000001',
    'payment_declared',
    'Paiement declare',
    'Yassine Khelifi a declare un paiement de 200 TND par virement bancaire. En attente de votre confirmation.',
    false,
    NOW() - INTERVAL '1 day'
  ),
  (
    'ffffffff-0001-0001-0001-000000000003',
    'aaaaaaaa-0001-0001-0001-000000000001',
    'bbbbbbbb-0001-0001-0001-000000000001',
    'reminder',
    'Rappel de paiement',
    'Nour Chaabane n''a pas encore effectue son paiement pour le Tour 1. Echeance dans 25 jours.',
    false,
    NOW() - INTERVAL '4 hours'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  read = EXCLUDED.read;

-- Connectez-vous avec ahmed@dourou.demo (magic link) pour le tableau de bord demo.
