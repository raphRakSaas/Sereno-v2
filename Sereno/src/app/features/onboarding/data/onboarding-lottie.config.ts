import { OnboardingStep } from '../../../features/onboarding/services/onboarding-state';

export const ONBOARDING_LOTTIE_PATHS: Record<OnboardingStep, string> = {
  welcome: '/onboarding/first-animation.json',
  'initial-balance': '/onboarding/second-animation.json',
  income: '/onboarding/third-animation.json',
  budgets: '/onboarding/fourth-animation.json',
  completion: '/onboarding/fourth-animation.json',
};

export const ONBOARDING_LOTTIE_LABELS: Record<OnboardingStep, string> = {
  welcome: 'Animation de bienvenue sur Sereno',
  'initial-balance': 'Animation pour la saisie du solde initial',
  income: 'Animation pour la saisie des revenus',
  budgets: 'Animation pour la définition des budgets',
  completion: 'Animation de finalisation de l’onboarding',
};
