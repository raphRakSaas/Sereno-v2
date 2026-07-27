import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { AppStore } from '../../store/app.store';
import { shiftMonth } from '../../../shared/utils/format-month';
import { Sidebar } from '../sidebar/sidebar';
import { TopBar } from '../top-bar/top-bar';

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
  imports: [RouterOutlet, Sidebar, TopBar],
  template: `
    <app-sidebar />
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
    <main class="ml-sidebar min-h-screen pt-16">
      <div class="mx-auto max-w-content-max px-page py-6">
        <router-outlet />
      </div>
    </main>
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
