import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Activity } from './activity';
import { AppStore } from '../../core/store/app.store';
import { SYSTEM_CATEGORIES } from '../../core/data/system-categories';

const deleteTransaction = vi.fn().mockResolvedValue(undefined);
const setSearchQuery = vi.fn();
const searchQuery = signal('');

const mockAppStore = {
  transactions: signal([
    {
      id: 'tx-1',
      type: 'expense' as const,
      amountInCents: 1250,
      date: '2026-07-20',
      categoryId: 'cat-groceries',
      note: 'Pain',
      createdAt: '2026-07-20T10:00:00.000Z',
      updatedAt: '2026-07-20T10:00:00.000Z',
    },
  ]),
  categories: signal(SYSTEM_CATEGORIES),
  goals: signal([]),
  searchQuery,
  setSearchQuery,
  deleteTransaction,
};

const emptyAppStore = {
  transactions: signal([]),
  categories: signal(SYSTEM_CATEGORIES),
  goals: signal([]),
  searchQuery: signal(''),
  setSearchQuery: vi.fn(),
  deleteTransaction,
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

  it('should render transactions with edit and delete actions', () => {
    const fixture = TestBed.createComponent(Activity);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Activité');
    expect(element.textContent).toContain('Pain');
    expect(element.textContent).toContain('Actions');
    expect(element.querySelector('a[href="/transactions/tx-1/modifier"]')).toBeTruthy();
    expect(element.querySelectorAll('button[aria-label^="Supprimer"]').length).toBe(1);
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
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aucune transaction');
  });
});
