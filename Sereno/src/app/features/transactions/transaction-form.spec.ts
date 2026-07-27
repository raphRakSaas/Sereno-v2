import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';
import { TransactionForm } from './transaction-form';
import { AppStore } from '../../core/store/app.store';
import { SYSTEM_CATEGORIES } from '../../core/data/system-categories';

const addTransaction = vi.fn().mockResolvedValue({ id: 'tx-1' });
const updateTransaction = vi.fn().mockResolvedValue(undefined);

const mockAppStore = {
  activeCategories: computed(() => SYSTEM_CATEGORIES),
  categories: signal(SYSTEM_CATEGORIES),
  transactions: signal([]),
  goals: signal([
    {
      id: 'goal-1',
      name: 'Fonds urgence',
      targetAmountInCents: 100000,
      icon: 'savings',
      createdAt: '2026-07-01T00:00:00.000Z',
      contributions: [],
    },
  ]),
  addTransaction,
  updateTransaction,
};

describe('TransactionForm (unit)', () => {
  it('should default to expense type in create mode', async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionForm],
      providers: [
        provideRouter([{ path: '**', component: TransactionForm }]),
        { provide: AppStore, useValue: mockAppStore },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TransactionForm);
    expect(fixture.componentInstance['transactionType']()).toBe('expense');
    expect(fixture.componentInstance['isEditMode']()).toBe(false);
  });
});

describe('TransactionForm (integration)', () => {
  beforeEach(async () => {
    addTransaction.mockClear();
    await TestBed.configureTestingModule({
      imports: [TransactionForm],
      providers: [
        provideRouter([{ path: '**', component: TransactionForm }]),
        { provide: AppStore, useValue: mockAppStore },
      ],
    }).compileComponents();
  });

  it('should render create form with recurrence toggle defaulting to no', () => {
    const fixture = TestBed.createComponent(TransactionForm);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance;

    expect(element.textContent).toContain('Nouvelle transaction');
    expect(element.textContent).toContain('Transaction récurrente');
    expect(component['isRecurring']()).toBe(false);
    expect(element.textContent).not.toContain('Tous les jours');
  });

  it('should reveal frequency options when recurring is enabled', () => {
    const fixture = TestBed.createComponent(TransactionForm);
    fixture.detectChanges();
    fixture.componentInstance['setRecurring'](true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Tous les jours');
    expect(element.textContent).toContain('Toutes les semaines');
    expect(element.textContent).toContain('Tous les mois');
    expect(element.textContent).toContain('Fin (optionnel)');
  });

  it('should render create form with goal contribution select', () => {
    const fixture = TestBed.createComponent(TransactionForm);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Contribuer à un objectif');
    expect(element.textContent).toContain('Fonds urgence');
  });

  it('should not submit when amount is zero', async () => {
    const fixture = TestBed.createComponent(TransactionForm);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['form'].patchValue({ categoryId: 'cat-groceries' });
    await component['onSubmit'](false);

    expect(addTransaction).not.toHaveBeenCalled();
    expect(component['submitted']()).toBe(true);
  });
});
