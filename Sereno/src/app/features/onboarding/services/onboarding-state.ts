import { Injectable, signal } from '@angular/core';
import { ONBOARDING_BUDGET_CATEGORY_IDS } from '../../../core/data/system-categories';

export type OnboardingStep =
  | 'welcome'
  | 'demo-preview'
  | 'initial-balance'
  | 'income'
  | 'budgets'
  | 'completion';

export interface OnboardingBudgetDraft {
  categoryId: string;
  amountInCents: number;
}

@Injectable()
export class OnboardingState {
  readonly currentStep = signal<OnboardingStep>('welcome');
  readonly initialBalanceInCents = signal(0);
  readonly monthlyIncomeInCents = signal(0);
  readonly incomeLabel = signal('Salaire');
  readonly budgetDrafts = signal<OnboardingBudgetDraft[]>([]);
  readonly excludedBudgetCategoryIds = signal<string[]>([]);

  setStep(step: OnboardingStep): void {
    this.currentStep.set(step);
  }

  updateInitialBalance(amountInCents: number): void {
    this.initialBalanceInCents.set(amountInCents);
  }

  updateIncome(amountInCents: number, label: string): void {
    this.monthlyIncomeInCents.set(amountInCents);
    this.incomeLabel.set(label);
  }

  updateBudgetDraft(categoryId: string, amountInCents: number): void {
    this.budgetDrafts.update((drafts) => {
      const withoutCategory = drafts.filter((draft) => draft.categoryId !== categoryId);

      if (amountInCents <= 0) {
        return withoutCategory;
      }

      return [...withoutCategory, { categoryId, amountInCents }];
    });
  }

  excludeBudgetCategory(categoryId: string): void {
    this.excludedBudgetCategoryIds.update((categoryIds) =>
      categoryIds.includes(categoryId) ? categoryIds : [...categoryIds, categoryId],
    );
    this.updateBudgetDraft(categoryId, 0);
  }

  restoreBudgetCategory(categoryId: string): void {
    this.excludedBudgetCategoryIds.update((categoryIds) =>
      categoryIds.filter((currentId) => currentId !== categoryId),
    );
  }

  isBudgetCategoryExcluded(categoryId: string): boolean {
    return this.excludedBudgetCategoryIds().includes(categoryId);
  }

  getActiveBudgetCategoryIds(): string[] {
    return ONBOARDING_BUDGET_CATEGORY_IDS.filter(
      (categoryId) => !this.isBudgetCategoryExcluded(categoryId),
    );
  }

  getBudgetAmount(categoryId: string): number {
    return (
      this.budgetDrafts().find((draft) => draft.categoryId === categoryId)?.amountInCents ?? 0
    );
  }
}
