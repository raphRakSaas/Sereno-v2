import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AppStore } from '../../core/store/app.store';

interface MonthlyPoint {
  label: string;
  incomeInCents: number;
  expensesInCents: number;
}

const SVG_WIDTH = 480;
const SVG_HEIGHT = 140;
const PADDING = 28;

@Component({
  selector: 'app-statistics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="label-caps text-text-muted">Statistiques</h2>
        <p class="mt-0.5 text-[12px] text-text-muted">Vue d'ensemble de ta santé financière</p>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-3 gap-gutter">
        <section class="bento-card p-5">
          <p class="label-caps text-text-muted">Revenus</p>
          <p class="mt-2 monetary-tabular text-[22px] font-bold text-income">
            {{ formatCents(summary().incomeInCents) }}
          </p>
          <p class="mt-1 text-[11px] text-text-muted">ce mois-ci</p>
        </section>

        <section class="bento-card p-5">
          <p class="label-caps text-text-muted">Dépenses</p>
          <p class="mt-2 monetary-tabular text-[22px] font-bold text-accent">
            {{ formatCents(summary().expensesInCents) }}
          </p>
          <p class="mt-1 text-[11px] text-text-muted">ce mois-ci</p>
        </section>

        <section class="bento-card p-5">
          <p class="label-caps text-text-muted">Taux d'épargne</p>
          <p
            class="mt-2 monetary-tabular text-[22px] font-bold"
            [class.text-income]="savingsRate() >= 20"
            [class.text-warning]="savingsRate() > 0 && savingsRate() < 20"
            [class.text-accent]="savingsRate() <= 0"
          >
            {{ savingsRate() }}%
          </p>
          <p class="mt-1 text-[11px] text-text-muted">
            {{ savingsRate() >= 20 ? 'Excellent !' : savingsRate() > 0 ? 'À améliorer' : 'Attention' }}
          </p>
        </section>
      </div>

      <div class="grid grid-cols-12 gap-gutter">
        <!-- Line chart -->
        <section class="col-span-12 xl:col-span-8 bento-card p-5">
          <h3 class="label-caps text-text-muted mb-4">Évolution sur 6 mois</h3>
          <svg
            [attr.viewBox]="'0 0 ' + svgWidth + ' ' + svgHeight"
            class="w-full"
            role="img"
            aria-label="Graphique d'évolution des revenus et dépenses sur 6 mois"
          >
            <!-- Income line -->
            <polyline
              [attr.points]="incomePolyline()"
              fill="none"
              stroke="#17836b"
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
            <!-- Expenses line -->
            <polyline
              [attr.points]="expensesPolyline()"
              fill="none"
              stroke="#ff4d6d"
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
            <!-- Labels -->
            @for (point of chartPoints(); track point.label; let pointIndex = $index) {
              <text
                [attr.x]="point.x"
                y="135"
                text-anchor="middle"
                font-size="10"
                fill="#6b635c"
              >
                {{ point.label }}
              </text>
            }
          </svg>
          <div class="mt-3 flex items-center gap-4">
            <div class="flex items-center gap-1.5">
              <span class="h-2 w-4 rounded-full bg-income inline-block"></span>
              <span class="text-[11px] text-text-muted">Revenus</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="h-2 w-4 rounded-full bg-accent inline-block"></span>
              <span class="text-[11px] text-text-muted">Dépenses</span>
            </div>
          </div>
        </section>

        <!-- Right column -->
        <div class="col-span-12 xl:col-span-4 flex flex-col gap-4">
          <!-- Category breakdown -->
          <section class="bento-card p-5">
            <h3 class="label-caps text-text-muted mb-3">Répartition</h3>
            @for (slice of categorySlices(); track slice.id) {
              <div class="mb-3 last:mb-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[12px] text-text">{{ slice.label }}</span>
                  <span class="text-[11px] font-semibold text-text-muted">{{ slice.percent }}%</span>
                </div>
                <div class="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    class="h-full rounded-full transition-all"
                    [class]="slice.colorClass"
                    [style.width.%]="slice.percent"
                  ></div>
                </div>
              </div>
            } @empty {
              <p class="text-[12px] text-text-muted">Aucune dépense ce mois-ci.</p>
            }
          </section>

          <!-- Insight card -->
          <section class="bento-card p-5 border-income/30">
            <div class="flex items-start gap-3">
              <span
                class="material-symbols-outlined text-[20px] text-income shrink-0 mt-0.5"
                aria-hidden="true"
                >spa</span
              >
              <div>
                <p class="text-[13px] font-medium text-text">{{ insightMessage() }}</p>
                <p class="mt-1 text-[11px] text-text-muted">
                  Tu avances à ton rythme, c'est ce qui compte.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Top transactions -->
      <section class="bento-card overflow-hidden">
        <div class="px-5 py-4 border-b border-border">
          <h3 class="label-caps text-text-muted">Transactions les plus importantes</h3>
        </div>
        <ul role="list">
          @for (transaction of topTransactions(); track transaction.id) {
            <li class="flex items-center justify-between px-5 py-3 border-b border-border/50 last:border-0 hover:bg-page/60 transition-colors">
              <div class="flex items-center gap-3">
                <span
                  class="material-symbols-outlined text-[16px]"
                  [class.text-accent]="transaction.type === 'expense'"
                  [class.text-income]="transaction.type === 'income'"
                  aria-hidden="true"
                >
                  {{ transaction.icon }}
                </span>
                <div>
                  <p class="text-[13px] font-medium text-text">{{ transaction.label }}</p>
                  <p class="text-[11px] text-text-muted">{{ transaction.dateLabel }}</p>
                </div>
              </div>
              <span
                class="monetary-tabular text-[13px] font-semibold"
                [class.text-income]="transaction.amountInCents > 0"
                [class.text-text]="transaction.amountInCents < 0"
              >
                {{ transaction.amountInCents > 0 ? '+' : ''
                }}{{ (transaction.amountInCents / 100).toFixed(2) }} €
              </span>
            </li>
          }
        </ul>
      </section>
    </div>
  `,
})
export class Statistics {
  private readonly appStore = inject(AppStore);

  protected readonly svgWidth = SVG_WIDTH;
  protected readonly svgHeight = SVG_HEIGHT;

  protected readonly summary = computed(() => this.appStore.dashboardData().summary);

  protected readonly categorySlices = computed(() => this.appStore.dashboardData().categorySlices);

  protected readonly savingsRate = computed(() => {
    const { incomeInCents, expensesInCents } = this.summary();
    if (incomeInCents <= 0) return 0;
    const rate = ((incomeInCents - expensesInCents) / incomeInCents) * 100;
    return Math.round(Math.max(0, rate));
  });

  protected readonly insightMessage = computed(() => {
    const rate = this.savingsRate();
    if (rate >= 30) return 'Tu épargnes bien ce mois-ci, continue comme ça !';
    if (rate >= 15) return 'Bonne maîtrise de tes dépenses ce mois.';
    if (rate > 0) return 'Quelques ajustements pourraient augmenter ton épargne.';
    return 'Prends soin de toi financièrement, un petit pas à la fois.';
  });

  protected readonly topTransactions = computed(() => {
    return [...this.appStore.dashboardData().transactions]
      .sort((left, right) => Math.abs(right.amountInCents) - Math.abs(left.amountInCents))
      .slice(0, 5);
  });

  /** 6 derniers mois calculés depuis IndexedDB local — pas de fausse courbe. */
  protected readonly monthlyEvolution = computed<MonthlyPoint[]>(() => {
    const [year, month] = this.appStore.selectedMonthKey().split('-').map(Number);
    const transactions = this.appStore.transactions();

    return Array.from({ length: 6 }, (_, index) => {
      const offset = 5 - index;
      const date = new Date(year, month - 1 - offset, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthTransactions = transactions.filter((transaction) =>
        transaction.date.startsWith(monthKey),
      );

      return {
        label: date
          .toLocaleDateString('fr-FR', { month: 'short' })
          .replace('.', '')
          .replace(/^\w/, (firstLetter) => firstLetter.toUpperCase()),
        incomeInCents: monthTransactions
          .filter((transaction) => transaction.type === 'income')
          .reduce((total, transaction) => total + transaction.amountInCents, 0),
        expensesInCents: monthTransactions
          .filter((transaction) => transaction.type === 'expense')
          .reduce((total, transaction) => total + transaction.amountInCents, 0),
      };
    });
  });

  protected readonly chartPoints = computed(() => {
    const chartWidth = SVG_WIDTH - PADDING * 2;
    const points = this.monthlyEvolution();
    const divisor = Math.max(points.length - 1, 1);

    return points.map((point, index) => ({
      ...point,
      x: PADDING + (index / divisor) * chartWidth,
    }));
  });

  private readonly chartMaxValue = computed(() => {
    const values = this.monthlyEvolution().flatMap((point) => [
      point.incomeInCents,
      point.expensesInCents,
    ]);
    return Math.max(...values, 1);
  });

  protected readonly incomePolyline = computed(() => {
    const points = this.chartPoints();
    const maxValue = this.chartMaxValue();
    const chartHeight = SVG_HEIGHT - PADDING * 2;
    return points
      .map((point) => {
        const y = PADDING + chartHeight - (point.incomeInCents / maxValue) * chartHeight;
        return `${point.x},${y}`;
      })
      .join(' ');
  });

  protected readonly expensesPolyline = computed(() => {
    const points = this.chartPoints();
    const maxValue = this.chartMaxValue();
    const chartHeight = SVG_HEIGHT - PADDING * 2;
    return points
      .map((point) => {
        const y = PADDING + chartHeight - (point.expensesInCents / maxValue) * chartHeight;
        return `${point.x},${y}`;
      })
      .join(' ');
  });

  protected formatCents(cents: number): string {
    return (cents / 100).toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    });
  }
}
