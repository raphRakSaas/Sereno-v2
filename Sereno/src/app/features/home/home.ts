import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BalanceCard } from './components/balance-card/balance-card';
import { BudgetProgressList } from './components/budget-progress-list/budget-progress-list';
import { CategoryDonut } from './components/category-donut/category-donut';
import { RecentTransactions } from './components/recent-transactions/recent-transactions';
import { SavingsGoalCard } from './components/savings-goal-card/savings-goal-card';
import { HOME_DEMO_DATA } from './data/home-demo.data';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BalanceCard,
    BudgetProgressList,
    RecentTransactions,
    CategoryDonut,
    SavingsGoalCard,
  ],
  template: `
    <div class="grid grid-cols-12 gap-gutter">
      <div class="col-span-12 flex flex-col gap-gutter xl:col-span-8">
        <app-balance-card [summary]="dashboardData.summary" />
        <app-budget-progress-list [budgets]="dashboardData.budgets" />
        <app-recent-transactions [transactions]="dashboardData.transactions" />
      </div>

      <div class="col-span-12 flex flex-col gap-gutter xl:col-span-4">
        <app-category-donut
          [slices]="dashboardData.categorySlices"
          [totalExpensesInCents]="dashboardData.summary.expensesInCents"
        />
        <app-savings-goal-card [goal]="dashboardData.savingsGoal" />
      </div>
    </div>
  `,
})
export class Home {
  protected readonly dashboardData = HOME_DEMO_DATA;
}
