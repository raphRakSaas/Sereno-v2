export type ThemePreference = 'light' | 'dark' | 'system';

export interface AppSettings {
  id: 'app';
  theme: ThemePreference;
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
  startScreen: '/',
  weekStartsOnMonday: true,
  showQuickActions: true,
  locale: 'fr-FR',
  onboardingCompleted: false,
  initialBalanceInCents: 0,
};
