import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppStore } from '../../core/store/app.store';
import { RecentTransaction, TransactionType } from '../home/models/home.models';

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

@Component({
  selector: 'app-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-[13px] font-semibold uppercase tracking-wide text-text-muted label-caps">
          Activité
        </h2>
        <p class="mt-0.5 text-[12px] text-text-muted">
          {{ filteredTransactions().length }} transaction{{
            filteredTransactions().length > 1 ? 's' : ''
          }}
          sur {{ allTransactions().length }} au total
        </p>
      </div>

      <!-- Filter bar -->
      <section class="bento-card p-4">
        <div class="flex flex-wrap items-center gap-3">
          <label class="relative flex-1 min-w-[200px]">
            <span class="sr-only">Rechercher une transaction</span>
            <span
              class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[16px] text-text-muted"
              aria-hidden="true"
              >search</span
            >
            <input
              type="search"
              [(ngModel)]="searchQuery"
              placeholder="Rechercher…"
              class="w-full rounded-lg border border-border bg-page py-2 pr-3 pl-9 text-[13px] text-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>

          <label class="flex flex-col gap-1">
            <span class="sr-only">Type</span>
            <select
              [(ngModel)]="typeFilter"
              class="rounded-lg border border-border bg-page px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
            >
              <option value="">Tous types</option>
              <option value="expense">Dépenses</option>
              <option value="income">Revenus</option>
            </select>
          </label>

          <label class="flex flex-col gap-1">
            <span class="sr-only">Catégorie</span>
            <select
              [(ngModel)]="categoryFilter"
              class="rounded-lg border border-border bg-page px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
            >
              <option value="">Toutes catégories</option>
              @for (category of availableCategories(); track category) {
                <option [value]="category">{{ category }}</option>
              }
            </select>
          </label>

          <label class="flex flex-col gap-1">
            <span class="sr-only">Trier par</span>
            <select
              [(ngModel)]="sortKey"
              class="rounded-lg border border-border bg-page px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
            >
              <option value="date-desc">Date ↓</option>
              <option value="date-asc">Date ↑</option>
              <option value="amount-desc">Montant ↓</option>
              <option value="amount-asc">Montant ↑</option>
            </select>
          </label>

          @if (hasActiveFilters()) {
            <button
              type="button"
              (click)="clearFilters()"
              class="text-[12px] font-medium text-accent hover:underline"
            >
              Réinitialiser
            </button>
          }
        </div>
      </section>

      <!-- Transactions table -->
      <section class="bento-card overflow-hidden">
        @if (filteredTransactions().length > 0) {
          <div class="overflow-x-auto">
            <table class="w-full" role="table" aria-label="Liste des transactions">
              <thead>
                <tr class="border-b border-border">
                  <th
                    scope="col"
                    class="label-caps px-5 py-3 text-left text-text-muted font-semibold"
                  >
                    Transaction
                  </th>
                  <th
                    scope="col"
                    class="label-caps px-5 py-3 text-left text-text-muted font-semibold hidden sm:table-cell"
                  >
                    Catégorie
                  </th>
                  <th
                    scope="col"
                    class="label-caps px-5 py-3 text-left text-text-muted font-semibold hidden md:table-cell"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    class="label-caps px-5 py-3 text-right text-text-muted font-semibold"
                  >
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody>
                @for (transaction of filteredTransactions(); track transaction.id) {
                  <tr
                    class="border-b border-border/50 transition-colors hover:bg-page/60 last:border-0"
                  >
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                          [class.bg-income/10]="transaction.type === 'income'"
                          [class.bg-accent/10]="transaction.type === 'expense'"
                        >
                          <span
                            class="material-symbols-outlined text-[16px]"
                            [class.text-income]="transaction.type === 'income'"
                            [class.text-accent]="transaction.type === 'expense'"
                            aria-hidden="true"
                          >
                            {{ transaction.icon }}
                          </span>
                        </div>
                        <div>
                          <p class="text-[13px] font-medium text-text">{{ transaction.label }}</p>
                          @if (transaction.note) {
                            <p class="text-[11px] text-text-muted">{{ transaction.note }}</p>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-3 hidden sm:table-cell">
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                        [class.bg-income/10]="transaction.categoryTone === 'income'"
                        [class.text-income]="transaction.categoryTone === 'income'"
                        [class.bg-accent/10]="transaction.categoryTone === 'accent'"
                        [class.text-accent]="transaction.categoryTone === 'accent'"
                        [class.bg-warning/10]="transaction.categoryTone === 'warning'"
                        [class.text-warning]="transaction.categoryTone === 'warning'"
                        [class.bg-border]="transaction.categoryTone === 'neutral'"
                        [class.text-text-muted]="transaction.categoryTone === 'neutral'"
                      >
                        {{ transaction.categoryName }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-[12px] text-text-muted hidden md:table-cell">
                      {{ transaction.dateLabel }}
                    </td>
                    <td class="px-5 py-3 text-right">
                      <span
                        class="monetary-tabular text-[13px] font-semibold"
                        [class.text-income]="transaction.amountInCents > 0"
                        [class.text-text]="transaction.amountInCents < 0"
                      >
                        {{ transaction.amountInCents > 0 ? '+' : ''
                        }}{{ (transaction.amountInCents / 100).toFixed(2) }} €
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center gap-3 py-16 px-5 text-center">
            <span class="material-symbols-outlined text-[40px] text-border" aria-hidden="true"
              >search_off</span
            >
            <p class="text-[13px] font-medium text-text">Aucun résultat</p>
            <p class="text-[12px] text-text-muted">
              Essaie d'ajuster tes filtres ou ta recherche.
            </p>
            <button
              type="button"
              (click)="clearFilters()"
              class="mt-1 rounded-lg border border-border px-4 py-2 text-[12px] font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
            >
              Réinitialiser les filtres
            </button>
          </div>
        }
      </section>
    </div>
  `,
})
export class Activity {
  private readonly appStore = inject(AppStore);

  protected searchQuery = signal('');
  protected typeFilter = signal<TransactionType | ''>('');
  protected categoryFilter = signal('');
  protected sortKey = signal<SortKey>('date-desc');

  protected readonly allTransactions = computed<RecentTransaction[]>(() => {
    return this.appStore.dashboardData().transactions;
  });

  protected readonly availableCategories = computed(() => {
    const categories = new Set(this.allTransactions().map((t) => t.categoryName));
    return [...categories].sort();
  });

  protected readonly filteredTransactions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const type = this.typeFilter();
    const category = this.categoryFilter();
    const sort = this.sortKey();

    let result = this.allTransactions().filter((transaction) => {
      const matchesQuery =
        !query ||
        transaction.label.toLowerCase().includes(query) ||
        (transaction.note ?? '').toLowerCase().includes(query) ||
        transaction.categoryName.toLowerCase().includes(query);

      const matchesType = !type || transaction.type === type;
      const matchesCategory = !category || transaction.categoryName === category;

      return matchesQuery && matchesType && matchesCategory;
    });

    result = [...result].sort((left, right) => {
      if (sort === 'amount-desc') return right.amountInCents - left.amountInCents;
      if (sort === 'amount-asc') return left.amountInCents - right.amountInCents;
      return 0;
    });

    return result;
  });

  protected readonly hasActiveFilters = computed(
    () => !!this.searchQuery() || !!this.typeFilter() || !!this.categoryFilter(),
  );

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.typeFilter.set('');
    this.categoryFilter.set('');
  }
}
