import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecentTransactions } from './recent-transactions';
import { RecentTransaction } from '../../models/home.models';

const MOCK_TRANSACTIONS: RecentTransaction[] = [
  {
    id: 'tx-1',
    label: 'Courses',
    note: 'Supermarché',
    icon: 'shopping_cart',
    categoryName: 'Alimentation',
    categoryTone: 'accent',
    dateLabel: '12 juil.',
    amountInCents: -4500,
    type: 'expense',
    hasReceipt: false,
  },
];

describe('RecentTransactions', () => {
  let fixture: ComponentFixture<RecentTransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentTransactions],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentTransactions);
    fixture.componentRef.setInput('transactions', MOCK_TRANSACTIONS);
    fixture.detectChanges();
  });

  it('should render transaction labels', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Courses');
    expect(compiled.textContent).toContain('Supermarché');
  });

  it('should not force a wide table on mobile', () => {
    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    expect(table.className).not.toContain('min-w-[640px]');
  });
});
