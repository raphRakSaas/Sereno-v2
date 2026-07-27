import { Routes } from '@angular/router';
import { onboardingCompleteGuard, onboardingPendingGuard } from './core/guards/onboarding.guard';

export const routes: Routes = [
  {
    path: 'onboarding',
    canActivate: [onboardingPendingGuard],
    loadComponent: () =>
      import('./features/onboarding/onboarding').then((module) => module.Onboarding),
  },
  {
    path: '',
    canActivate: [onboardingCompleteGuard],
    loadComponent: () => import('./core/layout/app-shell/app-shell').then((module) => module.AppShell),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((module) => module.Home),
      },
      {
        path: 'activite',
        loadComponent: () =>
          import('./features/activity/activity').then((module) => module.Activity),
      },
      {
        path: 'calendrier',
        loadComponent: () =>
          import('./features/calendar/calendar').then((module) => module.CalendarPage),
      },
      {
        path: 'statistiques',
        loadComponent: () =>
          import('./features/statistics/statistics').then((module) => module.Statistics),
      },
      {
        path: 'budgets',
        loadComponent: () =>
          import('./features/budgets/budgets').then((module) => module.Budgets),
      },
      {
        path: 'objectifs',
        loadComponent: () =>
          import('./features/goals/goals').then((module) => module.Goals),
      },
      {
        path: 'recurrences',
        loadComponent: () =>
          import('./features/recurrences/recurrences').then((module) => module.Recurrences),
      },
      {
        path: 'reglages',
        loadComponent: () =>
          import('./features/settings/settings').then((module) => module.Settings),
      },
    ],
  },
];
