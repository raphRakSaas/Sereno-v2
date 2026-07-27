import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface SerenoInsightAction {
  id: string;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-sereno-insights-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card p-5" aria-labelledby="insights-title">
      <header class="mb-4">
        <p class="label-caps text-accent">Analyses de Sereno</p>
        <h2 id="insights-title" class="mt-1 text-[14px] font-semibold text-text">
          {{ welcomeTitle() }}
        </h2>
        <p class="mt-1.5 text-[12px] leading-relaxed text-text-muted">
          {{ welcomeMessage() }}
        </p>
      </header>

      <ul class="space-y-2.5">
        @for (action of actions(); track action.id) {
          <li
            class="flex items-start gap-3 rounded-xl border border-border/70 bg-page/70 px-3 py-2.5"
          >
            <span
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-surface text-accent"
              aria-hidden="true"
            >
              <span class="material-symbols-outlined text-[16px]">{{ action.icon }}</span>
            </span>
            <div class="min-w-0">
              <p class="text-[12px] font-semibold text-text">{{ action.label }}</p>
              <p class="mt-0.5 text-[11px] leading-relaxed text-text-muted">
                {{ action.description }}
              </p>
            </div>
          </li>
        }
      </ul>
    </section>
  `,
})
export class SerenoInsightsCard {
  readonly welcomeTitle = input('Bienvenue sur ton aperçu');
  readonly welcomeMessage = input(
    'Sereno t’aide à y voir plus clair, sans pression. Continue à remplir les dimensions de ton mois pour affiner tes analyses.',
  );
  readonly actions = input<SerenoInsightAction[]>([
    {
      id: 'transactions',
      label: 'Enregistre une dépense',
      description: 'Quelques transactions suffisent pour faire apparaître ta répartition.',
      icon: 'add_card',
    },
    {
      id: 'budgets',
      label: 'Affirme tes budgets',
      description: 'Ajuste tes plafonds pour suivre ce qui compte vraiment pour toi.',
      icon: 'account_balance_wallet',
    },
    {
      id: 'goals',
      label: 'Pose un objectif',
      description: 'Une destination claire rend chaque choix du mois plus simple.',
      icon: 'flag',
    },
  ]);
}
