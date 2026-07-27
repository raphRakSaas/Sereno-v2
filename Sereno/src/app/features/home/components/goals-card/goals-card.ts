import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SavingsGoalSummary } from '../../models/home.models';
import { calculateProgressPercent, formatCurrency } from '../../../../shared/utils/format-currency';

@Component({
  selector: 'app-goals-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card p-5" aria-labelledby="goals-title">
      <header class="mb-4 flex items-center justify-between gap-3">
        <h2 id="goals-title" class="text-[13px] font-semibold uppercase tracking-wide text-text">
          Objectifs
        </h2>
        <button type="button" class="label-caps text-accent hover:underline">Voir tout</button>
      </header>

      @if (goal(); as activeGoal) {
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-surface text-accent"
            >
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">{{
                activeGoal.icon
              }}</span>
            </div>
            <div class="min-w-0">
              <p class="truncate text-[13px] font-medium text-text">{{ activeGoal.name }}</p>
              <p class="text-[11px] text-text-muted">{{ activeGoal.targetDateLabel }}</p>
            </div>
          </div>

          <div class="flex items-end justify-between gap-3">
            <span class="text-[16px] font-semibold monetary-tabular text-text">
              {{ formatCurrency(activeGoal.savedInCents) }}
            </span>
            <span class="text-[11px] text-text-muted">
              sur {{ formatCurrency(activeGoal.targetInCents) }}
            </span>
          </div>

          <div
            class="h-1.5 overflow-hidden rounded-full bg-page"
            role="progressbar"
            [attr.aria-valuenow]="progressPercent()"
            aria-valuemin="0"
            aria-valuemax="100"
            [attr.aria-label]="'Progression objectif ' + activeGoal.name"
          >
            <div class="h-full bg-accent" [style.width.%]="progressPercent()"></div>
          </div>

          <p class="text-[11px] text-text-muted">
            Progression {{ progressPercent() }}% · +{{
              formatCurrency(activeGoal.monthlyContributionInCents)
            }}
            ce mois
          </p>
        </div>
      } @else {
        <div class="rounded-xl border border-dashed border-border bg-page/60 px-4 py-5 text-center">
          <div
            class="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent-surface text-accent"
          >
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">flag</span>
          </div>
          <p class="text-[13px] font-medium text-text">Aucun objectif pour l’instant</p>
          <p class="mt-1 text-[12px] leading-relaxed text-text-muted">
            Définis un objectif d’épargne pour donner une direction claire à ton mois.
          </p>
          <button
            type="button"
            class="mt-3 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Créer un objectif
          </button>
        </div>
      }
    </section>
  `,
})
export class GoalsCard {
  readonly goal = input<SavingsGoalSummary | null>(null);
  protected readonly formatCurrency = formatCurrency;

  protected readonly progressPercent = computed(() => {
    const activeGoal = this.goal();

    if (!activeGoal) {
      return 0;
    }

    return calculateProgressPercent(activeGoal.savedInCents, activeGoal.targetInCents);
  });
}
