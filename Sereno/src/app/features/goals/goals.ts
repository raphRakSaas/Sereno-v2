import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

interface GoalItem {
  id: string;
  name: string;
  icon: string;
  targetDateLabel: string;
  savedInCents: number;
  targetInCents: number;
  monthlyContributionInCents: number;
  status: 'active' | 'completed';
}

@Component({
  selector: 'app-goals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-[18px] font-semibold text-text">Objectifs d'épargne</h2>
          <p class="mt-0.5 text-[12px] text-text-muted">
            @if (allGoals().length === 0) {
              Donne un nom à ce que tu veux mettre de côté.
            } @else {
              {{ activeGoals().length }} en cours · {{ completedGoals().length }} atteint{{
                completedGoals().length > 1 ? 's' : ''
              }}
            }
          </p>
        </div>
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <span class="material-symbols-outlined text-[16px]" aria-hidden="true">add</span>
          Créer un objectif
        </button>
      </div>

      @if (activeGoals().length > 0) {
        <div>
          <h3 class="label-caps mb-3 text-text-muted">En cours</h3>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            @for (goal of activeGoals(); track goal.id) {
              <article class="bento-card p-5">
                <div class="mb-4 flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-full bg-accent-surface"
                    >
                      <span class="material-symbols-outlined text-accent" aria-hidden="true">{{
                        goal.icon
                      }}</span>
                    </div>
                    <div>
                      <p class="text-[14px] font-semibold text-text">{{ goal.name }}</p>
                      <p class="text-[11px] text-text-muted">{{ goal.targetDateLabel }}</p>
                    </div>
                  </div>
                  <span class="text-[12px] font-semibold text-accent"
                    >{{ goalPercent(goal) }}%</span
                  >
                </div>
                <div class="mb-2 flex justify-between text-[12px]">
                  <span class="monetary-tabular font-medium text-text">{{
                    formatCents(goal.savedInCents)
                  }}</span>
                  <span class="text-text-muted"
                    >sur {{ formatCents(goal.targetInCents) }}</span
                  >
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-page">
                  <div
                    class="h-full rounded-full bg-accent"
                    [style.width.%]="goalPercent(goal)"
                  ></div>
                </div>
              </article>
            }
          </div>
        </div>
      }

      @if (completedGoals().length > 0) {
        <div>
          <h3 class="label-caps mb-3 text-text-muted">Atteints</h3>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            @for (goal of completedGoals(); track goal.id) {
              <article class="bento-card flex items-center gap-3 p-4">
                <span
                  class="material-symbols-outlined text-income"
                  aria-hidden="true"
                  >check_circle</span
                >
                <div>
                  <p class="text-[13px] font-semibold text-text">{{ goal.name }}</p>
                  <p class="text-[11px] text-text-muted">{{ goal.targetDateLabel }}</p>
                </div>
              </article>
            }
          </div>
        </div>
      }

      @if (allGoals().length === 0) {
        <section class="bento-card flex flex-col items-center gap-4 px-8 py-16 text-center">
          <span
            class="flex h-12 w-12 items-center justify-center rounded-full bg-accent-surface text-accent"
            aria-hidden="true"
          >
            <span class="material-symbols-outlined text-[24px]">flag</span>
          </span>
          <div>
            <p class="text-[14px] font-semibold text-text">Aucun objectif pour l'instant</p>
            <p class="mt-1 max-w-sm text-[12px] leading-relaxed text-text-muted">
              Sereno n'invente rien à ta place. Quand tu créeras un objectif, il apparaîtra ici —
              avec ton vrai suivi, sur cet appareil.
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg bg-accent px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Créer mon premier objectif
          </button>
        </section>
      }
    </div>
  `,
})
export class Goals {
  /** Vide par défaut : les objectifs viendront du store local, pas de fausses données. */
  protected readonly allGoals = signal<GoalItem[]>([]);

  protected readonly activeGoals = computed(() =>
    this.allGoals().filter((goal) => goal.status === 'active'),
  );

  protected readonly completedGoals = computed(() =>
    this.allGoals().filter((goal) => goal.status === 'completed'),
  );

  protected goalPercent(goal: GoalItem): number {
    if (goal.targetInCents <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((goal.savedInCents / goal.targetInCents) * 100));
  }

  protected formatCents(cents: number): string {
    return (cents / 100).toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    });
  }
}
