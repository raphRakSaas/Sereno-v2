import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ONBOARDING_BUDGET_CATEGORY_IDS,
  SYSTEM_CATEGORIES,
} from '../../core/data/system-categories';
import { AppStore } from '../../core/store/app.store';
import { formatCurrency } from '../../shared/utils/format-currency';
import { MoneyInput } from '../../shared/components/money-input/money-input';
import { OnboardingLottie } from '../../shared/components/onboarding-lottie/onboarding-lottie';
import { SerenoLogo } from '../../shared/components/sereno-logo/sereno-logo';
import { OnboardingState, OnboardingStep } from './services/onboarding-state';
import {
  ONBOARDING_LOTTIE_LABELS,
  ONBOARDING_LOTTIE_PATHS,
} from './data/onboarding-lottie.config';
import {
  DEFAULT_INCOME_TYPE_ID,
  findIncomeTypeById,
  ONBOARDING_INCOME_TYPE_OPTIONS,
} from './data/income-type-options';

@Component({
  selector: 'app-onboarding',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OnboardingState],
  imports: [ReactiveFormsModule, MoneyInput, OnboardingLottie, SerenoLogo],
  template: `
    <div class="grid min-h-screen lg:grid-cols-2">
      <div
        class="relative flex min-h-screen flex-col bg-white px-4 py-6 sm:px-8 lg:px-12 xl:px-16"
      >
        <header class="shrink-0">
          <app-sereno-logo variant="full" size="md" />
        </header>

        <div class="flex flex-1 items-center justify-center py-8">
          <div class="w-full max-w-xl">
            @switch (state.currentStep()) {
              @case ('welcome') {
                <div class="space-y-6 text-center">
                  <div class="space-y-3">
                    <h1 class="text-[28px] font-semibold text-text">Bienvenue sur Sereno</h1>
                    <p class="text-[15px] leading-relaxed text-text-muted">
                      Sereno t'aide à voir clairement où va ton argent, sans jugement.
                      <strong class="font-semibold text-text">
                        Tes données restent sur cet appareil, sans compte ni connexion bancaire.
                      </strong>
                    </p>
                  </div>
                  <div class="mx-auto flex max-w-sm flex-col gap-2 pt-2">
                    <button
                      type="button"
                      class="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      (click)="goToStep('initial-balance')"
                    >
                      Configurer mon espace
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-page"
                      [disabled]="isSaving()"
                      (click)="loadDemoData()"
                    >
                      Charger des données d'exemple
                    </button>
                  </div>
                </div>
              }

              @case ('initial-balance') {
                <div class="space-y-6">
                  <header class="space-y-2">
                    <p class="label-caps text-accent">Étape 1 sur 4</p>
                    <h2 class="text-[24px] font-semibold text-text">Solde initial</h2>
                    <p class="text-[14px] text-text-muted">
                      Indique combien tu as disponible aujourd'hui. Ce montant sert de point de
                      départ pour suivre ton mois.
                    </p>
                  </header>

                  <app-money-input
                    label="Solde disponible"
                    hint="Tu pourras ajuster ce montant plus tard."
                    [amountInCents]="state.initialBalanceInCents()"
                    (amountChange)="state.updateInitialBalance($event)"
                  />

                  <div class="flex gap-2 pt-2">
                    <button
                      type="button"
                      class="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text"
                      (click)="goToStep('welcome')"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
                      (click)="goToStep('income')"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              }

              @case ('income') {
                <div class="space-y-6">
                  <header class="space-y-2">
                    <p class="label-caps text-accent">Étape 2 sur 4</p>
                    <h2 class="text-[24px] font-semibold text-text">Revenus du mois</h2>
                    <p class="text-[14px] text-text-muted">
                      Ajoute ton revenu principal pour ce mois. Tu pourras enregistrer d'autres
                      revenus ensuite.
                    </p>
                  </header>

                  <label class="block">
                    <span class="label-caps mb-2 block text-text-muted">Catégorie</span>
                    <select
                      [formControl]="incomeCategoryControl"
                      class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    >
                      @for (option of incomeTypeOptions; track option.id) {
                        <option [value]="option.id">{{ option.label }}</option>
                      }
                    </select>
                  </label>

                  <label class="block">
                    <span class="label-caps mb-2 block text-text-muted">Libellé</span>
                    <input
                      type="text"
                      [formControl]="incomeLabelControl"
                      class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                      placeholder="Ex. Salaire Acme, CAF..."
                      (blur)="syncIncomeLabel()"
                    />
                  </label>

                  <app-money-input
                    label="Montant mensuel"
                    [amountInCents]="state.monthlyIncomeInCents()"
                    (amountChange)="state.updateIncome($event, incomeLabelControl.value)"
                  />

                  <div class="flex gap-2 pt-2">
                    <button
                      type="button"
                      class="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text"
                      (click)="goToStep('initial-balance')"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
                      (click)="goToStep('budgets')"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              }

              @case ('budgets') {
                <div class="space-y-4">
                  <header class="space-y-1.5">
                    <p class="label-caps text-accent">Étape 3 sur 4</p>
                    <h2 class="text-[24px] font-semibold text-text">Budgets de dépenses</h2>
                    <p class="text-[14px] text-text-muted">
                      Fixe un plafond pour les catégories que tu veux suivre. Retire celles qui ne
                      te concernent pas.
                    </p>
                  </header>

                  <ul class="overflow-hidden rounded-xl border border-border bg-surface">
                    @for (category of activeBudgetCategories(); track category.id; let last = $last) {
                      <li
                        class="flex items-center gap-3 px-3 py-2.5"
                        [class.border-b]="!last"
                        [class.border-border]="!last"
                      >
                        <span
                          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          [style.background-color]="category.color + '22'"
                          [style.color]="category.color"
                          aria-hidden="true"
                        >
                          <span class="material-symbols-outlined text-[18px]">{{
                            category.icon
                          }}</span>
                        </span>

                        <span class="min-w-0 flex-1 truncate text-sm font-medium text-text">
                          {{ category.name }}
                        </span>

                        <div class="w-28 shrink-0 sm:w-32">
                          <app-money-input
                            [label]="category.name"
                            [compact]="true"
                            [amountInCents]="state.getBudgetAmount(category.id)"
                            (amountChange)="state.updateBudgetDraft(category.id, $event)"
                          />
                        </div>

                        <button
                          type="button"
                          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-page hover:text-accent"
                          [attr.aria-label]="'Retirer ' + category.name"
                          (click)="excludeBudgetCategory(category.id)"
                        >
                          <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
                            >delete</span
                          >
                        </button>
                      </li>
                    } @empty {
                      <li class="px-4 py-6 text-center text-sm text-text-muted">
                        Toutes les catégories ont été retirées. Réactive-en une ci-dessous.
                      </li>
                    }
                  </ul>

                  @if (excludedBudgetCategories().length > 0) {
                    <div class="space-y-2">
                      <p class="text-[12px] font-medium text-text-muted">Catégories retirées</p>
                      <div class="flex flex-wrap gap-2">
                        @for (category of excludedBudgetCategories(); track category.id) {
                          <button
                            type="button"
                            class="inline-flex items-center gap-1.5 rounded-full border border-border bg-page px-2.5 py-1 text-[12px] text-text transition-colors hover:border-accent hover:text-accent"
                            (click)="restoreBudgetCategory(category.id)"
                          >
                            <span class="material-symbols-outlined text-[14px]" aria-hidden="true"
                              >add</span
                            >
                            {{ category.name }}
                          </button>
                        }
                      </div>
                    </div>
                  }

                  <div class="flex gap-2 pt-1">
                    <button
                      type="button"
                      class="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text"
                      (click)="goToStep('income')"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
                      (click)="goToStep('completion')"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              }

              @case ('completion') {
                <div class="space-y-5">
                  <header class="space-y-3 text-center">
                    <div
                      class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-surface text-accent"
                      aria-hidden="true"
                    >
                      <span class="material-symbols-outlined text-[28px]">check_circle</span>
                    </div>
                    <div class="space-y-1.5">
                      <p class="label-caps text-accent">Étape 4 sur 4</p>
                      <h2 class="text-[26px] font-semibold tracking-tight text-text">
                        Tout est prêt
                      </h2>
                      <p class="mx-auto max-w-sm text-[14px] leading-relaxed text-text-muted">
                        Voici le résumé de ta configuration. Tu pourras tout ajuster ensuite dans
                        Sereno.
                      </p>
                    </div>
                  </header>

                  <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(23,20,18,0.04)]">
                    <div class="grid gap-px bg-border sm:grid-cols-3">
                      <div class="bg-surface px-4 py-4 text-center sm:text-left">
                        <div class="mb-2 flex items-center justify-center gap-1.5 sm:justify-start">
                          <span
                            class="material-symbols-outlined text-[16px] text-accent"
                            aria-hidden="true"
                            >account_balance_wallet</span
                          >
                          <p class="label-caps text-text-muted">Solde</p>
                        </div>
                        <p class="monetary-tabular text-[18px] font-semibold text-text">
                          {{ formatCurrency(state.initialBalanceInCents()) }}
                        </p>
                      </div>

                      <div class="bg-surface px-4 py-4 text-center sm:text-left">
                        <div class="mb-2 flex items-center justify-center gap-1.5 sm:justify-start">
                          <span
                            class="material-symbols-outlined text-[16px] text-income"
                            aria-hidden="true"
                            >trending_up</span
                          >
                          <p class="label-caps text-text-muted">Revenu</p>
                        </div>
                        <p class="monetary-tabular text-[18px] font-semibold text-income">
                          {{
                            state.monthlyIncomeInCents() > 0
                              ? formatCurrency(state.monthlyIncomeInCents(), { showSign: true })
                              : '—'
                          }}
                        </p>
                        <p class="mt-0.5 truncate text-[12px] text-text-muted">
                          {{ state.incomeLabel() }}
                        </p>
                      </div>

                      <div class="bg-surface px-4 py-4 text-center sm:text-left">
                        <div class="mb-2 flex items-center justify-center gap-1.5 sm:justify-start">
                          <span
                            class="material-symbols-outlined text-[16px] text-accent"
                            aria-hidden="true"
                            >pie_chart</span
                          >
                          <p class="label-caps text-text-muted">Budgets</p>
                        </div>
                        <p class="text-[18px] font-semibold text-text">
                          {{ completionBudgetRows().length }}
                          <span class="text-[13px] font-medium text-text-muted">
                            {{ completionBudgetRows().length > 1 ? 'catégories' : 'catégorie' }}
                          </span>
                        </p>
                        <p class="mt-0.5 monetary-tabular text-[12px] text-text-muted">
                          {{ formatCurrency(completionBudgetsTotalInCents()) }} au total
                        </p>
                      </div>
                    </div>

                    <div class="border-t border-border px-4 py-3">
                      @if (completionBudgetRows().length > 0) {
                        <p class="label-caps mb-2.5 text-text-muted">Détail des budgets</p>
                        <ul class="space-y-2">
                          @for (budget of completionBudgetRows(); track budget.categoryId) {
                            <li class="flex items-center gap-3">
                              <span
                                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                                [style.background-color]="budget.color + '22'"
                                [style.color]="budget.color"
                                aria-hidden="true"
                              >
                                <span class="material-symbols-outlined text-[15px]">{{
                                  budget.icon
                                }}</span>
                              </span>
                              <span class="min-w-0 flex-1 truncate text-sm text-text">{{
                                budget.name
                              }}</span>
                              <span
                                class="monetary-tabular text-sm font-medium text-text"
                                >{{ formatCurrency(budget.amountInCents) }}</span
                              >
                            </li>
                          }
                        </ul>
                      } @else {
                        <p class="text-center text-[13px] text-text-muted">
                          Aucun budget chiffré pour l’instant. Tu pourras en ajouter plus tard.
                        </p>
                      }
                    </div>
                  </div>

                  <div class="flex flex-col gap-2 pt-1 sm:flex-row">
                    <button
                      type="button"
                      class="rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-text sm:flex-1"
                      (click)="goToStep('budgets')"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:flex-[1.4]"
                      [disabled]="isSaving()"
                      (click)="finishOnboarding()"
                    >
                      @if (isSaving()) {
                        Ouverture…
                      } @else {
                        Accéder à Sereno
                        <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
                          >arrow_forward</span
                        >
                      }
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <footer class="shrink-0 pb-2" aria-label="Progression de l'onboarding">
          <div class="flex items-center justify-center gap-2">
            @for (step of steps; track step.id; let index = $index) {
              <span
                class="h-1.5 rounded-full transition-all"
                [class.w-8]="step.id === state.currentStep()"
                [class.w-4]="step.id !== state.currentStep()"
                [class.bg-accent]="index <= currentStepIndex()"
                [class.bg-border]="index > currentStepIndex()"
              ></span>
            }
          </div>
        </footer>
      </div>

      <aside
        class="flex min-h-[320px] items-center justify-center bg-text p-6 sm:p-10 lg:min-h-screen lg:p-12"
      >
        <app-onboarding-lottie
          class="w-full max-w-xl"
          [animationPath]="currentLottiePath()"
          [ariaLabel]="currentLottieLabel()"
        />
      </aside>
    </div>
  `,
})
export class Onboarding {
  private readonly appStore = inject(AppStore);
  private readonly router = inject(Router);
  protected readonly state = inject(OnboardingState);

  protected readonly formatCurrency = formatCurrency;
  protected readonly isSaving = signal(false);

  protected readonly incomeLabelControl = new FormControl('Salaire', {
    nonNullable: true,
    validators: [Validators.required],
  });

  protected readonly incomeCategoryControl = new FormControl(DEFAULT_INCOME_TYPE_ID, {
    nonNullable: true,
  });

  protected readonly incomeTypeOptions = ONBOARDING_INCOME_TYPE_OPTIONS;

  constructor() {
    this.incomeCategoryControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((typeId) => this.applyIncomeCategory(typeId));

    this.incomeLabelControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.syncIncomeLabel());
  }

  protected readonly steps = [
    { id: 'initial-balance' as const },
    { id: 'income' as const },
    { id: 'budgets' as const },
    { id: 'completion' as const },
  ];

  protected readonly budgetCategories = ONBOARDING_BUDGET_CATEGORY_IDS.map((categoryId) =>
    SYSTEM_CATEGORIES.find((category) => category.id === categoryId),
  ).filter((category): category is (typeof SYSTEM_CATEGORIES)[number] => Boolean(category));

  protected readonly activeBudgetCategories = computed(() =>
    this.budgetCategories.filter(
      (category) => !this.state.isBudgetCategoryExcluded(category.id),
    ),
  );

  protected readonly excludedBudgetCategories = computed(() =>
    this.budgetCategories.filter((category) => this.state.isBudgetCategoryExcluded(category.id)),
  );

  protected readonly completionBudgetRows = computed(() =>
    this.state
      .budgetDrafts()
      .map((draft) => {
        const category = SYSTEM_CATEGORIES.find(
          (systemCategory) => systemCategory.id === draft.categoryId,
        );

        if (!category) {
          return null;
        }

        return {
          categoryId: draft.categoryId,
          name: category.name,
          icon: category.icon,
          color: category.color,
          amountInCents: draft.amountInCents,
        };
      })
      .filter(
        (
          row,
        ): row is {
          categoryId: string;
          name: string;
          icon: string;
          color: string;
          amountInCents: number;
        } => row !== null,
      ),
  );

  protected readonly completionBudgetsTotalInCents = computed(() =>
    this.completionBudgetRows().reduce((total, budget) => total + budget.amountInCents, 0),
  );

  protected readonly currentStepIndex = computed(() => {
    const stepOrder = ['welcome', 'initial-balance', 'income', 'budgets', 'completion'] as const;
    return stepOrder.indexOf(this.state.currentStep());
  });

  protected readonly currentLottiePath = computed(
    () => ONBOARDING_LOTTIE_PATHS[this.state.currentStep()],
  );

  protected readonly currentLottieLabel = computed(
    () => ONBOARDING_LOTTIE_LABELS[this.state.currentStep()],
  );

  protected goToStep(step: OnboardingStep): void {
    this.state.setStep(step);
  }

  protected excludeBudgetCategory(categoryId: string): void {
    this.state.excludeBudgetCategory(categoryId);
  }

  protected restoreBudgetCategory(categoryId: string): void {
    this.state.restoreBudgetCategory(categoryId);
  }

  protected applyIncomeCategory(typeId: string): void {
    const selectedOption = findIncomeTypeById(typeId);

    if (!selectedOption) {
      return;
    }

    if (selectedOption.id === 'other') {
      if (!this.incomeLabelControl.value.trim()) {
        this.incomeLabelControl.setValue('Autre', { emitEvent: false });
      }
    } else {
      this.incomeLabelControl.setValue(selectedOption.label, { emitEvent: false });
    }

    this.syncIncomeLabel();
  }

  protected syncIncomeLabel(): void {
    this.state.updateIncome(this.state.monthlyIncomeInCents(), this.incomeLabelControl.value);
  }

  protected async loadDemoData(): Promise<void> {
    this.isSaving.set(true);
    await this.appStore.loadDemoData();
    this.isSaving.set(false);
    await this.router.navigateByUrl('/');
  }

  protected async finishOnboarding(): Promise<void> {
    this.isSaving.set(true);

    await this.appStore.completeOnboarding({
      initialBalanceInCents: this.state.initialBalanceInCents(),
      monthlyIncomeInCents: this.state.monthlyIncomeInCents(),
      incomeLabel: this.incomeLabelControl.value,
      budgets: this.state.budgetDrafts(),
    });

    this.isSaving.set(false);
    await this.router.navigateByUrl('/');
  }
}
