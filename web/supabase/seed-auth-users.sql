-- =============================================
-- DOUROU - Comptes auth e-mail (seed demo Supabase)
-- =============================================
-- A executer APRES schema.sql et AVANT seed-demo.sql.
-- Mot de passe commun (tests manuels uniquement) : DemoDourou2026!
-- Connexion recommandee : magic link via l'application.
-- =============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ahmed Trabelsi (admin tontine demo)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-0001-0001-0001-000000000001',
  'authenticated',
  'authenticated',
  'ahmed@dourou.demo',
  crypt('DemoDourou2026!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Ahmed Trabelsi"}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'aaaaaaaa-0001-0001-0001-000000000001',
  'aaaaaaaa-0001-0001-0001-000000000001',
  jsonb_build_object('sub', 'aaaaaaaa-0001-0001-0001-000000000001', 'email', 'ahmed@dourou.demo'),
  'email',
  'aaaaaaaa-0001-0001-0001-000000000001',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Fatma Ben Youssef
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-0001-0001-0001-000000000002',
  'authenticated', 'authenticated',
  'fatma@dourou.demo',
  crypt('DemoDourou2026!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Fatma Ben Youssef"}',
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'aaaaaaaa-0001-0001-0001-000000000002',
  'aaaaaaaa-0001-0001-0001-000000000002',
  jsonb_build_object('sub', 'aaaaaaaa-0001-0001-0001-000000000002', 'email', 'fatma@dourou.demo'),
  'email', 'aaaaaaaa-0001-0001-0001-000000000002',
  NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Yassine Khelifi
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-0001-0001-0001-000000000003',
  'authenticated', 'authenticated',
  'yassine@dourou.demo',
  crypt('DemoDourou2026!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Yassine Khelifi"}',
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'aaaaaaaa-0001-0001-0001-000000000003',
  'aaaaaaaa-0001-0001-0001-000000000003',
  jsonb_build_object('sub', 'aaaaaaaa-0001-0001-0001-000000000003', 'email', 'yassine@dourou.demo'),
  'email', 'aaaaaaaa-0001-0001-0001-000000000003',
  NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Nour Chaabane
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-0001-0001-0001-000000000004',
  'authenticated', 'authenticated',
  'nour@dourou.demo',
  crypt('DemoDourou2026!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Nour Chaabane"}',
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'aaaaaaaa-0001-0001-0001-000000000004',
  'aaaaaaaa-0001-0001-0001-000000000004',
  jsonb_build_object('sub', 'aaaaaaaa-0001-0001-0001-000000000004', 'email', 'nour@dourou.demo'),
  'email', 'aaaaaaaa-0001-0001-0001-000000000004',
  NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;
