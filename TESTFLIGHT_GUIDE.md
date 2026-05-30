# Guide TestFlight - Dourou

Ce guide explique comment deployer l'application **Dourou** sur TestFlight et ajouter les membres du jury Startup Act comme testeurs internes pour l'evaluation.

Dourou est une application de gestion de tontines (jma3iyat) destinee au marche tunisien. Ce document couvre l'ensemble du processus, de la configuration initiale jusqu'a l'invitation des membres du jury.

---

## Table des matieres

1. [Prerequis](#prerequis)
2. [Configuration initiale](#configuration-initiale)
3. [Deployer sur TestFlight](#deployer-sur-testflight)
4. [Ajouter les membres du jury comme testeurs internes](#ajouter-les-membres-du-jury-comme-testeurs-internes)
5. [Partager le lien TestFlight](#partager-le-lien-testflight)
6. [Ce que le jury verra](#ce-que-le-jury-verra)
7. [Depannage](#depannage)
8. [Calendrier et delais](#calendrier-et-delais)
9. [Commandes utiles](#commandes-utiles)

---

## Prerequis

Avant de commencer, assurez-vous d'avoir les elements suivants :

- **Apple Developer Account** : Inscription au programme Apple Developer ($99/an). Le compte doit etre actif et en regle.
- **Node.js et npm** : Installes sur votre machine (Node.js 18+ recommande).
- **EAS CLI** : Installe globalement :
  ```bash
  npm install -g eas-cli
  ```
- **Compte Expo** : Cree et lie a votre projet :
  ```bash
  eas login
  ```
- **Identifiants Apple Developer** : Configures dans EAS (Apple ID, Team ID, certificats de distribution).
- **Fichier `eas.json`** : Deja present a la racine du projet avec les profils `development`, `preview` et `production`.
- **Bundle Identifier** : `tn.dourou.app` (deja configure dans `eas.json` et `app.json`).

---

## Configuration initiale

Ces etapes ne sont a effectuer qu'une seule fois, lors de la premiere mise en place.

### 1. Mettre a jour `eas.json` avec vos identifiants Apple

Ouvrez `eas.json` et remplacez les valeurs placeholder dans la section `submit` :

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "votre-email@example.com",
      "ascAppId": "1234567890",
      "appleTeamId": "ABCDEF1234"
    }
  }
}
```

- **appleId** : L'email associe a votre compte Apple Developer.
- **ascAppId** : L'identifiant de l'app dans App Store Connect (visible dans les parametres de l'app).
- **appleTeamId** : Votre Team ID Apple (visible dans le portail Apple Developer > Membership).

### 2. Creer l'application dans App Store Connect

1. Connectez-vous a [App Store Connect](https://appstoreconnect.apple.com)
2. Allez dans **Apps** > **+** (bouton plus) > **Nouvelle app**
3. Remplissez les informations :
   - **Plateformes** : iOS
   - **Nom** : Dourou
   - **Langue principale** : Francais
   - **Bundle ID** : `tn.dourou.app`
   - **SKU** : `dourou-app`
4. Cliquez sur **Creer**

### 3. Configurer `.env.production`

Copiez le fichier template puis remplissez-le avec vos vraies valeurs Supabase :

```bash
cp .env.production.example .env.production
```

Editez `.env.production` avec vos valeurs reelles :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-reelle
EXPO_PUBLIC_ENVIRONMENT=production
```

> **Important** : Ne commitez jamais ce fichier avec des valeurs reelles. Le fichier `.env.production` est dans `.gitignore` et ne sera pas suivi par git. Seul le fichier `.env.production.example` (avec des valeurs placeholder) est commite.

### 4. Configurer les variables d'environnement pour EAS Build (remote)

Les builds EAS s'executent sur des serveurs distants qui n'ont pas acces a vos fichiers `.env` locaux. Pour que les variables de production soient disponibles lors du build, vous devez les configurer via **EAS Secrets** :

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co" --scope project
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-key" --scope project
eas secret:create --name EXPO_PUBLIC_ENVIRONMENT --value "production" --scope project
```

Les secrets EAS sont injectes automatiquement comme variables d'environnement lors du build. C'est la methode recommandee car les valeurs restent securisees et ne sont jamais commitees dans le code source.

> **Alternative** : Vous pouvez aussi ajouter un bloc `env` dans le profil `production` de `eas.json`, mais cette approche necessite de commiter les valeurs dans le fichier de configuration, ce qui est deconseille pour les cles d'API.

Pour verifier que vos secrets sont bien configures :

```bash
eas secret:list
```

---

## Deployer sur TestFlight

Le deploiement sur TestFlight se fait en 5 etapes simples. Nous utilisons le profil `preview` defini dans `eas.json` qui est configure pour la distribution store (compatible TestFlight).

### Etape 1 : Se connecter a EAS

```bash
eas login
```

Entrez votre email et mot de passe Expo. Cette etape est necessaire pour acceder aux serveurs de build EAS.

### Etape 2 : Lancer le build iOS

```bash
npm run build:preview:ios
```

Cette commande execute `eas build --profile preview --platform ios`. Le profil `preview` dans `eas.json` est configure avec :
- `distribution: "store"` - pour soumission a App Store Connect / TestFlight
- `ios.simulator: false` - build pour appareil reel
- `ios.bundleIdentifier: "tn.dourou.app"`

EAS va vous demander de confirmer vos identifiants Apple et generer automatiquement les certificats et provisioning profiles necessaires.

### Etape 3 : Attendre la fin du build

Le build s'execute sur les serveurs EAS. Temps estime : **15 a 20 minutes**.

Vous pouvez suivre la progression :
- Dans le terminal (un lien sera affiche)
- Sur [expo.dev](https://expo.dev) dans la section Builds
- Vous recevrez une notification quand le build sera termine

### Etape 4 : Soumettre a TestFlight

Une fois le build termine :

```bash
npm run submit:ios
```

Cette commande execute `eas submit --platform ios --latest`. Elle va :
1. Telecharger le dernier build iOS depuis EAS
2. Le soumettre automatiquement a App Store Connect / TestFlight
3. Utiliser les identifiants configures dans `eas.json` (section `submit`)

Le temps de soumission est d'environ **5 minutes**.

### Etape 5 : Verifier dans App Store Connect

1. Connectez-vous a [App Store Connect](https://appstoreconnect.apple.com)
2. Allez dans **Apps** > **Dourou** > **TestFlight**
3. Vous devriez voir le nouveau build dans la liste
4. Le statut doit passer de "En traitement" a "Pret pour le test"

> **Note** : Pour les testeurs internes, le build est disponible immediatement apres le traitement (quelques minutes). Aucune review Apple n'est necessaire.

---

## Ajouter les membres du jury comme testeurs internes

Les testeurs internes sont les membres de votre equipe Apple Developer. Ils recoivent les builds immediatement, sans attendre la review Apple.

### 1. Ajouter les membres du jury dans App Store Connect

1. Allez dans [App Store Connect](https://appstoreconnect.apple.com)
2. Cliquez sur **Utilisateurs et acces** (Users and Access)
3. Cliquez sur le bouton **+** pour ajouter un nouvel utilisateur
4. Remplissez les informations de chaque membre du jury :
   - **Prenom** et **Nom**
   - **Email** : L'Apple ID du membre du jury (l'email associe a son compte Apple)
   - **Role** : Selectionnez **Marketing** ou **App Manager** (acces minimal necessaire pour TestFlight)
5. Cliquez sur **Inviter**
6. Repetez pour chaque membre du jury

> **Important** : Les membres du jury doivent avoir un Apple ID valide (un compte Apple). S'ils n'en ont pas, ils devront en creer un gratuitement sur [appleid.apple.com](https://appleid.apple.com).

### 2. Creer un groupe de testeurs "Jury Startup Act"

1. Dans App Store Connect, allez dans **Apps** > **Dourou** > **TestFlight**
2. Dans le panneau de gauche, sous **Testeurs internes**, cliquez sur **+** a cote de "Groupes"
3. Nommez le groupe : **Jury Startup Act**
4. Cliquez sur **Creer**

### 3. Ajouter les membres du jury au groupe

1. Ouvrez le groupe **Jury Startup Act**
2. Cliquez sur **+** a cote de "Testeurs"
3. Selectionnez les membres du jury que vous avez ajoutes a l'etape 1
4. Cliquez sur **Ajouter**

### 4. Associer le build au groupe

1. Dans l'onglet **TestFlight** > **Jury Startup Act**
2. Cliquez sur **+** a cote de "Builds"
3. Selectionnez le dernier build disponible
4. Cliquez sur **Ajouter**

Les membres du jury recevront automatiquement un email d'invitation avec un lien pour telecharger l'application via TestFlight.

---

## Partager le lien TestFlight

Il existe deux methodes pour partager l'application avec le jury :

### Methode 1 : Invitation par email (recommandee pour testeurs internes)

C'est la methode decrite ci-dessus. Chaque membre du jury recoit un email automatique d'Apple avec un lien personnalise. C'est la methode la plus securisee.

### Methode 2 : Lien public TestFlight

Pour un partage plus simple, vous pouvez generer un lien public :

1. Dans App Store Connect > **Dourou** > **TestFlight**
2. Creez un groupe de **Testeurs externes** (attention : necessite une review Apple de 24-48h)
3. Dans les parametres du groupe, activez **Lien public**
4. Copiez le lien genere (format : `https://testflight.apple.com/join/XXXXXXXX`)
5. Partagez ce lien avec les membres du jury par email ou messagerie

> **Note** : Le lien public necessite un groupe de testeurs externes, ce qui implique une review Apple. Pour un acces immediat, privilegiez les testeurs internes.

### Comment les membres du jury installent l'application

Instructions a transmettre aux membres du jury :

1. **Installer TestFlight** : Telecharger l'app "TestFlight" depuis l'App Store (gratuite)
2. **Accepter l'invitation** : Ouvrir l'email d'invitation et cliquer sur "Voir dans TestFlight"
3. **Installer Dourou** : Dans TestFlight, cliquer sur "Installer" a cote de "Dourou"
4. L'application apparaitra sur l'ecran d'accueil de l'iPhone

---

## Ce que le jury verra

Voici ce que les membres du jury verront lors de l'ouverture de l'application :

### Ecran de demarrage
- **Splash screen** : Fond sombre (#0F172A) avec le branding Dourou
- **Icone de l'application** : Logo Dourou sur fond sombre

### Parcours d'accueil (Onboarding)
- Ecran de bienvenue avec presentation de l'application
- Explication du concept de tontine numerique

### Authentification
- Connexion par numero de telephone (format tunisien +216)
- Verification par code OTP (SMS)

### Application principale
Une fois connecte, le jury aura acces a :
- **Liste des tontines** : Vue d'ensemble des cercles d'epargne
- **Creation de tontine** : Formulaire pour creer un nouveau cercle
- **Details d'une tontine** : Membres, tours, paiements
- **Profil** : Informations personnelles et parametres
- **Notifications** : Alertes de paiement et de tours

### Scenario de demonstration

Pour un parcours de demonstration complet, consultez le fichier **[STARTUP_ACT_DEMO.md](./STARTUP_ACT_DEMO.md)** qui contient :
- Les donnees de test pre-configurees
- Le scenario de demonstration etape par etape
- Les points cles a mettre en avant lors de l'evaluation

---

## Depannage

### "Provisioning profile not found"

**Cause** : Les certificats de signature iOS ne sont pas configures correctement.

**Solution** :
```bash
eas credentials:manager
```
Selectionnez iOS, puis laissez EAS regenerer automatiquement les provisioning profiles.

### "Bundle identifier mismatch"

**Cause** : L'identifiant de bundle dans le build ne correspond pas a celui dans App Store Connect.

**Solution** :
- Verifiez que `tn.dourou.app` est bien configure dans `eas.json` (section `build.preview.ios.bundleIdentifier`)
- Verifiez que `tn.dourou.app` est bien dans `app.json` (section `expo.ios.bundleIdentifier`)
- Verifiez que le Bundle ID dans App Store Connect correspond exactement

### "Build failed"

**Cause** : Erreur lors de la compilation sur les serveurs EAS.

**Solution** :
1. Verifiez les logs du build sur [expo.dev](https://expo.dev)
2. Executez le diagnostic :
   ```bash
   npx expo doctor
   ```
3. Verifiez que toutes les dependances sont compatibles :
   ```bash
   npx expo install --check
   ```
4. Si le probleme persiste, nettoyez le cache :
   ```bash
   eas build --profile preview --platform ios --clear-cache
   ```

### "TestFlight link doesn't work"

**Cause** : Le lien TestFlight n'est pas encore actif ou la review n'est pas terminee.

**Solution** :
- Pour les testeurs internes : Verifiez que le build a bien ete traite (statut "Pret pour le test" dans App Store Connect)
- Pour les testeurs externes : Attendez la fin de la Beta App Review (24-48h)
- Verifiez que le testeur a bien un Apple ID valide
- Assurez-vous que le testeur a installe l'app TestFlight sur son iPhone

### "App crashes on launch"

**Cause** : Les variables d'environnement de production sont manquantes ou incorrectes.

**Solution** :
1. Verifiez que vos EAS Secrets sont correctement configures :
   ```bash
   eas secret:list
   ```
2. Si vous testez en local, verifiez que `.env.production` contient les bonnes valeurs :
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-reelle
   EXPO_PUBLIC_ENVIRONMENT=production
   ```
3. Assurez-vous que l'URL Supabase est accessible
4. Verifiez que la cle anon est valide et correspond au bon projet
5. Refaites un build apres correction :
   ```bash
   npm run build:preview:ios
   ```

---

## Calendrier et delais

| Etape | Duree estimee |
|-------|---------------|
| Build EAS (serveurs distants) | ~15-20 minutes |
| Soumission a TestFlight | ~5 minutes |
| Traitement App Store Connect | ~5-10 minutes |
| Disponibilite testeurs internes | Immediate (apres traitement) |
| Review testeurs externes (Beta App Review) | 24-48 heures |
| **Total premier deploiement** (avec configuration) | **~1 heure** |
| **Mises a jour suivantes** | **~30 minutes** |

### Notes sur les delais

- **Testeurs internes** : C'est la methode recommandee pour le jury. Les builds sont disponibles immediatement apres traitement, sans review Apple.
- **Testeurs externes** : Necessite une Beta App Review par Apple. A eviter pour un acces rapide.
- **OTA Updates** : Pour les mises a jour mineures (JavaScript uniquement, pas de changement natif), utilisez `npm run update` pour un deploiement instantane sans nouveau build.

---

## Commandes utiles

Reference rapide des commandes disponibles :

```bash
# Build iOS pour TestFlight (profil preview)
npm run build:preview:ios

# Build Android pour test interne
npm run build:preview:android

# Build toutes les plateformes
npm run build:preview

# Soumettre le dernier build iOS a TestFlight
npm run submit:ios

# Soumettre le dernier build Android au Play Store
npm run submit:android

# Build de production (App Store / Play Store)
npm run build:production

# Mise a jour OTA (over-the-air, sans nouveau build)
npm run update

# Diagnostic du projet
npx expo doctor

# Gestion des certificats iOS
eas credentials:manager

# Verifier le statut du build
eas build:list

# Se connecter a EAS
eas login

# Lancer l'app en mode developpement
npm run start
```

---

## Ressources supplementaires

- [Documentation EAS Build](https://docs.expo.dev/build/introduction/)
- [Documentation EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Guide TestFlight Apple](https://developer.apple.com/testflight/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [STARTUP_ACT_DEMO.md](./STARTUP_ACT_DEMO.md) - Scenario de demonstration pour le jury
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guide de deploiement general
