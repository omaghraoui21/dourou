# Script Video Demo - Dourou (Startup Act)

Script pret a filmer pour une video de demonstration de **2 a 3 minutes**.
Cible : jury Startup Act Tunisie (non technique).

> **Rappel positionnement** : Dourou n'est **PAS** une banque, **PAS** un wallet,
> **PAS** une crypto. C'est un outil de **gestion, de transparence et de preuve
> de confiance** pour les tontines (جمعية). L'argent circule directement entre
> les membres ; Dourou ne touche jamais aux fonds.

Mode de demonstration recommande : **application web, mode demo** (bouton
"Essayer la demo"), aucune configuration requise.

---

## Plan de tournage

| Sequence | Duree | Ecran | Voix off (FR) |
|----------|-------|-------|----------------|
| 0. Accroche | 0:00 - 0:15 | Page d'accueil | "En Tunisie, plus de 2 millions de personnes participent a des tontines, les fameuses جمعية. Mais tout se gere encore sur papier ou WhatsApp. Dourou digitalise cette pratique." |
| 1. Probleme & promesse | 0:15 - 0:30 | Section "Pourquoi Dourou" | "Pas de transparence, pas de trace, des litiges frequents. Dourou apporte transparence, suivi des paiements et un score de confiance." |
| 2. Entree demo | 0:30 - 0:40 | Clic "Essayer la demo" | "Pas besoin de compte : on clique sur Essayer la demo et on entre directement." |
| 3. Tableau de bord | 0:40 - 0:55 | Dashboard | "Voici le tableau de bord : l'epargne active, la tontine en cours 'Collegues Startup', 200 dinars par mois, 4 membres." |
| 4. Detail tontine | 0:55 - 1:20 | Onglets Membres / Tours | "On voit les 4 membres et l'ordre de distribution, totalement transparent. Puis les tours : qui recoit, et quand." |
| 5. Etat des paiements | 1:20 - 1:40 | Tour 1 | "Pour le tour en cours : Fatma a paye, Yassine a declare son virement, Nour n'a pas encore paye. Chaque membre voit tout, en temps reel." |
| 6. Confirmation (admin) | 1:40 - 2:00 | Bouton Confirmer | "En tant qu'administrateur, je confirme le paiement declare par Yassine. Son statut passe a 'Paye'. La cagnotte progresse." |
| 7. Declaration (membre) | 2:00 - 2:20 | Bascule vers Nour + Declarer | "Je bascule sur le compte de Nour. Elle declare son paiement et choisit le moyen : especes, virement, D17 ou Flouci. Dourou enregistre, sans jamais toucher a l'argent." |
| 8. Confiance & notifications | 2:20 - 2:40 | Profil + Notifications | "Chaque membre a un score de confiance base sur sa ponctualite. Et tout le monde recoit des notifications a chaque etape." |
| 9. Cloture | 2:40 - 3:00 | Page d'accueil / logo | "Dourou : la confiance numerisee pour les tontines tunisiennes. Un outil de transparence, pas une banque. Merci." |

---

## Texte integral (a lire)

**[0:00]** Bonjour. En Tunisie, plus de deux millions de personnes participent a
des tontines - les جمعية. C'est une pratique d'epargne solidaire essentielle,
mais elle reste informelle : suivi sur papier, sur WhatsApp, et beaucoup de
litiges. Dourou la digitalise.

**[0:30]** Pour vous le montrer, pas besoin de compte. Je clique simplement sur
"Essayer la demo".

**[0:40]** Voici le tableau de bord. On voit l'epargne active et la tontine
"Collegues Startup" : 200 dinars par mois, quatre membres.

**[0:55]** En ouvrant la tontine, je vois la liste des membres et l'ordre de
passage - qui recevra la cagnotte, et dans quel ordre. Tout est visible par tous.
Dans l'onglet Tours, je retrouve chaque cycle.

**[1:20]** Regardons le tour en cours. Fatma a deja paye. Yassine a declare son
virement, en attente de validation. Nour n'a pas encore paye. Personne ne peut
cacher un paiement : c'est ca, la transparence.

**[1:40]** En tant qu'administrateur, je confirme le paiement de Yassine. Son
statut passe a "Paye", et la barre de progression de la cagnotte avance.

**[2:00]** Maintenant, je bascule sur le compte de Nour, un membre. Elle declare
son paiement et choisit son moyen : especes, virement bancaire, D17 ou Flouci.
Important : Dourou enregistre la declaration, mais l'argent circule directement
entre les membres. Dourou ne detient jamais les fonds.

**[2:20]** Chaque membre dispose d'un score de confiance, calcule sur sa
ponctualite. Et a chaque etape, des notifications tiennent tout le monde informe.

**[2:40]** Dourou, c'est la confiance numerisee pour les tontines tunisiennes :
un outil de transparence et de preuve, pas une banque, pas un portefeuille,
pas une crypto. Merci.

---

## Conseils de tournage

- **Resolution** : enregistrez en 1080p, fenetre navigateur en mode mobile
  (DevTools > vue responsive ~390px) pour un rendu "app mobile" net.
- **Rythme** : laissez 1 a 2 secondes apres chaque clic pour que le jury suive.
- **Sous-titres** : ajoutez des sous-titres FR (et eventuellement AR) ;
  l'interface est en francais.
- **Pas de donnees reelles** : le mode demo est entierement fictif, aucun
  numero ou montant reel n'apparait.
- **Plan B** : si vous filmez le mode reel (Supabase), preparez les comptes du
  seed et activez l'OTP de test au prealable (voir `web/SUPABASE_SETUP.md`).

---

## Points cles a marteler pour le jury

1. **Marche** : 2M+ de Tunisiens, aucun acteur digital dominant.
2. **Valeur** : transparence + preuve + score de confiance.
3. **Conformite** : aucun mouvement de fonds => pas de licence bancaire requise.
4. **Tunisien** : montants en TND, moyens locaux (D17, Flouci), langues locales.
5. **MVP reel** : produit testable immediatement (web), backend Supabase pret.
