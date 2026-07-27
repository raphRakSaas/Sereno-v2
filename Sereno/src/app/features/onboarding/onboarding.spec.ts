import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Onboarding } from './onboarding';
import { AppStore } from '../../core/store/app.store';
import { OnboardingState } from './services/onboarding-state';
import { OnboardingLottie } from '../../shared/components/onboarding-lottie/onboarding-lottie';

@Component({
  selector: 'app-onboarding-lottie',
  template: '',
})
class OnboardingLottieStub {
  readonly animationPath = input('');
  readonly ariaLabel = input('');
}

describe('Onboarding (integration)', () => {
  const completeOnboarding = vi.fn().mockResolvedValue(undefined);
  const loadDemoData = vi.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    completeOnboarding.mockClear();
    loadDemoData.mockClear();

    await TestBed.configureTestingModule({
      imports: [Onboarding],
      providers: [
        {
          provide: AppStore,
          useValue: {
            completeOnboarding,
            loadDemoData,
          },
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl: vi.fn().mockResolvedValue(true),
          },
        },
      ],
    })
      .overrideComponent(Onboarding, {
        remove: { imports: [OnboardingLottie] },
        add: { imports: [OnboardingLottieStub] },
      })
      .compileComponents();
  });

  it('should render welcome step by default', () => {
    const fixture = TestBed.createComponent(Onboarding);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Bienvenue sur Sereno');
  });

  it('should render the lottie panel', () => {
    const fixture = TestBed.createComponent(Onboarding);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-onboarding-lottie')).toBeTruthy();
  });

  it('should move to initial balance step', () => {
    const fixture = TestBed.createComponent(Onboarding);
    fixture.detectChanges();

    const button = [...fixture.nativeElement.querySelectorAll('button')].find((element: Element) =>
      element.textContent?.includes('Configurer mon espace'),
    ) as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Solde initial');
  });

  it('should persist onboarding data on completion', async () => {
    const fixture = TestBed.createComponent(Onboarding);
    const state = fixture.debugElement.injector.get(OnboardingState);

    state.setStep('completion');
    state.updateInitialBalance(150000);
    state.updateIncome(280000, 'Salaire');
    state.updateBudgetDraft('cat-groceries', 40000);

    fixture.detectChanges();

    const finishButton = fixture.nativeElement.querySelector(
      'button.bg-accent',
    ) as HTMLButtonElement | null;

    expect(finishButton).toBeTruthy();
    finishButton!.click();
    await fixture.whenStable();

    expect(completeOnboarding).toHaveBeenCalledWith({
      initialBalanceInCents: 150000,
      monthlyIncomeInCents: 280000,
      incomeLabel: 'Revenu mensuel',
      budgets: [{ categoryId: 'cat-groceries', amountInCents: 40000 }],
    });
  });
});
