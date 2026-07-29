import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'onboarding',
    renderMode: RenderMode.Client,
  },
  {
    path: 'transactions/:transactionId/modifier',
    renderMode: RenderMode.Client,
  },
  {
    path: 'objectifs/:goalId',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
