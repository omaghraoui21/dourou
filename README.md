# Dourou

**La plateforme tunisienne qui digitalise les tontines.**

**المنصة التونسية إلي ترقمن الجمعيات.**

> Ce repo contient **deux projets** :
> - **`/`** (racine) - Application mobile React Native / Expo
> - **`/web`** - Application web Next.js (recommandee pour la demo Startup Act)
>
> **Pour tester rapidement** : voir le dossier [`web/`](./web/) et son [README](./web/README.md).

---

## Probleme

En Tunisie, plus de 2 millions de personnes participent a des tontines (جمعية). Ces groupes d'epargne rotative sont geres de maniere informelle :

- Suivi sur papier ou via WhatsApp
- Aucune transparence sur les paiements
- Pas de trace en cas de litige
- Aucun mecanisme de confiance mesurable
- Conflits frequents entre membres

## Solution

Dourou digitalise la gestion des tontines avec :

- **Suivi des paiements** : chaque versement est enregistre et visible par tous les membres
- **Score de confiance** : note de 1.0 a 5.0 basee sur l'historique de paiement
- **Notifications en temps reel** : alertes automatiques pour les echeances et confirmations
- **Gouvernance** : possibilite de geler une tontine, suspendre un compte, activer le mode maintenance
- **Multi-langue** : Francais, Arabe, Darija tunisien

## Marche cible

- **Tunisie** : marche primaire
- **2M+** de participants actifs dans des tontines informelles
- **Segment** : adultes 25-55 ans utilisant des smartphones
- **Besoin** : transparence, confiance et suivi sans papier

## Fonctionnalites MVP

| Ecran | Description |
|-------|-------------|
| Onboarding | Presentation de l'app en 3 etapes |
| Authentification | Connexion par telephone + OTP |
| Dashboard | Vue d'ensemble des tontines actives |
| Creation tontine | Nom, montant, frequence, nombre de tours |
| Detail tontine | Membres, tours, statut (brouillon/active/terminee) |
| Invitation | Code d'invitation pour rejoindre une tontine |
| Tour (Round) | Beneficiaire, statut des paiements, confirmation |
| Declaration paiement | Cash, virement bancaire, D17, Flouci |
| Confirmation admin | Validation des paiements par l'administrateur |
| Profil | Score de confiance, parametres, deconnexion |
| Notifications | Historique des alertes |
| Centre juridique | Conditions d'utilisation, politique de confidentialite |
| Gouvernance | Gel de tontine, suspension de compte, maintenance |

## Stack technique

| Technologie | Usage |
|-------------|-------|
| [Expo](https://expo.dev) / React Native | Framework mobile cross-platform |
| [Supabase](https://supabase.com) | Backend (auth, base de donnees, realtime, storage) |
| TypeScript | Typage statique |
| Expo Router | Navigation file-based |
| i18next | Internationalisation (fr, ar, ar-TN) |
| React Native Reanimated | Animations |

## Statut du projet

**MVP fonctionnel** - L'application est operationnelle avec toutes les fonctionnalites listees ci-dessus.

Ecrans implementes :
- Onboarding et authentification (telephone + OTP)
- Dashboard avec liste des tontines
- Creation et gestion complete des tontines
- Systeme de tours avec attribution des beneficiaires
- Declaration et confirmation des paiements
- Score de confiance
- Notifications en temps reel (Supabase Realtime)
- Centre juridique
- Panneau de gouvernance (super admin)
- Support multi-langue (Francais, Arabe, Darija)

## Instructions de lancement local

### Prerequis

- Node.js 18+
- npm
- Expo CLI (`npx expo`)
- Un projet Supabase configure (voir [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

### Installation

```bash
# Cloner le depot
git clone <repo-url>
cd dourou

# Installer les dependances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Remplir les variables dans .env avec vos credentials Supabase
# EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon

# Lancer l'application
npx expo start
```

### Variables d'environnement

Voir [.env.example](./.env.example) pour la liste complete des variables requises et optionnelles.

## Demo

Pour une demonstration guidee de l'application, consultez le guide de demo :

**[STARTUP_ACT_DEMO.md](./STARTUP_ACT_DEMO.md)**

## Liens utiles

- [Application Web (dossier web/)](./web/) - **recommande pour la demo Startup Act**
- [Guide de configuration Supabase](./SUPABASE_SETUP.md)
- [Demo Startup Act](./STARTUP_ACT_DEMO.md)
- [Script video demo](./STARTUP_ACT_VIDEO_SCRIPT.md)
- [Schema de la base de donnees](./supabase/schema.sql)
- [Guide de deploiement](./DEPLOYMENT_GUIDE.md)
- [Guide Darija](./DARIJA_GUIDE.md)

## Avertissement legal

> **Dourou est un outil de gestion et de transparence pour les tontines.**
>
> Dourou n'est **PAS** :
> - Une banque
> - Un portefeuille electronique (wallet) qui detient des fonds
> - Une solution crypto
> - Un service de paiement reglemente
>
> Dourou facilite le suivi et la coordination entre les membres d'une tontine.
> L'application ne detient, ne transfere et ne gere aucun fond.
> Les paiements entre membres se font en dehors de l'application via les moyens habituels (especes, virement, D17, Flouci).

## Equipe

Projet developpe en Tunisie.

Pour toute question ou contact : consultez le profil du depot.

---

## English Summary

**Dourou** is a Tunisian mobile app that digitalizes tontines (rotating savings groups). It provides transparency, payment tracking, trust scoring, notifications, and governance tools for tontine participants.

Key highlights:
- Targets 2M+ active tontine participants in Tunisia
- Functional MVP with full tontine lifecycle management
- Built with Expo/React Native, Supabase, TypeScript
- Multi-language: French, Arabic, Tunisian Darija

**Dourou is a management and transparency tool. It is NOT a bank, wallet, crypto solution, or regulated payment service.**

---

*Fait en Tunisie* 🇹🇳
