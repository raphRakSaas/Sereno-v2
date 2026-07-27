import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppStore } from '../../core/store/app.store';
import { Recurrence, RecurrenceFrequency } from '../../core/models/recurrence.model';
import { formatCurrency } from '../../shared/utils/format-currency';

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  monthly: 'Mensuel',
  weekly: 'Hebdomadaire',
  yearly: 'Annuel',
};

@Component({
  selector: 'app-recurrences',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="label-caps text-text-muted">Récurrences</h2>
          <p class="mt-0.5 text-[12px] text-text-muted">Tes revenus et dépenses fixes chaque mois</p>
        </div>
        <a
          routerLink="/recurrences/creer"
          class="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <span class="material-symbols-outlined text-[16px]" aria-hidden="true">add</span>
          Ajouter
        </a>
      </div>

      <div class="grid grid-cols-2 gap-gutter md:grid-cols-3">
        <section class="bento-card p-5">
          <p class="label-caps text-text-muted">Revenus fixes</p>
          <p class="mt-2 monetary-tabular text-[20px] font-bold text-income">
            +{{ formatCurrency(fixedIncomeTotal()) }}
          </p>
          <p class="mt-1 text-[11px] text-text-muted">par mois</p>
        </section>

        <section class="bento-card p-5">
          <p class="label-caps text-text-muted">Charges fixes</p>
          <p class="mt-2 monetary-tabular text-[20px] font-bold text-accent">
            -{{ formatCurrency(fixedExpensesTotal()) }}
          </p>
          <p class="mt-1 text-[11px] text-text-muted">par mois</p>
        </section>

        <section class="bento-card col-span-2 p-5 md:col-span-1">
          <p class="label-caps text-text-muted">Solde récurrent</p>
          <p
            class="mt-2 monetary-tabular text-[20px] font-bold"
            [class.text-income]="fixedBalance() > 0"
            [class.text-accent]="fixedBalance() <= 0"
          >
            {{ fixedBalance() > 0 ? '+' : '' }}{{ formatCurrency(fixedBalance()) }}
          </p>
          <p class="mt-1 text-[11px] text-text-muted">net mensuel</p>
        </section>
      </div>

      <section class="bento-card overflow-hidden">
        <div class="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 class="label-caps text-text-muted">Toutes les récurrences</h3>
          <span class="text-[11px] text-text-muted">
            {{ activeRecurrences().length }} actives · {{ pausedRecurrences().length }} en pause
          </span>
        </div>

        <ul role="list">
          @for (recurrence of recurrenceViews(); track recurrence.id) {
            <li
              class="flex items-center gap-4 border-b border-border/50 px-5 py-4 transition-colors last:border-0"
              [class.opacity-50]="recurrence.isPaused"
              [class.hover:bg-page/60]="!recurrence.isPaused"
            >
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                [class.bg-income/10]="recurrence.type === 'income'"
                [class.bg-accent/10]="recurrence.type === 'expense'"
              >
                <span
                  class="material-symbols-outlined text-[17px]"
                  [class.text-income]="recurrence.type === 'income'"
                  [class.text-accent]="recurrence.type === 'expense'"
                  aria-hidden="true"
                >
                  {{ recurrence.icon }}
                </span>
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-[13px] font-medium text-text">{{ recurrence.label }}</p>
                <p class="text-[11px] text-text-muted">
                  {{ frequencyLabel(recurrence.frequency) }} · Début :
                  {{ formatDate(recurrence.startDate) }}
                </p>
              </div>

              @if (recurrence.isPaused) {
                <span
                  class="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-text-muted"
                >
                  En pause
                </span>
              }

              <span
                class="monetary-tabular shrink-0 text-[13px] font-semibold"
                [class.text-income]="recurrence.type === 'income'"
                [class.text-text]="recurrence.type === 'expense'"
              >
                {{ recurrence.type === 'income' ? '+' : '-'
                }}{{ formatCurrency(recurrence.amountInCents) }}
              </span>

              <button
                type="button"
                class="shrink-0 rounded-full p-1.5 transition-colors hover:bg-page"
                [attr.aria-label]="
                  recurrence.isPaused
                    ? 'Activer ' + recurrence.label
                    : 'Mettre en pause ' + recurrence.label
                "
                (click)="togglePause(recurrence.id, recurrence.isPaused)"
              >
                <span
                  class="material-symbols-outlined text-[16px]"
                  [class.text-text-muted]="!recurrence.isPaused"
                  [class.text-income]="recurrence.isPaused"
                  aria-hidden="true"
                >
                  {{ recurrence.isPaused ? 'play_arrow' : 'pause' }}
                </span>
              </button>
            </li>
          } @empty {
            <li class="px-5 py-10 text-center">
              <p class="text-[13px] font-medium text-text">Aucune récurrence pour l'instant</p>
              <p class="mt-1 text-[12px] text-text-muted">
                Ajoute un loyer, un salaire ou un abonnement pour ne plus les ressaisir chaque mois.
              </p>
              <a
                routerLink="/recurrences/creer"
                class="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Créer une récurrence
              </a>
            </li>
          }
        </ul>
      </section>
    </div>
  `,
})
export class Recurrences {
  private readonly appStore = inject(AppStore);

  protected readonly formatCurrency = formatCurrency;

  protected readonly recurrenceViews = computed(() => {
    const categoriesById = new Map(
      this.appStore.categories().map((category) => [category.id, category]),
    );

    return this.appStore.recurrences().map((recurrence) => ({
      ...recurrence,
      label: recurrence.note || categoriesById.get(recurrence.categoryId)?.name || 'Récurrence',
      icon: categoriesById.get(recurrence.categoryId)?.icon ?? 'repeat',
    }));
  });

  protected readonly activeRecurrences = computed(() =>
    this.recurrenceViews().filter((recurrence) => !recurrence.isPaused),
  );

  protected readonly pausedRecurrences = computed(() =>
    this.recurrenceViews().filter((recurrence) => recurrence.isPaused),
  );

  protected readonly fixedIncomeTotal = computed(() =>
    this.activeRecurrences()
      .filter((recurrence) => recurrence.type === 'income')
      .reduce((total, recurrence) => total + monthlyEquivalent(recurrence), 0),
  );

  protected readonly fixedExpensesTotal = computed(() =>
    this.activeRecurrences()
      .filter((recurrence) => recurrence.type === 'expense')
      .reduce((total, recurrence) => total + monthlyEquivalent(recurrence), 0),
  );

  protected readonly fixedBalance = computed(
    () => this.fixedIncomeTotal() - this.fixedExpensesTotal(),
  );

  protected frequencyLabel(frequency: RecurrenceFrequency): string {
    return FREQUENCY_LABELS[frequency];
  }

  protected formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  protected async togglePause(recurrenceId: string, isPaused: boolean): Promise<void> {
    await this.appStore.updateRecurrence(recurrenceId, { isPaused: !isPaused });
  }
}

function monthlyEquivalent(recurrence: Recurrence): number {
  switch (recurrence.frequency) {
    case 'weekly':
      return Math.round(recurrence.amountInCents * 4.33);
    case 'yearly':
      return Math.round(recurrence.amountInCents / 12);
    default:
      return recurrence.amountInCents;
  }
}
