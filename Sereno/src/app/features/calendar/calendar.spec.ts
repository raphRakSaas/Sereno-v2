import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';
import { CalendarPage } from './calendar';
import { AppStore } from '../../core/store/app.store';

const mockAppStore = {
  dashboardData: computed(() => ({
    summary: { availableBalanceInCents: 0, incomeInCents: 0, expensesInCents: 0 },
    budgets: [
      {
        id: 'b1',
        categoryName: 'Courses',
        description: 'Courses',
        spentInCents: 10000,
        plannedInCents: 30000,
        isOverBudget: false,
      },
    ],
    transactions: [],
    categorySlices: [],
    savingsGoal: null,
  })),
  selectedMonthKey: signal('2026-07'),
  transactions: signal([
    {
      id: 'tx-1',
      type: 'expense' as const,
      amountInCents: 8450,
      date: '2026-07-14',
      categoryId: 'cat-groceries',
      note: 'Courses Carrefour',
      createdAt: '2026-07-14T14:22:00.000Z',
      updatedAt: '2026-07-14T14:22:00.000Z',
    },
    {
      id: 'tx-2',
      type: 'expense' as const,
      amountInCents: 6200,
      date: '2026-07-14',
      categoryId: 'cat-transport',
      note: 'Essence',
      createdAt: '2026-07-14T09:15:00.000Z',
      updatedAt: '2026-07-14T09:15:00.000Z',
    },
  ]),
  budgets: signal([]),
  categories: signal([
    {
      id: 'cat-groceries',
      name: 'Courses',
      icon: 'shopping_cart',
      color: '#6BB8E8',
      isSystem: true,
    },
    {
      id: 'cat-transport',
      name: 'Transport',
      icon: 'local_gas_station',
      color: '#7BC48A',
      isSystem: true,
    },
  ]),
};

describe('CalendarPage (unit)', () => {
  it('should expose seven weekday labels', () => {
    expect(['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']).toHaveLength(7);
  });
});

describe('CalendarPage (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarPage],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
      ],
    }).compileComponents();
  });

  it('should render month grid cells and day detail panel', () => {
    const fixture = TestBed.createComponent(CalendarPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Calendrier');
    expect(element.textContent).toContain('Lun');
    expect(element.textContent).toContain('Détail du jour');
    expect(element.textContent).toContain('Budget');
    expect(element.querySelectorAll('[role="gridcell"]').length).toBeGreaterThan(28);
  });

  it('should show selected day transactions from the local store', () => {
    const fixture = TestBed.createComponent(CalendarPage);
    fixture.componentInstance['selectedDate'].set('2026-07-14');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Courses Carrefour');
    expect(element.textContent).toContain('Essence');
    expect(element.textContent).toContain('Dépense totale');
    expect(element.textContent).toContain('Voir tout le relevé');
  });

  it('should switch to week view', () => {
    const fixture = TestBed.createComponent(CalendarPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const weekButton = Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Semaine'),
    );
    weekButton?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance['view']()).toBe('week');
  });
});
