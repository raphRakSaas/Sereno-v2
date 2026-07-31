import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppStore } from '../../store/app.store';
import { PwaInstallService } from '../../pwa/pwa-install.service';
import { SerenoLogo } from '../../../shared/components/sereno-logo/sereno-logo';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, SerenoLogo],
  template: `
    <aside
      class="fixed top-0 left-0 z-20 hidden h-full w-sidebar flex-col gap-4 border-r border-border bg-surface px-4 py-6 lg:flex"
      aria-label="Navigation principale"
    >
      <div class="mb-4 px-2">
        <app-sereno-logo variant="full" size="sm" />
        <p class="mt-2 text-[13px] leading-none text-text-muted">Finance personnelle</p>
      </div>

      <a
        routerLink="/transactions/nouvelle"
        class="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        <span class="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>
        Nouvelle transaction
      </a>

      <nav class="flex-1 space-y-1">
        @for (item of navItems; track item.route) {
          <a
            class="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
            [routerLink]="item.route"
            routerLinkActive="bg-accent-surface font-semibold text-accent"
            [routerLinkActiveOptions]="{ exact: item.route === '/' }"
            #link="routerLinkActive"
            [class.text-text-muted]="!link.isActive"
            [class.hover:bg-page]="!link.isActive"
            [class.hover:text-accent]="!link.isActive"
          >
            <span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span>
            <span class="label-caps">{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="mt-auto space-y-1 border-t border-border pt-4">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted transition-colors hover:text-accent"
          (click)="installApp()"
        >
          <span class="material-symbols-outlined" aria-hidden="true">{{
            isInstalled() ? 'check_circle' : 'download'
          }}</span>
          <span class="label-caps">{{ installLabel() }}</span>
        </button>
        <a
          routerLink="/reglages"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted transition-colors hover:text-accent"
        >
          <span class="material-symbols-outlined" aria-hidden="true">lock</span>
          <span class="label-caps">Données locales</span>
        </a>
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted transition-colors hover:text-accent"
          [attr.aria-label]="'Thème actuel : ' + themeLabel()"
          (click)="toggleTheme()"
        >
          <span class="material-symbols-outlined" aria-hidden="true">{{ themeIcon() }}</span>
          <span class="label-caps">{{ themeLabel() }}</span>
        </button>
      </div>
    </aside>
  `,
})
export class Sidebar {
  private readonly appStore = inject(AppStore);
  private readonly pwaInstallService = inject(PwaInstallService);

  protected readonly isInstalled = this.pwaInstallService.isInstalled;

  protected readonly navItems: NavItem[] = [
    { label: 'Accueil', route: '/', icon: 'home' },
    { label: 'Activité', route: '/activite', icon: 'history' },
    { label: 'Calendrier', route: '/calendrier', icon: 'calendar_today' },
    { label: 'Statistiques', route: '/statistiques', icon: 'query_stats' },
    { label: 'Budgets', route: '/budgets', icon: 'account_balance_wallet' },
    { label: 'Objectifs', route: '/objectifs', icon: 'ads_click' },
    { label: 'Récurrences', route: '/recurrences', icon: 'repeat' },
    { label: 'Réglages', route: '/reglages', icon: 'settings' },
  ];

  protected readonly themeLabel = computed(() => {
    switch (this.appStore.settings().theme) {
      case 'dark':
        return 'Thème sombre';
      case 'light':
        return 'Thème clair';
      default:
        return 'Thème système';
    }
  });

  protected readonly themeIcon = computed(() => {
    switch (this.appStore.settings().theme) {
      case 'dark':
        return 'dark_mode';
      case 'light':
        return 'light_mode';
      default:
        return 'contrast';
    }
  });

  protected readonly installLabel = computed(() => {
    if (this.isInstalled()) {
      return 'Application installée';
    }

    if (this.pwaInstallService.platform() === 'ios') {
      return 'Installer (tutoriel)';
    }

    return 'Télécharger Sereno';
  });

  protected async installApp(): Promise<void> {
    await this.pwaInstallService.install();
  }

  protected toggleTheme(): void {
    this.appStore.toggleTheme();
  }
}
