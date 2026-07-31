export type ThemePreference = 'light' | 'dark' | 'system';
export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CHF';

export interface AppSettings {
  id: 'app';
  theme: ThemePreference;
  currency: CurrencyCode;
  showCents: boolean;
  startScreen: string;
  weekStartsOnMonday: boolean;
  showQuickActions: boolean;
  locale: string;
  onboardingCompleted: boolean;
  initialBalanceInCents: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'app',
  theme: 'light',
  currency: 'EUR',
  showCents: true,
  startScreen: '/',
  weekStartsOnMonday: true,
  showQuickActions: true,
  locale: 'fr-FR',
  onboardingCompleted: false,
  initialBalanceInCents: 0,
};
