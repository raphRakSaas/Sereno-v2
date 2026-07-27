import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layout/app-shell/app-shell').then((module) => module.AppShell),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((module) => module.Home),
      },
    ],
  },
];
