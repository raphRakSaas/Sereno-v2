import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { BudgetProgress } from '../../models/home.models';
import { BudgetProgressList } from './budget-progress-list';

const DEMO_BUDGETS: BudgetProgress[] = [
  {
    id: '1',
    categoryName: 'Logement',
    description: 'Logement',
    spentInCents: 0,
    plannedInCents: 30000,
    isOverBudget: false,
  },
  {
    id: '2',
    categoryName: 'Courses',
    description: 'Courses',
    spentInCents: 12000,
    plannedInCents: 25000,
    isOverBudget: false,
  },
  {
    id: '3',
    categoryName: 'Transport',
    description: 'Transport',
    spentInCents: 5000,
    plannedInCents: 10000,
    isOverBudget: false,
  },
];

describe('BudgetProgressList', () => {
  let fixture: ComponentFixture<BudgetProgressList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetProgressList],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetProgressList);
    fixture.componentRef.setInput('budgets', DEMO_BUDGETS);
    fixture.detectChanges();
  });

  it('should show only the first budget by default (unit)', () => {
    expect(fixture.nativeElement.textContent).toContain('Logement');
    expect(fixture.nativeElement.textContent).not.toContain('Courses');
    expect(fixture.nativeElement.textContent).toContain('Afficher 2 autres budgets');
  });

  it('should expand and collapse the remaining budgets (integration)', () => {
    const toggleButton = fixture.nativeElement.querySelector(
      'button[aria-expanded]',
    ) as HTMLButtonElement;

    toggleButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Courses');
    expect(fixture.nativeElement.textContent).toContain('Transport');
    expect(fixture.nativeElement.textContent).toContain('Masquer les autres budgets');

    toggleButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Courses');
  });
});
