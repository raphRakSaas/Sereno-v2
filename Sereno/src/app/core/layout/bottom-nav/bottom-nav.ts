import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppStore } from '../../store/app.store';
import { PwaInstallService } from '../../pwa/pwa-install.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (isMoreOpen()) {
      <button
        type="button"
        class="fixed inset-0 z-30 bg-black/30 lg:hidden"
        aria-label="Fermer le menu"
        (click)="closeMore()"
      ></button>

      <div
        id="bottom-nav-more-sheet"
        class="fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom))] left-4 right-4 z-40 rounded-2xl border border-border bg-surface p-3 shadow-xl lg:hidden"
      >
        <nav class="space-y-1" aria-label="Navigation secondaire">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
            [class.text-accent]="isInstalled()"
            [class.text-text-muted]="!isInstalled()"
            (click)="installApp()"
          >
            <span class="material-symbols-outlined" aria-hidden="true">{{
              isInstalled() ? 'check_circle' : 'download'
            }}</span>
            <span class="text-[14px]">{{ installLabel() }}</span>
          </button>

          @for (item of moreItems; track item.route) {
            <a
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
              [routerLink]="item.route"
              routerLinkActive="bg-accent-surface font-semibold text-accent"
              #link="routerLinkActive"
              [class.text-text-muted]="!link.isActive"
              (click)="closeMore()"
            >
              <span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span>
              <span class="text-[14px]">{{ item.label }}</span>
            </a>
          }
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-text-muted transition-colors"
            [attr.aria-label]="'Thème actuel : ' + themeLabel()"
            (click)="toggleTheme()"
          >
            <span class="material-symbols-outlined" aria-hidden="true">{{ themeIcon() }}</span>
            <span class="text-[14px]">{{ themeLabel() }}</span>
          </button>
        </nav>
      </div>
    }

    <nav
      class="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-4 right-4 z-30 grid grid-cols-6 items-end gap-0 rounded-2xl border border-border bg-surface px-1 py-2 shadow-[0_8px_30px_rgba(23,20,18,0.12)] lg:hidden"
      aria-label="Navigation principale"
    >
      @for (item of leftItems; track item.route) {
        <a
          [routerLink]="item.route"
          [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
          routerLinkActive=""
          #link="routerLinkActive"
          class="flex min-w-0 flex-col items-center justify-end gap-0.5 px-0.5 py-1 text-center transition-colors"
          [class.text-accent]="link.isActive"
          [class.text-text-muted]="!link.isActive"
        >
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            [class.bg-accent-surface]="link.isActive"
          >
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true">{{ item.icon }}</span>
          </span>
          <span class="w-full truncate text-[10px] font-medium leading-none">{{ item.label }}</span>
        </a>
      }

      <a
        routerLink="/transactions/nouvelle"
        class="flex min-w-0 flex-col items-center justify-end gap-0.5 px-0.5 py-1 text-center text-accent"
        aria-label="Nouvelle transaction"
        (click)="closeMore()"
      >
        <span
          class="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-md transition-opacity hover:opacity-90"
        >
          <span class="material-symbols-outlined text-[22px]" aria-hidden="true">add</span>
        </span>
        <span class="w-full truncate text-[10px] font-semibold leading-none">Ajouter</span>
      </a>

      @for (item of rightItems; track item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive=""
          #link="routerLinkActive"
          class="flex min-w-0 flex-col items-center justify-end gap-0.5 px-0.5 py-1 text-center transition-colors"
          [class.text-accent]="link.isActive"
          [class.text-text-muted]="!link.isActive"
        >
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            [class.bg-accent-surface]="link.isActive"
          >
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true">{{ item.icon }}</span>
          </span>
          <span class="w-full truncate text-[10px] font-medium leading-none">{{ item.label }}</span>
        </a>
      }

      <button
        type="button"
        class="flex min-w-0 flex-col items-center justify-end gap-0.5 px-0.5 py-1 text-center transition-colors"
        [class.text-accent]="isMoreOpen()"
        [class.text-text-muted]="!isMoreOpen()"
        aria-controls="bottom-nav-more-sheet"
        [attr.aria-expanded]="isMoreOpen()"
        aria-label="Plus d'options"
        (click)="toggleMore()"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          [class.bg-accent-surface]="isMoreOpen()"
        >
          <span class="material-symbols-outlined text-[20px]" aria-hidden="true">more_horiz</span>
        </span>
        <span class="w-full truncate text-[10px] font-medium leading-none">Plus</span>
      </button>
    </nav>
  `,
})
export class BottomNav {
  private readonly appStore = inject(AppStore);
  private readonly pwaInstallService = inject(PwaInstallService);

  protected readonly isInstalled = this.pwaInstallService.isInstalled;

  protected readonly isMoreOpen = signal(false);

  protected readonly leftItems: NavItem[] = [
    { label: 'Accueil', route: '/', icon: 'home', exact: true },
    { label: 'Activité', route: '/activite', icon: 'history' },
  ];

  protected readonly rightItems: NavItem[] = [
    { label: 'Budgets', route: '/budgets', icon: 'account_balance_wallet' },
  ];

  protected readonly moreItems: NavItem[] = [
    { label: 'Calendrier', route: '/calendrier', icon: 'calendar_today' },
    { label: 'Statistiques', route: '/statistiques', icon: 'query_stats' },
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

  protected readonly installLabel = computed(() =>
    this.isInstalled() ? 'Application installée' : 'Télécharger Sereno',
  );

  protected async installApp(): Promise<void> {
    await this.pwaInstallService.install();
    this.closeMore();
  }

  protected toggleMore(): void {
    this.isMoreOpen.update((open) => !open);
  }

  protected closeMore(): void {
    this.isMoreOpen.set(false);
  }

  protected toggleTheme(): void {
    this.appStore.toggleTheme();
    this.closeMore();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMore();
  }
}
