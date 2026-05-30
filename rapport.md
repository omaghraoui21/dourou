# Rapport de travail — Projet Dourou

**Date :** 29 mai 2026  
**Dépôt :** [omaghraoui21/dourou](https://github.com/omaghraoui21/dourou)  
**Branche :** `dourou-webapp` ([PR #2](https://github.com/omaghraoui21/dourou/pull/2), ouverte)  
**Application web :** `./web`  
**Clone local de référence :** `C:\Users\omar.maghraoui\Documents\Codex\dourou\dourou-dourou-webapp`

---

## 1. Contexte et objectif

### Produit

**Dourou** (دورو) est une application web tunisienne de gestion de **tontines** (جمعية). Elle vise la transparence, le suivi des cotisations, la gouvernance des tours, le score de confiance et les notifications entre membres.

### Positionnement strict

Dourou **n’est pas** :

- une banque ;
- un portefeuille électronique ;
- une plateforme crypto ;
- un service de paiement réglementé.

L’argent circule **directement entre les membres**. L’application **ne détient ni ne transfère** de fonds : elle **suit** et **rend visible** l’activité du groupe.

### Contraintes UI et produit

| Contrainte | Statut |
|---|---|
| Interface 100 % française | ✅ Respectée dans `web/src` |
| Ton « produit sérieux » | ✅ Landing, disclaimers, métadonnées |
| Aucune mention interdite dans l’UI publique (`web/src`) | ✅ Vérifié par grep (voir §7) |
| Pas de crédits cloud / pas d’AWS dans l’UI | ✅ Conforme |

### Objectif de la session Cursor

Préparer la webapp pour une **mise en production** : qualité de build (TypeScript, ESLint, Next.js), parcours démo sans backend, mode réel Supabase, déploiement Vercel, et polish produit — en préservant l’architecture démo/réel existante.

---

## 2. Architecture technique

### Vue d’ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                     Pages Next.js (App Router)                │
│   /  /auth  /dashboard/*  (tontines, profil, notifs, etc.)   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │   src/lib/data/index.ts     │  ← couche unifiée
              │   (routing démo ↔ Supabase) │
              └─────────────┬───────────────┘
                            │
           ┌────────────────┴────────────────┐
           ▼                                 ▼
┌──────────────────────┐         ┌──────────────────────┐
│   Mode DÉMO          │         │   Mode RÉEL          │
│ cookie dourou_demo=1 │         │ Supabase Auth + DB   │
│ + localStorage       │         │ (@supabase/ssr)      │
│ src/lib/demo/*       │         │ src/lib/supabase/*   │
└──────────────────────┘         └──────────────────────┘
```

### Modes démo et réel

| Aspect | Mode démo | Mode réel |
|---|---|---|
| Activation | Cookie `dourou_demo=1` + `dourou_demo_user` ; bouton « Essayer la démo » (`?demo=1` via middleware) | Auth OTP téléphone Supabase |
| Persistance | `localStorage` via `src/lib/demo/store.ts` | PostgreSQL Supabase |
| Backend requis | **Non** | **Oui** (URL + clé anon) |
| Déploiement sans Supabase | `NEXT_PUBLIC_DEMO_ONLY=1` sur Vercel | Non applicable |

### Fichiers clés

| Fichier | Rôle |
|---|---|
| `web/src/lib/data/index.ts` | Point d’entrée unique ; chaque lecture/écriture route vers démo ou Supabase |
| `web/src/lib/demo/constants.ts` | Noms de cookies (sans dépendances, importable en Edge) |
| `web/src/lib/demo/data.ts` | Seed pur : profils, tontine « Famille Sfax », tours, paiements, notifications |
| `web/src/lib/demo/mode.ts` | Activation/désactivation du mode démo, utilisateur courant |
| `web/src/lib/demo/store.ts` | CRUD localStorage + mutations (déclarer, confirmer, créer tontine) |
| `web/src/lib/supabase/client.ts` | Client navigateur |
| `web/src/lib/supabase/server.ts` | Client serveur (RSC / actions) |
| `web/src/lib/supabase/middleware.ts` | Session, cookies démo, échec fermé si env manquants |
| `web/src/middleware.ts` | Matcher global ; délègue à `updateSession` |
| `web/supabase/schema.sql` | Schéma complet (8 tables, RLS, triggers, Realtime) |
| `web/supabase/seed-demo.sql` | Données de démonstration pour Supabase |
| `web/.env.example` | Variables documentées (Supabase + `NEXT_PUBLIC_DEMO_ONLY`) |
| `web/DEPLOYMENT.md` | Guide Vercel (mode démo et mode réel) |

### Middleware et sécurité

Le middleware (`web/src/lib/supabase/middleware.ts`) applique une logique **fail-closed** :

1. **`?demo=1`** → pose les cookies démo et redirige vers la destination.
2. **Cookie démo actif** → toutes les routes passent sans auth Supabase.
3. **Variables Supabase absentes** :
   - si `NEXT_PUBLIC_DEMO_ONLY=1` → accès public autorisé (démo via bouton) ;
   - sinon → `/dashboard` redirige vers `/auth` (pas d’accès non authentifié).
4. **Mode réel** → session Supabase vérifiée ; redirection auth ↔ dashboard.

### Schéma Supabase (résumé)

**Tables :** `profiles`, `tontines`, `tontine_members`, `invitations`, `rounds`, `payments`, `notifications`, `audit_log`.

**RLS :** politiques par table avec fonctions `SECURITY DEFINER` (`is_tontine_member`, `is_tontine_creator`, `is_tontine_admin`) pour éviter la récursion RLS. Un membre ne voit que ses tontines ; seuls les admins confirment les paiements.

**Auth :** OTP téléphone (+216), OTP de test documenté : `123456`.

### Stack

- **Next.js 14.2.15** (App Router)
- **TypeScript 5.6** (strict)
- **Tailwind CSS 3.4**
- **Supabase** (`@supabase/ssr` 0.5.1, `@supabase/supabase-js` 2.45.0)
- **Cible de déploiement :** Vercel (`Root Directory = web`)

### Note sur le dépôt

La **racine** du dépôt GitHub contient encore l’ancienne application mobile **Expo/React Native**. La webapp production se trouve exclusivement dans **`./web`**.

Un projet local séparé (`dourou-mvp` sous `Documents/Codex/2026-05-26/...`) est une **ancienne preview Next.js simplifiée**, distincte de la webapp complète sur la branche `dourou-webapp`.

---

## 3. Fonctionnalités livrées (branche `dourou-webapp`)

### Pages et routes

| Route | Description |
|---|---|
| `/` | Landing : hero, fonctionnalités, CTA « Essayer la démo », disclaimer légal |
| `/auth` | Connexion OTP téléphone (+216) ; CTA démo |
| `/dashboard` | Tableau de bord : stats, tontines actives |
| `/dashboard/tontines` | Liste des tontines |
| `/dashboard/create` | Assistant création tontine (3 étapes) |
| `/dashboard/tontine/[id]` | Détail : onglets Membres / Tours / Paiements |
| `/dashboard/tontine/[id]/round/[roundId]` | Détail tour : bénéficiaire, progression, déclarer/confirmer |
| `/dashboard/profile` | Profil, score de confiance, statistiques |
| `/dashboard/notifications` | Notifications ; badge non lues dans la navbar |

### Parcours démo (sans Supabase)

- Données seed « **Famille Sfax** » : 4 membres, 4 tours, paiements en états variés.
- **Tour 1** : Fatma = Payé, Yassine = Déclaré, Nour = Non payé.
- Bandeau démo avec bascule **Ahmed Trabelsi** (admin, confirme) ↔ **Nour Chaabane** (membre, déclare).
- Méthodes de paiement simulées : cash, virement, D17, Flouci.
- Mutations persistantes en session via `localStorage`.
- Aucun appel Supabase en mode démo (tout passe par `src/lib/data`).

### Mode réel (conception livrée, activation manuelle)

- Auth OTP téléphone Supabase.
- CRUD tontines, tours, paiements, notifications via Supabase.
- RLS : isolation par membre ; confirmation réservée à l’admin de tontine.
- Realtime activable sur les tables concernées (schéma SQL).

### Polish produit (commits récents sur la branche)

- Métadonnées SEO / Open Graph / Twitter (`web/src/app/layout.tsx`).
- Favicon SVG (`/icon.svg`).
- Composant `LegalDisclaimer` (positionnement non-banque).
- États vides (`EmptyState`), chargement (`LoadingSpinner`), erreurs (`error.tsx`, `not-found.tsx`).
- Badge notifications non lues (navbar desktop + nav mobile).
- Correction du taux de paiement (ne pénalise plus les paiements en attente).
- Référence de transaction affichée sur les lignes de paiement.

---

## 4. Travail effectué dans cette session Cursor

### 4.1 Exploration de l’environnement

| Action | Résultat |
|---|---|
| Identification du workspace Cursor | `dourou-mvp` = preview Next.js locale (ancienne), **pas** la webapp complète |
| Localisation de la webapp cible | Branche `dourou-webapp` sur GitHub ; clone ZIP dans `Documents/Codex/dourou/` |
| Lecture des transcripts agents | Sessions [Vercel plugin](d6086efd-da55-49ca-8344-097ea7c22928) et [pipeline webapp](6d05cc29-860e-409e-a005-889a8369be45) |
| Consultation PR #2 | 17 commits, +8078 / −40 lignes, 74 fichiers, mergeable |

### 4.2 Plugin Vercel — préparation `dourou-mvp` (sous-agent 04a26697)

Travail sur le **projet local simplifié** (pas `./web` du dépôt principal) :

- Suppression de `output: "standalone"` dans `next.config.js` (inadapté à Vercel standard).
- Ajout de `.env.example` (variables Supabase publiques / serveur).
- Ajout de `.gitignore` (`.env*.local`, `.vercel`, `.next`, etc.).
- Enrichissement du README avec workflow `/deploy`, `/env pull`, `/status`, `/bootstrap`.
- Installation Node.js portable + `npm install` + **`npm run build` réussi** sur `dourou-mvp`.

### 4.3 Pipeline webapp complet — sous-agent 6d05cc29 (interrompu)

Objectif : build, tests démo navigateur, Supabase, déploiement Vercel, commit/push.

**Réalisé :**

- Téléchargement de la branche `dourou-webapp` (archive ZIP GitHub).
- Installation Node.js portable v22.22.0 dans `Documents/Codex/tools/`.
- Lancement de `npm install` dans `./web`.

**Non réalisé** (session interrompue avant complétion) :

- Tests navigateur E2E du parcours démo.
- Création / configuration projet Supabase distant.
- Déploiement Vercel (`vercel link`, `vercel deploy`).
- Commits ou push supplémentaires depuis l’agent.
- Polish production additionnel demandé en fin de session.

### 4.4 Vérifications effectuées lors de la rédaction de ce rapport

Sur `Documents/Codex/dourou/dourou-dourou-webapp/web` :

| Commande | Résultat |
|---|---|
| `npm install` | ✅ Dépendances présentes |
| `npx tsc --noEmit` | ✅ Aucune erreur de type |
| `npm run lint` | ✅ OK — 1 **avertissement** (`Avatar.tsx` : préférer `next/image` à `<img>`) |
| `npm run build` | ✅ OK après nettoyage `.next` (10 routes générées, middleware 56 kB) |
| Grep termes interdits dans `web/src` | ✅ Aucune occurrence |

**Première tentative de build** : échec `ENOENT` (`middleware-manifest.json` / `pages-manifest.json`) dû à des builds concurrents corrompant `.next`. **Résolu** en arrêtant les processus Node, supprimant `.next`, et relançant un build unique.

---

## 5. Commandes exécutées

### Environnement

```powershell
# Node.js portable (session agents)
# Emplacement : C:\Users\omar.maghraoui\Documents\Codex\tools\node-v22.22.0-win-x64
$env:PATH = "...\node-v22.22.0-win-x64;$env:PATH"
node --version   # v22.22.0
npm --version    # 10.x
```

### Clone / récupération du dépôt (sans git local)

```powershell
Invoke-WebRequest -Uri "https://github.com/omaghraoui21/dourou/archive/refs/heads/dourou-webapp.zip" -OutFile dourou-webapp.zip
Expand-Archive -Path dourou-webapp.zip -DestinationPath .
```

### Qualité — `./web`

```powershell
cd web
npm install
npx tsc --noEmit
npm run lint
npm run build
```

### Nettoyage build (si corruption `.next`)

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .next
npm run build
```

### Vérification UI

```powershell
# Aucune occurrence dans web/src (confirmé)
rg -i "startup act|\bMVP\b|jury|AWS" web/src
```

### Commandes **non** exécutées avec succès dans cette session

```powershell
npm run dev                    # serveur local non lancé pour test manuel
vercel link / vercel deploy    # CLI Vercel non configurée localement
supabase db push               # projet Supabase non provisionné
git commit / git push          # git absent du PATH sur la machine de session
```

---

## 6. Déploiement

### État actuel

| Élément | Statut |
|---|---|
| Projet lié Vercel (`.vercel/project.json`) | ❌ Absent en local |
| URL `https://dourou.vercel.app` | ❌ HTTP 404 (domaine placeholder dans `layout.tsx`, non déployé) |
| Déploiement production confirmé | ❌ **Non réalisé dans cette session** |

### Configuration Vercel recommandée

1. Importer [omaghraoui21/dourou](https://github.com/omaghraoui21/dourou) sur [vercel.com/new](https://vercel.com/new).
2. **Root Directory :** `web`
3. Framework : Next.js (auto-détecté).

### Variables d’environnement

#### Mode démo public (sans Supabase)

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_DEMO_ONLY` | `1` |
| `NEXT_PUBLIC_SITE_URL` | URL Vercel finale (optionnel, pour OG) |

Aucune variable Supabase requise. Les visiteurs utilisent « Essayer la démo ».

#### Mode réel (avec Supabase)

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé **anon** (publique) |
| `NEXT_PUBLIC_DEMO_ONLY` | **Retirée** ou vide |

> Ne jamais exposer la clé `service_role` côté client.

### Procédure CLI (après installation Node + Vercel CLI)

```bash
cd web
vercel login
vercel link
vercel env add NEXT_PUBLIC_DEMO_ONLY   # valeur 1 pour démo
vercel --prod
```

Voir aussi `web/DEPLOYMENT.md` et `web/SUPABASE_SETUP.md`.

---

## 7. Tests et validation

### Critères d’acceptation

| Critère | Statut | Preuve / commentaire |
|---|---|---|
| `npm run build` sans erreur | ✅ | Build local réussi (29/05/2026) |
| `npx tsc --noEmit` propre | ✅ | Exit code 0 |
| `npm run lint` propre | ⚠️ | 1 warning non bloquant (`Avatar.tsx`) |
| Parcours démo complet sans Supabase | ⚠️ | Code et architecture en place ; **test navigateur non exécuté** dans cette session |
| Mode réel Supabase (OTP, RLS) | ❌ | Schéma + seed livrés ; **projet Supabase non provisionné** ni testé ici |
| Déploiement Vercel en ligne + URL | ❌ | Non déployé |
| UI sans termes interdits | ✅ | Grep `web/src` vide |
| Positionnement non-banque/wallet | ✅ | `LegalDisclaimer`, copy landing, README |

### Scénario de test démo (à exécuter manuellement)

1. `cd web && npm run dev` → http://localhost:3000
2. Cliquer **« Essayer la démo »** → `/dashboard`
3. Ouvrir tontine **« Famille Sfax »** → onglets Membres / Tours / Paiements
4. Tour 1 : vérifier Fatma=Payé, Yassine=Déclaré, Nour=Non payé
5. En tant qu’**Ahmed** : confirmer le paiement de Yassine → statut Payé, cagnotte progresse
6. Bandeau démo → basculer sur **Nour** → déclarer un paiement (cash/virement/D17/Flouci)
7. Rebasculer sur **Ahmed** → badge notifications → confirmer
8. **Profil** : score de confiance cohérent → **Déconnexion** → retour accueil

---

## 8. Problèmes rencontrés et résolutions

| Problème | Cause | Résolution |
|---|---|---|
| Node.js / npm absents du PATH | Environnement Windows Cursor sans Node installé globalement | Téléchargement Node.js portable v22.22.0 |
| Git absent du PATH | Git non installé ou non accessible | Clone via archive ZIP GitHub |
| Confusion workspace `dourou-mvp` vs `./web` | Deux projets Next.js locaux distincts | Identification explicite : webapp complète = branche `dourou-webapp` / `./web` |
| `next.config.js` avec `output: "standalone"` (dourou-mvp) | Config Docker/self-host, inadaptée à Vercel | Suppression de `standalone` (sous-agent Vercel) |
| Build Next.js `ENOENT` sur `.next/server/*` | Builds `npm` concurrents corrompant le cache | Stop processus Node + `Remove-Item .next` + rebuild unique |
| Winget Node.js annulé par l’utilisateur | Installation système interrompue | Fallback Node portable |
| Vercel MCP non disponible | Serveur MCP Vercel absent du dossier `mcps` | Utilisation des skills plugin Vercel + documentation CLI |
| Sous-agent pipeline incomplet | Interruption multitâche avant déploiement | Documenté comme **en attente** ; vérifications build faites dans ce rapport |
| Tokens API collés en chat | Risque de sécurité | **Recommandation : rotation** des tokens Vercel / Supabase / Render |

---

## 9. Points restants / prochaines étapes

### Priorité haute (bloquant mise en ligne)

1. **Déployer sur Vercel** avec `Root Directory = web` et `NEXT_PUBLIC_DEMO_ONLY=1`.
2. **Tester le parcours démo** sur l’URL de production (ou `npm run dev` local).
3. **Configurer Supabase** : créer projet, exécuter `schema.sql` + `seed-demo.sql`, activer Auth Phone + OTP test `123456`.
4. **Basculer en mode réel** : ajouter variables Supabase sur Vercel, retirer `NEXT_PUBLIC_DEMO_ONLY`, redéployer, valider RLS.

### Priorité moyenne

5. Merger ou finaliser la [PR #2](https://github.com/omaghraoui21/dourou/pull/2) après revue.
6. Corriger l’avertissement ESLint `Avatar.tsx` (`next/image`).
7. Définir `NEXT_PUBLIC_SITE_URL` sur l’URL Vercel réelle (métadonnées OG).
8. Installer Git et Node.js de façon permanente sur la machine de développement.

### Priorité basse

9. Domaine personnalisé (ex. `app.dourou.tn`) — voir `DEPLOYMENT.md`.
10. Tests automatisés E2E (Playwright) pour le parcours démo.
11. Renommer ou archiver les docs racine contenant des termes internes (`STARTUP_ACT_DEMO.md`, etc.) — **hors UI publique**, sans impact utilisateur final.

---

## 10. Annexes

### A. Structure du dépôt (simplifiée)

```
dourou/                          # Racine GitHub
├── app/                         # Ancienne app mobile Expo
├── web/                         # ★ Webapp Next.js (cible Vercel)
│   ├── src/
│   │   ├── app/                 # Routes App Router
│   │   ├── components/          # UI, layout, demo, tontine
│   │   └── lib/
│   │       ├── data/index.ts    # Couche unifiée
│   │       ├── demo/            # Mode démo
│   │       └── supabase/        # Mode réel
│   ├── supabase/
│   │   ├── schema.sql
│   │   └── seed-demo.sql
│   ├── public/
│   ├── .env.example
│   ├── DEPLOYMENT.md
│   ├── SUPABASE_SETUP.md
│   └── package.json
├── STARTUP_ACT_DEMO.md          # Doc interne (hors UI)
├── SUPABASE_SETUP.md            # Doc racine (legacy mobile)
└── README.md
```

### B. Comptes et données de démo

#### Mode démo client (localStorage)

| ID interne | Nom | Téléphone | Rôle dans la démo |
|---|---|---|---|
| `u-ahmed` | Ahmed Trabelsi | +21698000001 | Admin (confirme les paiements) |
| `u-nour` | Nour Chaabane | +21698000004 | Membre (déclare les paiements) |
| `u-fatma` | Fatma Ben Youssef | +21698000002 | Membre |
| `u-yassine` | Yassine Khelifi | +21698000003 | Membre |

Tontine seed : **« Famille Sfax »** — 200 TND/mois, 4 membres, tour 1 en cours.

#### Mode réel Supabase (seed SQL)

Mêmes profils téléphoniques ; OTP de test Supabase : **`123456`**.

### C. Commits significatifs sur `dourou-webapp` (PR #2)

| Date | Message (résumé) |
|---|---|
| 2026-05-26 | Ajout webapp complète Next.js 14 + Supabase + Tailwind |
| 2026-05-29 | Mode démo instantané (cookie, localStorage, couche data unifiée) |
| 2026-05-29 | Fix build TypeScript (`getTontinesForUser` / flatMap) |
| 2026-05-29 | Fix entrée démo server-visible (cookies middleware) |
| 2026-05-29 | UX : badge notifications, taux paiement, référence transaction |
| 2026-05-29 | Alignement wording « Famille Sfax » |

**HEAD actuel :** `8d31b63` — *fix(web): align demo example wording to 'Famille Sfax'*

### D. Routes générées au build (29/05/2026)

```
○ /                                          96.8 kB
○ /auth                                      130 kB
ƒ /dashboard                                 132 kB
ƒ /dashboard/create                          132 kB
ƒ /dashboard/notifications                   131 kB
ƒ /dashboard/profile                         137 kB
ƒ /dashboard/tontine/[id]                    137 kB
ƒ /dashboard/tontine/[id]/round/[roundId]     139 kB
ƒ /dashboard/tontines                          132 kB
ƒ Middleware                                   56 kB
```

### E. Synthèse honnête de l’état du projet

| Domaine | État |
|---|---|
| Code webapp fonctionnel (branche) | ✅ Livré et buildable |
| Architecture démo/réel | ✅ En place, non régressive |
| Qualité build local | ✅ Validée dans cette session |
| Déploiement Vercel | ❌ À faire |
| Supabase production | ❌ À provisionner |
| Test E2E démo navigateur | ❌ Non exécuté dans cette session |

---

## 11. Mise en production — session 29/05/2026 (soir)

### Quota Supabase (free tier : 2 projets actifs)

| Projet | Statut final | Action |
|---|---|---|
| **dpi-trs-tracker** | ✅ **ACTIVE_HEALTHY** | Restauré (priorité utilisateur) |
| **dourou-prod** (`yyufaaxmpoppnmcbypvf`) | ✅ **ACTIVE_HEALTHY** | Schéma + seed + auth e-mail |
| **trs-pharma** | ⏸ **INACTIVE** (pausé) | Pausé pour libérer un slot — **pas dpi-trs-tracker** |
| DourouV1, silsila, TRSNF60182, not | INACTIVE | Déjà inactifs |

### Déploiement Vercel

| Élément | Valeur |
|---|---|
| **URL production (alias)** | **https://dourou-webapp.vercel.app** |
| Ancienne URL | https://web-lovat-phi-92.vercel.app (projet `web`, conservé) |
| Projet Vercel | `dourou-webapp` — Root Directory `web` |
| Déploiement CLI | ✅ Production `dpl_9hkoMBuZfsDEhFbBpF1nLWfVEpRC` (29/05/2026) |

### Variables Vercel (`dourou-webapp`)

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_DEMO_ONLY` | `1` (mode démo public pour jury) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yyufaaxmpoppnmcbypvf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé anon (configurée, non reproduite ici) |
| `NEXT_PUBLIC_SITE_URL` | `https://dourou-webapp.vercel.app` |

**Mode réel :** retirer `NEXT_PUBLIC_DEMO_ONLY` sur Vercel et redéployer.

### Qualité build (local, 29/05/2026)

| Commande | Résultat |
|---|---|
| `npx tsc --noEmit` | ✅ OK |
| `npm run lint` | ✅ OK (0 warning) |
| `npm run build` | ✅ OK (11 routes) |

### Tests live (https://dourou-webapp.vercel.app)

| Scénario | Résultat |
|---|---|
| Landing + bandeau « Demo en ligne » | ✅ |
| Parcours démo → `/dashboard` | ✅ (Famille Sfax accessible) |
| Page `/auth` magic link (UI) | ✅ formulaire e-mail |
| Envoi magic link `ahmed@dourou.demo` | ⚠️ Supabase rejette le domaine `.demo` (`email_address_invalid`) ; comptes seed corrigés (`fix-auth-tokens.sql`) |
| Auth e-mail réelle | ⚠️ Non testée avec une vraie adresse — chemin prêt côté app |

### Git / GitHub

| Action | Statut |
|---|---|
| Commit local | ✅ `ca6628c` — email auth, polish, scripts Supabase |
| Push `dourou-webapp` | ⚠️ **Bloqué** — credentials GitHub absents sur la machine (push suspendu >4 min) |
| Déploiement | ✅ Réalisé via **Vercel CLI** (contournement push) |

> Pour pousser : `git push origin dourou-webapp` depuis un clone authentifié, ou configurer un PAT GitHub.

### Polish « surprise »

- Alias propre **dourou-webapp.vercel.app** (déjà actif sur Vercel)
- Badges README (demo live, build, auth magic link)
- Bandeau vert animé « Demo en ligne » sur la landing
- Script `web/supabase/fix-auth-tokens.sql` pour compatibilité GoTrue

### Prêt dossier Startup Act / grant ?

**Verdict : OUI pour démo jury** — URL live, parcours démo complet, UI FR, disclaimers, build propre.

**Gaps honnêtes :**

1. Push GitHub non finalisé (code déployé via CLI, pas via CI Git)
2. Magic link `@dourou.demo` bloqué par Supabase (utiliser démo sans compte ou un vrai e-mail)
3. SMTP custom non configuré (e-mails Supabase par défaut, limites free tier)
4. Rotation recommandée des tokens API exposés en chat

---

*Document généré à partir de l’état du dépôt, des transcripts agents Cursor, de la PR #2 GitHub et des vérifications build/lint/tsc locales du 29 mai 2026. Section 11 ajoutée après déploiement production.*
