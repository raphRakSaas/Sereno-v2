import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  protected readonly selectedYear = signal(2026);
  protected readonly selectedMonthIndex = signal(6);

  protected goToPreviousMonth(): void {
    const next = shiftMonth(this.selectedYear(), this.selectedMonthIndex(), -1);
    this.selectedYear.set(next.year);
    this.selectedMonthIndex.set(next.monthIndex);
  }

  protected goToNextMonth(): void {
    const next = shiftMonth(this.selectedYear(), this.selectedMonthIndex(), 1);
    this.selectedYear.set(next.year);
    this.selectedMonthIndex.set(next.monthIndex);
  }
}
