import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RecentTransaction } from '../../models/home.models';
import { formatCurrency } from '../../../../shared/utils/format-currency';

@Component({
  selector: 'app-recent-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card overflow-hidden" aria-labelledby="transactions-title">
      <header class="flex items-center justify-between border-b border-border p-6">
        <h2 id="transactions-title" class="text-[15px] font-semibold uppercase tracking-wide text-text">
          Transactions récentes
        </h2>
        <button type="button" class="label-caps text-accent hover:tracking-widest">Tout voir</button>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-left">
          <thead class="border-b border-border bg-page">
            <tr>
              <th class="label-caps px-6 py-3 text-text-muted">Détails</th>
              <th class="label-caps px-6 py-3 text-text-muted">Catégorie</th>
              <th class="label-caps px-6 py-3 text-text-muted">Date</th>
              <th class="label-caps px-6 py-3 text-right text-text-muted">Montant</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/40">
            @for (transaction of transactions(); track transaction.id) {
              <tr class="h-11 cursor-pointer transition-colors hover:bg-page">
                <td class="px-6">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-8 w-8 items-center justify-center rounded bg-accent-surface text-accent"
                    >
                      <span class="material-symbols-outlined text-[18px]" aria-hidden="true">
                        {{ transaction.icon }}
                      </span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-text">{{ transaction.label }}</p>
                      <p class="text-[11px] text-text-muted">{{ transaction.note }}</p>
                    </div>
                    @if (transaction.hasReceipt) {
                      <span
                        class="material-symbols-outlined text-[16px] text-text-muted"
                        aria-label="Justificatif joint"
                        >attach_file</span
                      >
                    }
                  </div>
                </td>
                <td class="px-6">
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    [class]="categoryClass(transaction.categoryTone)"
                  >
                    {{ transaction.categoryName }}
                  </span>
                </td>
                <td class="px-6 text-[13px] text-text-muted">{{ transaction.dateLabel }}</td>
                <td
                  class="px-6 text-right text-sm font-medium monetary-tabular"
                  [class.text-income]="transaction.type === 'income'"
                  [class.text-text]="transaction.type === 'expense'"
                >
                  {{
                    transaction.type === 'income'
                      ? formatCurrency(transaction.amountInCents, { showSign: true })
                      : formatCurrency(transaction.amountInCents)
                  }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class RecentTransactions {
  readonly transactions = input.required<RecentTransaction[]>();
  protected readonly formatCurrency = formatCurrency;

  protected categoryClass(tone: RecentTransaction['categoryTone']): string {
    const toneClasses: Record<RecentTransaction['categoryTone'], string> = {
      accent: 'bg-accent-surface text-accent',
      income: 'bg-income/10 text-income',
      warning: 'bg-warning/10 text-warning',
      neutral: 'bg-page text-text-muted',
    };

    return toneClasses[tone];
  }
}
