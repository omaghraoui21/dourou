# Configuration Supabase pour Dourou Web

## Projet recommande

- **Nom** : `dourou-prod`
- **Ref** : `yyufaaxmpoppnmcbypvf`
- **Region** : `eu-west-1`

## 1. Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://yyufaaxmpoppnmcbypvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<cle anon du dashboard>
```

## 2. Appliquer le schema

Dans **SQL Editor**, executez dans l'ordre :

1. `supabase/schema.sql`
2. `supabase/seed-auth-users.sql`
3. `supabase/seed-demo.sql`

## 3. Authentification par e-mail (magic link)

1. **Authentication > Providers** : activez **Email** (magic link)
2. **Authentication > URL Configuration** :
   - Site URL : votre domaine (ex. `https://votre-app.vercel.app`)
   - Redirect URLs : `http://localhost:3000/auth/callback`, `https://*.vercel.app/auth/callback`
3. Les utilisateurs recoivent un lien sans mot de passe ; la page `/auth/callback` finalise la session.

### Comptes de demonstration (@dourou.demo)

| E-mail | Nom | Role dans la tontine seed |
|--------|-----|---------------------------|
| ahmed@dourou.demo | Ahmed Trabelsi | Admin |
| fatma@dourou.demo | Fatma Ben Youssef | Membre |
| yassine@dourou.demo | Yassine Khelifi | Membre |
| nour@dourou.demo | Nour Chaabane | Membre |

Pour les domaines `@dourou.demo`, recuperez le lien magic link dans **Authentication > Logs** si l'e-mail n'arrive pas en boite mail.

## 4. Verification SQL

```sql
SELECT id, full_name, email, trust_score FROM profiles;
SELECT id, title, status FROM tontines;
```

## 5. Mode demo local (sans Supabase)

Aucune configuration : bouton **Essayer la demo** sur `/auth`. Donnees en `localStorage` uniquement.
