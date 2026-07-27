import { TestBed } from '@angular/core/testing';
import { AppStore } from './app.store';
import { SerenoDatabase } from '../persistence/sereno-database';
import { DEFAULT_SETTINGS } from '../models/settings.model';
import { SYSTEM_CATEGORIES } from '../data/system-categories';

describe('AppStore', () => {
  let appStore: AppStore;
  const database = {
    isBrowser: true,
    open: vi.fn().mockResolvedValue(undefined),
    getSettings: vi.fn().mockResolvedValue(DEFAULT_SETTINGS),
    getAllCategories: vi.fn().mockResolvedValue(SYSTEM_CATEGORIES),
    getAllTransactions: vi.fn().mockResolvedValue([]),
    getAllBudgets: vi.fn().mockResolvedValue([]),
    getAllGoals: vi.fn().mockResolvedValue([]),
    getAllRecurrences: vi.fn().mockResolvedValue([]),
    putSettings: vi.fn().mockResolvedValue(undefined),
    putTransaction: vi.fn().mockResolvedValue(undefined),
    putBudget: vi.fn().mockResolvedValue(undefined),
    putCategory: vi.fn().mockResolvedValue(undefined),
    putGoal: vi.fn().mockResolvedValue(undefined),
    putRecurrence: vi.fn().mockResolvedValue(undefined),
    deleteTransaction: vi.fn().mockResolvedValue(undefined),
    deleteGoal: vi.fn().mockResolvedValue(undefined),
    deleteRecurrence: vi.fn().mockResolvedValue(undefined),
    deleteCategory: vi.fn().mockResolvedValue(undefined),
    deleteBudget: vi.fn().mockResolvedValue(undefined),
    clearAll: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      providers: [AppStore, { provide: SerenoDatabase, useValue: database }],
    }).compileComponents();

    appStore = TestBed.inject(AppStore);
    await appStore.initialize();
  });

  it('should compute dashboard summary from onboarding data', async () => {
    await appStore.completeOnboarding({
      initialBalanceInCents: 100000,
      monthlyIncomeInCents: 250000,
      incomeLabel: 'Salaire',
      budgets: [{ categoryId: 'cat-groceries', amountInCents: 50000 }],
    });

    const dashboard = appStore.dashboardData();

    expect(dashboard.summary.availableBalanceInCents).toBe(350000);
    expect(dashboard.summary.incomeInCents).toBe(250000);
    expect(dashboard.budgets).toHaveLength(1);
    expect(dashboard.transactions).toHaveLength(1);
  });

  it('should add a transaction to the local store', async () => {
    const transaction = await appStore.addTransaction({
      type: 'expense',
      amountInCents: 1250,
      date: '2026-07-20',
      categoryId: 'cat-groceries',
      note: 'Pain',
    });

    expect(transaction.id).toBeTruthy();
    expect(appStore.transactions()).toHaveLength(1);
    expect(database.putTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ note: 'Pain', amountInCents: 1250 }),
    );
  });

  it('should add a goal and expose it on the dashboard', async () => {
    await appStore.addGoal({
      name: 'Fonds urgence',
      targetAmountInCents: 100000,
      icon: 'savings',
    });

    expect(appStore.goals()).toHaveLength(1);
    expect(appStore.dashboardData().savingsGoal?.name).toBe('Fonds urgence');
    expect(database.putGoal).toHaveBeenCalled();
  });

  it('should add a recurrence and a custom category', async () => {
    await appStore.addCategory({
      name: 'Sport',
      icon: 'fitness_center',
      color: '#17836B',
    });
    await appStore.addRecurrence({
      type: 'expense',
      amountInCents: 4500,
      categoryId: 'cat-leisure',
      note: 'Salle de sport',
      frequency: 'monthly',
      startDate: '2026-07-01',
    });

    expect(appStore.categories().some((category) => category.name === 'Sport')).toBe(true);
    expect(appStore.recurrences()).toHaveLength(1);
  });

  it('should add a transaction linked to a goal contribution', async () => {
    await appStore.addGoal({
      name: 'Fonds urgence',
      targetAmountInCents: 100000,
      icon: 'savings',
    });
    const goalId = appStore.goals()[0].id;

    await appStore.addTransaction({
      type: 'expense',
      amountInCents: 2000,
      date: '2026-07-22',
      categoryId: 'cat-groceries',
      note: 'Épargne courses',
      goalId,
    });

    expect(appStore.goals()[0].contributions).toHaveLength(1);
    expect(appStore.goals()[0].contributions[0].amountInCents).toBe(2000);
    expect(appStore.transactions()[0].goalId).toBe(goalId);
  });

  it('should create a recurrence when adding a recurring transaction', async () => {
    const transaction = await appStore.addTransaction({
      type: 'expense',
      amountInCents: 85000,
      date: '2026-07-05',
      categoryId: 'cat-housing',
      note: 'Loyer',
      recurrence: {
        frequency: 'monthly',
        startDate: '2026-07-05',
      },
    });

    expect(transaction.recurrenceId).toBeTruthy();
    expect(appStore.recurrences()).toHaveLength(1);
    expect(appStore.recurrences()[0].frequency).toBe('monthly');
    expect(appStore.recurrences()[0].lastGeneratedAt).toBe('2026-07-05');
  });

  it('should delete a transaction', async () => {
    const transaction = await appStore.addTransaction({
      type: 'expense',
      amountInCents: 500,
      date: '2026-07-21',
      categoryId: 'cat-groceries',
      note: 'Café',
    });

    await appStore.deleteTransaction(transaction.id);

    expect(appStore.transactions()).toHaveLength(0);
    expect(database.deleteTransaction).toHaveBeenCalledWith(transaction.id);
  });
});
