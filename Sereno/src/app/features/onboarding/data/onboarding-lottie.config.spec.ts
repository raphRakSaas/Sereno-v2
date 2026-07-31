import { ONBOARDING_LOTTIE_LABELS, ONBOARDING_LOTTIE_PATHS } from './onboarding-lottie.config';

describe('onboarding lottie config', () => {
  it('should map each onboarding step to a lottie file', () => {
    expect(ONBOARDING_LOTTIE_PATHS.welcome).toBe('/onboarding/first-animation.json');
    expect(ONBOARDING_LOTTIE_PATHS['demo-preview']).toBe('/onboarding/first-animation.json');
    expect(ONBOARDING_LOTTIE_PATHS['initial-balance']).toBe('/onboarding/second-animation.json');
    expect(ONBOARDING_LOTTIE_PATHS.income).toBe('/onboarding/third-animation.json');
    expect(ONBOARDING_LOTTIE_PATHS.budgets).toBe('/onboarding/fourth-animation.json');
    expect(ONBOARDING_LOTTIE_PATHS.completion).toBe('/onboarding/fourth-animation.json');
  });

  it('should provide accessible labels for each step', () => {
    expect(ONBOARDING_LOTTIE_LABELS.welcome).toContain('bienvenue');
    expect(ONBOARDING_LOTTIE_LABELS.completion).toContain('finalisation');
  });
});
