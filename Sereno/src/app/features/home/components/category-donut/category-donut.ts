import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CategorySlice } from '../../models/home.models';
import { formatCurrency } from '../../../../shared/utils/format-currency';

@Component({
  selector: 'app-category-donut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card flex flex-col items-center p-6" aria-labelledby="category-title">
      <header class="mb-6 w-full text-left">
        <h2 id="category-title" class="text-[15px] font-semibold uppercase tracking-wide text-text">
          Répartition
        </h2>
      </header>

      <div class="relative mb-6 h-48 w-48">
        <svg class="h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e8e4e0" stroke-width="3" />
          @for (segment of segments(); track segment.id) {
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              [attr.stroke]="segment.color"
              stroke-width="3"
              [attr.stroke-dasharray]="segment.dashArray"
              [attr.stroke-dashoffset]="segment.dashOffset"
            />
          }
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-2xl font-semibold monetary-tabular text-text">
            {{ formatCurrency(totalExpensesInCents()) }}
          </span>
          <span class="label-caps text-[10px] text-text-muted">Dépenses totales</span>
        </div>
      </div>

      <ul class="w-full space-y-3">
        @for (slice of slices(); track slice.id) {
          <li class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-sm" [class]="slice.colorClass"></span>
              <span class="text-[13px] text-text-muted">{{ slice.label }}</span>
            </div>
            <span class="text-sm font-medium monetary-tabular text-text">{{ slice.percent }}%</span>
          </li>
        }
      </ul>
    </section>
  `,
})
export class CategoryDonut {
  readonly slices = input.required<CategorySlice[]>();
  readonly totalExpensesInCents = input.required<number>();
  protected readonly formatCurrency = formatCurrency;

  private readonly chartColors = ['#ff4d6d', '#ff8095', '#ffb3bf', '#ffd9df'];

  protected readonly segments = computed(() => {
    let offset = 0;

    return this.slices().map((slice, index) => {
      const dashArray = `${slice.percent}, 100`;
      const dashOffset = -offset;
      offset += slice.percent;

      return {
        id: slice.id,
        color: this.chartColors[index] ?? this.chartColors[0],
        dashArray,
        dashOffset,
      };
    });
  });
}
