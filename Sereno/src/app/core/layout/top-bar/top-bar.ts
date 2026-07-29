import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { formatMonthLabel } from '../../../shared/utils/format-month';

@Component({
  selector: 'app-top-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <header
      class="fixed inset-x-0 top-0 z-10 h-16 border-b border-border bg-page/95 lg:left-sidebar"
    >
      <div
        class="mx-auto flex h-full max-w-content-max items-center justify-between gap-2 px-4 sm:px-6 lg:px-page"
      >
        <div class="flex min-w-0 items-center gap-2 sm:gap-4">
          <h1 class="truncate text-[16px] font-semibold text-text sm:text-[20px]">
            {{ pageTitle() }}
          </h1>
          <div
            class="flex shrink-0 items-center gap-1 rounded-full border border-border bg-surface px-3 py-1"
          >
            <span class="material-symbols-outlined text-[18px] text-accent" aria-hidden="true">
              calendar_month
            </span>
            <span class="text-[13px] font-semibold text-accent">{{ monthLabel() }}</span>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-1 sm:gap-4 lg:gap-6">
          <div class="flex items-center">
            <button
              type="button"
              class="rounded-full p-2 transition-colors hover:bg-surface"
              aria-label="Mois précédent"
              (click)="previousMonth.emit()"
            >
              <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
            </button>
            <button
              type="button"
              class="rounded-full p-2 transition-colors hover:bg-surface"
              aria-label="Mois suivant"
              (click)="nextMonth.emit()"
            >
              <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
          </div>

          <div class="hidden h-6 w-px bg-border sm:block" aria-hidden="true"></div>

          <form class="relative hidden sm:block" (submit)="onSubmit($event)">
            <label class="relative block">
              <span class="sr-only">Rechercher</span>
              <span
                class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-text-muted"
                aria-hidden="true"
                >search</span
              >
              <input
                type="search"
                class="w-36 rounded-full border border-border bg-surface py-1.5 pr-4 pl-10 text-[13px] text-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 md:w-48 lg:w-64"
                placeholder="Rechercher une transaction…"
                [ngModel]="draftQuery()"
                (ngModelChange)="onQueryChange($event)"
                name="globalSearch"
              />
            </label>
          </form>
        </div>
      </div>
    </header>
  `,
})
export class TopBar {
  readonly pageTitle = input('Aperçu global');
  readonly year = input.required<number>();
  readonly monthIndex = input.required<number>();
  readonly searchQuery = input('');

  readonly previousMonth = output<void>();
  readonly nextMonth = output<void>();
  readonly searchChange = output<string>();
  readonly searchSubmit = output<string>();

  protected readonly draftQuery = signal('');

  protected readonly monthLabel = computed(() =>
    formatMonthLabel(this.year(), this.monthIndex()),
  );

  constructor() {
    // Keep draft in sync when parent updates (ex. clear from Activité).
  }

  protected onQueryChange(value: string): void {
    this.draftQuery.set(value);
    this.searchChange.emit(value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.searchSubmit.emit(this.draftQuery().trim());
  }
}
