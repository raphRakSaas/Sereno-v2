import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DashboardSummary } from '../../models/home.models';
import { formatCurrency } from '../../../../shared/utils/format-currency';

@Component({
  selector: 'app-balance-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card p-6" aria-labelledby="balance-title">
      <header class="mb-4">
        <span id="balance-title" class="label-caps text-text-muted">Solde disponible</span>
        <p class="mt-1 text-[40px] font-semibold leading-tight monetary-tabular text-text">
          {{ formatCurrency(summary().availableBalanceInCents) }}
        </p>
      </header>

      <div class="mt-6 grid grid-cols-2 gap-4">
        <div class="rounded-lg border border-border/40 bg-page p-4">
          <span class="label-caps text-[10px] text-text-muted">Revenus</span>
          <p class="mt-1 text-lg font-medium monetary-tabular text-income">
            {{ formatCurrency(summary().incomeInCents, { showSign: true }) }}
          </p>
        </div>
        <div class="rounded-lg border border-border/40 bg-page p-4">
          <span class="label-caps text-[10px] text-text-muted">Dépenses</span>
          <p class="mt-1 text-lg font-medium monetary-tabular text-accent">
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
