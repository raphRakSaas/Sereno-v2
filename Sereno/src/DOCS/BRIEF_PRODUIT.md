# Sereno — Brief produit

À utiliser avec Stitch **après** avoir collé le système de design (voir `SCOPE.md`).
Un écran par message. Rappeler le système de design en tête de chaque message.

---

## Le produit, en une page

À coller une fois, en préambule :

```
PRODUCT BRIEF — SERENO

Sereno is a personal budgeting app for people who feel anxious about
money. It has one job: let someone see clearly where their money goes,
without ever making them feel judged.

Who it's for: someone in their twenties or thirties who has tried a
banking app's automatic budget feature and abandoned it, because the
automation made them a passive spectator of their own spending.

The core belief: writing down an expense yourself takes five seconds,
and that small deliberate act is exactly what puts a person back in
control. So there is no bank connection, no automatic categorisation,
no receipt scanning. The manual entry is the product, not a limitation.

Three principles that govern every screen:

1. Never alarm. An overspent budget is information, not a failure.
   The app states facts calmly. It never scolds, never uses urgency,
   never celebrates with confetti either.
2. Nothing is required. The app is fully usable without an account,
   without setup, without filling in a profile. Data lives on the
   device. A first-time user can record an expense within five seconds
   of opening it.
3. An empty screen is an invitation, not a void. Every empty state
   explains what this screen will show and offers exactly one action.

Voice: plain, calm, second person singular ("tu"). Short sentences.
No exclamation marks. No financial jargon. All interface copy in
French. Amounts in euros, French format (1 234,56 €).
```

---

## Les écrans

Quatorze écrans. Pour chacun : coller le système de design, puis le bloc ci-dessous.

---

### 1. Accueil

```
Design the Home screen for Sereno.

Purpose: answer one question in under three seconds — "where do I
stand this month?"

What the user sees:
- The current month, with arrows to move to previous or next month
- Their available balance for the month: what came in, minus what
  went out
- How their active budgets are tracking: a few categories with how
  much is spent against how much was planned
- A short list of their most recent transactions
- How their spending breaks down across categories
- Progress on their savings goal, if they have one

What the user can do:
- Record a new transaction — the single most important action on
  this screen
- Jump to the full transaction list, the full statistics, or the
  full budget list
- Move between months

Realistic French data: Loyer, Courses Carrefour, Essence, Abonnement
Spotify, Restaurant, Pharmacie, Salaire.
```

---

### 2. Activité

```
Design the Activity screen for Sereno.

Purpose: the complete history. This is where someone goes to find a
specific transaction, or to understand a month in detail.

What the user sees:
- The current month, with month navigation
- Total in and total out for the month
- Every transaction of the month, grouped by day, most recent first
- For each transaction: what it was, its category, the amount, and a
  discreet indicator when a receipt photo is attached

What the user can do:
- Search by name, note, category or amount
- Filter by type: everything, expenses only, income only
- Filter by category
- Change the sort order
- Tap any transaction to see or edit it
- Record a new transaction

Show around a dozen transactions across three or four different days.
```

---

### 3. Détail d'une transaction

```
Design the Transaction detail screen for Sereno.

Purpose: see everything about one transaction, and correct it.

What the user sees:
- The amount, prominently
- What it was, its category, its date
- Their note, if they wrote one
- The receipt photo, if they attached one
- A mention if this transaction is part of a recurring series

What the user can do:
- Edit any of it
- View the receipt photo full size
- Delete the transaction, with the ability to undo immediately after
- If it belongs to a recurring series: choose to change only this
  occurrence, or the whole series

Show a version with a receipt photo attached.
```

---

### 4. Enregistrer une transaction

```
Design the "New transaction" screen for Sereno. This is the most
used screen in the entire product — it must feel effortless.

Purpose: record an expense in under five seconds.

What the user sees and does, in this order of importance:
- Choose expense or income — expense is preselected, because it is
  what people record ninety percent of the time
- Enter the amount — this field has focus immediately, so someone
  can start typing the moment the screen opens
- Choose a category — the most frequently used categories are
  immediately visible, no menu to open
- The date — today by default, changeable
- An optional note
- Optionally attach a photo of the receipt: take one or pick one
  from the device

What the user can do:
- Save and close
- Save and immediately record another one, for someone entering
  several expenses in a row
- Cancel

Design constraint from the product side: someone recording a
5,40 € coffee should be able to do it with the amount, one category
tap, and save. Everything else is optional and must stay out of
the way.

Show two versions: the empty state as it opens, and a filled state
with a receipt photo attached and a thumbnail preview.
```

---

### 5. Calendrier

```
Design the Calendar screen for Sereno.

Purpose: see the rhythm of a month. Which days cost money, which
days were quiet.

What the user sees:
- A month grid, with a discreet mark on days that had transactions,
  proportional to how much was spent
- A switch between month view and week view
- The selected day, with everything that happened that day and the
  day's total

What the user can do:
- Select any day
- Switch between month and week
- Move between months
- Record a transaction directly on the selected day

Show a month where some days have transactions and others are empty.
Include the selected-day panel for a day that has two transactions,
and mention how it reads for a day with none — calm, not empty-feeling.
```

---

### 6. Statistiques

```
Design the Statistics screen for Sereno.

Purpose: understand patterns, not just totals. Answer "am I doing
better than last month?"

What the user sees:
- The month, with navigation
- Total income and total expenses
- What proportion of their income they managed not to spend
- How spending breaks down across categories, with percentages
- How this month compares to previous months
- Which days of the week or month they spend most on

What the user can do:
- Move between months
- Tap a category to see the transactions behind it

Important product note: a low savings rate is stated as a fact, in a
neutral tone. It is never presented as a failure or a warning.
```

---

### 7. Budgets

```
Design the Budgets screen for Sereno.

Purpose: decide in advance what a category should cost, then watch
where you stand — without pressure.

What the user sees:
- The month, with navigation
- Each budget: the category, how much is planned, how much is spent,
  how much is left, and how far through the month they are
- Budgets that are on track, and budgets that are exceeded — the
  exceeded ones stated plainly, never alarmingly
- A total: everything planned, everything spent

What the user can do:
- Add a budget for a category
- Change or remove a budget
- Copy last month's budgets into this month in one action
- Tap a budget to see the transactions inside it

Show two versions: a month with four budgets where one is exceeded,
and the empty state for a month with none.
```

---

### 8. Créer ou modifier un budget

```
Design the "New budget" screen for Sereno.

Purpose: set a spending limit for one category, this month.

What the user sees and does:
- Choose the category — categories that already have a budget this
  month are not offered again
- Enter the planned amount
- Helpful context: what they actually spent in this category over
  the last few months, so the number they choose is informed rather
  than invented
- Optionally: apply this budget to following months too

Then save or cancel.
```

---

### 9. Objectifs d'épargne

```
Design the Savings goals screen for Sereno.

Purpose: give saving a face and a name. "Trip to Japan" motivates;
"savings account" does not.

What the user sees:
- Each goal: its name, how much has been set aside, the target
  amount, how much remains, and progress
- If the goal has a target date: whether they are on pace
- Completed goals, kept visible as something achieved

What the user can do:
- Create a goal
- Record money set aside towards a goal
- Edit or delete a goal
- Open a goal to see its history of contributions

Show two goals in progress and one completed. Also show the empty
state for someone who has none.

Product note: money set aside is recorded by hand. The app never
moves real money and never connects to a bank.
```

---

### 10. Détail d'un objectif

```
Design the Savings goal detail screen for Sereno.

What the user sees:
- The goal name, target amount, and progress
- The target date and whether they are on pace, if one is set
- The full history of contributions, each with its date and amount
- How much they would need to set aside per month to arrive on time

What the user can do:
- Record a new contribution
- Edit or remove a past contribution
- Edit the goal itself
- Mark the goal as reached
```

---

### 11. Transactions récurrentes

```
Design the Recurring transactions screen for Sereno.

Purpose: stop re-entering the same rent, salary and subscriptions
every month.

What the user sees:
- Each recurring item: what it is, its amount, its category, how
  often it repeats, and when it next occurs
- Which ones are active and which have ended
- A monthly total: recurring income and recurring expenses, so
  someone can see their fixed costs at a glance

What the user can do:
- Create a recurring transaction
- Pause, resume, or end one
- Edit one — with a clear choice between changing only future
  occurrences or the whole series
- Delete one, choosing whether to keep the transactions it already
  created

Show a realistic set: Salaire monthly, Loyer monthly, Spotify
monthly, Assurance habitation yearly.
```

---

### 12. Créer une récurrence

```
Design the "New recurring transaction" screen for Sereno.

What the user sees and does:
- Expense or income
- The amount
- The category
- What it is (a name)
- How often: every week, every month, every year
- When it starts
- Optionally when it stops — otherwise it continues indefinitely
- A plain-language confirmation of what they just set up, in words
  rather than settings — for example "Every month on the 5th,
  starting in August 2026"

Then save or cancel.
```

---

### 13. Catégories

```
Design the Categories screen for Sereno.

Purpose: let people describe their own life. Someone's spending
categories are personal, and the defaults will never fit everyone.

What the user sees:
- All their categories, with an icon and a colour each
- Which are the app's defaults and which they created
- For each: how much they spent in it this month

What the user can do:
- Create a category: name, icon, colour
- Edit one
- Archive a category they no longer use — past transactions keep it,
  but it is no longer offered when recording new ones
- Reorder categories so the ones they use most appear first when
  recording a transaction

Realistic French categories: Logement, Courses, Transport,
Restaurants, Santé, Loisirs, Abonnements, Vêtements, Cadeaux.
```

---

### 14. Réglages

```
Design the Settings screen for Sereno.

Purpose: adjust the app, and stay in control of your own data.

What the user sees, grouped:

Data on this device
- A clear statement that everything is stored on this device and
  nothing is sent anywhere

Display
- Light or dark theme
- Which screen the app opens on
- Whether the week starts on Monday
- Whether quick actions appear on the home screen

Your data
- Save a full backup to a file
- Restore from a backup file
- Export transactions as a spreadsheet file
- Import transactions from a spreadsheet file
- Delete everything and start over

The app
- Install Sereno on the device for quick access, works offline
- Version, and a way to send feedback

What matters from the product side: the actions that can destroy
data must be visibly distinct from the harmless ones, and must ask
for confirmation. "Restore a backup" replaces everything — the user
must understand that before tapping, not after.
```

---

### 15. Importer un fichier

```
Design the Import flow for Sereno, in three steps.

Purpose: someone arriving from another budgeting app, or from a
spreadsheet, should be able to bring their history with them.

Step one — choose the file
- Pick a spreadsheet file from the device
- A short explanation of what the file should look like, and a
  downloadable example

Step two — match the columns
- The app shows the columns it found in their file
- For each one, the user says what it is: date, amount, description,
  category, or ignore it
- Categories in the file that Sereno does not recognise are listed,
  and the user maps each one to an existing category or creates it

Step three — check before importing
- A preview of the first rows exactly as they will be recorded
- How many transactions will be imported, and their total
- Rows that could not be read, listed clearly with the reason, and
  the choice to skip them or go back and fix the mapping
- Confirm the import

Show step two, since it is the hardest one to get right.
```

---

### 16. Premier lancement

```
Design the first-run experience for Sereno.

Purpose: get someone from opening the app to their first recorded
expense as fast as possible. Not an onboarding tour — a first step.

What the user sees on a truly empty app:
- One sentence explaining what Sereno does
- A reassurance that nothing is required: no account, no bank
  connection, data stays on the device
- One primary action: record a first expense
- One secondary action: load example data, to look around before
  committing anything

That is all. No carousel, no permission requests, no account
creation, no email capture.
```

---

## Ce que le produit ne fait pas

À coller si Stitch commence à inventer des fonctionnalités :

```
Sereno deliberately does NOT do any of the following. Do not design
or suggest screens for them:

- No account creation, no login, no sync between devices
- No bank connection, no automatic import, no automatic
  categorisation
- No receipt scanning or text recognition — a photo is stored as a
  photo, nothing is read from it
- No multiple accounts, no transfers between accounts
- No multiple currencies
- No notifications, reminders or nudges
- No sharing a budget with a partner or family
- No debt or loan tracking
- No forecasting or cash-flow projection
- No PDF reports
- No premium tier, no paywall, no upsell of any kind
- No social features, no comparison to other users
- No streaks, badges, or gamification
```

---

## Le test qui compte

Un lead dev qui ouvre cette app doit pouvoir, sans aide et sans lire de documentation :

1. Charger les données d'exemple en un clic
2. Comprendre en trois secondes où il en est sur le mois
3. Enregistrer une dépense en moins de cinq secondes
4. Trouver une transaction précise du mois dernier
5. Créer un budget, et voir immédiatement où il se situe

Si l'un de ces cinq gestes demande une explication, l'écran concerné n'est pas fini.