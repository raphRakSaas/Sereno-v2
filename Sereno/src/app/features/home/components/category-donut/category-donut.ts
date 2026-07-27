import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CategorySlice } from '../../models/home.models';
import { formatCurrency } from '../../../../shared/utils/format-currency';

@Component({
  selector: 'app-category-donut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card flex flex-col items-center p-5" aria-labelledby="category-title">
      <header class="mb-4 w-full text-left">
        <h2 id="category-title" class="text-[13px] font-semibold uppercase tracking-wide text-text">
          Répartition
        </h2>
      </header>

      <div class="relative mb-4 h-40 w-40">
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
          <span class="text-[18px] font-semibold monetary-tabular text-text">
            {{ formatCurrency(totalExpensesInCents()) }}
          </span>
          <span class="label-caps text-text-muted">Dépenses</span>
        </div>
      </div>

      <ul class="w-full space-y-2">
        @for (slice of slices(); track slice.id) {
          <li class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-sm" [class]="slice.colorClass"></span>
              <span class="text-[12px] text-text-muted">{{ slice.label }}</span>
            </div>
            <span class="text-[12px] font-medium monetary-tabular text-text"
              >{{ slice.percent }}%</span
            >
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
