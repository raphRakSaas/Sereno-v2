import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type RecurrenceFrequency = 'monthly' | 'weekly' | 'yearly';
type RecurrenceStatus = 'active' | 'paused';

interface RecurrenceItem {
  id: string;
  label: string;
  icon: string;
  amountInCents: number;
  type: 'income' | 'expense';
  frequency: RecurrenceFrequency;
  nextDateLabel: string;
  status: RecurrenceStatus;
}

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  monthly: 'Mensuel',
  weekly: 'Hebdomadaire',
  yearly: 'Annuel',
};

@Component({
  selector: 'app-recurrences',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="label-caps text-text-muted">Récurrences</h2>
        <p class="mt-0.5 text-[12px] text-text-muted">Tes revenus et dépenses fixes chaque mois</p>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-2 gap-gutter md:grid-cols-3">
        <section class="bento-card p-5">
          <p class="label-caps text-text-muted">Revenus fixes</p>
          <p class="mt-2 monetary-tabular text-[20px] font-bold text-income">
            +{{ formatCents(fixedIncomeTotal()) }}
          </p>
          <p class="mt-1 text-[11px] text-text-muted">par mois</p>
        </section>

        <section class="bento-card p-5">
          <p class="label-caps text-text-muted">Charges fixes</p>
          <p class="mt-2 monetary-tabular text-[20px] font-bold text-accent">
            -{{ formatCents(fixedExpensesTotal()) }}
          </p>
          <p class="mt-1 text-[11px] text-text-muted">par mois</p>
        </section>

        <section class="bento-card p-5 col-span-2 md:col-span-1">
          <p class="label-caps text-text-muted">Solde récurrent</p>
          <p
            class="mt-2 monetary-tabular text-[20px] font-bold"
            [class.text-income]="fixedBalance() > 0"
            [class.text-accent]="fixedBalance() <= 0"
          >
            {{ fixedBalance() > 0 ? '+' : '' }}{{ formatCents(fixedBalance()) }}
          </p>
          <p class="mt-1 text-[11px] text-text-muted">net mensuel</p>
        </section>
      </div>

      <!-- Recurrence list -->
      <section class="bento-card overflow-hidden">
        <div class="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 class="label-caps text-text-muted">Toutes les récurrences</h3>
          <span class="text-[11px] text-text-muted">
            {{ activeRecurrences().length }} actives · {{ pausedRecurrences().length }} en pause
          </span>
        </div>

        <ul role="list">
          @for (recurrence of recurrences(); track recurrence.id) {
            <li
              class="flex items-center gap-4 border-b border-border/50 px-5 py-4 transition-colors last:border-0"
              [class.opacity-50]="recurrence.status === 'paused'"
              [class.hover:bg-page/60]="recurrence.status === 'active'"
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
                  {{ frequencyLabel(recurrence.frequency) }} · Prochain :
                  {{ recurrence.nextDateLabel }}
                </p>
              </div>

              @if (recurrence.status === 'paused') {
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
                }}{{ formatCents(recurrence.amountInCents) }}
              </span>

              <button
                type="button"
                class="shrink-0 rounded-full p-1.5 transition-colors hover:bg-page"
                [attr.aria-label]="
                  recurrence.status === 'active'
                    ? 'Mettre en pause ' + recurrence.label
                    : 'Activer ' + recurrence.label
                "
                (click)="toggleStatus(recurrence.id)"
              >
                <span
                  class="material-symbols-outlined text-[16px]"
                  [class.text-text-muted]="recurrence.status === 'active'"
                  [class.text-income]="recurrence.status === 'paused'"
                  aria-hidden="true"
                >
                  {{ recurrence.status === 'active' ? 'pause' : 'play_arrow' }}
                </span>
              </button>
            </li>
          } @empty {
            <li class="px-5 py-10 text-center">
              <p class="text-[13px] font-medium text-text">Aucune récurrence pour l'instant</p>
              <p class="mt-1 text-[12px] text-text-muted">
                Ajoute un loyer, un salaire ou un abonnement pour ne plus les ressaisir chaque mois.
              </p>
            </li>
          }
        </ul>
      </section>
    </div>
  `,
})
export class Recurrences {
  protected readonly recurrences = signal<RecurrenceItem[]>([]);

  protected readonly activeRecurrences = computed(() =>
    this.recurrences().filter((rec) => rec.status === 'active'),
  );

  protected readonly pausedRecurrences = computed(() =>
    this.recurrences().filter((rec) => rec.status === 'paused'),
  );

  protected readonly fixedIncomeTotal = computed(() =>
    this.activeRecurrences()
      .filter((rec) => rec.type === 'income')
      .reduce((sum, rec) => sum + rec.amountInCents, 0),
  );

  protected readonly fixedExpensesTotal = computed(() =>
    this.activeRecurrences()
      .filter((rec) => rec.type === 'expense')
      .reduce((sum, rec) => sum + rec.amountInCents, 0),
  );

  protected readonly fixedBalance = computed(
    () => this.fixedIncomeTotal() - this.fixedExpensesTotal(),
  );

  protected frequencyLabel(frequency: RecurrenceFrequency): string {
    return FREQUENCY_LABELS[frequency];
  }

  protected toggleStatus(recurrenceId: string): void {
    this.recurrences.update((items) =>
      items.map((item) =>
        item.id === recurrenceId
          ? { ...item, status: item.status === 'active' ? 'paused' : 'active' }
          : item,
      ),
    );
  }

  protected formatCents(cents: number): string {
    return (cents / 100).toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    });
  }
}
