import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { BudgetProgress } from '../../models/home.models';
import { calculateProgressPercent, formatCurrency } from '../../../../shared/utils/format-currency';

@Component({
  selector: 'app-budget-progress-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card p-5" aria-labelledby="budgets-title">
      <header class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2
            id="budgets-title"
            class="text-[13px] font-semibold uppercase tracking-wide text-text"
          >
            Budgets mensuels
          </h2>
          <p class="mt-0.5 text-[12px] text-text-muted">
            {{ budgets().length }} catégorie{{ budgets().length > 1 ? 's' : '' }} suivie{{
              budgets().length > 1 ? 's' : ''
            }}
          </p>
        </div>
        <button type="button" class="label-caps text-accent hover:underline">
          Gérer les limites
        </button>
      </header>

      <ul class="space-y-3">
        @for (budget of visibleBudgets(); track budget.id) {
          <li class="space-y-1.5">
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 items-center gap-1.5">
                <p class="truncate text-[13px] font-medium text-text">{{ budget.categoryName }}</p>
                @if (budget.isOverBudget) {
                  <span
                    class="material-symbols-outlined text-[16px] text-warning"
                    aria-hidden="true"
                    >warning</span
                  >
                }
              </div>
              <p class="shrink-0 text-right text-[12px] monetary-tabular">
                <span
                  class="font-medium"
                  [class.text-warning]="budget.isOverBudget"
                  [class.text-text]="!budget.isOverBudget"
                >
                  {{ formatCurrency(budget.spentInCents) }}
                </span>
                <span class="text-text-muted"> / {{ formatCurrency(budget.plannedInCents) }}</span>
              </p>
            </div>
            <div class="h-1.5 overflow-hidden rounded-full bg-page">
              <div
                class="h-full rounded-full transition-all"
                [class.bg-warning]="budget.isOverBudget"
                [class.bg-income]="!budget.isOverBudget"
                [style.width.%]="progressPercent(budget)"
                role="progressbar"
                [attr.aria-valuenow]="progressPercent(budget)"
                aria-valuemin="0"
                aria-valuemax="100"
                [attr.aria-label]="'Avancement budget ' + budget.categoryName"
              ></div>
            </div>
          </li>
        }
      </ul>

      @if (hiddenBudgetsCount() > 0) {
        <button
          type="button"
          class="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
          [attr.aria-expanded]="isExpanded()"
          (click)="toggleExpanded()"
        >
          @if (isExpanded()) {
            Masquer les autres budgets
            <span class="material-symbols-outlined text-[16px]" aria-hidden="true"
              >expand_less</span
            >
          } @else {
            Afficher {{ hiddenBudgetsCount() }} autre{{ hiddenBudgetsCount() > 1 ? 's' : '' }}
            budget{{ hiddenBudgetsCount() > 1 ? 's' : '' }}
            <span class="material-symbols-outlined text-[16px]" aria-hidden="true"
              >expand_more</span
            >
          }
        </button>
      }
    </section>
  `,
})
export class BudgetProgressList {
  readonly budgets = input.required<BudgetProgress[]>();
  protected readonly formatCurrency = formatCurrency;
  protected readonly isExpanded = signal(false);

  protected readonly visibleBudgets = computed(() => {
    const allBudgets = this.budgets();

    if (this.isExpanded() || allBudgets.length <= 1) {
      return allBudgets;
    }

    return allBudgets.slice(0, 1);
  });

  protected readonly hiddenBudgetsCount = computed(() =>
    Math.max(this.budgets().length - 1, 0),
  );

  protected toggleExpanded(): void {
    this.isExpanded.update((expanded) => !expanded);
  }

  protected progressPercent(budget: BudgetProgress): number {
    return calculateProgressPercent(budget.spentInCents, budget.plannedInCents);
  }
}
