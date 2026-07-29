import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppStore } from '../../core/store/app.store';
import { SavingsGoal } from '../../core/models/goal.model';
import { calculateProgressPercent, formatCurrency } from '../../shared/utils/format-currency';

@Component({
  selector: 'app-goals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
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
        <a
          routerLink="/objectifs/creer"
          class="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <span class="material-symbols-outlined text-[16px]" aria-hidden="true">add</span>
          Créer un objectif
        </a>
      </div>

      @if (activeGoals().length > 0) {
        <div>
          <h3 class="label-caps mb-3 text-text-muted">En cours</h3>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            @for (goal of activeGoals(); track goal.id) {
              <a [routerLink]="['/objectifs', goal.id]" class="bento-card block p-5 transition-colors hover:border-accent/40">
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
                      <p class="text-[11px] text-text-muted">{{ targetDateLabel(goal) }}</p>
                    </div>
                  </div>
                  <span class="text-[12px] font-semibold text-accent"
                    >{{ goalPercent(goal) }}%</span
                  >
                </div>
                <div class="mb-2 flex justify-between text-[12px]">
                  <span class="monetary-tabular font-medium text-text">{{
                    formatCurrency(savedInCents(goal))
                  }}</span>
                  <span class="text-text-muted"
                    >sur {{ formatCurrency(goal.targetAmountInCents) }}</span
                  >
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-page">
                  <div
                    class="h-full rounded-full bg-accent"
                    [style.width.%]="goalPercent(goal)"
                  ></div>
                </div>
                <p class="mt-3 text-[11px] font-medium text-accent">Ouvrir · Ajouter une contribution</p>
              </a>
            }
          </div>
        </div>
      }

      @if (completedGoals().length > 0) {
        <div>
          <h3 class="label-caps mb-3 text-text-muted">Atteints</h3>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            @for (goal of completedGoals(); track goal.id) {
              <a
                [routerLink]="['/objectifs', goal.id]"
                class="bento-card flex items-center gap-3 p-4 transition-colors hover:border-accent/40"
              >
                <span class="material-symbols-outlined text-income" aria-hidden="true"
                  >check_circle</span
                >
                <div>
                  <p class="text-[13px] font-semibold text-text">{{ goal.name }}</p>
                  <p class="text-[11px] text-text-muted">{{ targetDateLabel(goal) }}</p>
                </div>
              </a>
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
          <a
            routerLink="/objectifs/creer"
            class="rounded-lg bg-accent px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Créer mon premier objectif
          </a>
        </section>
      }
    </div>
  `,
})
export class Goals {
  private readonly appStore = inject(AppStore);

  protected readonly formatCurrency = formatCurrency;
  protected readonly allGoals = computed(() => this.appStore.goals());

  protected readonly activeGoals = computed(() =>
    this.allGoals().filter((goal) => !goal.completedAt),
  );

  protected readonly completedGoals = computed(() =>
    this.allGoals().filter((goal) => Boolean(goal.completedAt)),
  );

  protected savedInCents(goal: SavingsGoal): number {
    return goal.contributions.reduce(
      (total, contribution) => total + contribution.amountInCents,
      0,
    );
  }

  protected goalPercent(goal: SavingsGoal): number {
    return calculateProgressPercent(this.savedInCents(goal), goal.targetAmountInCents);
  }

  protected targetDateLabel(goal: SavingsGoal): string {
    if (!goal.targetDate) {
      return 'Sans date cible';
    }
    return `Objectif : ${new Date(goal.targetDate).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    })}`;
  }
}
