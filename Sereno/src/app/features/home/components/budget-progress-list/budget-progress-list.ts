import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BudgetProgress } from '../../models/home.models';
import { calculateProgressPercent, formatCurrency } from '../../../../shared/utils/format-currency';

@Component({
  selector: 'app-budget-progress-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card p-6" aria-labelledby="budgets-title">
      <header class="mb-6 flex items-center justify-between">
        <h2 id="budgets-title" class="text-[15px] font-semibold uppercase tracking-wide text-text">
          Budgets mensuels
        </h2>
        <button type="button" class="label-caps text-accent hover:underline">Gérer les limites</button>
      </header>

      <ul class="space-y-6">
        @for (budget of budgets(); track budget.id) {
          <li class="space-y-2">
            <div class="flex items-end justify-between gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-text">{{ budget.categoryName }}</p>
                  @if (budget.isOverBudget) {
                    <span class="material-symbols-outlined text-lg text-warning" aria-hidden="true">warning</span>
                  }
                </div>
                <p class="text-[13px] text-text-muted">{{ budget.description }}</p>
              </div>
              <div class="text-right">
                <span
                  class="text-sm font-medium monetary-tabular"
                  [class.text-warning]="budget.isOverBudget"
                  [class.text-text]="!budget.isOverBudget"
                >
                  {{ formatCurrency(budget.spentInCents) }}
                </span>
                <span class="text-[13px] text-text-muted">
                  / {{ formatCurrency(budget.plannedInCents) }}
                </span>
              </div>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-page">
              <div
                class="h-full rounded-full"
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
    </section>
  `,
})
export class BudgetProgressList {
  readonly budgets = input.required<BudgetProgress[]>();
  protected readonly formatCurrency = formatCurrency;

  protected progressPercent(budget: BudgetProgress): number {
    return calculateProgressPercent(budget.spentInCents, budget.plannedInCents);
  }
}
