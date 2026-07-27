import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AppStore } from '../../core/store/app.store';

type ChartView = 'evolution' | 'bars' | 'pie' | 'savings';

interface MonthlyPoint {
  label: string;
  incomeInCents: number;
  expensesInCents: number;
}

interface ChartTab {
  id: ChartView;
  label: string;
  icon: string;
}

interface PieSliceView {
  id: string;
  label: string;
  percent: number;
  color: string;
  path: string;
}

const CHART_TABS: ChartTab[] = [
  { id: 'evolution', label: 'Évolution', icon: 'show_chart' },
  { id: 'bars', label: 'Barres', icon: 'bar_chart' },
  { id: 'pie', label: 'Répartition', icon: 'pie_chart' },
  { id: 'savings', label: 'Épargne', icon: 'savings' },
];

const PIE_COLORS = ['#FF4D6D', '#17836B', '#E8A838', '#6B7FD7', '#9B59B6', '#3498DB'];

const SVG_WIDTH = 480;
const SVG_HEIGHT = 200;
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
            {{
              savingsRate() >= 20 ? 'Excellent !' : savingsRate() > 0 ? 'À améliorer' : 'Attention'
            }}
          </p>
        </section>
      </div>

      <div class="grid grid-cols-12 gap-gutter">
        <section class="bento-card col-span-12 p-5 xl:col-span-8">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="label-caps text-text-muted">{{ activeChartTitle() }}</h3>
              <p class="mt-0.5 text-[11px] text-text-muted">{{ activeChartSubtitle() }}</p>
            </div>
            <div
              class="flex overflow-hidden rounded-lg border border-border bg-page"
              role="tablist"
              aria-label="Type de graphique"
            >
              @for (tab of chartTabs; track tab.id) {
                <button
                  type="button"
                  role="tab"
                  class="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold transition-colors"
                  [attr.aria-selected]="selectedChart() === tab.id"
                  [class.bg-accent]="selectedChart() === tab.id"
                  [class.text-white]="selectedChart() === tab.id"
                  [class.text-text-muted]="selectedChart() !== tab.id"
                  (click)="selectedChart.set(tab.id)"
                >
                  <span class="material-symbols-outlined text-[14px]" aria-hidden="true">{{
                    tab.icon
                  }}</span>
                  <span class="hidden sm:inline">{{ tab.label }}</span>
                </button>
              }
            </div>
          </div>

          @switch (selectedChart()) {
            @case ('evolution') {
              <svg
                [attr.viewBox]="'0 0 ' + svgWidth + ' ' + svgHeight"
                class="w-full"
                role="img"
                aria-label="Évolution des revenus et dépenses sur 6 mois"
              >
                <polyline
                  [attr.points]="incomePolyline()"
                  fill="none"
                  stroke="#17836b"
                  stroke-width="2.5"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                />
                <polyline
                  [attr.points]="expensesPolyline()"
                  fill="none"
                  stroke="#ff4d6d"
                  stroke-width="2.5"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                />
                @for (point of chartPoints(); track point.label) {
                  <circle [attr.cx]="point.x" [attr.cy]="incomeY(point.incomeInCents)" r="3" fill="#17836b" />
                  <circle
                    [attr.cx]="point.x"
                    [attr.cy]="expenseY(point.expensesInCents)"
                    r="3"
                    fill="#ff4d6d"
                  />
                  <text
                    [attr.x]="point.x"
                    [attr.y]="svgHeight - 8"
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
                  <span class="inline-block h-2 w-4 rounded-full bg-income"></span>
                  <span class="text-[11px] text-text-muted">Revenus</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="inline-block h-2 w-4 rounded-full bg-accent"></span>
                  <span class="text-[11px] text-text-muted">Dépenses</span>
                </div>
              </div>
            }

            @case ('bars') {
              <svg
                [attr.viewBox]="'0 0 ' + svgWidth + ' ' + svgHeight"
                class="w-full"
                role="img"
                aria-label="Dépenses mensuelles en barres"
              >
                @for (bar of expenseBars(); track bar.label) {
                  <rect
                    [attr.x]="bar.x"
                    [attr.y]="bar.y"
                    [attr.width]="bar.width"
                    [attr.height]="bar.height"
                    rx="4"
                    fill="#ff4d6d"
                    opacity="0.9"
                  />
                  <text
                    [attr.x]="bar.x + bar.width / 2"
                    [attr.y]="svgHeight - 8"
                    text-anchor="middle"
                    font-size="10"
                    fill="#6b635c"
                  >
                    {{ bar.label }}
                  </text>
                }
              </svg>
              <p class="mt-3 text-[11px] text-text-muted">Hauteur = montant des dépenses du mois</p>
            }

            @case ('pie') {
              @if (pieSlices().length > 0) {
                <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                  <svg
                    viewBox="0 0 160 160"
                    class="h-44 w-44 shrink-0"
                    role="img"
                    aria-label="Répartition des dépenses par catégorie"
                  >
                    @for (slice of pieSlices(); track slice.id) {
                      <path [attr.d]="slice.path" [attr.fill]="slice.color" stroke="#fff" stroke-width="2" />
                    }
                    <circle cx="80" cy="80" r="36" fill="#fff" />
                    <text
                      x="80"
                      y="78"
                      text-anchor="middle"
                      font-size="11"
                      fill="#6b635c"
                    >
                      Dépenses
                    </text>
                    <text
                      x="80"
                      y="94"
                      text-anchor="middle"
                      font-size="12"
                      font-weight="600"
                      fill="#1a1a1a"
                    >
                      {{ formatCents(summary().expensesInCents) }}
                    </text>
                  </svg>
                  <ul class="w-full space-y-2">
                    @for (slice of pieSlices(); track slice.id) {
                      <li class="flex items-center justify-between gap-3">
                        <div class="flex min-w-0 items-center gap-2">
                          <span
                            class="h-2.5 w-2.5 shrink-0 rounded-full"
                            [style.backgroundColor]="slice.color"
                          ></span>
                          <span class="truncate text-[12px] text-text">{{ slice.label }}</span>
                        </div>
                        <span class="text-[11px] font-semibold text-text-muted"
                          >{{ slice.percent }}%</span
                        >
                      </li>
                    }
                  </ul>
                </div>
              } @else {
                <p class="py-10 text-center text-[12px] text-text-muted">
                  Aucune dépense ce mois-ci pour afficher la répartition.
                </p>
              }
            }

            @case ('savings') {
              <svg
                [attr.viewBox]="'0 0 ' + svgWidth + ' ' + svgHeight"
                class="w-full"
                role="img"
                aria-label="Épargne nette mensuelle"
              >
                <line
                  [attr.x1]="padding"
                  [attr.x2]="svgWidth - padding"
                  [attr.y1]="zeroLineY()"
                  [attr.y2]="zeroLineY()"
                  stroke="#d4cdc4"
                  stroke-width="1"
                  stroke-dasharray="4 4"
                />
                @for (bar of savingsBars(); track bar.label) {
                  <rect
                    [attr.x]="bar.x"
                    [attr.y]="bar.y"
                    [attr.width]="bar.width"
                    [attr.height]="bar.height"
                    rx="4"
                    [attr.fill]="bar.positive ? '#17836b' : '#ff4d6d'"
                    opacity="0.9"
                  />
                  <text
                    [attr.x]="bar.x + bar.width / 2"
                    [attr.y]="svgHeight - 8"
                    text-anchor="middle"
                    font-size="10"
                    fill="#6b635c"
                  >
                    {{ bar.label }}
                  </text>
                }
              </svg>
              <div class="mt-3 flex items-center gap-4">
                <div class="flex items-center gap-1.5">
                  <span class="inline-block h-2 w-4 rounded-full bg-income"></span>
                  <span class="text-[11px] text-text-muted">Épargne positive</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="inline-block h-2 w-4 rounded-full bg-accent"></span>
                  <span class="text-[11px] text-text-muted">Déficit</span>
                </div>
              </div>
            }
          }
        </section>

        <div class="col-span-12 flex flex-col gap-4 xl:col-span-4">
          <section class="bento-card p-5">
            <h3 class="label-caps mb-3 text-text-muted">Répartition</h3>
            @for (slice of categorySlices(); track slice.id) {
              <div class="mb-3 last:mb-0">
                <div class="mb-1 flex items-center justify-between">
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

          <section class="bento-card border-income/30 p-5">
            <div class="flex items-start gap-3">
              <span
                class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-income"
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

      <section class="bento-card overflow-hidden">
        <div class="border-b border-border px-5 py-4">
          <h3 class="label-caps text-text-muted">Transactions les plus importantes</h3>
        </div>
        <ul role="list">
          @for (transaction of topTransactions(); track transaction.id) {
            <li
              class="flex items-center justify-between border-b border-border/50 px-5 py-3 transition-colors last:border-0 hover:bg-page/60"
            >
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
          } @empty {
            <li class="px-5 py-8 text-center text-[12px] text-text-muted">
              Pas encore de transactions à analyser.
            </li>
          }
        </ul>
      </section>
    </div>
  `,
})
export class Statistics {
  private readonly appStore = inject(AppStore);

  protected readonly chartTabs = CHART_TABS;
  protected readonly svgWidth = SVG_WIDTH;
  protected readonly svgHeight = SVG_HEIGHT;
  protected readonly padding = PADDING;
  protected readonly selectedChart = signal<ChartView>('evolution');

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

  protected readonly activeChartTitle = computed(() => {
    switch (this.selectedChart()) {
      case 'bars':
        return 'Dépenses en barres';
      case 'pie':
        return 'Répartition du mois';
      case 'savings':
        return 'Épargne nette';
      default:
        return 'Évolution sur 6 mois';
    }
  });

  protected readonly activeChartSubtitle = computed(() => {
    switch (this.selectedChart()) {
      case 'bars':
        return 'Compare tes dépenses mois par mois';
      case 'pie':
        return 'Où va ton argent ce mois-ci';
      case 'savings':
        return 'Revenus − dépenses sur 6 mois';
      default:
        return 'Revenus et dépenses côte à côte';
    }
  });

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

  protected readonly incomePolyline = computed(() =>
    this.chartPoints()
      .map((point) => `${point.x},${this.incomeY(point.incomeInCents)}`)
      .join(' '),
  );

  protected readonly expensesPolyline = computed(() =>
    this.chartPoints()
      .map((point) => `${point.x},${this.expenseY(point.expensesInCents)}`)
      .join(' '),
  );

  protected readonly expenseBars = computed(() => {
    const points = this.monthlyEvolution();
    const maxValue = Math.max(...points.map((point) => point.expensesInCents), 1);
    const chartWidth = SVG_WIDTH - PADDING * 2;
    const chartHeight = SVG_HEIGHT - PADDING * 2 - 12;
    const gap = 10;
    const barWidth = (chartWidth - gap * (points.length - 1)) / points.length;

    return points.map((point, index) => {
      const height = (point.expensesInCents / maxValue) * chartHeight;
      const x = PADDING + index * (barWidth + gap);
      const y = PADDING + chartHeight - height;
      return { label: point.label, x, y, width: barWidth, height: Math.max(height, 2) };
    });
  });

  protected readonly savingsBars = computed(() => {
    const points = this.monthlyEvolution().map((point) => ({
      label: point.label,
      netInCents: point.incomeInCents - point.expensesInCents,
    }));
    const maxAbs = Math.max(...points.map((point) => Math.abs(point.netInCents)), 1);
    const chartWidth = SVG_WIDTH - PADDING * 2;
    const chartHeight = SVG_HEIGHT - PADDING * 2 - 12;
    const zeroY = PADDING + chartHeight / 2;
    const gap = 10;
    const barWidth = (chartWidth - gap * (points.length - 1)) / points.length;

    return points.map((point, index) => {
      const halfHeight = (Math.abs(point.netInCents) / maxAbs) * (chartHeight / 2);
      const x = PADDING + index * (barWidth + gap);
      const positive = point.netInCents >= 0;
      const y = positive ? zeroY - halfHeight : zeroY;
      return {
        label: point.label,
        x,
        y,
        width: barWidth,
        height: Math.max(halfHeight, 2),
        positive,
      };
    });
  });

  protected readonly zeroLineY = computed(() => {
    const chartHeight = SVG_HEIGHT - PADDING * 2 - 12;
    return PADDING + chartHeight / 2;
  });

  protected readonly pieSlices = computed<PieSliceView[]>(() => {
    const slices = this.categorySlices();
    if (slices.length === 0) {
      return [];
    }

    let startAngle = -Math.PI / 2;
    return slices.map((slice, index) => {
      const angle = (slice.percent / 100) * Math.PI * 2;
      const endAngle = startAngle + angle;
      const path = describeDonutSlice(80, 80, 70, 40, startAngle, endAngle);
      const view: PieSliceView = {
        id: slice.id,
        label: slice.label,
        percent: slice.percent,
        color: PIE_COLORS[index % PIE_COLORS.length],
        path,
      };
      startAngle = endAngle;
      return view;
    });
  });

  protected incomeY(amountInCents: number): number {
    const chartHeight = SVG_HEIGHT - PADDING * 2 - 12;
    return PADDING + chartHeight - (amountInCents / this.chartMaxValue()) * chartHeight;
  }

  protected expenseY(amountInCents: number): number {
    return this.incomeY(amountInCents);
  }

  protected formatCents(cents: number): string {
    return (cents / 100).toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    });
  }
}

function describeDonutSlice(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  if (endAngle - startAngle < 0.001) {
    return '';
  }

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const outerEnd = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInRadians: number,
): { x: number; y: number } {
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}
