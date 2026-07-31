import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RecentTransaction } from '../../models/home.models';
import { formatCurrency } from '../../../../shared/utils/format-currency';

@Component({
  selector: 'app-recent-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card min-w-0 overflow-hidden" aria-labelledby="transactions-title">
      <header class="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
        <h2
          id="transactions-title"
          class="text-[13px] font-semibold uppercase tracking-wide text-text"
        >
          Transactions récentes
        </h2>
        <button type="button" class="label-caps text-accent hover:underline">Tout voir</button>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="border-b border-border bg-page">
            <tr>
              <th class="label-caps px-4 py-2.5 text-text-muted sm:px-5">Détails</th>
              <th class="label-caps hidden px-5 py-2.5 text-text-muted sm:table-cell">Catégorie</th>
              <th class="label-caps hidden px-5 py-2.5 text-text-muted md:table-cell">Date</th>
              <th class="label-caps px-4 py-2.5 text-right text-text-muted sm:px-5">Montant</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/40">
            @for (transaction of transactions(); track transaction.id) {
              <tr class="h-10 cursor-pointer transition-colors hover:bg-page">
                <td class="px-4 sm:px-5">
                  <div class="flex min-w-0 items-center gap-2.5">
                    <div
                      class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-surface text-accent"
                    >
                      <span class="material-symbols-outlined text-[16px]" aria-hidden="true">
                        {{ transaction.icon }}
                      </span>
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-[13px] font-medium text-text">{{ transaction.label }}</p>
                      <p class="truncate text-[11px] text-text-muted">
                        @if (transaction.note) {
                          {{ transaction.note }}
                        } @else {
                          {{ transaction.categoryName }} · {{ transaction.dateLabel }}
                        }
                      </p>
                    </div>
                    @if (transaction.hasReceipt) {
                      <span
                        class="material-symbols-outlined shrink-0 text-[15px] text-text-muted"
                        aria-label="Justificatif joint"
                        >attach_file</span
                      >
                    }
                  </div>
                </td>
                <td class="hidden px-5 sm:table-cell">
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    [class]="categoryClass(transaction.categoryTone)"
                  >
                    {{ transaction.categoryName }}
                  </span>
                </td>
                <td class="hidden px-5 text-[12px] text-text-muted md:table-cell">
                  {{ transaction.dateLabel }}
                </td>
                <td
                  class="px-4 text-right text-[13px] font-medium monetary-tabular sm:px-5"
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
