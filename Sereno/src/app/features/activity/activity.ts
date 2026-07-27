import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppStore } from '../../core/store/app.store';
import { Transaction } from '../../core/models/transaction.model';
import { RecentTransaction, TransactionType } from '../home/models/home.models';
import { formatCurrency } from '../../shared/utils/format-currency';

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

@Component({
  selector: 'app-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
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
        <a
          routerLink="/transactions/nouvelle"
          class="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <span class="material-symbols-outlined text-[16px]" aria-hidden="true">add</span>
          Nouvelle transaction
        </a>
      </div>

      <section class="bento-card p-4">
        <div class="flex flex-wrap items-center gap-3">
          <label class="relative min-w-[200px] flex-1">
            <span class="sr-only">Rechercher une transaction</span>
            <span
              class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[16px] text-text-muted"
              aria-hidden="true"
              >search</span
            >
            <input
              type="search"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Rechercher…"
              class="w-full rounded-lg border border-border bg-page py-2 pr-3 pl-9 text-[13px] text-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>

          <label class="flex flex-col gap-1">
            <span class="sr-only">Type</span>
            <select
              [ngModel]="typeFilter()"
              (ngModelChange)="typeFilter.set($event)"
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
              [ngModel]="categoryFilter()"
              (ngModelChange)="categoryFilter.set($event)"
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
              [ngModel]="sortKey()"
              (ngModelChange)="sortKey.set($event)"
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

      <section class="bento-card overflow-hidden">
        @if (filteredTransactions().length > 0) {
          <div class="overflow-x-auto">
            <table class="w-full" role="table" aria-label="Liste des transactions">
              <thead>
                <tr class="border-b border-border">
                  <th
                    scope="col"
                    class="label-caps px-5 py-3 text-left font-semibold text-text-muted"
                  >
                    Transaction
                  </th>
                  <th
                    scope="col"
                    class="label-caps hidden px-5 py-3 text-left font-semibold text-text-muted sm:table-cell"
                  >
                    Catégorie
                  </th>
                  <th
                    scope="col"
                    class="label-caps hidden px-5 py-3 text-left font-semibold text-text-muted md:table-cell"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    class="label-caps px-5 py-3 text-right font-semibold text-text-muted"
                  >
                    Montant
                  </th>
                  <th
                    scope="col"
                    class="label-caps px-5 py-3 text-right font-semibold text-text-muted"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                @for (transaction of filteredTransactions(); track transaction.id) {
                  <tr
                    class="border-b border-border/50 transition-colors last:border-0 hover:bg-page/60"
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
                          @if (transaction.goalName) {
                            <p class="text-[11px] text-accent">→ {{ transaction.goalName }}</p>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="hidden px-5 py-3 sm:table-cell">
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                        [class.bg-income/10]="transaction.categoryTone === 'income'"
                        [class.text-income]="transaction.categoryTone === 'income'"
                        [class.bg-accent/10]="transaction.categoryTone === 'accent'"
                        [class.text-accent]="transaction.categoryTone === 'accent'"
                      >
                        {{ transaction.categoryName }}
                      </span>
                    </td>
                    <td class="hidden px-5 py-3 text-[12px] text-text-muted md:table-cell">
                      {{ transaction.dateLabel }}
                    </td>
                    <td class="px-5 py-3 text-right">
                      <span
                        class="monetary-tabular text-[13px] font-semibold"
                        [class.text-income]="transaction.amountInCents > 0"
                        [class.text-text]="transaction.amountInCents < 0"
                      >
                        {{ formatCurrency(transaction.amountInCents, { showSign: true }) }}
                      </span>
                    </td>
                    <td class="px-5 py-3">
                      <div class="flex items-center justify-end gap-1">
                        <a
                          [routerLink]="['/transactions', transaction.id, 'modifier']"
                          class="rounded-lg p-2 text-text-muted transition-colors hover:bg-page hover:text-accent"
                          [attr.aria-label]="'Modifier ' + transaction.label"
                        >
                          <span class="material-symbols-outlined text-[18px]">edit</span>
                        </a>
                        <button
                          type="button"
                          class="rounded-lg p-2 text-text-muted transition-colors hover:bg-accent-surface hover:text-accent"
                          [attr.aria-label]="'Supprimer ' + transaction.label"
                          (click)="deleteTransaction(transaction.id, transaction.label)"
                        >
                          <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <span class="material-symbols-outlined text-[40px] text-border" aria-hidden="true"
              >receipt_long</span
            >
            <p class="text-[13px] font-medium text-text">Aucune transaction</p>
            <p class="text-[12px] text-text-muted">
              @if (hasActiveFilters()) {
                Essaie d'ajuster tes filtres ou ta recherche.
              } @else {
                Ajoute ta première transaction pour commencer le suivi.
              }
            </p>
            @if (hasActiveFilters()) {
              <button
                type="button"
                (click)="clearFilters()"
                class="mt-1 rounded-lg border border-border px-4 py-2 text-[12px] font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
              >
                Réinitialiser les filtres
              </button>
            } @else {
              <a
                routerLink="/transactions/nouvelle"
                class="mt-1 rounded-lg bg-accent px-4 py-2 text-[12px] font-semibold text-white"
              >
                Nouvelle transaction
              </a>
            }
          </div>
        }
      </section>
    </div>
  `,
})
export class Activity {
  private readonly appStore = inject(AppStore);

  protected readonly formatCurrency = formatCurrency;
  protected readonly searchQuery = signal('');
  protected readonly typeFilter = signal<TransactionType | ''>('');
  protected readonly categoryFilter = signal('');
  protected readonly sortKey = signal<SortKey>('date-desc');

  protected readonly allTransactions = computed(() => {
    const categoriesById = new Map(
      this.appStore.categories().map((category) => [category.id, category]),
    );
    const goalsById = new Map(this.appStore.goals().map((goal) => [goal.id, goal]));

    return [...this.appStore.transactions()]
      .sort((left, right) => right.date.localeCompare(left.date))
      .map((transaction) => toActivityRow(transaction, categoriesById, goalsById));
  });

  protected readonly availableCategories = computed(() => {
    const categories = new Set(this.allTransactions().map((item) => item.categoryName));
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
        transaction.categoryName.toLowerCase().includes(query) ||
        (transaction.goalName ?? '').toLowerCase().includes(query);

      const matchesType = !type || transaction.type === type;
      const matchesCategory = !category || transaction.categoryName === category;

      return matchesQuery && matchesType && matchesCategory;
    });

    result = [...result].sort((left, right) => {
      if (sort === 'amount-desc') return right.amountInCents - left.amountInCents;
      if (sort === 'amount-asc') return left.amountInCents - right.amountInCents;
      if (sort === 'date-asc') return left.rawDate.localeCompare(right.rawDate);
      return right.rawDate.localeCompare(left.rawDate);
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

  protected async deleteTransaction(transactionId: string, label: string): Promise<void> {
    if (!globalThis.confirm(`Supprimer « ${label} » ?`)) {
      return;
    }
    await this.appStore.deleteTransaction(transactionId);
  }
}

interface ActivityRow extends RecentTransaction {
  rawDate: string;
  goalName?: string;
}

function toActivityRow(
  transaction: Transaction,
  categoriesById: Map<string, { name: string; icon: string }>,
  goalsById: Map<string, { name: string }>,
): ActivityRow {
  const category = categoriesById.get(transaction.categoryId);

  return {
    id: transaction.id,
    label: transaction.note || category?.name || 'Transaction',
    note: transaction.note,
    categoryName: category?.name ?? 'Autre',
    categoryTone: transaction.type === 'income' ? 'income' : 'accent',
    dateLabel: formatShortDate(transaction.date),
    amountInCents:
      transaction.type === 'expense' ? -transaction.amountInCents : transaction.amountInCents,
    type: transaction.type,
    icon: category?.icon ?? 'receipt_long',
    hasReceipt: Boolean(transaction.receiptId),
    rawDate: transaction.date,
    goalName: transaction.goalId ? goalsById.get(transaction.goalId)?.name : undefined,
  };
}

function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
