import { Injectable, computed, inject, signal } from '@angular/core';
import { SYSTEM_CATEGORIES } from '../data/system-categories';
import { Budget } from '../models/budget.model';
import { Category } from '../models/category.model';
import { AppSettings, DEFAULT_SETTINGS } from '../models/settings.model';
import { Transaction } from '../models/transaction.model';
import { SerenoDatabase } from '../persistence/sereno-database';
import {
  BudgetProgress,
  CategorySlice,
  HomeDashboardData,
  RecentTransaction,
} from '../../features/home/models/home.models';
import { calculateProgressPercent } from '../../shared/utils/format-currency';
import { getCurrentMonthKey, isDateInMonth } from '../../shared/utils/month-key';

export interface OnboardingPayload {
  initialBalanceInCents: number;
  monthlyIncomeInCents: number;
  incomeLabel: string;
  budgets: Array<{ categoryId: string; amountInCents: number }>;
}

@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly database = inject(SerenoDatabase);

  readonly settings = signal<AppSettings>(DEFAULT_SETTINGS);
  readonly categories = signal<Category[]>([]);
  readonly transactions = signal<Transaction[]>([]);
  readonly budgets = signal<Budget[]>([]);
  readonly isReady = signal(false);

  readonly selectedMonthKey = signal(getCurrentMonthKey());

  readonly dashboardData = computed<HomeDashboardData>(() => {
    const monthKey = this.selectedMonthKey();
    const settings = this.settings();
    const categoriesById = new Map(this.categories().map((category) => [category.id, category]));
    const monthTransactions = this.transactions().filter((transaction) =>
      isDateInMonth(transaction.date, monthKey),
    );

    const incomeInCents = monthTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amountInCents, 0);

    const expensesInCents = monthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amountInCents, 0);

    const availableBalanceInCents =
      settings.initialBalanceInCents + incomeInCents - expensesInCents;

    const monthBudgets = this.budgets().filter((budget) => budget.month === monthKey);

    const budgetProgress: BudgetProgress[] = monthBudgets.map((budget) => {
      const category = categoriesById.get(budget.categoryId);
      const spentInCents = monthTransactions
        .filter(
          (transaction) =>
            transaction.type === 'expense' && transaction.categoryId === budget.categoryId,
        )
        .reduce((total, transaction) => total + transaction.amountInCents, 0);

      return {
        id: budget.id,
        categoryName: category?.name ?? 'Catégorie',
        description: category?.name ?? '',
        spentInCents,
        plannedInCents: budget.amountInCents,
        isOverBudget: spentInCents > budget.amountInCents,
      };
    });

    const recentTransactions: RecentTransaction[] = [...this.transactions()]
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 8)
      .map((transaction) => {
        const category = categoriesById.get(transaction.categoryId);

        return {
          id: transaction.id,
          label: transaction.note || category?.name || 'Transaction',
          note: transaction.note,
          categoryName: category?.name ?? 'Autre',
          categoryTone: transaction.type === 'income' ? 'income' : 'accent',
          dateLabel: formatShortDate(transaction.date),
          amountInCents:
            transaction.type === 'expense'
              ? -transaction.amountInCents
              : transaction.amountInCents,
          type: transaction.type,
          icon: category?.icon ?? 'receipt_long',
          hasReceipt: Boolean(transaction.receiptId),
        };
      });

    const expensesByCategory = new Map<string, number>();
    monthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const current = expensesByCategory.get(transaction.categoryId) ?? 0;
        expensesByCategory.set(transaction.categoryId, current + transaction.amountInCents);
      });

    const categorySlices: CategorySlice[] = buildCategorySlices(
      expensesByCategory,
      categoriesById,
      expensesInCents,
    );

    return {
      summary: {
        availableBalanceInCents,
        incomeInCents,
        expensesInCents,
      },
      budgets: budgetProgress,
      transactions: recentTransactions,
      categorySlices,
      savingsGoal: null,
    };
  });

  async initialize(): Promise<void> {
    if (!this.database.isBrowser) {
      this.isReady.set(true);
      return;
    }

    await this.database.open();
    await this.seedCategoriesIfNeeded();

    const [settings, categories, transactions, budgets] = await Promise.all([
      this.database.getSettings(),
      this.database.getAllCategories(),
      this.database.getAllTransactions(),
      this.database.getAllBudgets(),
    ]);

    this.settings.set(settings ?? DEFAULT_SETTINGS);
    this.categories.set(categories);
    this.transactions.set(transactions);
    this.budgets.set(budgets);
    this.isReady.set(true);
  }

  async completeOnboarding(payload: OnboardingPayload): Promise<void> {
    const now = new Date().toISOString();
    const monthKey = getCurrentMonthKey();
    const firstDayOfMonth = `${monthKey}-01`;

    const settings: AppSettings = {
      ...DEFAULT_SETTINGS,
      onboardingCompleted: true,
      initialBalanceInCents: payload.initialBalanceInCents,
    };

    await this.database.putSettings(settings);
    this.settings.set(settings);

    if (payload.monthlyIncomeInCents > 0) {
      const incomeTransaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'income',
        amountInCents: payload.monthlyIncomeInCents,
        date: firstDayOfMonth,
        categoryId: 'cat-income',
        note: payload.incomeLabel || 'Revenu mensuel',
        createdAt: now,
        updatedAt: now,
      };

      await this.database.putTransaction(incomeTransaction);
      this.transactions.update((transactions) => [...transactions, incomeTransaction]);
    }

    const createdBudgets: Budget[] = [];

    for (const budgetInput of payload.budgets) {
      if (budgetInput.amountInCents <= 0) {
        continue;
      }

      const budget: Budget = {
        id: crypto.randomUUID(),
        categoryId: budgetInput.categoryId,
        month: monthKey,
        amountInCents: budgetInput.amountInCents,
      };

      await this.database.putBudget(budget);
      createdBudgets.push(budget);
    }

    this.budgets.update((budgets) => [...budgets, ...createdBudgets]);
  }

  async loadDemoData(): Promise<void> {
    await this.database.clearAll();
    await this.seedCategoriesIfNeeded();

    const now = new Date().toISOString();
    const monthKey = getCurrentMonthKey();

    const settings: AppSettings = {
      ...DEFAULT_SETTINGS,
      onboardingCompleted: true,
      initialBalanceInCents: 285988,
    };

    const demoTransactions: Transaction[] = [
      createDemoTransaction('expense', 6420, '2026-07-12', 'cat-groceries', 'Courses Carrefour'),
      createDemoTransaction('income', 345000, '2026-07-01', 'cat-income', 'Salaire'),
      createDemoTransaction('expense', 11200, '2026-06-28', 'cat-transport', 'Essence'),
      createDemoTransaction('expense', 4250, '2026-06-24', 'cat-restaurants', 'Restaurant'),
      createDemoTransaction('expense', 1099, '2026-06-20', 'cat-subscriptions', 'Spotify'),
      createDemoTransaction('expense', 1890, '2026-06-18', 'cat-health', 'Pharmacie'),
    ].map((transaction) => ({ ...transaction, createdAt: now, updatedAt: now }));

    const demoBudgets: Budget[] = [
      { id: crypto.randomUUID(), categoryId: 'cat-housing', month: monthKey, amountInCents: 120000 },
      { id: crypto.randomUUID(), categoryId: 'cat-groceries', month: monthKey, amountInCents: 50000 },
      { id: crypto.randomUUID(), categoryId: 'cat-transport', month: monthKey, amountInCents: 25000 },
    ];

    await this.database.putSettings(settings);
    await Promise.all(demoTransactions.map((transaction) => this.database.putTransaction(transaction)));
    await Promise.all(demoBudgets.map((budget) => this.database.putBudget(budget)));

    this.settings.set(settings);
    this.transactions.set(demoTransactions);
    this.budgets.set(demoBudgets);
  }

  setSelectedMonth(year: number, monthIndex: number): void {
    const month = (monthIndex + 1).toString().padStart(2, '0');
    this.selectedMonthKey.set(`${year}-${month}`);
  }

  private async seedCategoriesIfNeeded(): Promise<void> {
    const existingCategories = await this.database.getAllCategories();

    if (existingCategories.length > 0) {
      return;
    }

    await Promise.all(
      SYSTEM_CATEGORIES.map((category) => this.database.putCategory(category)),
    );
    this.categories.set(SYSTEM_CATEGORIES);
  }
}

function createDemoTransaction(
  type: Transaction['type'],
  amountInCents: number,
  date: string,
  categoryId: string,
  note: string,
): Omit<Transaction, 'createdAt' | 'updatedAt'> {
  return {
    id: crypto.randomUUID(),
    type,
    amountInCents,
    date,
    categoryId,
    note,
  };
}

function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function buildCategorySlices(
  expensesByCategory: Map<string, number>,
  categoriesById: Map<string, Category>,
  totalExpensesInCents: number,
): CategorySlice[] {
  if (totalExpensesInCents <= 0) {
    return [];
  }

  const colorClasses = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4'];
  const sortedEntries = [...expensesByCategory.entries()].sort((left, right) => right[1] - left[1]);

  return sortedEntries.slice(0, 4).map(([categoryId, amountInCents], index) => ({
    id: categoryId,
    label: categoriesById.get(categoryId)?.name ?? 'Autre',
    percent: calculateProgressPercent(amountInCents, totalExpensesInCents),
    colorClass: colorClasses[index] ?? colorClasses[colorClasses.length - 1],
  }));
}
