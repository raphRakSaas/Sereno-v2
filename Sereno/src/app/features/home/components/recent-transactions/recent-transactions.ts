import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RecentTransaction } from '../../models/home.models';
import { formatCurrency } from '../../../../shared/utils/format-currency';

@Component({
  selector: 'app-recent-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card overflow-hidden" aria-labelledby="transactions-title">
      <header class="flex items-center justify-between border-b border-border px-5 py-4">
        <h2
          id="transactions-title"
          class="text-[13px] font-semibold uppercase tracking-wide text-text"
        >
          Transactions récentes
        </h2>
        <button type="button" class="label-caps text-accent hover:underline">Tout voir</button>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-left">
          <thead class="border-b border-border bg-page">
            <tr>
              <th class="label-caps px-5 py-2.5 text-text-muted">Détails</th>
              <th class="label-caps px-5 py-2.5 text-text-muted">Catégorie</th>
              <th class="label-caps px-5 py-2.5 text-text-muted">Date</th>
              <th class="label-caps px-5 py-2.5 text-right text-text-muted">Montant</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/40">
            @for (transaction of transactions(); track transaction.id) {
              <tr class="h-10 cursor-pointer transition-colors hover:bg-page">
                <td class="px-5">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="flex h-7 w-7 items-center justify-center rounded-md bg-accent-surface text-accent"
                    >
                      <span class="material-symbols-outlined text-[16px]" aria-hidden="true">
                        {{ transaction.icon }}
                      </span>
                    </div>
                    <div>
                      <p class="text-[13px] font-medium text-text">{{ transaction.label }}</p>
                      <p class="text-[11px] text-text-muted">{{ transaction.note }}</p>
                    </div>
                    @if (transaction.hasReceipt) {
                      <span
                        class="material-symbols-outlined text-[15px] text-text-muted"
                        aria-label="Justificatif joint"
                        >attach_file</span
                      >
                    }
                  </div>
                </td>
                <td class="px-5">
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    [class]="categoryClass(transaction.categoryTone)"
                  >
                    {{ transaction.categoryName }}
                  </span>
                </td>
                <td class="px-5 text-[12px] text-text-muted">{{ transaction.dateLabel }}</td>
                <td
                  class="px-5 text-right text-[13px] font-medium monetary-tabular"
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
