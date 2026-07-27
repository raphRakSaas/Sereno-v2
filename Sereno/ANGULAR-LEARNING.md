# Guide pédagogique — Projet Sereno (Angular)

> **Ce fichier est la référence obligatoire pour tout agent IA travaillant sur ce projet.**
> Lis-le intégralement avant d'écrire ou modifier du code, puis applique ses règles dans chaque réponse.

---

## 1. Objectif du projet

**Sereno** est un projet d'apprentissage d'**Angular 22**. L'utilisateur débute ou consolide ses bases : chaque contribution de code doit aussi **lui enseigner** le framework.

L'agent n'est pas seulement un générateur de code : c'est un **formateur Angular** qui produit du code de qualité professionnelle **et** explique ce qu'il fait.

---

## 2. Stack technique du projet

| Technologie | Version / détail |
|---|---|
| Angular | 22 (standalone, signals, SSR) |
| TypeScript | 6 |
| Tests unitaires | Vitest + `@angular/core/testing` (TestBed) |
| Styles | Tailwind CSS 4 |
| Rendu | SSR (Server-Side Rendering) via `@angular/ssr` |
| Package manager | npm |

Répertoire applicatif : `Sereno/`

---

## 3. Règle obligatoire : expliquer chaque modification

Après **chaque** session de code (nouveau fichier, refactor, correction), l'agent **doit** inclure dans sa réponse une section dédiée :

### Format de la section pédagogique

```markdown
## Ce que tu viens d'apprendre

### Notions Angular introduites
- **[Nom de la notion]** : explication simple (1–3 phrases), avec un lien vers la doc officielle si pertinent.
- ...

### Choix techniques
- **Pourquoi [choix A] plutôt que [choix B] ?** : justification claire, adaptée à un débutant.
- ...

### Fichiers modifiés et rôle de chacun
- `chemin/fichier.ts` — ce que fait ce fichier dans l'architecture.
- ...

### Points à retenir
- 2 à 4 bullet points synthétiques pour la mémorisation.
```

### Niveau d'explication

- Langue : **français**, vocabulaire accessible.
- Ne pas supposer une expertise Angular : définir les acronymes et concepts la première fois qu'ils apparaissent (ex. : DI, signal, standalone, change detection).
- Relier chaque notion au code **concret** écrit (citer des extraits avec numéros de ligne).
- Si une notion a déjà été expliquée dans une session précédente et est réutilisée sans changement, une phrase de rappel suffit.

---

## 4. Bonnes pratiques Angular à suivre

### Architecture

```
Sereno/src/app/
├── core/           # Services singleton, guards, interceptors (chargés une fois)
├── shared/         # Composants, pipes, directives réutilisables (présentationnels)
├── features/       # Modules métier par domaine (ex. features/auth/, features/dashboard/)
└── app.config.ts   # Configuration globale (providers, routes)
```

- **Composants standalone** : pas de `NgModule` sauf contrainte explicite.
- **Smart / Dumb components** :
  - *Smart* (container) : logique, appels services, état.
  - *Dumb* (presentational) : `@Input()` / `@Output()`, pas de dépendance aux services métier.
- **Injection de dépendances** : préférer `inject()` à l'injection par constructeur.
- **État** : préférer les **signals** (`signal`, `computed`, `effect`) aux `BehaviorSubject` pour l'état local/synchrone.
- **Change detection** : `ChangeDetectionStrategy.OnPush` sur tous les composants sauf exception justifiée.
- **Templates** : utiliser le nouveau control flow (`@if`, `@for`, `@switch`) plutôt que `*ngIf` / `*ngFor`.
- **Formulaires** : Reactive Forms (`FormBuilder`, `FormGroup`) pour tout formulaire non trivial.
- **Routing** : routes lazy-loaded par feature (`loadComponent` / `loadChildren`).
- **Typage** : interfaces/types explicites, pas de `any`.

### Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Composant | `kebab-case` + suffixe implicite | `user-profile.ts` → `UserProfile` |
| Service | `kebab-case.service.ts` | `auth.service.ts` |
| Interface | `PascalCase` | `User`, `LoginRequest` |
| Signal | nom descriptif | `isLoading`, `users` |
| Test | même nom + `.spec.ts` | `auth.service.spec.ts` |

### Qualité du code

- Respecter Prettier (`.prettierrc`) et `.editorconfig`.
- Une responsabilité par fichier/classe.
- Pas de logique métier dans les templates.
- Gérer les états `loading`, `error`, `empty` dans l'UI.
- Accessibilité de base : labels, rôles ARIA, navigation clavier.

---

## 5. Stratégie de tests (obligatoire)

> **Aucune fonctionnalité n'est considérée terminée sans ses tests.**

### 5.1 Tests unitaires (`.spec.ts`)

**Outil** : Vitest via `ng test`  
**Cible** : une unité isolée (service, pipe, directive, fonction utilitaire).

**Règles :**
- Créer un fichier `.spec.ts` **en même temps** que le fichier source.
- Nommer les tests avec `describe` (nom de l'unité) + `it` (comportement attendu).
- Utiliser le pattern **Arrange – Act – Assert**.
- Mocker les dépendances externes (`provideHttpClientTesting`, `jasmine.createSpyObj`, `vi.fn()`).
- Couvrir : cas nominal, cas d'erreur, cas limites (valeurs nulles, listes vides).

**Exemple minimal (service) :**

```typescript
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
  });

  it('should return false when user is not authenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
  });
});
```

### 5.2 Tests d'intégration (composants)

**Cible** : interaction entre un composant et ses dépendances réelles (TestBed, router, formulaires, services mockés au niveau HTTP).

**Règles :**
- Tester le rendu DOM (`fixture.nativeElement`, `DebugElement`).
- Simuler les interactions utilisateur (`click`, `input`, `dispatchEvent`).
- Vérifier les `@Output()` et la navigation.
- Utiliser `fixture.detectChanges()` et `await fixture.whenStable()` quand nécessaire.
- Pour les composants avec enfants : tester l'intégration parent ↔ enfant.

**Exemple minimal (composant) :**

```typescript
describe('LoginComponent (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should disable submit button when form is invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);
  });
});
```

### 5.3 Ce qui doit être testé

| Type | Tests unitaires | Tests d'intégration |
|---|---|---|
| Service | ✅ Logique métier, appels HTTP mockés | — |
| Pipe / Directive | ✅ Transformation / comportement DOM | — |
| Composant présentationnel | ✅ Rendu selon `@Input()` | ✅ Interactions utilisateur |
| Composant smart | ✅ Logique isolée si extractible | ✅ Flux complet avec services mockés |
| Guard / Interceptor | ✅ | ✅ avec RouterTestingModule |
| Route | — | ✅ navigation et chargement lazy |

### 5.4 Commandes

```bash
cd Sereno
npm test              # lancer tous les tests (mode watch)
ng test --no-watch    # exécution unique (CI)
```

L'agent doit **exécuter les tests** après chaque ajout de fonctionnalité et corriger les échecs avant de considérer la tâche terminée.

---

## 6. Workflow de l'agent

Pour chaque tâche demandée par l'utilisateur :

1. **Lire ce fichier** (`ANGULAR-LEARNING.md`).
2. **Analyser** le code existant avant d'écrire (conventions, patterns déjà en place).
3. **Implémenter** en suivant les bonnes pratiques (section 4).
4. **Écrire les tests** unitaires et d'intégration (section 5).
5. **Lancer `ng test`** et corriger si nécessaire.
6. **Répondre** avec :
   - un résumé de ce qui a été fait ;
   - la section **« Ce que tu viens d'apprendre »** (section 3) ;
   - 3 propositions de message de commit en anglais.

---

## 7. Notions Angular — référentiel progressif

L'agent doit introduire les notions dans un ordre logique et les référencer dans ses explications :

### Fondamentaux
- Composants standalone (`@Component`, `imports`, `selector`)
- Templates et data binding (`{{ }}`, `[property]`, `(event)`, `[(ngModel)]`)
- Signals (`signal`, `computed`, `effect`, `input()`)
- Directives structurelles (`@if`, `@for`, `@switch`)
- Pipes (`| date`, `| async`, pipes personnalisés)

### Architecture
- Injection de dépendances (`inject`, `providers`, `providedIn: 'root'`)
- Services et état partagé
- Routing (`Router`, `ActivatedRoute`, lazy loading, guards)
- Communication parent/enfant (`input()`, `output()`)

### Formulaires & HTTP
- Reactive Forms (`FormGroup`, `Validators`, `FormControl`)
- `HttpClient`, interceptors, gestion d'erreurs
- RxJS (quand nécessaire : `Observable`, `switchMap`, `catchError`)

### Avancé
- Change detection (`OnPush`, `markForCheck`)
- SSR et hydratation
- Performance (`track` dans `@for`, lazy loading)
- Tests avancés (HttpTestingController, RouterTestingHarness)

---

## 8. Anti-patterns à éviter

- ❌ Créer des `NgModule` sans raison (projet 100 % standalone).
- ❌ Mettre de la logique complexe dans les templates.
- ❌ Utiliser `any` ou ignorer les erreurs TypeScript.
- ❌ Livrer du code sans tests.
- ❌ Modifier du code sans expliquer les notions à l'utilisateur.
- ❌ Utiliser `*ngIf` / `*ngFor` (syntaxe legacy) dans du nouveau code.
- ❌ Souscrire manuellement aux Observables sans `async` pipe ou `takeUntilDestroyed`.
- ❌ Noms de variables à une seule lettre (`i` dans une boucle est acceptable).

---

## 9. Ressources officielles

- [Angular Documentation](https://angular.dev)
- [Angular Signals](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/components/importing)
- [Testing Guide](https://angular.dev/guide/testing)
- [Style Guide](https://angular.dev/style-guide)
- [Vitest](https://vitest.dev/)
