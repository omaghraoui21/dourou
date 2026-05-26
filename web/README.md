# Dourou - Tontines Digitales 🇹🇳

Application web pour la gestion transparente des tontines tunisiennes.

## Presentation

Dourou (دورو) digitalise la gestion des tontines (جمعية) en Tunisie. Ce n'est ni une banque, ni un portefeuille electronique, ni une cryptomonnaie. Dourou est un outil de suivi qui aide les groupes d'epargne rotative a gerer leurs contributions avec transparence et confiance.

### Fonctionnalites principales

- **Gestion des tontines** : Creez et gerez des groupes d'epargne rotative
- **Suivi des paiements** : Declarrez et confirmez les contributions en temps reel
- **Tours automatises** : Rotation des beneficiaires selon la logique choisie (fixe, aleatoire, confiance)
- **Score de confiance** : Systeme de reputation base sur la ponctualite des paiements
- **Notifications** : Alertes pour les paiements, rappels et mises a jour
- **Interface en francais** : Adaptee au marche tunisien

## Stack Technique

- **Frontend** : Next.js 14 (App Router)
- **Langage** : TypeScript (mode strict)
- **Styles** : Tailwind CSS (theme sombre + accents dores)
- **Backend** : Supabase (Auth, Database, Realtime)
- **Deploiement** : Vercel

## Installation

### Prerequis

- Node.js 18+
- Compte Supabase (gratuit sur [supabase.com](https://supabase.com))

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

3. **Configurer l'environnement**
   ```bash
   cp .env.example .env.local
   ```
   Remplissez les variables Supabase dans `.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
   ```

4. **Configurer Supabase**
   Suivez les instructions dans [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

5. **Lancer le serveur de developpement**
   ```bash
   npm run dev
   ```

6. **Ouvrir l'application**
   Accedez a [http://localhost:3000](http://localhost:3000)

## Comptes de Demonstration

| Telephone | Nom | Role |
|---|---|---|
| +21698000001 | Ahmed Trabelsi | Admin |
| +21698000002 | Fatma Ben Youssef | Membre |
| +21698000003 | Yassine Khelifi | Membre |
| +21698000004 | Nour Chaabane | Membre |

**Code OTP de test** : `123456`

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
│   │   └── layout/             # Navbar, MobileNav
│   └── lib/
│       ├── supabase/           # Clients Supabase
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
