export type TransactionType = 'expense' | 'income';

export interface DashboardSummary {
  availableBalanceInCents: number;
  incomeInCents: number;
  expensesInCents: number;
}

export interface BudgetProgress {
  id: string;
  categoryName: string;
  description: string;
  spentInCents: number;
  plannedInCents: number;
  isOverBudget: boolean;
}

export interface RecentTransaction {
  id: string;
  label: string;
  note: string;
  categoryName: string;
  categoryTone: 'accent' | 'income' | 'warning' | 'neutral';
  dateLabel: string;
  amountInCents: number;
  type: TransactionType;
  icon: string;
  hasReceipt: boolean;
}

export interface CategorySlice {
  id: string;
  label: string;
  percent: number;
  colorClass: string;
}

export interface SavingsGoalSummary {
  id: string;
  name: string;
  targetDateLabel: string;
  savedInCents: number;
  targetInCents: number;
  monthlyContributionInCents: number;
  icon: string;
}

export interface HomeDashboardData {
  summary: DashboardSummary;
  budgets: BudgetProgress[];
  transactions: RecentTransaction[];
  categorySlices: CategorySlice[];
  savingsGoal: SavingsGoalSummary;
}
