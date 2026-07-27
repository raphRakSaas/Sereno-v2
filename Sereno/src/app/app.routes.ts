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
    ],
  },
];
