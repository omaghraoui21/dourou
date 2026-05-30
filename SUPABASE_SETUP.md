# Guide de Configuration Supabase - Dourou

Ce guide vous accompagne pas a pas dans la configuration complete du backend Supabase pour l'application Dourou. Il couvre la creation du projet, l'application du schema de base de donnees, la configuration de l'authentification, et l'insertion de donnees de demonstration.

**Public cible** : Evaluateurs Startup Act, nouveaux developpeurs rejoignant le projet.

---

## Table des matieres

1. [Creation du projet Supabase](#1-creation-du-projet-supabase)
2. [Variables d'environnement](#2-variables-denvironnement)
3. [Creation du fichier .env](#3-creation-du-fichier-env)
4. [Application du schema](#4-application-du-schema)
5. [Application des migrations](#5-application-des-migrations)
6. [Verification](#6-verification)
7. [Configuration de l'authentification](#7-configuration-de-lauthentification)
8. [Donnees de demonstration (seed)](#8-donnees-de-demonstration-seed)
9. [Creation d'un compte demo](#9-creation-dun-compte-demo)
10. [Erreurs frequentes et solutions](#10-erreurs-frequentes-et-solutions)
11. [Ressources](#11-ressources)

---

## 1. Creation du projet Supabase

1. Rendez-vous sur [https://supabase.com](https://supabase.com) et connectez-vous (ou creez un compte gratuit).
2. Cliquez sur **"New Project"** dans votre organisation.
3. Remplissez les informations :
   - **Name** : `dourou` (ou le nom de votre choix)
   - **Database Password** : choisissez un mot de passe fort (conservez-le en lieu sur)
   - **Region** : choisissez la region la plus proche (ex: `eu-west-1` pour la Tunisie)
   - **Pricing Plan** : le plan gratuit (Free) suffit pour le developpement et la demonstration
4. Cliquez sur **"Create new project"**.
5. **Attendez 2-3 minutes** que le projet soit completement initialise (vous verrez un indicateur de progression).

> **Note** : Ne passez pas a l'etape suivante tant que le projet n'est pas entierement initialise (status "Ready").

---

## 2. Variables d'environnement

Une fois le projet cree, recuperez les informations de connexion :

1. Dans le dashboard Supabase, allez dans **Settings** (icone engrenage en bas a gauche).
2. Cliquez sur **API** dans le menu lateral.
3. Vous trouverez :
   - **Project URL** : l'URL de votre projet (format : `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key** : la cle publique anonyme (sous "Project API keys")

> **Important** : La cle `anon` est publique et securisee par les politiques RLS (Row Level Security). Ne confondez pas avec la cle `service_role` qui ne doit JAMAIS etre exposee dans le code client.

---

## 3. Creation du fichier .env

1. A la racine du projet, copiez le fichier `.env.example` :

```bash
cp .env.example .env
```

2. Ouvrez `.env` et remplissez les valeurs :

```env
# Supabase Configuration (Required)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx

# Dourou Platform (Optional - advanced features)
EXPO_PUBLIC_PROJECT_ID=your-project-id
EXPO_PUBLIC_NEWELL_API_URL=https://api.example.com
EXPO_PUBLIC_AUTH_BROKER_URL=https://auth.example.com
```

> **Attention** : Le fichier `.env` est dans `.gitignore` et ne sera jamais commite. Ne partagez jamais vos cles dans un depot public.

---

## 4. Application du schema

Le fichier `supabase/schema.sql` contient le schema complet et rejouable de la base de donnees Dourou. Il cree :

- 8 tables principales
- Tous les index de performance
- Les fonctions helper de securite (`is_admin()`, `is_tontine_member()`, `is_tontine_creator()`, `is_tontine_admin()`)
- Toutes les politiques RLS (Row Level Security)
- Les fonctions et triggers (`handle_new_user`, `handle_updated_at`, `calculate_trust_score`)
- La configuration Realtime

### Etapes :

1. Dans le dashboard Supabase, allez dans **SQL Editor** (menu lateral gauche).
2. Cliquez sur **"New query"**.
3. Ouvrez le fichier `supabase/schema.sql` depuis le code source du projet.
4. **Copiez l'integralite du contenu** et collez-le dans l'editeur SQL.
5. Cliquez sur **"Run"** (ou `Ctrl+Enter`).
6. Verifiez qu'il n'y a pas d'erreurs dans la console en bas.

> **Note** : Le schema utilise `CREATE TABLE IF NOT EXISTS` et `CREATE OR REPLACE FUNCTION`, donc il est idempotent et peut etre relance sans risque.

---

## 5. Application des migrations

Apres le schema de base, appliquez les migrations incrementales dans l'ordre. Chaque fichier se trouve dans `supabase/migrations/`.

### Procedure :

Pour chaque migration ci-dessous, ouvrez une nouvelle requete dans le SQL Editor, copiez le contenu du fichier, et executez.

### Migration 003 : Trust Score et Notifications

**Fichier** : `supabase/migrations/003_trust_score_and_notifications.sql`

Ajoute :
- Champ `metadata` (JSONB) a la table `notifications`
- Index de performance sur les notifications
- Fonction `calculate_trust_score()` - calcul automatique du score de confiance
- Trigger `trigger_update_trust_score` - mise a jour automatique apres un paiement
- Fonctions helper pour les notifications (`create_notification`, `notify_tontine_members`)
- Triggers automatiques : notification a la confirmation de paiement, au demarrage d'un tour, a l'ajout d'un membre
- Fonction `recalculate_all_trust_scores()` pour recalcul en batch
- Realtime active sur la table `notifications`

### Migration 004 : Etats de paiement raffines

**Fichier** : `supabase/migrations/004_refined_payment_states.sql`

Ajoute :
- Nouveaux etats de paiement : `unpaid`, `declared`, `paid`, `late` (remplace l'ancien `pending`)
- Migration automatique des donnees existantes
- Mise a jour de `calculate_trust_score()` pour les nouveaux etats
- Validation des limites de membres (minimum 3, maximum 50)
- Recalcul automatique de tous les trust scores

### Migration 005 : Durcissement production

**Fichier** : `supabase/migrations/005_production_hardening.sql`

Ajoute :
- Tables de rate limiting (`invitation_attempts`, `payment_rate_limits`)
- Logs d'audit immutables (interdiction UPDATE/DELETE)
- Enforcement du fuseau horaire Africa/Tunis sur toutes les timestamps
- Procedure de suppression de compte (`delete_user_account`)
- Fonction de masquage des numeros de telephone (`mask_phone_number`)
- Fonctions de controle de debit (`check_invitation_rate_limit`, `check_payment_rate_limit`)
- Politiques RLS sur les nouvelles tables

### Migration 006 : Correction recursion RLS

**Fichier** : `supabase/migrations/006_fix_rls_infinite_recursion.sql`

Ajoute :
- Fonctions SECURITY DEFINER (`is_tontine_member`, `is_tontine_creator`, `is_tontine_admin`) pour casser les dependances circulaires RLS
- Suppression des anciennes politiques RLS problematiques
- Nouvelles politiques v2 sans recursion sur : `tontines`, `tontine_members`, `rounds`, `payments`, `audit_log`

> **Important** : Cette migration est critique. Sans elle, certaines requetes tombent en boucle infinie.

### Migration 007 : Mitigation des risques et securite

**Fichier** : `supabase/migrations/007_risk_mitigation_security.sql`

Ajoute :
- Champ `status` sur `profiles` (`active`, `suspended`, `banned`)
- Table `governance_settings` pour les parametres de gouvernance configurables
- Fonction `check_user_eligibility_for_invite()` - prevention des membres fantomes
- Champs `proof_image_url` et `reference_id` sur `payments` - preuves de paiement
- Trigger `validate_payment_proof` - exige une preuve lors de la declaration
- Vue `orphaned_tontines` - detection des tontines sans admin actif
- Vue `monitor_abuse_metrics` - surveillance des abus (velocite, patterns suspects)
- Fonction `check_join_velocity_limit()` - limite de tontines rejointes par jour
- Fonction `get_governance_summary()` - tableau de bord admin
- Politiques RLS sur `governance_settings`

---

## 6. Verification

Apres avoir applique le schema et toutes les migrations, verifiez que tout est en place.

### Verifier les tables

Executez dans le SQL Editor :

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Tables attendues** (10 tables apres les migrations) :

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs |
| `tontines` | Groupes de tontine |
| `tontine_members` | Membres des tontines |
| `invitations` | Codes d'invitation |
| `rounds` | Tours de collecte |
| `payments` | Paiements individuels |
| `notifications` | Notifications |
| `audit_log` | Journal d'audit |
| `invitation_attempts` | Tentatives d'invitation (rate limiting) |
| `payment_rate_limits` | Rate limiting des paiements |
| `governance_settings` | Parametres de gouvernance |

### Verifier que RLS est active

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Toutes les tables principales doivent avoir `rowsecurity = true`.

### Verifier la publication Realtime

```sql
SELECT * FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

Tables attendues dans la publication : `tontines`, `tontine_members`, `rounds`, `payments`, `notifications`.

### Verifier les fonctions

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

Fonctions cles attendues :
- `is_admin`
- `is_tontine_member`
- `is_tontine_creator`
- `is_tontine_admin`
- `handle_new_user`
- `calculate_trust_score`
- `create_notification`
- `check_join_velocity_limit`
- `get_governance_summary`

---

## 7. Configuration de l'authentification

Dourou utilise l'authentification par telephone (OTP par SMS).

### Activer le fournisseur Phone :

1. Dans le dashboard Supabase, allez dans **Authentication** (menu lateral).
2. Cliquez sur **Providers** dans le menu.
3. Trouvez **Phone** dans la liste et cliquez dessus.
4. **Activez** le toggle "Enable Phone provider".
5. Configurez les options :
   - **SMS Provider** : pour la demo, utilisez "Twilio" ou laissez la configuration par defaut
   - Activez **"Enable phone confirmations"**

### Pour la demonstration (sans envoyer de vrais SMS) :

Option A - Numeros de test Supabase :
1. Dans **Authentication** > **Providers** > **Phone**
2. Ajoutez des numeros de test dans la section "Phone numbers for testing"
3. Exemple : `+21698000001` avec OTP `123456`
4. Ces numeros recevront toujours le meme OTP sans envoi de SMS

Option B - Desactiver la confirmation :
1. Dans **Authentication** > **Settings**
2. Desactivez temporairement "Enable phone confirmations"
3. Les utilisateurs pourront se connecter sans verification OTP

> **Recommandation pour la demo Startup Act** : Utilisez l'Option A avec des numeros de test. Cela montre le flux complet d'authentification sans dependre d'un service SMS.

### Trigger automatique :

Lorsqu'un utilisateur s'inscrit via le telephone, le trigger `handle_new_user` cree automatiquement une ligne dans la table `profiles` avec l'UUID et le numero de telephone.

---

## 8. Donnees de demonstration (seed)

Les donnees ci-dessous creent un scenario de demonstration realiste : une tontine active avec 4 membres tunisiens, des tours planifies, et des paiements en cours.

> **Important** : Les UUIDs ci-dessous sont des placeholders. Pour que les donnees fonctionnent correctement avec l'authentification, vous devez :
> 1. D'abord creer les comptes via l'application (ou via le dashboard Supabase)
> 2. Recuperer les UUIDs generes par `auth.users`
> 3. Remplacer les UUIDs placeholders par les vrais UUIDs
>
> Alternativement, vous pouvez inserer ces donnees directement si les utilisateurs correspondants existent deja dans `auth.users`.

### SQL de seed :

```sql
-- =============================================
-- DONNEES DE DEMONSTRATION - DOUROU
-- =============================================
-- Remplacez les UUIDs par ceux de vos utilisateurs reels
-- =============================================

-- UUIDs placeholders (a remplacer par les vrais apres inscription)
-- Utilisateur demo principal : 00000000-0000-0000-0000-000000000001
-- Ahmed Trabelsi :            00000000-0000-0000-0000-000000000002
-- Fatma Ben Youssef :         00000000-0000-0000-0000-000000000003
-- Yassine Khelifi :           00000000-0000-0000-0000-000000000004
-- Nour Chaabane :             00000000-0000-0000-0000-000000000005

-- =============================================
-- 1. PROFILS
-- =============================================

INSERT INTO profiles (id, full_name, phone, trust_score, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Ahmed Trabelsi', '+21698000001', 4.2, 'user'),
  ('00000000-0000-0000-0000-000000000002', 'Fatma Ben Youssef', '+21698000002', 3.8, 'user'),
  ('00000000-0000-0000-0000-000000000003', 'Yassine Khelifi', '+21698000003', 3.5, 'user'),
  ('00000000-0000-0000-0000-000000000004', 'Nour Chaabane', '+21698000004', 4.0, 'user')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  trust_score = EXCLUDED.trust_score;

-- =============================================
-- 2. TONTINE
-- =============================================

INSERT INTO tontines (id, creator_id, title, amount, frequency, currency, total_members, current_round, distribution_logic, status, start_date, next_deadline)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Collegues Startup',
  200,
  'monthly',
  'TND',
  4,
  1,
  'fixed',
  'active',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '25 days'
);

-- =============================================
-- 3. MEMBRES
-- =============================================

INSERT INTO tontine_members (id, tontine_id, user_id, name, phone, payout_order, role)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Ahmed Trabelsi', '+21698000001', 1, 'admin'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Fatma Ben Youssef', '+21698000002', 2, 'member'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Yassine Khelifi', '+21698000003', 3, 'member'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Nour Chaabane', '+21698000004', 4, 'member');

-- =============================================
-- 4. TOURS (ROUNDS)
-- =============================================

INSERT INTO rounds (id, tontine_id, round_number, beneficiary_id, status, scheduled_date)
VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, '20000000-0000-0000-0000-000000000001', 'current', NOW()),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 2, '20000000-0000-0000-0000-000000000002', 'upcoming', NOW() + INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 3, '20000000-0000-0000-0000-000000000003', 'upcoming', NOW() + INTERVAL '60 days'),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 4, '20000000-0000-0000-0000-000000000004', 'upcoming', NOW() + INTERVAL '90 days');

-- =============================================
-- 5. PAIEMENTS (ROUND 1)
-- =============================================
-- Ahmed (beneficiaire) n'a pas besoin de payer ce tour
-- Fatma : a paye (confirmed)
-- Yassine : a declare (en attente de confirmation)
-- Nour : n'a pas encore paye

INSERT INTO payments (id, round_id, member_id, amount, method, status, reference, declared_at, confirmed_at)
VALUES
  -- Fatma - paye et confirme
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 200, 'd17', 'paid', 'REF-D17-20240115', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
  -- Yassine - declare mais pas encore confirme
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 200, 'bank', 'declared', 'REF-BANK-20240116', NOW() - INTERVAL '1 day', NULL),
  -- Nour - pas encore paye
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 200, NULL, 'unpaid', NULL, NULL, NULL);

-- =============================================
-- 6. NOTIFICATIONS
-- =============================================

INSERT INTO notifications (id, user_id, tontine_id, type, title, body, read)
VALUES
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'round_started', 'Nouveau tour demarre', 'Le tour 1 de Collegues Startup a commence. Vous etes le beneficiaire!', false),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'payment_confirmed', 'Paiement confirme', 'Votre paiement de 200 TND pour le tour 1 a ete confirme.', true);
```

> **Note sur les UUIDs** : Les identifiants `00000000-...` sont des placeholders. Dans un environnement reel, les UUIDs sont generes automatiquement par Supabase lors de l'inscription. Pour utiliser ce seed :
> - Soit inscrivez d'abord les utilisateurs via l'application et recuperez leurs UUIDs
> - Soit creez manuellement les entrees dans `auth.users` via le dashboard (voir section suivante)
> - Soit utilisez un fichier `seed-demo.sql` qui sera fourni separement avec les UUIDs reels de l'environnement cible

---

## 9. Creation d'un compte demo

Pour tester l'application, vous avez besoin d'au moins un compte utilisateur.

### Option A : Via l'application (recommande)

1. Lancez l'application Dourou (`npx expo start`)
2. Sur l'ecran d'authentification, entrez un numero de telephone
3. Si vous avez configure des numeros de test (section 7), utilisez un de ces numeros
4. Entrez le code OTP (ex: `123456` pour les numeros de test)
5. Completez le profil (nom, etc.)
6. Le trigger `handle_new_user` cree automatiquement le profil dans la table `profiles`

### Option B : Via le dashboard Supabase

1. Allez dans **Authentication** > **Users**
2. Cliquez sur **"Add user"** > **"Create new user"**
3. Remplissez :
   - **Phone** : `+21698000001` (ou tout numero valide)
   - Cochez "Auto-confirm" pour eviter la verification
4. Cliquez sur **"Create user"**
5. Notez l'UUID genere (visible dans la liste des utilisateurs)
6. Le trigger `handle_new_user` creera automatiquement le profil

### Option C : Directement en SQL (avance)

```sql
-- Creer un utilisateur dans auth.users
-- Note : cette methode n'est pas recommandee en production
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  phone,
  encrypted_password,
  raw_user_meta_data,
  created_at,
  updated_at,
  phone_confirmed_at,
  confirmation_token,
  aud,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  NULL,
  '+21698000001',
  crypt('demo-password-123', gen_salt('bf')),
  '{"full_name": "Ahmed Trabelsi"}'::jsonb,
  NOW(),
  NOW(),
  NOW(),
  '',
  'authenticated',
  'authenticated'
);
```

> **Note** : L'Option B est la plus simple pour la demonstration. Elle cree l'utilisateur et declenche automatiquement la creation du profil.

---

## 10. Erreurs frequentes et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `permission denied for table X` | Les politiques RLS bloquent l'acces | Verifiez que l'utilisateur est authentifie et qu'il a les permissions necessaires. Consultez les politiques RLS de la table concernee. |
| `relation "X" does not exist` | Le schema n'a pas ete applique | Reexecutez `supabase/schema.sql` dans le SQL Editor. |
| `Could not find the function "X"` | Les migrations n'ont pas ete appliquees dans l'ordre | Appliquez les migrations 003 a 007 dans l'ordre. Certaines fonctions sont creees ou mises a jour dans des migrations specifiques. |
| `Invalid login credentials` | L'authentification par telephone n'est pas activee | Activez le provider Phone dans Authentication > Providers. Verifiez les numeros de test. |
| L'application affiche un ecran blanc | Les variables d'environnement ne sont pas definies ou sont incorrectes | Verifiez le fichier `.env`. Assurez-vous que `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` sont correctement renseignes. Redemarrez l'application apres modification. |
| `JWT expired` | La session a expire | Deconnectez-vous et reconnectez-vous. Le token est renouvele automatiquement, mais si la session est inactive trop longtemps, il faut se re-authentifier. |
| `duplicate key value violates unique constraint` | Tentative d'insertion d'un enregistrement qui existe deja | Verifiez si les donnees existent deja. Utilisez `ON CONFLICT` dans vos INSERT ou supprimez les doublons. |
| `new row violates check constraint` | Valeur non conforme a une contrainte CHECK | Verifiez les valeurs autorisees (ex: `status` ne peut etre que `draft`, `active`, `completed` pour les tontines; `total_members` doit etre entre 3 et 50). |
| `infinite recursion detected in policy` | Politiques RLS circulaires | Assurez-vous que la migration 006 a ete appliquee. Elle corrige les dependances circulaires avec des fonctions SECURITY DEFINER. |

### Conseils de diagnostic :

- **Voir les logs** : Dans le dashboard Supabase, allez dans **Database** > **Logs** pour voir les erreurs SQL.
- **Tester sans RLS** : Pour isoler un probleme de permissions, vous pouvez temporairement desactiver RLS sur une table :
  ```sql
  ALTER TABLE tontines DISABLE ROW LEVEL SECURITY;
  -- Testez votre requete
  ALTER TABLE tontines ENABLE ROW LEVEL SECURITY;
  ```
- **Verifier l'authentification** : Dans l'application, ouvrez la console et verifiez que `supabase.auth.getSession()` retourne une session valide.

---

## 11. Ressources

### Fichiers du projet

| Fichier | Description |
|---------|-------------|
| [`supabase/schema.sql`](supabase/schema.sql) | Schema complet de la base de donnees (rejouable) |
| [`supabase/migrations/`](supabase/migrations/) | Migrations incrementales (003 a 007) |
| [`supabase/MIGRATION_GUIDE.txt`](supabase/MIGRATION_GUIDE.txt) | Guide detaille pour la migration de donnees entre instances |
| [`supabase/PORTABILITY_KIT.txt`](supabase/PORTABILITY_KIT.txt) | Kit de portabilite complet avec checklist |
| [`.env.example`](.env.example) | Template des variables d'environnement |

### Documentation Supabase

- [Guide Database](https://supabase.com/docs/guides/database) - Gestion de la base de donnees
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) - Politiques de securite
- [Phone Auth](https://supabase.com/docs/guides/auth/phone-login) - Authentification par telephone
- [Realtime](https://supabase.com/docs/guides/realtime) - Abonnements en temps reel
- [SQL Editor](https://supabase.com/docs/guides/database/overview#the-sql-editor) - Editeur SQL du dashboard

### Architecture de la base de donnees

```
profiles ─────────── auth.users (trigger: handle_new_user)
    │
    ├── tontines (creator_id)
    │       │
    │       ├── tontine_members (tontine_id, user_id)
    │       │       │
    │       │       ├── rounds (beneficiary_id)
    │       │       │       │
    │       │       │       └── payments (round_id, member_id)
    │       │       │
    │       │       └── (payout_order determines turn sequence)
    │       │
    │       ├── invitations (tontine_id, created_by)
    │       │
    │       └── audit_log (tontine_id)
    │
    ├── notifications (user_id, tontine_id)
    │
    └── governance_settings (updated_by)
```

---

**Temps estime pour la configuration complete** : 15-20 minutes.

Si vous rencontrez des problemes non couverts par ce guide, consultez les fichiers `supabase/MIGRATION_GUIDE.txt` et `supabase/PORTABILITY_KIT.txt` pour des informations supplementaires.
