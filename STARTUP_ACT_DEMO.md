# Guide de Demonstration - Startup Act

## Presentation de Dourou pour le Jury

**Dourou** (دورو) digitalise la gestion des tontines (جمعية). Elle apporte transparence, suivi en temps reel et confiance entre les membres - sans jamais toucher a l'argent.

> **Dourou n'est PAS une banque, PAS un portefeuille electronique, PAS une crypto-monnaie.**
> C'est un outil de gestion et de transparence. L'argent circule directement entre les membres.

---

## ⭐ Option recommandee : Demo Web instantanee (le plus simple)

Le moyen le plus rapide pour le jury de tester Dourou est l'**application web**
avec son **mode demo integre** : aucun compte, aucune installation backend.

### Si l'application est deployee (Vercel)

1. Ouvrez le lien fourni (ex : `https://dourou.vercel.app`).
2. Cliquez sur **"Essayer la demo (sans compte)"**.
3. Vous etes immediatement dans le tableau de bord avec des donnees realistes.

### En local

```bash
cd web
npm install
npm run dev
```
Puis ouvrez [http://localhost:3000](http://localhost:3000) et cliquez sur
**"Essayer la demo"**. Aucune variable d'environnement n'est necessaire.

### Ce que permet le mode demo

- Un **bandeau** en haut permet de basculer entre deux identites :
  - **Ahmed Trabelsi** (admin) : peut **confirmer** les paiements declares.
  - **Nour Chaabane** (membre) : peut **declarer** son propre paiement.
- Les actions persistent pendant la session (stockage local du navigateur).
- Aucune donnee reelle, aucun fonds : tout est simule cote client.

### Parcours jury en 3 minutes (mode demo web)

1. **Accueil** : cliquez sur "Essayer la demo".
2. **Tableau de bord** : observez l'epargne active, la tontine "Collegues Startup".
3. **Detail tontine** : onglets **Membres** (ordre de distribution), **Tours**, **Paiements**.
4. **Tour 1** : voyez les statuts (Fatma = paye, Yassine = declare, Nour = non paye).
5. **Confirmer** (en tant qu'Ahmed) : validez le paiement declare de Yassine -> il passe a "Paye".
6. **Basculer sur Nour** (bandeau du haut) puis **Declarer** son paiement.
7. **Notifications** et **Profil** : score de confiance et historique.

---

## Alternative : Application mobile (Expo)

L'application mobile native reste disponible a la racine du depot.

### Option A : Environnement local

1. **Node.js** 18+ installe
2. **Expo CLI** : `npm install` dans le repertoire du projet
3. **Supabase** configure (voir `SUPABASE_SETUP.md`)
4. **Seed applique** : executez `supabase/seed-demo.sql` dans le SQL Editor Supabase
5. Lancer l'app : `npx expo start`

### Option B : Application deployee

Si l'application est deployee sur un serveur de test, le jury peut y acceder directement via le lien fourni avec les identifiants demo ci-dessous.

---

## Compte de Demonstration (mode reel avec Supabase)

| Champ | Valeur |
|-------|--------|
| Telephone | `+21698000001` |
| OTP (test) | `123456` |
| Nom | Ahmed Trabelsi |
| Role | Administrateur de la tontine |

> **Note** : En environnement de test Supabase, l'OTP `123456` est accepte par defaut si le mode test est active dans Authentication > Settings > Enable test OTP. Sinon, confirmez manuellement via le Dashboard Supabase (Authentication > Users > Verify).

### Autres comptes disponibles

| Telephone | Nom | Role dans la tontine |
|-----------|-----|---------------------|
| `+21698000002` | Fatma Ben Youssef | Membre (a paye) |
| `+21698000003` | Yassine Khelifi | Membre (paiement declare) |
| `+21698000004` | Nour Chaabane | Membre (pas encore paye) |

---

## Scenario en 3 Minutes

### 00:00 - 00:30 | Ouverture et Onboarding

1. **Ecran Splash** : Observez le cercle dore anime avec le logo "Dourou / دورو"
2. **Onboarding (3 slides)** :
   - Slide 1 : "Digitalisez vos tontines" - la proposition de valeur principale
   - Slide 2 : "Suivi en temps reel" - transparence sur chaque paiement
   - Slide 3 : "Score de confiance" - la reputation se construit avec la ponctualite

### 00:30 - 01:00 | Connexion

1. Entrez le numero `+21698000001`
2. Validez l'OTP (`123456` en mode test)
3. **Dashboard** : Observez :
   - Message de bienvenue personnalise ("Bonjour Ahmed")
   - Total epargne
   - Tontine active "Collegues Startup"
   - Prochaine echeance affichee
   - Bouton FAB (+) pour creer une nouvelle tontine

### 01:00 - 01:30 | Explorer la Tontine

1. Tapez sur la carte **"Collegues Startup"**
2. **Detail de la tontine** : Observez :
   - Contribution : 200 TND/mois
   - Frequence : Mensuelle
   - 4 membres
3. **Onglet Membres** : Voyez les 4 membres tunisiens avec avatars, noms et telephones :
   - Ahmed Trabelsi (admin, ordre 1)
   - Fatma Ben Youssef (ordre 2)
   - Yassine Khelifi (ordre 3)
   - Nour Chaabane (ordre 4)
4. **Onglet Sequence** : L'ordre de distribution fixe (qui recoit quand)

### 01:30 - 02:15 | Voir les Tours (Rounds)

1. Basculez sur l'onglet **"Tours"**
2. Voyez les 4 cartes de tours :
   - **Tour 1** (en cours) - Beneficiaire : Ahmed Trabelsi
   - Tour 2 (a venir) - Beneficiaire : Fatma Ben Youssef
   - Tour 3 (a venir) - Beneficiaire : Yassine Khelifi
   - Tour 4 (a venir) - Beneficiaire : Nour Chaabane
3. **Tapez sur Tour 1** pour voir le detail :
   - Carte du beneficiaire (Ahmed)
   - Barre de progression du pot (pourcentage collecte)
   - Liste des paiements par membre :
     - Fatma : **Paye** (via D17) ✓
     - Yassine : **Declare** (virement bancaire, en attente de confirmation)
     - Nour : **Non paye**

### 02:15 - 02:45 | Actions de Paiement

**Si connecte en tant que Nour (+21698000004)** :
1. Tapez "Declarer mon paiement"
2. Choisissez une methode : cash, bank, D17, ou Flouci
3. Le statut passe de "Non paye" a "Declare"

**Si connecte en tant qu'Ahmed (+21698000001, admin)** :
1. Voyez la notification "Yassine a declare un paiement"
2. Tapez sur le paiement de Yassine (statut "Declare")
3. Appuyez sur "Confirmer le paiement"
4. Le statut passe de "Declare" a "Paye" ✓

### 02:45 - 03:00 | Profil et Confiance

1. Allez sur l'onglet **Profil**
2. Observez :
   - **Score de confiance** : 4.5/5 (badge dore)
   - Le score est calcule automatiquement selon la ponctualite des paiements
   - Option de changement de langue (Francais / Arabe / Anglais)
   - Statistiques personnelles

---

## Ce que le Jury Doit Observer

| Critere | Ce qui est demontre |
|---------|---------------------|
| **Transparence** | Chaque membre voit tous les paiements, tous les statuts, en temps reel |
| **Suivi en temps reel** | Les changements de statut (declare/confirme) sont visibles instantanement |
| **Absence d'opacite** | Pas de "boite noire" - l'ordre de distribution, les montants, les echeances sont visibles par tous |
| **Contexte tunisien** | Noms tunisiens, montants en TND, methodes de paiement locales (D17, Flouci), interface en francais/arabe |
| **Multi-langue** | L'application supporte le francais, l'arabe (darija tunisien) et l'anglais |
| **Gamification positive** | Le score de confiance incite a la ponctualite sans punir |
| **Pas de manipulation d'argent** | Dourou ne touche jamais a l'argent - il ne fait que suivre et rendre transparent |

---

## Limites Connues (MVP)

- **OTP** : En mode demo/local, les SMS ne sont pas reellement envoyes. Utilisez le mode test de Supabase ou confirmez manuellement.
- **Pas de transaction financiere reelle** : Dourou ne deplace pas d'argent. Il suit les declarations et confirmations.
- **UI optimisee mobile** : L'interface est concue pour smartphone (iOS/Android via Expo). L'affichage web est fonctionnel mais non optimise.
- **Donnees de demo** : Les 4 profils et la tontine sont des donnees fictives a des fins de demonstration.
- **Notifications push** : Non actives en environnement de developpement (necessite un build natif).

---

## Alternative Sans Backend

Si le backend Supabase n'est pas configure, voici ce que chaque ecran affiche :

### Structure de l'Application

| Ecran | Fichier | Description |
|-------|---------|-------------|
| Splash | `app/index.tsx` | Cercle dore anime, logo "Dourou / دورو", transition automatique |
| Onboarding | `app/onboarding.tsx` | 3 slides avec illustrations, bouton "Commencer" |
| Auth - Telephone | `app/auth/phone.tsx` | Champ telephone avec indicatif +216, bouton envoyer OTP |
| Auth - OTP | `app/auth/otp.tsx` | 6 chiffres a saisir, timer de renvoi |
| Auth - Profil | `app/auth/profile.tsx` | Saisie nom complet, creation du profil |
| Dashboard | `app/(tabs)/index.tsx` | Carte de bienvenue, total epargne, liste tontines actives, FAB creer |
| Liste Tontines | `app/(tabs)/tontines.tsx` | Toutes les tontines de l'utilisateur |
| Detail Tontine | `app/tontine/[id].tsx` | Infos tontine + onglets : Membres, Sequence, Tours |
| Detail Tour | `app/tontine/round/[roundId].tsx` | Beneficiaire, pot, liste paiements, actions |
| Profil | `app/(tabs)/profile.tsx` | Score de confiance, langue, statistiques, deconnexion |
| Creer Tontine | `app/tontine/create.tsx` | Formulaire : titre, montant, frequence, membres |
| Rejoindre | `app/tontine/join.tsx` | Scanner/saisir code d'invitation |
| Notifications | `app/notifications.tsx` | Liste des evenements (paiements, rappels) |

### Navigation possible sans donnees

L'application affichera des etats vides (empty states) avec des messages encourageant la creation d'une premiere tontine. Les ecrans d'authentification et d'onboarding fonctionnent sans backend.

---

## Questions Anticipees du Jury

### "Est-ce une banque ?"

**Non.** Dourou ne detient aucun fonds, n'effectue aucun transfert et n'a aucune licence bancaire. C'est un outil de suivi et de transparence pour une pratique qui existe deja entre les membres.

### "Est-ce de la crypto-monnaie ?"

**Non.** Aucune blockchain, aucun token, aucun actif numerique. L'argent reste en dinars tunisiens (TND) et circule physiquement ou par virement entre les membres.

### "Comment l'argent circule-t-il ?"

L'argent circule **directement entre les membres**, par les moyens qu'ils choisissent : especes (cash), virement bancaire, D17 (La Poste Tunisienne), ou Flouci. Dourou ne fait que **suivre** et **rendre visible** ces mouvements.

### "C'est legal ?"

Les tontines (جمعية) sont une pratique sociale legale en Tunisie. Dourou ne les cree pas - il les digitalise. Aucune reglementation financiere ne s'applique car aucun mouvement de fonds ne transite par la plateforme.

### "Quel est le modele economique ?"

MVP actuel : gratuit. Modeles envisages pour la suite :
- Freemium (fonctionnalites avancees pour les grandes tontines)
- Partenariats avec des services de paiement mobile (D17, Flouci)
- Pas de commission sur les montants echanges

### "Quelle est la taille du marche ?"

En Tunisie, on estime que plus de **2 millions de personnes** participent a des tontines. La pratique est repandue dans toutes les couches sociales, des familles aux collegues de travail. Aucune solution digitale n'existe actuellement pour ce besoin.

### "Qu'est-ce qui vous differencie ?"

1. **Contexte 100% tunisien** : methodes de paiement locales, langues locales (darija), montants en TND
2. **Score de confiance** : innovation qui n'existe nulle part pour les tontines
3. **Transparence totale** : chaque membre voit tout, elimine les litiges
4. **Pas d'intermediation financiere** : aucun risque reglementaire

---

## Fichiers Cles pour l'Evaluation Technique

| Fichier | Contenu |
|---------|---------|
| `supabase/schema.sql` | Schema complet de la base de donnees |
| `supabase/seed-demo.sql` | Donnees de demonstration |
| `SUPABASE_SETUP.md` | Guide de configuration backend |
| `README.md` | Presentation produit et instructions |
| `i18n/locales/fr.json` | Traductions francaises |
| `constants/theme.ts` | Theme sombre avec accents dores |

---

*Document prepare pour l'evaluation Startup Act - Tunisie*
