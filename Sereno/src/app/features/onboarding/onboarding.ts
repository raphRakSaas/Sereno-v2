import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ONBOARDING_BUDGET_CATEGORY_IDS,
  SYSTEM_CATEGORIES,
} from '../../core/data/system-categories';
import { AppStore } from '../../core/store/app.store';
import { formatCurrency } from '../../shared/utils/format-currency';
import { MoneyInput } from '../../shared/components/money-input/money-input';
import { OnboardingState, OnboardingStep } from './services/onboarding-state';

@Component({
  selector: 'app-onboarding',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OnboardingState],
  imports: [ReactiveFormsModule, MoneyInput],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-page px-4 py-10">
      <div class="w-full max-w-xl">
        <div class="mb-8 flex items-center justify-center gap-2">
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

        <section class="bento-card p-8">
          @switch (state.currentStep()) {
            @case ('welcome') {
              <div class="space-y-6 text-center">
                <div
                  class="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-2xl font-bold text-white"
                >
                  S
                </div>
                <div class="space-y-3">
                  <h1 class="text-[28px] font-semibold text-text">Bienvenue sur Sereno</h1>
                  <p class="text-[15px] leading-relaxed text-text-muted">
                    Sereno t'aide à voir clairement où va ton argent, sans jugement. Tes données
                    restent sur cet appareil, sans compte ni connexion bancaire.
                  </p>
                </div>
                <div class="space-y-3 pt-2">
                  <button
                    type="button"
                    class="w-full rounded-lg bg-accent py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
                    (click)="goToStep('initial-balance')"
                  >
                    Configurer mon espace
                  </button>
                  <button
                    type="button"
                    class="w-full rounded-lg border border-border py-3 text-[15px] font-semibold text-text transition-colors hover:bg-page"
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
                    Indique combien tu as disponible aujourd'hui. Ce montant sert de point de départ
                    pour suivre ton mois.
                  </p>
                </header>

                <app-money-input
                  label="Solde disponible"
                  hint="Tu pourras ajuster ce montant plus tard."
                  [amountInCents]="state.initialBalanceInCents()"
                  (amountChange)="state.updateInitialBalance($event)"
                />

                <div class="flex gap-3 pt-2">
                  <button
                    type="button"
                    class="flex-1 rounded-lg border border-border py-3 text-sm font-semibold text-text"
                    (click)="goToStep('welcome')"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    class="flex-1 rounded-lg bg-accent py-3 text-sm font-semibold text-white"
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

                <app-money-input
                  label="Montant mensuel"
                  [amountInCents]="state.monthlyIncomeInCents()"
                  (amountChange)="state.updateIncome($event, incomeLabelControl.value)"
                />

                <label class="block">
                  <span class="label-caps mb-2 block text-text-muted">Libellé</span>
                  <input
                    type="text"
                    [formControl]="incomeLabelControl"
                    class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    placeholder="Salaire, freelance..."
                    (blur)="syncIncomeLabel()"
                  />
                </label>

                <div class="flex gap-3 pt-2">
                  <button
                    type="button"
                    class="flex-1 rounded-lg border border-border py-3 text-sm font-semibold text-text"
                    (click)="goToStep('initial-balance')"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    class="flex-1 rounded-lg bg-accent py-3 text-sm font-semibold text-white"
                    (click)="goToStep('budgets')"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            }

            @case ('budgets') {
              <div class="space-y-6">
                <header class="space-y-2">
                  <p class="label-caps text-accent">Étape 3 sur 4</p>
                  <h2 class="text-[24px] font-semibold text-text">Budgets de dépenses</h2>
                  <p class="text-[14px] text-text-muted">
                    Définis un plafond pour les catégories que tu suis le plus. Tu peux laisser une
                    catégorie vide si tu préfères.
                  </p>
                </header>

                <ul class="space-y-4">
                  @for (category of budgetCategories; track category.id) {
                    <li class="rounded-lg border border-border/70 bg-page p-4">
                      <app-money-input
                        [label]="category.name"
                        [amountInCents]="state.getBudgetAmount(category.id)"
                        (amountChange)="state.updateBudgetDraft(category.id, $event)"
                      />
                    </li>
                  }
                </ul>

                <div class="flex gap-3 pt-2">
                  <button
                    type="button"
                    class="flex-1 rounded-lg border border-border py-3 text-sm font-semibold text-text"
                    (click)="goToStep('income')"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    class="flex-1 rounded-lg bg-accent py-3 text-sm font-semibold text-white"
                    (click)="goToStep('completion')"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            }

            @case ('completion') {
              <div class="space-y-6">
                <header class="space-y-2 text-center">
                  <p class="label-caps text-accent">Étape 4 sur 4</p>
                  <h2 class="text-[24px] font-semibold text-text">Tout est prêt</h2>
                  <p class="text-[14px] text-text-muted">
                    Vérifie le résumé de ta configuration avant d'accéder à ton tableau de bord.
                  </p>
                </header>

                <dl class="space-y-3 rounded-lg border border-border bg-page p-4 text-sm">
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-text-muted">Solde initial</dt>
                    <dd class="font-medium monetary-tabular text-text">
                      {{ formatCurrency(state.initialBalanceInCents()) }}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-text-muted">Revenu mensuel</dt>
                    <dd class="font-medium monetary-tabular text-income">
                      {{
                        state.monthlyIncomeInCents() > 0
                          ? formatCurrency(state.monthlyIncomeInCents(), { showSign: true })
                          : 'Non renseigné'
                      }}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-text-muted">Budgets définis</dt>
                    <dd class="font-medium text-text">{{ state.budgetDrafts().length }}</dd>
                  </div>
                </dl>

                <div class="flex gap-3 pt-2">
                  <button
                    type="button"
                    class="flex-1 rounded-lg border border-border py-3 text-sm font-semibold text-text"
                    (click)="goToStep('budgets')"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    class="flex-1 rounded-lg bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
                    [disabled]="isSaving()"
                    (click)="finishOnboarding()"
                  >
                    Accéder à Sereno
                  </button>
                </div>
              </div>
            }
          }
        </section>
      </div>
    </div>
  `,
})
export class Onboarding {
  private readonly appStore = inject(AppStore);
  private readonly router = inject(Router);
  protected readonly state = inject(OnboardingState);

  protected readonly formatCurrency = formatCurrency;
  protected readonly isSaving = signal(false);

  protected readonly incomeLabelControl = new FormControl('Revenu mensuel', {
    nonNullable: true,
    validators: [Validators.required],
  });

  protected readonly steps = [
    { id: 'initial-balance' as const },
    { id: 'income' as const },
    { id: 'budgets' as const },
    { id: 'completion' as const },
  ];

  protected readonly budgetCategories = ONBOARDING_BUDGET_CATEGORY_IDS.map((categoryId) =>
    SYSTEM_CATEGORIES.find((category) => category.id === categoryId),
  ).filter((category): category is (typeof SYSTEM_CATEGORIES)[number] => Boolean(category));

  protected readonly currentStepIndex = computed(() => {
    const stepOrder = ['welcome', 'initial-balance', 'income', 'budgets', 'completion'] as const;
    return stepOrder.indexOf(this.state.currentStep());
  });

  protected goToStep(step: OnboardingStep): void {
    this.state.setStep(step);
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
