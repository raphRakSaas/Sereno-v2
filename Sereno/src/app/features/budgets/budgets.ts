import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppStore } from '../../core/store/app.store';
import { BudgetProgress } from '../home/models/home.models';

@Component({
  selector: 'app-budgets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="label-caps text-text-muted">Budgets</h2>
          <p class="mt-0.5 text-[12px] text-text-muted">Suivi de tes enveloppes budgétaires</p>
        </div>
        <a
          routerLink="/categories/nouvelle"
          class="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-[12px] font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <span class="material-symbols-outlined text-[16px]" aria-hidden="true">add</span>
          Ajouter une catégorie
        </a>
      </div>

      <!-- Summary card -->
      <div class="grid grid-cols-1 gap-gutter sm:grid-cols-3">
        <section class="bento-card p-5">
          <p class="label-caps text-text-muted">Total planifié</p>
          <p class="mt-2 monetary-tabular text-[20px] font-bold text-text">
            {{ formatCents(totalPlannedInCents()) }}
          </p>
          <p class="mt-1 text-[11px] text-text-muted">ce mois-ci</p>
        </section>

        <section class="bento-card p-5">
          <p class="label-caps text-text-muted">Utilisé</p>
          <p
            class="mt-2 monetary-tabular text-[20px] font-bold"
            [class.text-accent]="usedPercent() > 90"
            [class.text-warning]="usedPercent() > 70 && usedPercent() <= 90"
            [class.text-income]="usedPercent() <= 70"
          >
            {{ usedPercent() }}%
          </p>
          <p class="mt-1 text-[11px] text-text-muted">{{ formatCents(totalSpentInCents()) }}</p>
        </section>

        <section class="bento-card p-5">
          <p class="label-caps text-text-muted">Restant</p>
          <p
            class="mt-2 monetary-tabular text-[20px] font-bold"
            [class.text-income]="remainingInCents() > 0"
            [class.text-accent]="remainingInCents() <= 0"
          >
            {{ formatCents(Math.abs(remainingInCents())) }}
          </p>
          <p class="mt-1 text-[11px] text-text-muted">
            {{ remainingInCents() >= 0 ? 'disponibles' : 'dépassement' }}
          </p>
        </section>
      </div>

      <!-- Warning card -->
      @if (overBudgetCategories().length > 0) {
        <section class="bento-card p-4 border-accent/40 bg-accent/5">
          <div class="flex items-start gap-3">
            <span
              class="material-symbols-outlined text-[20px] text-accent shrink-0 mt-0.5"
              aria-hidden="true"
              >warning</span
            >
            <div>
              <p class="text-[13px] font-semibold text-text">Budget dépassé</p>
              <p class="mt-0.5 text-[12px] text-text-muted">
                {{ overBudgetCategories().join(', ') }}
                {{ overBudgetCategories().length > 1 ? 'ont' : 'a' }} dépassé leur enveloppe ce
                mois-ci.
              </p>
            </div>
          </div>
        </section>
      }

      <!-- Budget list -->
      <section class="bento-card overflow-hidden">
        <div class="px-5 py-4 border-b border-border">
          <h3 class="label-caps text-text-muted">Détail par catégorie</h3>
        </div>
        @if (budgets().length > 0) {
          <ul role="list">
            @for (budget of budgets(); track budget.id) {
              <li class="px-5 py-4 border-b border-border/50 last:border-0">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <p class="text-[13px] font-medium text-text">{{ budget.categoryName }}</p>
                    @if (budget.description) {
                      <p class="text-[11px] text-text-muted">{{ budget.description }}</p>
                    }
                  </div>
                  <div class="text-right">
                    <p
                      class="monetary-tabular text-[13px] font-semibold"
                      [class.text-accent]="budget.isOverBudget"
                      [class.text-text]="!budget.isOverBudget"
                    >
                      {{ formatCents(budget.spentInCents) }}
                    </p>
                    <p class="text-[11px] text-text-muted">/ {{ formatCents(budget.plannedInCents) }}</p>
                  </div>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    [class.bg-accent]="budget.isOverBudget"
                    [class.bg-income]="!budget.isOverBudget && progressPercent(budget) < 80"
                    [class.bg-warning]="!budget.isOverBudget && progressPercent(budget) >= 80"
                    [style.width.%]="Math.min(100, progressPercent(budget))"
                  ></div>
                </div>
                <div class="mt-1.5 flex justify-between">
                  <span class="text-[10px] text-text-muted">{{ progressPercent(budget) }}% utilisé</span>
                  @if (!budget.isOverBudget) {
                    <span class="text-[10px] font-medium text-text-muted">
                      {{ formatCents(budget.plannedInCents - budget.spentInCents) }} restants
                    </span>
                  } @else {
                    <span class="text-[10px] font-semibold text-accent">
                      +{{ formatCents(budget.spentInCents - budget.plannedInCents) }} dépassement
                    </span>
                  }
                </div>
              </li>
            }
          </ul>
        } @else {
          <div class="flex flex-col items-center gap-3 py-12 px-5 text-center">
            <span class="material-symbols-outlined text-[36px] text-border" aria-hidden="true"
              >account_balance_wallet</span
            >
            <p class="text-[13px] font-medium text-text">Aucun budget défini</p>
            <p class="text-[12px] text-text-muted">
              Définis tes enveloppes budgétaires pour suivre tes dépenses sans te juger.
            </p>
          </div>
        }
      </section>

      <!-- Sereno tip -->
      <section class="bento-card p-5 border-income/30">
        <div class="flex items-start gap-3">
          <span
            class="material-symbols-outlined text-[20px] text-income shrink-0 mt-0.5"
            aria-hidden="true"
            >lightbulb</span
          >
          <div>
            <p class="text-[12px] font-semibold text-text">Conseil Sereno</p>
            <p class="mt-1 text-[12px] leading-relaxed text-text-muted">
              Les budgets ne sont pas des contraintes, ce sont des intentions. Même si tu dépasses,
              l'important est de comprendre pourquoi — sans culpabilité.
            </p>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class Budgets {
  private readonly appStore = inject(AppStore);

  protected readonly Math = Math;

  protected readonly budgets = computed<BudgetProgress[]>(() => {
    return this.appStore.dashboardData().budgets;
  });

  protected readonly totalPlannedInCents = computed(() =>
    this.budgets().reduce((sum, budget) => sum + budget.plannedInCents, 0),
  );

  protected readonly totalSpentInCents = computed(() =>
    this.budgets().reduce((sum, budget) => sum + budget.spentInCents, 0),
  );

  protected readonly remainingInCents = computed(
    () => this.totalPlannedInCents() - this.totalSpentInCents(),
  );

  protected readonly usedPercent = computed(() => {
    const total = this.totalPlannedInCents();
    if (total <= 0) return 0;
    return Math.round((this.totalSpentInCents() / total) * 100);
  });

  protected readonly overBudgetCategories = computed(() =>
    this.budgets()
      .filter((budget) => budget.isOverBudget)
      .map((budget) => budget.categoryName),
  );

  protected progressPercent(budget: BudgetProgress): number {
    if (budget.plannedInCents <= 0) return 0;
    return Math.round((budget.spentInCents / budget.plannedInCents) * 100);
  }

  protected formatCents(cents: number): string {
    return (cents / 100).toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    });
  }
}
