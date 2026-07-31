import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { AppStore } from '../../store/app.store';
import { shiftMonth } from '../../../shared/utils/format-month';
import { Sidebar } from '../sidebar/sidebar';
import { TopBar } from '../top-bar/top-bar';
import { BottomNav } from '../bottom-nav/bottom-nav';
import { PwaUpdateBanner } from '../../../shared/components/pwa-update-banner/pwa-update-banner';
import { PwaInstallGuide } from '../../../shared/components/pwa-install-guide/pwa-install-guide';
import { PwaInstallBanner } from '../../../shared/components/pwa-install-banner/pwa-install-banner';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Aperçu global',
  '/activite': 'Activité',
  '/transactions/nouvelle': 'Nouvelle transaction',
  '/calendrier': 'Calendrier',
  '/statistiques': 'Statistiques',
  '/budgets': 'Budgets',
  '/categories/nouvelle': 'Nouvelle catégorie',
  '/objectifs': 'Objectifs',
  '/objectifs/creer': 'Créer un objectif',
  '/recurrences': 'Récurrences',
  '/recurrences/creer': 'Nouvelle récurrence',
  '/reglages': 'Réglages',
};

function resolvePageTitle(url: string): string {
  const path = url.split('?')[0];
  if (PAGE_TITLES[path]) {
    return PAGE_TITLES[path];
  }
  if (path.startsWith('/transactions/') && path.endsWith('/modifier')) {
    return 'Modifier la transaction';
  }
  if (path.startsWith('/objectifs/') && path !== '/objectifs/creer') {
    return 'Détail objectif';
  }
  return 'Aperçu global';
}

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full max-w-full min-w-0 overflow-x-clip',
  },
  imports: [RouterOutlet, Sidebar, TopBar, BottomNav, PwaUpdateBanner, PwaInstallGuide, PwaInstallBanner],
  template: `
    <app-sidebar />
    <app-pwa-update-banner />
    <app-pwa-install-guide />
    <app-pwa-install-banner />
    <app-top-bar
      [pageTitle]="pageTitle()"
      [year]="selectedYear()"
      [monthIndex]="selectedMonthIndex()"
      [searchQuery]="appStore.searchQuery()"
      (previousMonth)="goToPreviousMonth()"
      (nextMonth)="goToNextMonth()"
      (searchChange)="onSearchChange($event)"
      (searchSubmit)="onSearchSubmit($event)"
    />
    <main class="min-h-screen w-full min-w-0 overflow-x-clip pt-16 lg:ml-sidebar">
      <div class="mx-auto w-full min-w-0 max-w-content-max px-4 pt-6 pb-28 sm:px-6 lg:px-page lg:pb-6">
        <router-outlet />
      </div>
    </main>
    <app-bottom-nav />
  `,
})
export class AppShell {
  protected readonly appStore = inject(AppStore);
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly pageTitle = computed(() => resolvePageTitle(this.currentUrl() ?? '/'));

  protected readonly selectedYear = computed(() => {
    const [year] = this.appStore.selectedMonthKey().split('-');
    return Number(year);
  });

  protected readonly selectedMonthIndex = computed(() => {
    const [, month] = this.appStore.selectedMonthKey().split('-');
    return Number(month) - 1;
  });

  protected goToPreviousMonth(): void {
    const next = shiftMonth(this.selectedYear(), this.selectedMonthIndex(), -1);
    this.appStore.setSelectedMonth(next.year, next.monthIndex);
  }

  protected goToNextMonth(): void {
    const next = shiftMonth(this.selectedYear(), this.selectedMonthIndex(), 1);
    this.appStore.setSelectedMonth(next.year, next.monthIndex);
  }

  protected onSearchChange(query: string): void {
    this.appStore.setSearchQuery(query);
  }

  protected onSearchSubmit(query: string): void {
    this.appStore.setSearchQuery(query);
    void this.router.navigate(['/activite'], {
      queryParams: query ? { q: query } : {},
    });
  }
}
