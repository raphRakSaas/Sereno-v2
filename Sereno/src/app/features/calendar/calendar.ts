import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppStore } from '../../core/store/app.store';
import { Transaction } from '../../core/models/transaction.model';
import {
  calculateProgressPercent,
  formatCurrency,
} from '../../shared/utils/format-currency';

interface CalendarDayCell {
  dayNumber: number;
  isoDate: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  expenses: DayTransactionView[];
  incomes: DayTransactionView[];
}

interface DayTransactionView {
  id: string;
  label: string;
  categoryName: string;
  icon: string;
  amountInCents: number;
  type: 'expense' | 'income';
  timeLabel: string;
}

type CalendarView = 'month' | 'week';

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-[18px] font-semibold text-text">Calendrier</h2>
          <p class="mt-0.5 text-[12px] capitalize text-text-muted">{{ currentMonthLabel() }}</p>
        </div>
        <div class="flex overflow-hidden rounded-lg border border-border bg-surface">
          <button
            type="button"
            class="px-3 py-1.5 text-[12px] font-medium transition-colors"
            [class.bg-accent]="view() === 'month'"
            [class.text-white]="view() === 'month'"
            [class.text-text-muted]="view() !== 'month'"
            (click)="view.set('month')"
          >
            Mois
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-[12px] font-medium transition-colors"
            [class.bg-accent]="view() === 'week'"
            [class.text-white]="view() === 'week'"
            [class.text-text-muted]="view() !== 'week'"
            (click)="view.set('week')"
          >
            Semaine
          </button>
        </div>
      </div>

      <div class="grid min-w-0 grid-cols-12 gap-gutter">
        <section class="bento-card col-span-12 overflow-hidden p-4 xl:col-span-8">
          @if (view() === 'month') {
            <div
              class="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border"
              role="grid"
              aria-label="Calendrier mensuel"
            >
              @for (label of weekdayLabels; track label) {
                <div
                  class="bg-page px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-text-muted"
                >
                  {{ label }}
                </div>
              }

              @for (day of calendarDays(); track day.isoDate) {
                <button
                  type="button"
                  role="gridcell"
                  class="relative flex min-h-[88px] flex-col items-start gap-1 bg-surface p-2 text-left transition-colors hover:bg-page sm:min-h-[100px]"
                  [class.bg-accent-surface]="selectedDate() === day.isoDate"
                  [class.ring-2]="selectedDate() === day.isoDate"
                  [class.ring-inset]="selectedDate() === day.isoDate"
                  [class.ring-accent]="selectedDate() === day.isoDate"
                  [class.opacity-45]="!day.isCurrentMonth"
                  [attr.aria-label]="'Jour ' + day.dayNumber"
                  [attr.aria-selected]="selectedDate() === day.isoDate"
                  (click)="selectDay(day.isoDate)"
                >
                  <span
                    class="inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold"
                    [class.bg-accent]="day.isToday"
                    [class.text-white]="day.isToday"
                    [class.text-text]="!day.isToday && day.isCurrentMonth"
                    [class.text-text-muted]="!day.isToday && !day.isCurrentMonth"
                  >
                    {{ day.dayNumber }}
                  </span>

                  <div class="flex w-full flex-col gap-0.5">
                    @for (expense of day.expenses.slice(0, 2); track expense.id) {
                      <span
                        class="truncate rounded px-1 py-0.5 text-[10px] font-medium text-accent bg-accent-surface"
                      >
                        {{ expense.label }}
                      </span>
                    }
                    @for (income of day.incomes.slice(0, 1); track income.id) {
                      <span
                        class="truncate rounded px-1 py-0.5 text-[10px] font-medium text-income bg-income/10"
                      >
                        {{ income.label }}
                      </span>
                    }
                    @if (day.expenses.length + day.incomes.length > 2) {
                      <span class="text-[10px] text-text-muted"
                        >+{{ day.expenses.length + day.incomes.length - 2 }}</span
                      >
                    }
                  </div>

                  @if (day.expenses.length === 0 && day.incomes.length > 0) {
                    <span
                      class="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-income"
                      aria-hidden="true"
                    ></span>
                  } @else if (day.expenses.length > 0) {
                    <span
                      class="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-accent"
                      aria-hidden="true"
                    ></span>
                  }
                </button>
              }
            </div>
          } @else {
            <div class="flex gap-2 overflow-x-auto pb-1">
              @for (day of weekDays(); track day.isoDate) {
                <button
                  type="button"
                  class="flex min-h-[110px] min-w-[72px] flex-1 flex-col rounded-xl border border-border bg-surface p-2.5 text-left transition-colors hover:border-accent/40"
                  [class.border-accent]="selectedDate() === day.isoDate"
                  [class.bg-accent-surface]="selectedDate() === day.isoDate"
                  (click)="selectDay(day.isoDate)"
                >
                  <span class="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    {{ day.weekLabel }}
                  </span>
                  <span class="mt-1 text-[18px] font-semibold text-text">{{ day.dayNumber }}</span>
                  <div class="mt-auto flex gap-0.5">
                    @if (day.expenses.length > 0) {
                      <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
                    }
                    @if (day.incomes.length > 0) {
                      <span class="h-1.5 w-1.5 rounded-full bg-income"></span>
                    }
                  </div>
                </button>
              }
            </div>
          }
        </section>

        <aside class="col-span-12 flex flex-col gap-4 xl:col-span-4">
          <section class="bento-card p-5">
            <header class="mb-4 flex items-center justify-between gap-3">
              <h3 class="text-[14px] font-semibold text-text">Détail du jour</h3>
              @if (selectedDate()) {
                <span
                  class="rounded-md bg-accent-surface px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-accent"
                >
                  {{ selectedDayBadge() }}
                </span>
              }
            </header>

            @if (!selectedDate()) {
              <p class="text-[12px] leading-relaxed text-text-muted">
                Clique sur une case du calendrier pour voir les mouvements de la journée.
              </p>
            } @else if (selectedDayTransactions().length === 0) {
              <p class="text-[12px] leading-relaxed text-text-muted">
                Journée calme — aucune transaction enregistrée.
              </p>
            } @else {
              <ul class="space-y-3">
                @for (transaction of selectedDayTransactions(); track transaction.id) {
                  <li class="flex items-start gap-3">
                    <span
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-page text-text-muted"
                      aria-hidden="true"
                    >
                      <span class="material-symbols-outlined text-[16px]">{{
                        transaction.icon
                      }}</span>
                    </span>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-[13px] font-semibold text-text">
                        {{ transaction.label }}
                      </p>
                      <p class="text-[11px] text-text-muted">{{ transaction.categoryName }}</p>
                    </div>
                    <div class="shrink-0 text-right">
                      <p
                        class="monetary-tabular text-[13px] font-semibold"
                        [class.text-accent]="transaction.type === 'expense'"
                        [class.text-income]="transaction.type === 'income'"
                      >
                        {{
                          formatCurrency(
                            transaction.type === 'expense'
                              ? -transaction.amountInCents
                              : transaction.amountInCents,
                            { showSign: true }
                          )
                        }}
                      </p>
                      <p class="text-[10px] text-text-muted">{{ transaction.timeLabel }}</p>
                    </div>
                  </li>
                }
              </ul>

              <div class="mt-4 space-y-1.5 border-t border-border pt-3">
                <div class="flex items-center justify-between">
                  <span class="text-[12px] text-text-muted">Dépense totale</span>
                  <span class="monetary-tabular text-[15px] font-semibold text-accent">
                    {{ formatCurrency(-selectedDayExpensesInCents(), { showSign: true }) }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[12px] text-text-muted">Revenus</span>
                  <span class="monetary-tabular text-[13px] font-medium text-income">
                    {{
                      selectedDayIncomeInCents() > 0
                        ? formatCurrency(selectedDayIncomeInCents(), { showSign: true })
                        : formatCurrency(0)
                    }}
                  </span>
                </div>
              </div>
            }

            <a
              routerLink="/activite"
              class="mt-4 flex w-full items-center justify-center rounded-lg border border-border py-2 text-[12px] font-semibold text-text transition-colors hover:border-accent hover:text-accent"
            >
              Voir tout le relevé
            </a>
          </section>

          <section class="rounded-xl bg-accent p-5 text-white shadow-sm">
            <p class="text-[10px] font-bold uppercase tracking-[0.08em] text-white/80">
              Budget {{ currentMonthShortLabel() }}
            </p>
            <p class="mt-2 text-[22px] font-semibold monetary-tabular">
              {{ formatCurrency(budgetRemainingInCents()) }}
              <span class="text-[13px] font-medium text-white/80">restant</span>
            </p>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                class="h-full rounded-full bg-white transition-all"
                [style.width.%]="budgetUsedPercent()"
              ></div>
            </div>
            <p class="mt-2 text-[11px] leading-relaxed text-white/85">
              @if (budgetPlannedInCents() > 0) {
                Tu as utilisé {{ budgetUsedPercent() }}% de ton budget mensuel.
              } @else {
                Définis des budgets pour suivre ton rythme du mois.
              }
            </p>
          </section>
        </aside>
      </div>
    </div>
  `,
})
export class CalendarPage {
  private readonly appStore = inject(AppStore);

  protected readonly formatCurrency = formatCurrency;
  protected readonly weekdayLabels = WEEKDAY_LABELS;
  protected readonly view = signal<CalendarView>('month');
  protected readonly selectedDate = signal(getTodayIsoDate());

  protected readonly currentMonthLabel = computed(() => {
    const [year, month] = this.appStore.selectedMonthKey().split('-').map(Number);
    return new Date(year, month - 1).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  });

  protected readonly currentMonthShortLabel = computed(() => {
    const [year, month] = this.appStore.selectedMonthKey().split('-').map(Number);
    return new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long' }).toUpperCase();
  });

  private readonly categoriesById = computed(
    () => new Map(this.appStore.categories().map((category) => [category.id, category])),
  );

  private readonly transactionsByDate = computed(() => {
    const grouped = new Map<string, DayTransactionView[]>();
    const monthKey = this.appStore.selectedMonthKey();

    for (const transaction of this.appStore.transactions()) {
      if (!transaction.date.startsWith(monthKey)) {
        continue;
      }

      const view = this.toDayTransaction(transaction);
      const existing = grouped.get(transaction.date) ?? [];
      grouped.set(transaction.date, [...existing, view]);
    }

    return grouped;
  });

  protected readonly calendarDays = computed<CalendarDayCell[]>(() => {
    const monthKey = this.appStore.selectedMonthKey();
    const [year, month] = monthKey.split('-').map(Number);
    const byDate = this.transactionsByDate();
    const todayIso = getTodayIsoDate();

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days: CalendarDayCell[] = [];

    for (let offset = startDayOfWeek - 1; offset >= 0; offset--) {
      const date = new Date(year, month - 1, -offset);
      days.push(this.buildDayCell(date, false, byDate, todayIso));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      days.push(this.buildDayCell(date, true, byDate, todayIso));
    }

    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let offset = 1; offset <= remaining; offset++) {
        const date = new Date(year, month, offset);
        days.push(this.buildDayCell(date, false, byDate, todayIso));
      }
    }

    return days;
  });

  protected readonly weekDays = computed(() => {
    const selected = this.selectedDate() || getTodayIsoDate();
    const selectedDate = new Date(selected);
    const dayOfWeek = selectedDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const byDate = this.transactionsByDate();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() + mondayOffset + index);
      const isoDate = formatIsoDate(date);
      const dayTransactions = byDate.get(isoDate) ?? [];
      return {
        dayNumber: date.getDate(),
        isoDate,
        weekLabel: WEEKDAY_LABELS[index],
        expenses: dayTransactions.filter((item) => item.type === 'expense'),
        incomes: dayTransactions.filter((item) => item.type === 'income'),
      };
    });
  });

  protected readonly selectedDayTransactions = computed(() => {
    const date = this.selectedDate();
    if (!date) {
      return [];
    }
    return this.transactionsByDate().get(date) ?? [];
  });

  protected readonly selectedDayExpensesInCents = computed(() =>
    this.selectedDayTransactions()
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amountInCents, 0),
  );

  protected readonly selectedDayIncomeInCents = computed(() =>
    this.selectedDayTransactions()
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amountInCents, 0),
  );

  protected readonly selectedDayBadge = computed(() => {
    const date = this.selectedDate();
    if (!date) {
      return '';
    }
    return new Date(date)
      .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      .replace('.', '')
      .toUpperCase();
  });

  protected readonly budgetPlannedInCents = computed(() =>
    this.appStore
      .dashboardData()
      .budgets.reduce((total, budget) => total + budget.plannedInCents, 0),
  );

  protected readonly budgetSpentInCents = computed(() =>
    this.appStore
      .dashboardData()
      .budgets.reduce((total, budget) => total + budget.spentInCents, 0),
  );

  protected readonly budgetRemainingInCents = computed(() =>
    Math.max(this.budgetPlannedInCents() - this.budgetSpentInCents(), 0),
  );

  protected readonly budgetUsedPercent = computed(() =>
    calculateProgressPercent(this.budgetSpentInCents(), this.budgetPlannedInCents()),
  );

  protected selectDay(isoDate: string): void {
    this.selectedDate.set(isoDate);
  }

  private buildDayCell(
    date: Date,
    isCurrentMonth: boolean,
    byDate: Map<string, DayTransactionView[]>,
    todayIso: string,
  ): CalendarDayCell {
    const isoDate = formatIsoDate(date);
    const dayTransactions = byDate.get(isoDate) ?? [];

    return {
      dayNumber: date.getDate(),
      isoDate,
      isCurrentMonth,
      isToday: isoDate === todayIso,
      expenses: dayTransactions.filter((item) => item.type === 'expense'),
      incomes: dayTransactions.filter((item) => item.type === 'income'),
    };
  }

  private toDayTransaction(transaction: Transaction): DayTransactionView {
    const category = this.categoriesById().get(transaction.categoryId);

    return {
      id: transaction.id,
      label: transaction.note || category?.name || 'Transaction',
      categoryName: category?.name ?? 'Autre',
      icon: category?.icon ?? 'receipt_long',
      amountInCents: transaction.amountInCents,
      type: transaction.type,
      timeLabel: formatTimeLabel(transaction.createdAt || transaction.date),
    };
  }
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayIsoDate(): string {
  return formatIsoDate(new Date());
}

function formatTimeLabel(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
