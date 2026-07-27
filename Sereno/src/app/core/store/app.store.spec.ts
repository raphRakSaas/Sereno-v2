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
    putSettings: vi.fn().mockResolvedValue(undefined),
    putTransaction: vi.fn().mockResolvedValue(undefined),
    putBudget: vi.fn().mockResolvedValue(undefined),
    putCategory: vi.fn().mockResolvedValue(undefined),
    clearAll: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
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
});
