# Dourou - Tontines Digitales 🇹🇳

[![Demo live](https://img.shields.io/badge/demo-live-dourou--webapp.vercel.app-2563eb?style=for-the-badge&logo=vercel&logoColor=white)](https://dourou-webapp.vercel.app)
[![Build](https://img.shields.io/badge/build-passing-16a34a?style=flat-square)](https://dourou-webapp.vercel.app)
[![Auth](https://img.shields.io/badge/auth-magic%20link-9333ea?style=flat-square)](/auth)

Application web pour la gestion transparente des tontines tunisiennes.

> **Demo en ligne :** [dourou-webapp.vercel.app](https://dourou-webapp.vercel.app) — cliquez sur **Essayer la demo** (aucun compte requis).

## Presentation

Dourou (دورو) digitalise la gestion des tontines (جمعية) en Tunisie. Ce n'est ni une banque, ni un portefeuille electronique, ni une cryptomonnaie. Dourou est un outil de suivi qui aide les groupes d'epargne rotative a gerer leurs contributions avec transparence et confiance.

### Fonctionnalites principales

- **Gestion des tontines** : Creez et gerez des groupes d'epargne rotative
- **Suivi des paiements** : Declarrez et confirmez les contributions en temps reel
- **Tours automatises** : Rotation des beneficiaires selon la logique choisie (fixe, aleatoire, confiance)
- **Score de confiance** : Systeme de reputation base sur la ponctualite des paiements
- **Notifications** : Alertes pour les paiements, rappels et mises a jour
- **Interface en francais** : Adaptee au marche tunisien

## Mode Demo (test instantane, sans configuration)

L'application embarque un **mode demo** qui permet de tester le produit
immediatement, **sans compte ni Supabase**.

- Sur la page d'accueil ou la page de connexion, cliquez sur **"Essayer la demo"**.
- L'application charge des donnees fictives realistes (une tontine active
  "Famille Sfax", 4 membres, 4 tours, des paiements en differents etats).
- Un bandeau "Mode demo" permet de **basculer entre deux profils** :
  - **Ahmed Trabelsi** (administrateur) : peut **confirmer** les paiements declares.
  - **Nour Chaabane** (membre) : peut **declarer** son paiement.
- Les actions (declaration, confirmation, creation de tontine, notifications)
  **persistent** pendant la session grace au stockage local du navigateur.
- Aucune donnee reelle, aucun fonds, aucun paiement : tout est simule cote client.

> Le mode demo n'a besoin d'**aucune** variable d'environnement. Il fonctionne
> meme si Supabase n'est pas configure, ce qui le rend ideal pour une
> demonstration rapide ou un deploiement Vercel sans backend.

Pour le scenario detaille pas-a-pas, voir **[STARTUP_ACT_DEMO.md](../STARTUP_ACT_DEMO.md)**.

## Stack Technique

- **Frontend** : Next.js 14 (App Router)
- **Langage** : TypeScript (mode strict)
- **Styles** : Tailwind CSS (theme sombre + accents dores)
- **Backend** : Supabase (Auth, Database, Realtime)
- **Mode demo** : couche de donnees client-side (localStorage), sans backend
- **Deploiement** : Vercel

## Architecture des donnees

Toutes les pages consomment une **couche d'acces unifiee** (`src/lib/data/`).
Selon le contexte, cette couche route automatiquement vers :

- le **store de demonstration** (`src/lib/demo/`) si le mode demo est actif ;
- **Supabase** (backend reel) sinon.

Les pages sont donc identiques dans les deux modes : seul l'aiguillage change.

## Installation

### Prerequis

- Node.js 18+
- Compte Supabase (gratuit sur [supabase.com](https://supabase.com)) — **optionnel**
  si vous voulez seulement tester le mode demo.

### Etapes

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/dourou-web.git
   cd dourou-web
   ```

2. **Installer les dependances**
   ```bash
   npm install
   ```

3. **Lancer en mode demo (sans Supabase)**
   ```bash
   npm run dev
   ```
   Ouvrez [http://localhost:3000](http://localhost:3000) et cliquez sur
   **"Essayer la demo"**. Aucune autre configuration n'est requise.

4. **Configurer l'environnement (pour le mode reel avec Supabase)**
   ```bash
   cp .env.example .env.local
   ```
   Remplissez les variables Supabase dans `.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
   ```

5. **Configurer Supabase**
   Suivez les instructions dans [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

6. **Lancer le serveur de developpement**
   ```bash
   npm run dev
   ```

7. **Ouvrir l'application**
   Accedez a [http://localhost:3000](http://localhost:3000)

## Comptes de Demonstration

### Mode demo (recommande pour tester)

Cliquez simplement sur **"Essayer la demo"** — aucun identifiant requis.
Utilisez le bandeau en haut pour basculer entre **Ahmed (admin)** et **Nour (membre)**.

### Mode reel (avec Supabase configure)

Apres avoir applique `seed-auth-users.sql` et `seed-demo.sql`, connectez-vous
par **magic link** (e-mail) sur `/auth` :

| E-mail | Nom | Role |
|---|---|---|
| ahmed@dourou.demo | Ahmed Trabelsi | Admin |
| fatma@dourou.demo | Fatma Ben Youssef | Membre |
| yassine@dourou.demo | Yassine Khelifi | Membre |
| nour@dourou.demo | Nour Chaabane | Membre |

Pour `@dourou.demo`, recuperez le lien dans Supabase **Authentication > Logs** si besoin.

## Structure du Projet

```
dourou-web/
├── src/
│   ├── app/                    # Pages (App Router)
│   │   ├── page.tsx            # Landing page
│   │   ├── auth/               # Authentification
│   │   └── dashboard/          # Pages protegees
│   │       ├── page.tsx        # Tableau de bord
│   │       ├── create/         # Creer une tontine
│   │       ├── tontine/[id]/   # Detail tontine
│   │       ├── profile/        # Profil utilisateur
│   │       └── notifications/  # Notifications
│   ├── components/
│   │   ├── ui/                 # Composants de base (Button, Card, etc.)
│   │   ├── tontine/            # Composants metier
│   │   ├── demo/               # Bandeau et bouton du mode demo
│   │   └── layout/             # Navbar, MobileNav
│   └── lib/
│       ├── supabase/           # Clients Supabase (mode reel)
│       ├── demo/               # Mode demo : seed, cookies, store localStorage
│       ├── data/               # Couche d'acces unifiee (demo OU Supabase)
│       ├── database.types.ts   # Types TypeScript
│       ├── translations.ts     # Traductions francaises
│       └── utils.ts            # Fonctions utilitaires
├── supabase/
│   ├── schema.sql              # Schema de base de donnees
│   └── seed-demo.sql           # Donnees de demonstration
├── public/                     # Assets statiques
└── docs
    ├── SUPABASE_SETUP.md       # Guide de configuration Supabase
    └── DEPLOYMENT.md           # Guide de deploiement Vercel
```

## Documentation

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Configuration complete de Supabase
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploiement sur Vercel

## Licence

Projet prive - Tous droits reserves.
