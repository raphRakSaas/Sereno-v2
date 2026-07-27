# Sereno — Périmètre gelé

**Date de gel : 27 juillet 2026**
**Objectif du projet : un actif de crédibilité technique Angular pour la recherche d'emploi à Toulouse.**
**Non-objectifs : revenu, croissance, nombre d'utilisateurs.**

---

## Règle du jeu

1. La liste « Dans le périmètre » ci-dessous est **fermée**. Rien ne s'y ajoute.
2. Toute idée qui arrive après le gel va dans `PLUS_TARD.md`, jamais dans le code.
3. Le projet est terminé quand la section « Definition of Done » est entièrement cochée — pas quand il est « bien ».
4. Aucun nouveau projet ne démarre avant que ce document soit intégralement coché.

---

## Dans le périmètre

### Socle

- **Accueil** — solde du mois, budgets en cours, transactions récentes, répartition par catégorie
- **Activité** — liste des transactions, filtres (type, catégorie, période), recherche, tri
- **Calendrier** — vue mois et semaine, détail du jour sélectionné
- **Statistiques** — revenus/dépenses du mois, taux d'épargne, répartition par catégorie, évolution
- **Budgets** — un budget par catégorie et par mois, report depuis le mois précédent
- **Réglages** — thème, écran de démarrage, préférences d'affichage, import/export

### Transactions

- Dépense, revenu
- Montant, date, catégorie, note
- Catégories prédéfinies + catégories personnalisées (nom, icône, couleur)
- Édition, suppression, annulation de suppression (undo)

### Transactions récurrentes

- Fréquence : mensuelle, hebdomadaire, annuelle
- Date de début, date de fin optionnelle
- Génération des occurrences à l'ouverture de l'app
- Modification ou suppression d'une occurrence sans casser la série
- Vue dédiée listant les récurrences actives

### Objectifs d'épargne

- Nom, montant cible, date cible optionnelle
- Progression alimentée manuellement (versements)
- Affichage de la progression et du reste à épargner
- Pas de lien automatique avec les transactions

### Justificatifs

- **Une photo par transaction**, pas plus
- Compression côté client avant stockage (cible : < 300 Ko)
- Miniature générée et stockée séparément pour l'affichage en liste
- Stockage en Blob dans IndexedDB
- Gestion explicite du quota : message clair si le stockage est saturé
- Suppression de la photo avec la transaction

### Import / export

- Export sauvegarde complète (JSON)
- Import sauvegarde avec écran de confirmation avant écrasement
- Export transactions (CSV)
- Import CSV avec mapping de colonnes et prévisualisation avant validation

---

## Hors périmètre — ne pas coder

Ces éléments sont exclus par décision, pas par oubli. Ils vont dans `PLUS_TARD.md` si l'envie revient.

- Compte utilisateur, authentification, synchronisation multi-appareils
- Backend, Supabase, API distante
- Multi-comptes, virements internes
- Multi-devises, taux de change
- OCR, lecture automatique de tickets, scan multi-pages
- Galerie de plusieurs photos par transaction
- Connexion bancaire, agrégation, catégorisation automatique
- Notifications push, rappels
- Partage de budget, mode famille ou couple
- Suivi de dettes, prêts, échéanciers
- Prévisionnel, projection de trésorerie
- Rapports PDF
- Sous-catégories, tags libres
- Widgets, extension navigateur, application mobile native

---

## Modèle de données

Local uniquement, IndexedDB. Aucun identifiant utilisateur — l'appareil *est* le compte.

```
Transaction
  id, type ('expense' | 'income'), amount (centimes, entier)
  date (ISO), categoryId, note
  receiptId?, recurrenceId?, createdAt, updatedAt

Category
  id, name, icon, color, isSystem, archivedAt?

Budget
  id, categoryId, month (YYYY-MM), amount (centimes)

Recurrence
  id, type, amount, categoryId, note
  frequency ('weekly' | 'monthly' | 'yearly')
  startDate, endDate?, lastGeneratedAt

SavingsGoal
  id, name, targetAmount, targetDate?, createdAt
  contributions: { id, amount, date }[]

Receipt
  id, transactionId, blob, thumbnailBlob
  mimeType, byteSize, createdAt

Settings
  theme, startScreen, weekStartsOnMonday, showQuickActions, locale
```

**Règle non négociable :** tous les montants sont des entiers en centimes. Aucun flottant ne touche de l'argent, jamais.

---

## Vitrine technique — la vraie ambition du projet

Chaque feature du périmètre existe pour démontrer une compétence Angular précise. C'est ici que se joue le « ok, je vois tes compétences », pas dans le nombre d'écrans.

| Feature | Ce qu'elle démontre |
|---|---|
| Store de transactions | Signals, `computed`, `linkedSignal`, store sans NgRx classique |
| Filtres + recherche Activité | Signals dérivés, `debounce` via RxJS interop, `toSignal` / `toObservable` |
| Formulaire de transaction | Formulaires typés, validators custom, gestion d'erreurs accessible |
| Import CSV avec prévisualisation | Parsing, validation par lot, machine à états d'un flux multi-étapes |
| Photos et justificatifs | API File, `canvas` pour la compression, `URL.createObjectURL`, cycle de vie et libération mémoire |
| Récurrences | Logique de dates pure et testable — la meilleure cible de tests unitaires du projet |
| Calendrier | Composant custom, navigation clavier complète, `role="grid"` |
| Statistiques | `@defer` sur les charts, chargement paresseux d'une lib lourde |
| Routing | Lazy routes, guards, resolvers, préchargement |
| Persistance IndexedDB | Couche d'abstraction, migrations de schéma versionnées |
| Thème clair/sombre | Custom properties CSS, `prefers-color-scheme`, persistance |
| PWA | Service worker, stratégie de cache explicite, fonctionnement hors ligne réel |
| Site vitrine | SSR ou prerender, métadonnées, Lighthouse au vert |

**Contraintes techniques transverses :**

- Angular 20+, standalone partout, zoneless si possible
- `ChangeDetectionStrategy.OnPush` sur tous les composants
- Nouvelle syntaxe de contrôle de flux (`@if`, `@for`, `@switch`) — aucun `*ngIf`
- Mode strict TypeScript, aucun `any`
- Tests unitaires sur toute la logique de dates, de montants et de récurrence
- Deux à trois parcours Playwright : créer une transaction, définir un budget, importer un CSV
- Accessibilité : navigation clavier complète, focus visible, contraste AA vérifié
- CI GitHub Actions : lint, tests, build

---

## Écrans à designer

1. Accueil (dashboard)
2. Activité (liste + filtres)
3. Calendrier (mois + semaine)
4. Statistiques
5. Budgets (avec et sans budgets définis)
6. Objectifs d'épargne
7. Récurrences
8. Réglages
9. Modal nouvelle transaction (avec ajout de photo)
10. Écran d'import CSV (mapping + prévisualisation)
11. États vides pour chaque écran de liste

---

## Direction visuelle

Référence : dashboards Linear et Vercel — dense, précis, typographiquement rigoureux. Palette chaleureuse au lieu du gris froid, pour rester fidèle au produit.

Le corail `#FF4D6D` est l'accent existant de la marque Sereno et reste inchangé. C'est la seule couleur d'accent du produit : aucun bleu, aucune palette de charts multicolore.

### Tokens

```
Fond de page          #FAF8F6
Surfaces / cartes     #FFFFFF
Bordure               #E8E4E0   (filet 1px, jamais d'ombre portée)
Texte principal       #171412
Texte secondaire      #6B635C
Accent                #FF4D6D
Surface d'accent      #FFF0F2
Positif / revenus     #17836B
Alerte                #B4762A   (ambre sourd — jamais de rouge vif)
Charts                #FF4D6D → #FF8095 → #FFB3BF → #FFD9DF
```

```
Typographie      Inter, une seule famille
Titre de page    24px / 600
Section          15px / 600
Corps            14px / 400
Label            11px / 600, majuscules, tracking 0.06em
Secondaire       13px / 400
Montants         font-variant-numeric: tabular-nums, alignés à droite,
                 centimes 2px plus petits et en texte secondaire
```

```
Sidebar          240px fixe
Contenu          max-width 1180px, centré
Grille           12 colonnes, gouttière 24px
Espacements      4 / 8 / 12 / 16 / 24 / 32 / 48
Rayons           cartes 12px, boutons 8px, champs 8px
```

### Règles

- Le corail occupe au maximum 5 % de la surface d'un écran
- Un seul bouton primaire par vue
- Aucun `<select>` natif, aucun champ natif non stylé
- Aucun dégradé, aucun effet de verre, aucun emoji en guise d'icône
- Les états vides sont neutres et calmes — jamais rouges, jamais alarmants
- Aucun écran ne laisse plus de 20 % du viewport vide sur desktop

---

## Prompts Google Stitch

À coller en deux étapes. **Ne jamais tout envoyer d'un coup** — un écran par message, en gardant le système en tête de contexte.

### Étape 1 — le système, seul

```
Design a personal finance web app called Sereno. Desktop-first,
1440x900 viewport. The aesthetic reference is Linear and Vercel
dashboards: dense, precise, typographically rigorous — but with a
warm, calm palette instead of cold grey.

DESIGN SYSTEM

Colors (light theme):
- Page background: #FAF8F6 (warm off-white)
- Surface / cards: #FFFFFF
- Border: #E8E4E0, hairline 1px
- Text primary: #171412
- Text secondary: #6B635C
- Accent (single, used sparingly): #FF4D6D coral
- Accent surface: #FFF0F2
- Income / positive: #17836B
- Warning: #B4762A (muted amber, never bright red)
- Charts: monochrome coral ramp only — #FF4D6D, #FF8095,
  #FFB3BF, #FFD9DF. Never blue, never rainbow.

Typography:
- Single family: Inter
- Page title 24px/600, section 15px/600, body 14px/400,
  label 11px/600 uppercase 0.06em tracking, secondary 13px
- All monetary figures use tabular numbers, aligned right, cents
  rendered 2px smaller and in text-secondary

Layout:
- Fixed left sidebar 240px, content area max-width 1180px centered
- 12-column grid, 24px gutter
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48
- Card radius 12px, button radius 8px, input radius 8px
- Elevation: no drop shadows — separation by 1px border only

Components:
- Buttons: primary = coral fill, white text. Secondary = white fill,
  1px border. Tertiary = text only. Only ONE primary button per view.
- Inputs and selects: fully custom, 36px height, 1px border,
  never native browser styling
- Icons: single family, 1.5px stroke, 18px, inherit text color

Rules:
- Coral appears on at most 5% of any screen
- No gradients, no glassmorphism, no emoji as icons
- Empty states are calm and neutral — never red, never alarming
- Every screen must feel dense enough that no more than 20% of
  the viewport is empty
- All copy in French
```

### Étape 2 — un écran par message

Exemple pour l'accueil, à décliner ensuite pour chaque écran de la liste :

```
Using the Sereno design system above, design the Dashboard screen.

Left sidebar (240px): logo "sereno" top-left, a primary
"Nouvelle transaction" button below it, then nav items — Accueil,
Activité, Calendrier, Statistiques, Budgets, Objectifs, Récurrences,
Réglages. Bottom of sidebar: a row showing "Mode invité" and a
light/dark toggle.

Main content, 12-column grid, two columns:

Header row: page title "Juillet 2026" with previous/next month
chevrons on the left, and a subtle "⌘K" search affordance on the right.

Left column (8 cols):
- Balance card: label "SOLDE DISPONIBLE" 11px uppercase, the figure
  at 32px tabular, then one line of secondary text showing income and
  expenses side by side, separated by a hairline divider
- Monthly budgets card: three horizontal progress rows (Logement,
  Courses, Transport), each with category name left, spent / total
  right in tabular figures, a thin 4px track below filled with the
  coral ramp. One row is over budget — render it in muted amber,
  never red.
- Recent transactions: dense table, 44px rows, columns = icon,
  name with note stacked below, category chip, date, amount
  right-aligned. Show a small paperclip indicator on rows that have
  a receipt photo. 8 rows visible, "Tout voir" link in the section
  header.

Right column (4 cols):
- Category donut chart, coral ramp only, total centered inside,
  compact legend below with percentages in tabular figures
- Savings goal card: goal name, progress bar, amount saved of target,
  remaining amount in secondary text

Populate with realistic French data: Loyer, Courses Carrefour,
Essence, Abonnement Spotify, Restaurant, Pharmacie. Amounts in euros,
French format (1 234,56 €).
```

Pour les écrans suivants, garder la même structure d'instruction : rappeler le système, décrire la sidebar, puis la grille et chaque bloc, puis exiger des données françaises réalistes.

---

## Jeu de données de démo

**Le geste le plus rentable du projet.** Un lead qui ouvre l'app et voit une seule transaction voit une démo ; s'il voit trois mois de données vivantes, il voit un produit.

- Trois mois de transactions, une centaine au total
- Un salaire mensuel récurrent, deux ou trois abonnements récurrents
- Des budgets : certains respectés, un dépassé
- Un objectif d'épargne en cours
- Deux ou trois transactions avec justificatif
- Chargeable en un clic depuis un écran vide ou les réglages

---

## Definition of Done

Le projet est terminé quand tout est coché. Pas avant, et surtout pas « presque ».

### Fonctionnel
- [ ] Les 11 écrans de la liste sont implémentés
- [ ] Tous les états vides sont traités
- [ ] Le jeu de données de démo se charge en un clic

### Visuel
- [ ] Une seule couleur d'accent dans toute l'app, charts compris
- [ ] Aucun `<select>` ou champ natif non stylé
- [ ] `max-width` et grille deux colonnes appliqués sur desktop
- [ ] Chiffres tabulaires sur tous les montants
- [ ] Aucun rouge en dehors des vraies erreurs

### Technique
- [ ] Mode strict TypeScript, aucun `any`
- [ ] `OnPush` partout, nouvelle syntaxe de contrôle de flux partout
- [ ] Tests unitaires sur les dates, les montants et les récurrences
- [ ] Deux à trois parcours Playwright qui passent
- [ ] CI GitHub Actions au vert : lint, tests, build

### Qualité
- [ ] Lighthouse : 90+ sur les quatre axes
- [ ] Contraste AA vérifié sur tous les textes
- [ ] Navigation clavier complète, focus visible partout
- [ ] PWA installable et réellement fonctionnelle hors ligne

### Présentation
- [ ] README technique : architecture, choix de conception, arbitrages, ce que je ferais différemment
- [ ] Déployé, URL stable
- [ ] `canonical` cohérent avec l'URL réellement servie