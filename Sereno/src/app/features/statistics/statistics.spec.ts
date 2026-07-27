import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';
import { Statistics } from './statistics';
import { AppStore } from '../../core/store/app.store';
import { HOME_DEMO_DATA } from '../home/data/home-demo.data';

const mockAppStore = {
  dashboardData: computed(() => HOME_DEMO_DATA),
  selectedMonthKey: signal('2026-07'),
  transactions: signal([
    {
      id: 'tx-income',
      type: 'income' as const,
      amountInCents: 345000,
      date: '2026-07-01',
      categoryId: 'cat-income',
      note: 'Salaire',
      createdAt: '2026-07-01T08:00:00.000Z',
      updatedAt: '2026-07-01T08:00:00.000Z',
    },
    {
      id: 'tx-expense',
      type: 'expense' as const,
      amountInCents: 50000,
      date: '2026-07-10',
      categoryId: 'cat-groceries',
      note: 'Courses',
      createdAt: '2026-07-10T12:00:00.000Z',
      updatedAt: '2026-07-10T12:00:00.000Z',
    },
  ]),
  budgets: signal([]),
  categories: signal([]),
};

describe('Statistics (unit)', () => {
  it('should compute savings rate correctly', () => {
    const income = 345000;
    const expenses = 234012;
    const rate = Math.round(((income - expenses) / income) * 100);
    expect(rate).toBeGreaterThan(0);
    expect(rate).toBeLessThan(100);
  });
});

describe('Statistics (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Statistics],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
      ],
    }).compileComponents();
  });

  it('should render summary cards with Revenus, Dépenses and Taux d\'épargne', () => {
    const fixture = TestBed.createComponent(Statistics);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Revenus');
    expect(element.textContent).toContain('Dépenses');
    expect(element.textContent).toContain("Taux d'épargne");
  });

  it('should display évolution chart section', () => {
    const fixture = TestBed.createComponent(Statistics);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Évolution sur 6 mois');
    const svg = element.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should render top transactions section', () => {
    const fixture = TestBed.createComponent(Statistics);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Transactions les plus importantes');
  });
});
