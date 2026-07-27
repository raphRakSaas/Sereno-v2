import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';
import { Activity } from './activity';
import { AppStore } from '../../core/store/app.store';
import { HOME_DEMO_DATA } from '../home/data/home-demo.data';

const mockAppStore = {
  dashboardData: computed(() => HOME_DEMO_DATA),
  selectedMonthKey: signal('2026-07'),
  transactions: signal([]),
  budgets: signal([]),
  categories: signal([]),
};

const emptyAppStore = {
  dashboardData: computed(() => ({ ...HOME_DEMO_DATA, transactions: [] })),
  selectedMonthKey: signal('2026-07'),
  transactions: signal([]),
  budgets: signal([]),
  categories: signal([]),
};

describe('Activity (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Activity],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
      ],
    }).compileComponents();
  });

  it('should render the activity page with store transactions', () => {
    const fixture = TestBed.createComponent(Activity);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Activité');
    expect(element.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
  });

  it('should display filter controls', () => {
    const fixture = TestBed.createComponent(Activity);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('input[type="search"]').length).toBeGreaterThan(0);
    expect(element.querySelectorAll('select').length).toBeGreaterThanOrEqual(3);
  });
});

describe('Activity empty state (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Activity],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: emptyAppStore },
      ],
    }).compileComponents();
  });

  it('should show an empty list when the local store has no transactions', () => {
    const fixture = TestBed.createComponent(Activity);
    fixture.detectChanges();
    expect(fixture.componentInstance['allTransactions']()).toEqual([]);
  });
});
