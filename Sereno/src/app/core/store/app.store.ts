import { Injectable, computed, inject, signal } from '@angular/core';
import { SYSTEM_CATEGORIES } from '../data/system-categories';
import { Budget } from '../models/budget.model';
import { Category } from '../models/category.model';
import { GoalContribution, SavingsGoal } from '../models/goal.model';
import { Recurrence } from '../models/recurrence.model';
import { AppSettings, DEFAULT_SETTINGS } from '../models/settings.model';
import { Transaction, TransactionType } from '../models/transaction.model';
import { SerenoDatabase } from '../persistence/sereno-database';
import {
  BudgetProgress,
  CategorySlice,
  HomeDashboardData,
  RecentTransaction,
  SavingsGoalSummary,
} from '../../features/home/models/home.models';
import { calculateProgressPercent } from '../../shared/utils/format-currency';
import { getCurrentMonthKey, isDateInMonth } from '../../shared/utils/month-key';

export interface OnboardingPayload {
  initialBalanceInCents: number;
  monthlyIncomeInCents: number;
  incomeLabel: string;
  budgets: Array<{ categoryId: string; amountInCents: number }>;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amountInCents: number;
  date: string;
  categoryId: string;
  note: string;
  goalId?: string;
  /** Si présent, crée aussi une récurrence et lie la transaction. */
  recurrence?: {
    frequency: Recurrence['frequency'];
    startDate: string;
    endDate?: string;
  };
}

export interface CreateCategoryInput {
  name: string;
  icon: string;
  color: string;
}

export interface CreateGoalInput {
  name: string;
  targetAmountInCents: number;
  targetDate?: string;
  icon: string;
}

export interface CreateRecurrenceInput {
  type: TransactionType;
  amountInCents: number;
  categoryId: string;
  note: string;
  frequency: Recurrence['frequency'];
  startDate: string;
  endDate?: string;
}

@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly database = inject(SerenoDatabase);

  readonly settings = signal<AppSettings>(DEFAULT_SETTINGS);
  readonly categories = signal<Category[]>([]);
  readonly transactions = signal<Transaction[]>([]);
  readonly budgets = signal<Budget[]>([]);
  readonly goals = signal<SavingsGoal[]>([]);
  readonly recurrences = signal<Recurrence[]>([]);
  readonly isReady = signal(false);

  readonly selectedMonthKey = signal(getCurrentMonthKey());

  readonly activeCategories = computed(() =>
    this.categories().filter((category) => !category.archivedAt),
  );

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
      savingsGoal: pickPrimarySavingsGoal(this.goals(), monthKey),
    };
  });

  async initialize(): Promise<void> {
    if (!this.database.isBrowser) {
      this.isReady.set(true);
      return;
    }

    await this.database.open();
    await this.seedCategoriesIfNeeded();

    const [settings, categories, transactions, budgets, goals, recurrences] = await Promise.all([
      this.database.getSettings(),
      this.database.getAllCategories(),
      this.database.getAllTransactions(),
      this.database.getAllBudgets(),
      this.database.getAllGoals(),
      this.database.getAllRecurrences(),
    ]);

    this.settings.set(settings ?? DEFAULT_SETTINGS);
    this.categories.set(categories);
    this.transactions.set(transactions);
    this.budgets.set(budgets);
    this.goals.set(goals);
    this.recurrences.set(recurrences);
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
    this.goals.set([]);
    this.recurrences.set([]);
  }

  async addTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const now = new Date().toISOString();
    const goalId = input.goalId?.trim() || undefined;

    let recurrenceId: string | undefined;
    if (input.recurrence) {
      const recurrence = await this.addRecurrence({
        type: input.type,
        amountInCents: input.amountInCents,
        categoryId: input.categoryId,
        note: input.note.trim() || 'Transaction récurrente',
        frequency: input.recurrence.frequency,
        startDate: input.recurrence.startDate,
        endDate: input.recurrence.endDate,
      });
      recurrenceId = recurrence.id;

      const withGenerated: Recurrence = {
        ...recurrence,
        lastGeneratedAt: input.date,
        updatedAt: now,
      };
      await this.database.putRecurrence(withGenerated);
      this.recurrences.update((recurrences) =>
        recurrences.map((item) => (item.id === recurrence.id ? withGenerated : item)),
      );
    }

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: input.type,
      amountInCents: input.amountInCents,
      date: input.date,
      categoryId: input.categoryId,
      note: input.note.trim(),
      goalId,
      recurrenceId,
      createdAt: now,
      updatedAt: now,
    };

    await this.database.putTransaction(transaction);
    this.transactions.update((transactions) => [...transactions, transaction]);

    if (goalId) {
      await this.addGoalContribution(goalId, input.amountInCents, input.date, transaction.id);
    }

    return transaction;
  }

  async updateTransaction(
    transactionId: string,
    patch: Partial<CreateTransactionInput>,
  ): Promise<void> {
    const existing = this.transactions().find((transaction) => transaction.id === transactionId);
    if (!existing) {
      throw new Error('Transaction introuvable');
    }

    const nextGoalId =
      patch.goalId !== undefined ? patch.goalId.trim() || undefined : existing.goalId;

    const updated: Transaction = {
      ...existing,
      type: patch.type ?? existing.type,
      amountInCents: patch.amountInCents ?? existing.amountInCents,
      date: patch.date ?? existing.date,
      categoryId: patch.categoryId ?? existing.categoryId,
      note: patch.note !== undefined ? patch.note.trim() : existing.note,
      goalId: nextGoalId,
      updatedAt: new Date().toISOString(),
    };

    await this.database.putTransaction(updated);
    this.transactions.update((transactions) =>
      transactions.map((transaction) =>
        transaction.id === transactionId ? updated : transaction,
      ),
    );

    await this.syncTransactionGoalContribution(existing, updated);
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    const existing = this.transactions().find((transaction) => transaction.id === transactionId);
    await this.database.deleteTransaction(transactionId);
    this.transactions.update((transactions) =>
      transactions.filter((transaction) => transaction.id !== transactionId),
    );

    if (existing?.goalId) {
      await this.removeGoalContributionByTransaction(existing.goalId, transactionId);
    }
  }

  async addCategory(input: CreateCategoryInput): Promise<Category> {
    const category: Category = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      icon: input.icon,
      color: input.color,
      isSystem: false,
    };

    await this.database.putCategory(category);
    this.categories.update((categories) => [...categories, category]);
    return category;
  }

  async archiveCategory(categoryId: string): Promise<void> {
    const existing = this.categories().find((category) => category.id === categoryId);
    if (!existing || existing.isSystem) {
      throw new Error('Catégorie non archivable');
    }

    const archived: Category = {
      ...existing,
      archivedAt: new Date().toISOString(),
    };

    await this.database.putCategory(archived);
    this.categories.update((categories) =>
      categories.map((category) => (category.id === categoryId ? archived : category)),
    );
  }

  async addGoal(input: CreateGoalInput): Promise<SavingsGoal> {
    const goal: SavingsGoal = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      targetAmountInCents: input.targetAmountInCents,
      targetDate: input.targetDate || undefined,
      icon: input.icon,
      createdAt: new Date().toISOString(),
      contributions: [],
    };

    await this.database.putGoal(goal);
    this.goals.update((goals) => [...goals, goal]);
    return goal;
  }

  async addGoalContribution(
    goalId: string,
    amountInCents: number,
    date = getTodayIsoDate(),
    transactionId?: string,
  ): Promise<void> {
    const existing = this.goals().find((goal) => goal.id === goalId);
    if (!existing) {
      throw new Error('Objectif introuvable');
    }

    const contribution: GoalContribution = {
      id: crypto.randomUUID(),
      amountInCents,
      date,
      transactionId,
    };

    const updated: SavingsGoal = {
      ...existing,
      contributions: [...existing.contributions, contribution],
      completedAt: undefined,
    };

    const savedInCents = sumContributions(updated.contributions);
    if (savedInCents >= updated.targetAmountInCents) {
      updated.completedAt = new Date().toISOString();
    }

    await this.database.putGoal(updated);
    this.goals.update((goals) => goals.map((goal) => (goal.id === goalId ? updated : goal)));
  }

  async deleteGoalContribution(goalId: string, contributionId: string): Promise<void> {
    const existing = this.goals().find((goal) => goal.id === goalId);
    if (!existing) {
      throw new Error('Objectif introuvable');
    }

    const updated: SavingsGoal = {
      ...existing,
      contributions: existing.contributions.filter(
        (contribution) => contribution.id !== contributionId,
      ),
      completedAt: undefined,
    };

    const savedInCents = sumContributions(updated.contributions);
    if (savedInCents >= updated.targetAmountInCents) {
      updated.completedAt = existing.completedAt ?? new Date().toISOString();
    } else {
      updated.completedAt = undefined;
    }

    await this.database.putGoal(updated);
    this.goals.update((goals) => goals.map((goal) => (goal.id === goalId ? updated : goal)));
  }

  async updateGoal(goalId: string, patch: Partial<CreateGoalInput>): Promise<void> {
    const existing = this.goals().find((goal) => goal.id === goalId);
    if (!existing) {
      throw new Error('Objectif introuvable');
    }

    const updated: SavingsGoal = {
      ...existing,
      name: patch.name !== undefined ? patch.name.trim() : existing.name,
      targetAmountInCents: patch.targetAmountInCents ?? existing.targetAmountInCents,
      targetDate:
        patch.targetDate !== undefined ? patch.targetDate || undefined : existing.targetDate,
      icon: patch.icon ?? existing.icon,
    };

    await this.database.putGoal(updated);
    this.goals.update((goals) => goals.map((goal) => (goal.id === goalId ? updated : goal)));
  }

  async deleteGoal(goalId: string): Promise<void> {
    await this.database.deleteGoal(goalId);
    this.goals.update((goals) => goals.filter((goal) => goal.id !== goalId));
  }

  async addRecurrence(input: CreateRecurrenceInput): Promise<Recurrence> {
    const now = new Date().toISOString();
    const recurrence: Recurrence = {
      id: crypto.randomUUID(),
      type: input.type,
      amountInCents: input.amountInCents,
      categoryId: input.categoryId,
      note: input.note.trim(),
      frequency: input.frequency,
      startDate: input.startDate,
      endDate: input.endDate || undefined,
      isPaused: false,
      createdAt: now,
      updatedAt: now,
    };

    await this.database.putRecurrence(recurrence);
    this.recurrences.update((recurrences) => [...recurrences, recurrence]);
    return recurrence;
  }

  async updateRecurrence(
    recurrenceId: string,
    patch: Partial<CreateRecurrenceInput & { isPaused: boolean }>,
  ): Promise<void> {
    const existing = this.recurrences().find((recurrence) => recurrence.id === recurrenceId);
    if (!existing) {
      throw new Error('Récurrence introuvable');
    }

    const updated: Recurrence = {
      ...existing,
      ...patch,
      note: patch.note !== undefined ? patch.note.trim() : existing.note,
      endDate: patch.endDate !== undefined ? patch.endDate || undefined : existing.endDate,
      updatedAt: new Date().toISOString(),
    };

    await this.database.putRecurrence(updated);
    this.recurrences.update((recurrences) =>
      recurrences.map((recurrence) =>
        recurrence.id === recurrenceId ? updated : recurrence,
      ),
    );
  }

  async deleteRecurrence(recurrenceId: string): Promise<void> {
    await this.database.deleteRecurrence(recurrenceId);
    this.recurrences.update((recurrences) =>
      recurrences.filter((recurrence) => recurrence.id !== recurrenceId),
    );
  }

  setSelectedMonth(year: number, monthIndex: number): void {
    const month = (monthIndex + 1).toString().padStart(2, '0');
    this.selectedMonthKey.set(`${year}-${month}`);
  }

  private async syncTransactionGoalContribution(
    previous: Transaction,
    next: Transaction,
  ): Promise<void> {
    if (previous.goalId) {
      await this.removeGoalContributionByTransaction(previous.goalId, previous.id);
    }

    if (next.goalId) {
      await this.addGoalContribution(
        next.goalId,
        next.amountInCents,
        next.date,
        next.id,
      );
    }
  }

  private async removeGoalContributionByTransaction(
    goalId: string,
    transactionId: string,
  ): Promise<void> {
    const existing = this.goals().find((goal) => goal.id === goalId);
    if (!existing) {
      return;
    }

    const remaining = existing.contributions.filter(
      (contribution) => contribution.transactionId !== transactionId,
    );

    if (remaining.length === existing.contributions.length) {
      return;
    }

    const updated: SavingsGoal = {
      ...existing,
      contributions: remaining,
      completedAt: undefined,
    };

    const savedInCents = sumContributions(updated.contributions);
    if (savedInCents >= updated.targetAmountInCents) {
      updated.completedAt = existing.completedAt ?? new Date().toISOString();
    }

    await this.database.putGoal(updated);
    this.goals.update((goals) => goals.map((goal) => (goal.id === goalId ? updated : goal)));
  }

  private async seedCategoriesIfNeeded(): Promise<void> {
    const existingCategories = await this.database.getAllCategories();

    if (existingCategories.length > 0) {
      return;
    }

    await Promise.all(SYSTEM_CATEGORIES.map((category) => this.database.putCategory(category)));
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

function getTodayIsoDate(): string {
  const today = new Date();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function sumContributions(contributions: GoalContribution[]): number {
  return contributions.reduce((total, contribution) => total + contribution.amountInCents, 0);
}

function pickPrimarySavingsGoal(
  goals: SavingsGoal[],
  monthKey: string,
): SavingsGoalSummary | null {
  const activeGoal =
    goals.find((goal) => !goal.completedAt) ??
    [...goals].sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

  if (!activeGoal) {
    return null;
  }

  const savedInCents = sumContributions(activeGoal.contributions);
  const monthlyContributionInCents = activeGoal.contributions
    .filter((contribution) => contribution.date.startsWith(monthKey))
    .reduce((total, contribution) => total + contribution.amountInCents, 0);

  return {
    id: activeGoal.id,
    name: activeGoal.name,
    targetDateLabel: activeGoal.targetDate
      ? `Objectif : ${formatMonthYear(activeGoal.targetDate)}`
      : 'Sans date cible',
    savedInCents,
    targetInCents: activeGoal.targetAmountInCents,
    monthlyContributionInCents,
    icon: activeGoal.icon,
  };
}

function formatMonthYear(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    month: 'long',
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
