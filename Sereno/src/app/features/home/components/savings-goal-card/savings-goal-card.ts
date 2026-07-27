import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SavingsGoalSummary } from '../../models/home.models';
import { calculateProgressPercent, formatCurrency } from '../../../../shared/utils/format-currency';

@Component({
  selector: 'app-savings-goal-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card p-6" aria-labelledby="savings-title">
      <header class="mb-4 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-surface">
          <span
            class="material-symbols-outlined text-accent"
            style="font-variation-settings: 'FILL' 1"
            aria-hidden="true"
          >
            {{ goal().icon }}
          </span>
        </div>
        <div>
          <h2 id="savings-title" class="text-[15px] font-semibold text-text">{{ goal().name }}</h2>
          <p class="text-[12px] text-text-muted">{{ goal().targetDateLabel }}</p>
        </div>
      </header>

      <div class="space-y-4">
        <div class="flex items-end justify-between">
          <span class="text-xl font-semibold monetary-tabular text-text">
            {{ formatCurrency(goal().savedInCents) }}
          </span>
          <span class="text-[13px] text-text-muted">
            sur {{ formatCurrency(goal().targetInCents) }}
          </span>
        </div>

        <div>
          <div
            class="mb-4 h-2.5 overflow-hidden rounded-full border border-border/30 bg-page"
            role="progressbar"
            [attr.aria-valuenow]="progressPercent()"
            aria-valuemin="0"
            aria-valuemax="100"
            [attr.aria-label]="'Progression objectif ' + goal().name"
          >
            <div class="h-full bg-accent transition-all" [style.width.%]="progressPercent()"></div>
          </div>
          <div class="flex justify-between text-[11px] uppercase tracking-wide text-text-muted">
            <span>Progression : {{ progressPercent() }}%</span>
            <span>+{{ formatCurrency(goal().monthlyContributionInCents) }} ce mois</span>
          </div>
        </div>

        <button
          type="button"
          class="w-full rounded-lg border border-accent py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent-surface"
        >
          Booster l'épargne
        </button>
      </div>
    </section>
  `,
})
export class SavingsGoalCard {
  readonly goal = input.required<SavingsGoalSummary>();
  protected readonly formatCurrency = formatCurrency;

  protected readonly progressPercent = computed(() =>
    calculateProgressPercent(this.goal().savedInCents, this.goal().targetInCents),
  );
}
