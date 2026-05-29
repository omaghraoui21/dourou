# Deploiement de Dourou Web

Guide pour deployer l'application Dourou sur Vercel.

## Prerequis

- Compte [Vercel](https://vercel.com) (gratuit)
- Repository GitHub avec le code source
- Projet Supabase configure (voir [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

## 1. Pousser sur GitHub

```bash
git remote add origin https://github.com/votre-username/dourou-web.git
git push -u origin main
```

## 2. Connecter a Vercel

1. Rendez-vous sur [vercel.com/new](https://vercel.com/new)
2. Cliquez sur **Import Git Repository**
3. Selectionnez votre repository `dourou-web`
4. Vercel detecte automatiquement Next.js

## 3. Configurer les variables d'environnement

Dans les parametres du projet Vercel, ajoutez :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://votre-projet.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `votre-cle-anon-publique` |

> **Important** : N'utilisez JAMAIS la `service_role` key cote client. Utilisez uniquement la cle `anon`.

### Deploiement en mode demo uniquement (sans Supabase)

Pour une demonstration rapide au jury, vous pouvez deployer **sans configurer
Supabase**. Le **mode demo** fonctionne entierement cote client (donnees fictives
dans le navigateur).

Dans ce cas, ajoutez **une seule** variable d'environnement sur Vercel :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_DEMO_ONLY` | `1` |

- Deployez, puis partagez le lien.
- Les visiteurs cliquent sur **"Essayer la demo"** pour tester tout le parcours.
- La connexion reelle par telephone/OTP restera inactive tant que Supabase
  n'est pas configure — c'est attendu dans ce mode.

> **Securite** : si vous oubliez les variables Supabase **sans** poser
> `NEXT_PUBLIC_DEMO_ONLY=1`, l'acces au tableau de bord est volontairement
> bloque (redirige vers `/auth`). Cela evite tout acces non authentifie en cas
> de mauvaise configuration d'un deploiement reel.

Ajoutez les variables Supabase plus tard (et retirez `NEXT_PUBLIC_DEMO_ONLY`)
pour activer le mode reel, sans changement de code.

## 4. Deployer

1. Cliquez sur **Deploy**
2. Vercel installe les dependances et build le projet
3. En quelques minutes, votre application est en ligne

L'URL de deploiement sera de la forme : `https://dourou-web-xxx.vercel.app`

## 5. Domaine personnalise (optionnel)

1. Allez dans **Settings > Domains**
2. Cliquez sur **Add Domain**
3. Entrez votre domaine (ex: `app.dourou.tn`)
4. Configurez les DNS selon les instructions de Vercel :
   - **CNAME** : `cname.vercel-dns.com`
   - Ou **A Record** : `76.76.21.21`

## 6. Deploiements automatiques

Chaque push sur la branche `main` declenche un deploiement automatique.

Pour les branches de developpement, Vercel cree des **Preview Deployments** avec des URLs uniques.

## 7. Notes de production

### Supabase en production

- Utilisez un projet Supabase separe pour la production
- Activez un vrai fournisseur SMS (Twilio recommande)
- Retirez les numeros de test
- Activez la confirmation d'email si necessaire

### Performance

- Next.js optimise automatiquement les images et le code
- Le rendu cote serveur (SSR) est gere par les Edge Functions de Vercel
- Le cache est configure automatiquement

### Securite

- Les variables `NEXT_PUBLIC_*` sont visibles cote client (c'est normal pour Supabase)
- La securite est assuree par les Row Level Security (RLS) de Supabase
- Ne stockez jamais de secrets sensibles dans les variables `NEXT_PUBLIC_`

### Monitoring

- Utilisez le dashboard Vercel pour les metriques (Web Vitals, erreurs)
- Consultez les logs Supabase pour les requetes et l'activite
- Configurez des alertes dans Supabase pour les erreurs

## Depannage

### Build echoue

```bash
# Testez le build localement
npm run build
```

Verifiez que toutes les variables d'environnement sont configurees.

### Erreur 500 en production

1. Verifiez les logs dans Vercel (Functions > Logs)
2. Verifiez que les variables Supabase sont correctes
3. Testez la connexion Supabase depuis votre navigateur

### Les donnees ne s'affichent pas

1. Verifiez que le schema SQL est applique
2. Verifiez les politiques RLS
3. Verifiez que l'utilisateur est authentifie
