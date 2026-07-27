import { Injectable, signal } from '@angular/core';

export type OnboardingStep =
  | 'welcome'
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
  readonly incomeLabel = signal('Revenu mensuel');
  readonly budgetDrafts = signal<OnboardingBudgetDraft[]>([]);

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

  getBudgetAmount(categoryId: string): number {
    return (
      this.budgetDrafts().find((draft) => draft.categoryId === categoryId)?.amountInCents ?? 0
    );
  }
}
