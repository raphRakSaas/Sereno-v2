import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { OnboardingState } from './onboarding-state';

describe('OnboardingState', () => {
  it('should exclude a budget category and clear its draft amount (unit)', () => {
    TestBed.configureTestingModule({
      providers: [OnboardingState],
    });

    const state = TestBed.inject(OnboardingState);
    state.updateBudgetDraft('cat-leisure', 15000);
    state.excludeBudgetCategory('cat-leisure');

    expect(state.isBudgetCategoryExcluded('cat-leisure')).toBe(true);
    expect(state.getBudgetAmount('cat-leisure')).toBe(0);
    expect(state.getActiveBudgetCategoryIds()).not.toContain('cat-leisure');
  });

  it('should restore an excluded budget category (integration)', () => {
    TestBed.configureTestingModule({
      providers: [OnboardingState],
    });

    const state = TestBed.inject(OnboardingState);
    state.excludeBudgetCategory('cat-restaurants');
    state.restoreBudgetCategory('cat-restaurants');

    expect(state.isBudgetCategoryExcluded('cat-restaurants')).toBe(false);
    expect(state.getActiveBudgetCategoryIds()).toContain('cat-restaurants');
  });
});
