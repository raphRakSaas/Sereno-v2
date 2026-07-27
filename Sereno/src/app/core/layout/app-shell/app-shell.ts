import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppStore } from '../../store/app.store';
import { shiftMonth } from '../../../shared/utils/format-month';
import { Sidebar } from '../sidebar/sidebar';
import { TopBar } from '../top-bar/top-bar';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Sidebar, TopBar],
  template: `
    <app-sidebar />
    <app-top-bar
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
