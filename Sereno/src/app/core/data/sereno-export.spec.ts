import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../models/settings.model';
import { SERENO_EXPORT_FORMAT, createSerenoExportPayload, mergeSerenoData, parseSerenoExportPayload } from './sereno-export';

describe('sereno-export', () => {
  const samplePayload = createSerenoExportPayload({
    exportedAt: '2026-07-31T12:00:00.000Z',
    selectedMonthKey: '2026-06',
    settings: {
      ...DEFAULT_SETTINGS,
      onboardingCompleted: true,
      initialBalanceInCents: 150000,
    },
    categories: [],
    transactions: [
      {
        id: 'tx-1',
        type: 'income',
        amountInCents: 250000,
        date: '2026-06-01',
        categoryId: 'cat-income',
        note: 'Salaire',
        createdAt: '2026-06-01T08:00:00.000Z',
        updatedAt: '2026-06-01T08:00:00.000Z',
      },
    ],
    budgets: [],
    goals: [],
    recurrences: [],
  });

  it('should round-trip an export payload (unit)', () => {
    const json = JSON.stringify(samplePayload);
    const parsed = parseSerenoExportPayload(json);

    expect(parsed.format).toBe(SERENO_EXPORT_FORMAT);
    expect(parsed.selectedMonthKey).toBe('2026-06');
    expect(parsed.settings.initialBalanceInCents).toBe(150000);
    expect(parsed.transactions).toHaveLength(1);
    expect(parsed.transactions[0].amountInCents).toBe(250000);
  });

  it('should strip a UTF-8 BOM before parsing (integration)', () => {
    const json = `\uFEFF${JSON.stringify(samplePayload)}`;
    const parsed = parseSerenoExportPayload(json);

    expect(parsed.transactions).toHaveLength(1);
  });

  it('should coerce string amounts from hand-edited exports', () => {
    const legacyPayload = {
      version: 1,
      exportedAt: '2026-07-31T12:00:00.000Z',
      settings: {
        ...DEFAULT_SETTINGS,
        initialBalanceInCents: '150000',
      },
      categories: [],
      transactions: [
        {
          id: 'tx-1',
          type: 'income',
          amountInCents: '250000',
          date: '2026-06-01',
          categoryId: 'cat-income',
          note: 'Salaire',
        },
      ],
      budgets: [],
      goals: [],
      recurrences: [],
    };

    const parsed = parseSerenoExportPayload(JSON.stringify(legacyPayload));

    expect(parsed.settings.initialBalanceInCents).toBe(150000);
    expect(parsed.transactions[0].amountInCents).toBe(250000);
  });

  it('should reject invalid export files', () => {
    expect(() => parseSerenoExportPayload('')).toThrow('vide');
    expect(() => parseSerenoExportPayload('{"version":2}')).toThrow('non supportée');
  });

  it('should merge collections without losing local-only records (integration)', () => {
    const merged = mergeSerenoData(
      {
        categories: [{ id: 'cat-local', name: 'Local', icon: 'star', color: '#000', isSystem: false }],
        transactions: [
          {
            id: 'tx-local',
            type: 'expense',
            amountInCents: 1000,
            date: '2026-07-01',
            categoryId: 'cat-groceries',
            note: 'Local',
            createdAt: '2026-07-01T08:00:00.000Z',
            updatedAt: '2026-07-01T08:00:00.000Z',
          },
        ],
        budgets: [
          {
            id: 'budget-local',
            categoryId: 'cat-groceries',
            month: '2026-07',
            amountInCents: 30000,
          },
        ],
        goals: [],
        recurrences: [
          {
            id: 'rec-local',
            type: 'expense',
            amountInCents: 5000,
            categoryId: 'cat-subscriptions',
            note: 'Local recurrence',
            frequency: 'monthly',
            startDate: '2026-07-01',
            isPaused: false,
            createdAt: '2026-07-01T08:00:00.000Z',
            updatedAt: '2026-07-01T08:00:00.000Z',
          },
        ],
      },
      {
        categories: [],
        transactions: [
          {
            id: 'tx-imported',
            type: 'income',
            amountInCents: 200000,
            date: '2026-06-01',
            categoryId: 'cat-income',
            note: 'Import',
            createdAt: '2026-06-01T08:00:00.000Z',
            updatedAt: '2026-06-01T08:00:00.000Z',
          },
        ],
        budgets: [
          {
            id: 'budget-imported',
            categoryId: 'cat-groceries',
            month: '2026-06',
            amountInCents: 40000,
          },
        ],
        goals: [],
        recurrences: [],
      },
    );

    expect(merged.categories).toHaveLength(1);
    expect(merged.transactions).toHaveLength(2);
    expect(merged.budgets).toHaveLength(2);
    expect(merged.recurrences).toHaveLength(1);
  });
});
