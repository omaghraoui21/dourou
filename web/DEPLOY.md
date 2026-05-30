# Vercel — déploiement Dourou Web

## Démo publique (sans Supabase)

Variables d'environnement Vercel (Root Directory = `web`) :

```
NEXT_PUBLIC_DEMO_ONLY=1
```

Aucune variable Supabase requise. Le middleware autorise l'accès au tableau de bord en mode démo.

## Mode production (Supabase)

1. Restaurer ou créer un projet Supabase
2. Appliquer `supabase/schema.sql` puis `supabase/seed-demo.sql`
3. Activer Auth > Email (magic link) et configurer les Redirect URLs (`/auth/callback`)
4. Variables Vercel :

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Supprimer ou laisser vide `NEXT_PUBLIC_DEMO_ONLY`.

## Commandes locales

```bash
cd web
npm install
npx tsc --noEmit
npm run lint
npm run build
npm run dev
```
