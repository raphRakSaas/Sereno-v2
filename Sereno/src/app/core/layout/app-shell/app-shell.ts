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
  '/calendrier': 'Calendrier',
  '/statistiques': 'Statistiques',
  '/budgets': 'Budgets',
  '/objectifs': 'Objectifs',
  '/recurrences': 'Récurrences',
  '/reglages': 'Réglages',
};

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
      (previousMonth)="goToPreviousMonth()"
      (nextMonth)="goToNextMonth()"
    />
    <main class="ml-sidebar min-h-screen pt-16">
      <div class="mx-auto max-w-content-max px-page py-6">
        <router-outlet />
      </div>
    </main>
  `,
})
export class AppShell {
  private readonly appStore = inject(AppStore);
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly pageTitle = computed(
    () => PAGE_TITLES[this.currentUrl()] ?? 'Aperçu global',
  );

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
}
