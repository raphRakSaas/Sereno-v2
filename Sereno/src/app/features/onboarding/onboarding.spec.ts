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

  it('should render the Sereno logo', () => {
    const fixture = TestBed.createComponent(Onboarding);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-sereno-logo')).toBeTruthy();
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

  it('should select an income category from the dropdown and update the label', () => {
    const fixture = TestBed.createComponent(Onboarding);
    fixture.detectChanges();

    fixture.componentInstance['goToStep']('income');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('select')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Catégorie');
    expect(fixture.nativeElement.textContent).toContain('Libellé');

    fixture.componentInstance['incomeCategoryControl'].setValue('family-allowance');
    fixture.detectChanges();

    const state = fixture.debugElement.injector.get(OnboardingState);
    expect(state.incomeLabel()).toBe('Allocation familiale (CAF)');

    const labelInput = fixture.nativeElement.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement;
    expect(labelInput.value).toBe('Allocation familiale (CAF)');
  });

  it('should keep a customizable label field next to the category dropdown', () => {
    const fixture = TestBed.createComponent(Onboarding);
    fixture.detectChanges();

    fixture.componentInstance['goToStep']('income');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input[type="text"]')).toBeTruthy();

    fixture.componentInstance['incomeLabelControl'].setValue('Salaire Acme');
    fixture.detectChanges();

    const state = fixture.debugElement.injector.get(OnboardingState);
    expect(state.incomeLabel()).toBe('Salaire Acme');
  });

  it('should exclude a budget category with the trash action', () => {
    const fixture = TestBed.createComponent(Onboarding);
    fixture.detectChanges();

    fixture.componentInstance['goToStep']('budgets');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Logement');
    expect(fixture.nativeElement.textContent).toContain('Loisirs');

    const deleteLeisure = [...fixture.nativeElement.querySelectorAll('button')].find(
      (element: Element) => element.getAttribute('aria-label') === 'Retirer Loisirs',
    ) as HTMLButtonElement;

    deleteLeisure.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Catégories retirées');
    expect(fixture.nativeElement.textContent).toContain('Loisirs');

    const activeNames = [...fixture.nativeElement.querySelectorAll('ul li span.font-medium')].map(
      (element: Element) => element.textContent?.trim(),
    );
    expect(activeNames).not.toContain('Loisirs');
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
      incomeLabel: 'Salaire',
      budgets: [{ categoryId: 'cat-groceries', amountInCents: 40000 }],
    });
  });
});
