import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';
import { Budgets } from './budgets';
import { AppStore } from '../../core/store/app.store';
import { HOME_DEMO_DATA } from '../home/data/home-demo.data';

const mockAppStore = {
  dashboardData: computed(() => HOME_DEMO_DATA),
  selectedMonthKey: signal('2026-07'),
  transactions: signal([]),
  budgets: signal([]),
  categories: signal([]),
};

describe('Budgets (unit)', () => {
  it('should correctly identify over-budget categories in demo data', () => {
    const overBudget = HOME_DEMO_DATA.budgets.filter((budget) => budget.isOverBudget);
    expect(overBudget.length).toBeGreaterThan(0);
    expect(overBudget[0].categoryName).toBe('Courses');
  });
});

describe('Budgets (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Budgets],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
      ],
    }).compileComponents();
  });

  it('should render budgets page with summary cards', () => {
    const fixture = TestBed.createComponent(Budgets);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Total planifié');
    expect(element.textContent).toContain('Utilisé');
    expect(element.textContent).toContain('Restant');
  });

  it('should show warning card for over-budget categories', () => {
    const fixture = TestBed.createComponent(Budgets);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Budget dépassé');
    expect(element.textContent).toContain('Courses');
  });

  it('should display budget list with progress bars', () => {
    const fixture = TestBed.createComponent(Budgets);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Logement');
    expect(element.textContent).toContain('Transport');
    const progressBars = element.querySelectorAll('[style*="width"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should display Sereno tip card', () => {
    const fixture = TestBed.createComponent(Budgets);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Conseil Sereno');
  });
});
