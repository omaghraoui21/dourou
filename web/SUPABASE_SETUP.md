# Configuration Supabase pour Dourou Web

Guide complet pour configurer Supabase avec l'application web Dourou.

## 1. Creer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com) et connectez-vous
2. Cliquez sur **New Project**
3. Choisissez un nom (ex: `dourou-production`)
4. Selectionnez la region la plus proche (Europe de l'Ouest recommande)
5. Definissez un mot de passe pour la base de donnees
6. Cliquez sur **Create new project**

## 2. Recuperer les identifiants

Allez dans **Settings > API** et notez :
- `Project URL` : votre URL Supabase
- `anon / public` key : votre cle anonyme

## 3. Configurer les variables d'environnement

Dans votre fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Important** : Le prefixe `NEXT_PUBLIC_` est necessaire pour que les variables soient accessibles cote client dans Next.js.

## 4. Appliquer le schema

1. Allez dans **SQL Editor** dans votre dashboard Supabase
2. Cliquez sur **New Query**
3. Copiez-collez le contenu complet de `supabase/schema.sql`
4. Cliquez sur **Run**
5. Verifiez qu'il n'y a pas d'erreurs

Le schema cree les tables suivantes :
- `profiles` - Profils utilisateurs
- `tontines` - Groupes de tontine
- `tontine_members` - Membres des tontines
- `invitations` - Codes d'invitation
- `rounds` - Tours/cycles
- `payments` - Paiements individuels
- `notifications` - Notifications utilisateur
- `audit_log` - Journal d'audit

## 5. Configurer l'authentification par telephone

1. Allez dans **Authentication > Providers**
2. Activez le provider **Phone**
3. Pour le developpement, configurez les numeros de test :

### Numeros de test (developpement uniquement)

Allez dans **Authentication > Phone > Test Phone Numbers** et ajoutez :

| Numero | Code OTP |
|--------|----------|
| +21698000001 | 123456 |
| +21698000002 | 123456 |
| +21698000003 | 123456 |
| +21698000004 | 123456 |

> **Note** : Les numeros de test ne consomment pas de credits SMS et fonctionnent uniquement avec le code OTP specifie.

### Pour la production

Configurez un fournisseur SMS :
- **Twilio** (recommande) : Configurez SID, Auth Token et numero d'envoi
- **MessageBird** : Alternative disponible
- **Vonage** : Autre option

## 6. Inserer les donnees de demonstration

1. Allez dans **SQL Editor**
2. Creez d'abord les utilisateurs de test :
   - **Authentication > Users > Add User > Phone**
   - Ajoutez chaque numero (+21698000001 a +21698000004)
   - Notez les UUIDs generes
3. Si vous utilisez les UUIDs fixes du seed, inserez manuellement dans auth.users via SQL
4. Executez le contenu de `supabase/seed-demo.sql`

## 7. Verification

Executez ces requetes dans le SQL Editor pour verifier :

```sql
-- Verifier les profils
SELECT id, full_name, phone, trust_score FROM profiles;

-- Verifier la tontine
SELECT id, title, amount, frequency, status FROM tontines;

-- Verifier les membres
SELECT tm.name, tm.role, tm.payout_order, t.title
FROM tontine_members tm
JOIN tontines t ON t.id = tm.tontine_id;

-- Verifier les paiements
SELECT p.amount, p.status, p.method, tm.name
FROM payments p
JOIN tontine_members tm ON tm.id = p.member_id;
```

## 8. Activer le Realtime (optionnel)

Le schema active deja le Realtime sur les tables principales. Pour verifier :
1. Allez dans **Database > Replication**
2. Verifiez que `tontines`, `tontine_members`, `rounds`, `payments` sont dans la publication

## Depannage

### Erreur "relation already exists"
Le schema utilise `IF NOT EXISTS`, donc vous pouvez le re-executer sans probleme.

### Erreur de permission RLS
Verifiez que vous etes connecte en tant qu'utilisateur authentifie. Les politiques RLS necessitent `auth.uid()`.

### Les numeros de test ne fonctionnent pas
Assurez-vous que le provider Phone est bien active et que les numeros sont enregistres avec le bon format (+216...).
