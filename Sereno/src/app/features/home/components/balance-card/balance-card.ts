import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DashboardSummary } from '../../models/home.models';
import { formatCurrency } from '../../../../shared/utils/format-currency';

@Component({
  selector: 'app-balance-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card p-5" aria-labelledby="balance-title">
      <header class="mb-4">
        <span id="balance-title" class="label-caps text-text-muted">Solde disponible</span>
        <p class="mt-1 text-[30px] font-semibold leading-tight monetary-tabular text-text">
          {{ formatCurrency(summary().availableBalanceInCents) }}
        </p>
      </header>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl border border-border/50 bg-page px-3.5 py-3">
          <span class="label-caps text-text-muted">Revenus</span>
          <p class="mt-1 text-[15px] font-medium monetary-tabular text-income">
            {{ formatCurrency(summary().incomeInCents, { showSign: true }) }}
          </p>
        </div>
        <div class="rounded-xl border border-border/50 bg-page px-3.5 py-3">
          <span class="label-caps text-text-muted">Dépenses</span>
          <p class="mt-1 text-[15px] font-medium monetary-tabular text-accent">
            {{ formatCurrency(-summary().expensesInCents) }}
          </p>
        </div>
      </div>
    </section>
  `,
})
export class BalanceCard {
  readonly summary = input.required<DashboardSummary>();
  protected readonly formatCurrency = formatCurrency;
}
