import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BalanceCard } from './components/balance-card/balance-card';
import { BudgetProgressList } from './components/budget-progress-list/budget-progress-list';
import { CategoryDonut } from './components/category-donut/category-donut';
import { GoalsCard } from './components/goals-card/goals-card';
import { RecentTransactions } from './components/recent-transactions/recent-transactions';
import { SerenoInsightsCard } from './components/sereno-insights-card/sereno-insights-card';
import { AppStore } from '../../core/store/app.store';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BalanceCard,
    BudgetProgressList,
    RecentTransactions,
    CategoryDonut,
    GoalsCard,
    SerenoInsightsCard,
  ],
  template: `
    <div class="grid min-w-0 grid-cols-12 gap-gutter">
      <div class="col-span-12 flex flex-col gap-gutter xl:col-span-8">
        <app-balance-card [summary]="dashboardData().summary" />

        @if (dashboardData().budgets.length > 0) {
          <app-budget-progress-list [budgets]="dashboardData().budgets" />
        } @else {
          <section class="bento-card p-5">
            <h2 class="text-[13px] font-semibold uppercase tracking-wide text-text">
              Budgets mensuels
            </h2>
            <p class="mt-2 text-[12px] leading-relaxed text-text-muted">
              Tu n'as pas encore défini de budget pour ce mois. Ajoutes-en pour suivre tes plafonds
              sans te juger.
            </p>
          </section>
        }

        @if (dashboardData().transactions.length > 0) {
          <app-recent-transactions [transactions]="dashboardData().transactions" />
        } @else {
          <section class="bento-card p-5">
            <h2 class="text-[13px] font-semibold uppercase tracking-wide text-text">
              Transactions récentes
            </h2>
            <p class="mt-2 text-[12px] leading-relaxed text-text-muted">
              Aucune transaction pour le moment. Enregistre ta première dépense pour commencer à
              suivre ton mois.
            </p>
          </section>
        }
      </div>

      <div class="col-span-12 flex flex-col gap-gutter xl:col-span-4">
        @if (dashboardData().categorySlices.length > 0) {
          <app-category-donut
            [slices]="dashboardData().categorySlices"
            [totalExpensesInCents]="dashboardData().summary.expensesInCents"
          />
        } @else {
          <section class="bento-card p-5">
            <h2 class="text-[13px] font-semibold uppercase tracking-wide text-text">Répartition</h2>
            <p class="mt-2 text-[12px] leading-relaxed text-text-muted">
              Ta répartition par catégorie apparaîtra ici dès que tu auras enregistré des dépenses.
            </p>
          </section>
        }

        <app-goals-card [goal]="dashboardData().savingsGoal" />
        <app-sereno-insights-card />
      </div>
    </div>
  `,
})
export class Home {
  private readonly appStore = inject(AppStore);
  protected readonly dashboardData = this.appStore.dashboardData;
}
