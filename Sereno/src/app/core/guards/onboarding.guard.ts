import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStore } from '../store/app.store';

export const onboardingCompleteGuard: CanActivateFn = () => {
  const appStore = inject(AppStore);
  const router = inject(Router);

  if (!appStore.settings().onboardingCompleted) {
    return router.createUrlTree(['/onboarding']);
  }

  return true;
};

export const onboardingPendingGuard: CanActivateFn = () => {
  const appStore = inject(AppStore);
  const router = inject(Router);

  if (appStore.settings().onboardingCompleted) {
    return router.createUrlTree(['/']);
  }

  return true;
};
