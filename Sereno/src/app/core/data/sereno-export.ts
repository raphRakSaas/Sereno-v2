import { Budget } from '../models/budget.model';
import { Category } from '../models/category.model';
import { SavingsGoal } from '../models/goal.model';
import { Recurrence } from '../models/recurrence.model';
import { AppSettings } from '../models/settings.model';
import { Transaction } from '../models/transaction.model';

export const SERENO_EXPORT_FORMAT = 'sereno-backup-v1';

export interface SerenoExportPayload {
  format: typeof SERENO_EXPORT_FORMAT;
  version: 1;
  exportedAt: string;
  selectedMonthKey: string;
  settings: AppSettings;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  recurrences: Recurrence[];
}

export interface SerenoImportSummary {
  mode: SerenoImportMode;
  categories: number;
  transactions: number;
  budgets: number;
  goals: number;
  recurrences: number;
}

export type SerenoImportMode = 'replace' | 'merge';

export interface SerenoDataCollections {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  recurrences: Recurrence[];
}

export const SERENO_EXPORT_CONTENT_LABELS = [
  'Réglages et solde initial',
  'Catégories',
  'Transactions',
  'Budgets',
  'Objectifs d’épargne',
  'Récurrences',
  'Mois affiché',
] as const;

export function createSerenoExportPayload(input: {
  exportedAt: string;
  selectedMonthKey: string;
  settings: AppSettings;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  recurrences: Recurrence[];
}): SerenoExportPayload {
  return {
    format: SERENO_EXPORT_FORMAT,
    version: 1,
    exportedAt: input.exportedAt,
    selectedMonthKey: input.selectedMonthKey,
    settings: input.settings,
    categories: input.categories,
    transactions: input.transactions,
    budgets: input.budgets,
    goals: input.goals,
    recurrences: input.recurrences,
  };
}

export function parseSerenoExportPayload(raw: string): SerenoExportPayload {
  const cleaned = raw.replace(/^\uFEFF/, '').trim();

  if (!cleaned) {
    throw new Error('Le fichier est vide.');
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Le fichier n’est pas un JSON valide.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Structure d’export Sereno invalide.');
  }

  const record = parsed as Record<string, unknown>;
  const version = Number(record['version']);

  if (version !== 1) {
    throw new Error('Version d’export Sereno non supportée.');
  }

  if (!record['settings'] || typeof record['settings'] !== 'object') {
    throw new Error('Le fichier ne contient pas de réglages Sereno.');
  }

  const format = record['format'];
  if (format !== undefined && format !== SERENO_EXPORT_FORMAT) {
    throw new Error('Ce fichier n’est pas une sauvegarde Sereno.');
  }

  return {
    format: SERENO_EXPORT_FORMAT,
    version: 1,
    exportedAt:
      typeof record['exportedAt'] === 'string'
        ? record['exportedAt']
        : new Date().toISOString(),
    selectedMonthKey:
      typeof record['selectedMonthKey'] === 'string' ? record['selectedMonthKey'] : '',
    settings: sanitizeSettings(record['settings'] as AppSettings),
    categories: sanitizeArray(record['categories'], sanitizeCategory),
    transactions: sanitizeArray(record['transactions'], sanitizeTransaction),
    budgets: sanitizeArray(record['budgets'], sanitizeBudget),
    goals: sanitizeArray(record['goals'], sanitizeGoal),
    recurrences: sanitizeArray(record['recurrences'], sanitizeRecurrence),
  };
}

export function summarizeSerenoImport(
  payload: SerenoExportPayload,
  mode: SerenoImportMode,
): SerenoImportSummary {
  return {
    mode,
    categories: payload.categories.length,
    transactions: payload.transactions.length,
    budgets: payload.budgets.length,
    goals: payload.goals.length,
    recurrences: payload.recurrences.length,
  };
}

export function mergeSerenoData(
  current: SerenoDataCollections,
  imported: SerenoDataCollections,
): SerenoDataCollections {
  return {
    categories: mergeRecordsById(current.categories, imported.categories),
    transactions: mergeRecordsById(current.transactions, imported.transactions),
    budgets: mergeBudgets(current.budgets, imported.budgets),
    goals: mergeGoals(current.goals, imported.goals),
    recurrences: mergeRecordsById(current.recurrences, imported.recurrences),
  };
}

function mergeRecordsById<T extends { id: string }>(current: T[], imported: T[]): T[] {
  const mergedRecords = new Map(current.map((record) => [record.id, record]));

  for (const importedRecord of imported) {
    mergedRecords.set(importedRecord.id, importedRecord);
  }

  return [...mergedRecords.values()];
}

function mergeBudgets(current: Budget[], imported: Budget[]): Budget[] {
  const mergedBudgets = new Map(current.map((budget) => [budgetKey(budget), budget]));

  for (const importedBudget of imported) {
    mergedBudgets.set(budgetKey(importedBudget), importedBudget);
  }

  return [...mergedBudgets.values()];
}

function budgetKey(budget: Budget): string {
  return `${budget.categoryId}:${budget.month}`;
}

function mergeGoals(current: SavingsGoal[], imported: SavingsGoal[]): SavingsGoal[] {
  const mergedGoals = new Map(current.map((goal) => [goal.id, goal]));

  for (const importedGoal of imported) {
    const existingGoal = mergedGoals.get(importedGoal.id);

    if (!existingGoal) {
      mergedGoals.set(importedGoal.id, importedGoal);
      continue;
    }

    mergedGoals.set(importedGoal.id, {
      ...existingGoal,
      ...importedGoal,
      createdAt: existingGoal.createdAt,
      contributions: mergeRecordsById(existingGoal.contributions, importedGoal.contributions),
    });
  }

  return [...mergedGoals.values()];
}

function sanitizeArray<T>(value: unknown, sanitize: (item: unknown) => T | null): T[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => sanitize(item))
    .filter((item): item is T => item !== null);
}

function sanitizeSettings(settings: AppSettings): AppSettings {
  const rawSettings = settings as AppSettings & { initialBalanceInCents?: unknown };

  return {
    ...settings,
    id: 'app',
    initialBalanceInCents: toInteger(rawSettings.initialBalanceInCents),
    showCents: settings.showCents !== false,
    onboardingCompleted: settings.onboardingCompleted === true,
  };
}

function sanitizeCategory(value: unknown): Category | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const category = value as Category;

  if (!category.id || !category.name) {
    return null;
  }

  return category;
}

function sanitizeTransaction(value: unknown): Transaction | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const transaction = value as Transaction;

  if (!transaction.id || !transaction.date || !transaction.categoryId) {
    return null;
  }

  return {
    ...transaction,
    type: transaction.type === 'income' ? 'income' : 'expense',
    amountInCents: toInteger(transaction.amountInCents),
    note: typeof transaction.note === 'string' ? transaction.note : '',
    createdAt: transaction.createdAt ?? new Date().toISOString(),
    updatedAt: transaction.updatedAt ?? new Date().toISOString(),
  };
}

function sanitizeBudget(value: unknown): Budget | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const budget = value as Budget;

  if (!budget.id || !budget.categoryId || !budget.month) {
    return null;
  }

  return {
    ...budget,
    amountInCents: toInteger(budget.amountInCents),
  };
}

function sanitizeGoal(value: unknown): SavingsGoal | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const goal = value as SavingsGoal;

  if (!goal.id || !goal.name) {
    return null;
  }

  return {
    ...goal,
    targetAmountInCents: toInteger(goal.targetAmountInCents),
    contributions: Array.isArray(goal.contributions)
      ? goal.contributions.map((contribution) => ({
          ...contribution,
          amountInCents: toInteger(contribution.amountInCents),
        }))
      : [],
  };
}

function sanitizeRecurrence(value: unknown): Recurrence | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const recurrence = value as Recurrence;

  if (!recurrence.id || !recurrence.startDate || !recurrence.categoryId) {
    return null;
  }

  return {
    ...recurrence,
    type: recurrence.type === 'income' ? 'income' : 'expense',
    amountInCents: toInteger(recurrence.amountInCents),
    note: typeof recurrence.note === 'string' ? recurrence.note : '',
    isPaused: recurrence.isPaused === true,
  };
}

function toInteger(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}
