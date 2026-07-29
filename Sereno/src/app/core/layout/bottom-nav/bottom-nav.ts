import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppStore } from '../../store/app.store';

interface NavItem {
  label: string;
  route: string;
  icon: string;
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
        class="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 rounded-t-2xl border border-border bg-surface p-3 shadow-xl lg:hidden"
      >
        <nav class="space-y-1" aria-label="Navigation secondaire">
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

    <a
      routerLink="/transactions/nouvelle"
      class="fixed bottom-[calc(2.25rem+env(safe-area-inset-bottom))] left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-opacity hover:opacity-90 lg:hidden"
      aria-label="Nouvelle transaction"
      (click)="closeMore()"
    >
      <span class="material-symbols-outlined text-[26px]" aria-hidden="true">add</span>
    </a>

    <nav
      class="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Navigation principale"
    >
      @for (item of leftItems; track item.route) {
        <a
          class="flex flex-1 flex-col items-center justify-center gap-0.5"
          [routerLink]="item.route"
          routerLinkActive="text-accent"
          [routerLinkActiveOptions]="{ exact: item.route === '/' }"
          #link="routerLinkActive"
          [class.text-text-muted]="!link.isActive"
        >
          <span class="material-symbols-outlined text-[22px]" aria-hidden="true">{{
            item.icon
          }}</span>
          <span class="text-[10px] font-medium">{{ item.label }}</span>
        </a>
      }

      <div class="w-14 flex-none" aria-hidden="true"></div>

      @for (item of rightItems; track item.route) {
        <a
          class="flex flex-1 flex-col items-center justify-center gap-0.5"
          [routerLink]="item.route"
          routerLinkActive="text-accent"
          #link="routerLinkActive"
          [class.text-text-muted]="!link.isActive"
        >
          <span class="material-symbols-outlined text-[22px]" aria-hidden="true">{{
            item.icon
          }}</span>
          <span class="text-[10px] font-medium">{{ item.label }}</span>
        </a>
      }

      <button
        type="button"
        class="flex flex-1 flex-col items-center justify-center gap-0.5"
        [class.text-accent]="isMoreOpen()"
        [class.text-text-muted]="!isMoreOpen()"
        aria-controls="bottom-nav-more-sheet"
        [attr.aria-expanded]="isMoreOpen()"
        aria-label="Plus d'options"
        (click)="toggleMore()"
      >
        <span class="material-symbols-outlined text-[22px]" aria-hidden="true">more_horiz</span>
        <span class="text-[10px] font-medium">Plus</span>
      </button>
    </nav>
  `,
})
export class BottomNav {
  private readonly appStore = inject(AppStore);

  protected readonly isMoreOpen = signal(false);

  protected readonly leftItems: NavItem[] = [
    { label: 'Accueil', route: '/', icon: 'home' },
    { label: 'Activité', route: '/activite', icon: 'history' },
    { label: 'Calendrier', route: '/calendrier', icon: 'calendar_today' },
  ];

  protected readonly rightItems: NavItem[] = [
    { label: 'Budgets', route: '/budgets', icon: 'account_balance_wallet' },
    { label: 'Objectifs', route: '/objectifs', icon: 'ads_click' },
  ];

  protected readonly moreItems: NavItem[] = [
    { label: 'Statistiques', route: '/statistiques', icon: 'query_stats' },
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
