import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AppStore } from '../../core/store/app.store';
import { GoalContribution, SavingsGoal } from '../../core/models/goal.model';
import { MoneyInput } from '../../shared/components/money-input/money-input';
import { calculateProgressPercent, formatCurrency } from '../../shared/utils/format-currency';

@Component({
  selector: 'app-goal-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MoneyInput],
  template: `
    <div class="mx-auto max-w-2xl space-y-5">
      <div class="flex items-center gap-3">
        <a
          routerLink="/objectifs"
          class="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-accent"
          aria-label="Retour aux objectifs"
        >
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </a>
        <div class="min-w-0 flex-1">
          <h2 class="truncate text-[18px] font-semibold text-text">
            {{ goal()?.name || 'Objectif' }}
          </h2>
          <p class="text-[12px] text-text-muted">Ajoute des contributions pour avancer</p>
        </div>
      </div>

      @if (goal(); as currentGoal) {
        <section class="bento-card space-y-4 p-5">
          <div class="flex items-start gap-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-accent-surface text-accent"
            >
              <span class="material-symbols-outlined text-[24px]" aria-hidden="true">{{
                currentGoal.icon
              }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[12px] text-text-muted">{{ targetDateLabel(currentGoal) }}</p>
              <div class="mt-2 flex items-end justify-between gap-3">
                <span class="monetary-tabular text-[22px] font-semibold text-text">
                  {{ formatCurrency(savedInCents(currentGoal)) }}
                </span>
                <span class="text-[12px] text-text-muted">
                  sur {{ formatCurrency(currentGoal.targetAmountInCents) }}
                </span>
              </div>
              <div class="mt-3 h-2 overflow-hidden rounded-full bg-page">
                <div
                  class="h-full rounded-full bg-accent"
                  [style.width.%]="goalPercent(currentGoal)"
                ></div>
              </div>
              <p class="mt-2 text-[12px] text-text-muted">
                Progression {{ goalPercent(currentGoal) }}%
                @if (currentGoal.completedAt) {
                  · Atteint
                }
              </p>
            </div>
          </div>
        </section>

        <section class="bento-card space-y-4 p-5">
          <h3 class="text-[14px] font-semibold text-text">Ajouter une contribution</h3>
          <p class="text-[12px] text-text-muted">
            Enregistre un montant mis de côté pour cet objectif — sans créer de transaction, ou via
            une transaction ci-dessous.
          </p>

          <app-money-input
            label="Montant"
            [amountInCents]="contributionAmountInCents()"
            (amountChange)="contributionAmountInCents.set($event)"
          />

          <label class="block">
            <span class="label-caps mb-2 block text-text-muted">Date</span>
            <input
              type="date"
              class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              [value]="contributionDate()"
              (change)="onContributionDateChange($event)"
            />
          </label>

          @if (contributionError()) {
            <p class="text-[12px] text-accent">{{ contributionError() }}</p>
          }

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              [disabled]="isSavingContribution()"
              (click)="addContribution()"
            >
              {{ isSavingContribution() ? 'Ajout…' : 'Ajouter la contribution' }}
            </button>
            <a
              class="rounded-lg border border-border px-4 py-2.5 text-[13px] font-semibold text-text transition-colors hover:border-accent hover:text-accent"
              [routerLink]="['/transactions/nouvelle']"
              [queryParams]="{ goalId: currentGoal.id }"
            >
              Via une transaction
            </a>
          </div>
        </section>

        <section class="bento-card overflow-hidden">
          <div class="border-b border-border px-5 py-4">
            <h3 class="label-caps text-text-muted">Historique des contributions</h3>
          </div>
          <ul role="list">
            @for (contribution of sortedContributions(currentGoal); track contribution.id) {
              <li
                class="flex items-center gap-3 border-b border-border/50 px-5 py-3 last:border-0"
              >
                <div class="min-w-0 flex-1">
                  <p class="monetary-tabular text-[13px] font-semibold text-income">
                    +{{ formatCurrency(contribution.amountInCents) }}
                  </p>
                  <p class="text-[11px] text-text-muted">
                    {{ formatContributionDate(contribution.date) }}
                    @if (contribution.transactionId) {
                      · liée à une transaction
                    }
                  </p>
                </div>
                <button
                  type="button"
                  class="rounded-lg p-2 text-text-muted transition-colors hover:bg-accent-surface hover:text-accent"
                  [attr.aria-label]="'Supprimer la contribution du ' + contribution.date"
                  (click)="removeContribution(currentGoal.id, contribution.id)"
                >
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </li>
            } @empty {
              <li class="px-5 py-10 text-center text-[12px] text-text-muted">
                Aucune contribution pour l'instant. Ajoute-en une ci-dessus.
              </li>
            }
          </ul>
        </section>
      } @else {
        <section class="bento-card px-5 py-10 text-center">
          <p class="text-[13px] font-medium text-text">Objectif introuvable</p>
          <a routerLink="/objectifs" class="mt-3 inline-block text-[12px] font-medium text-accent">
            Retour à la liste
          </a>
        </section>
      }
    </div>
  `,
})
export class GoalDetail {
  private readonly appStore = inject(AppStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly formatCurrency = formatCurrency;

  private readonly goalId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('goalId') ?? '')),
    { initialValue: '' },
  );

  protected readonly goal = computed(() =>
    this.appStore.goals().find((item) => item.id === this.goalId()) ?? null,
  );

  protected readonly contributionAmountInCents = signal(0);
  protected readonly contributionDate = signal(getTodayIsoDate());
  protected readonly contributionError = signal('');
  protected readonly isSavingContribution = signal(false);

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

  protected sortedContributions(goal: SavingsGoal): GoalContribution[] {
    return [...goal.contributions].sort((left, right) => right.date.localeCompare(left.date));
  }

  protected formatContributionDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  protected onContributionDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contributionDate.set(input.value);
  }

  protected async addContribution(): Promise<void> {
    const currentGoal = this.goal();
    this.contributionError.set('');

    if (!currentGoal) {
      return;
    }

    if (this.contributionAmountInCents() <= 0) {
      this.contributionError.set('Indique un montant supérieur à 0.');
      return;
    }

    this.isSavingContribution.set(true);
    try {
      await this.appStore.addGoalContribution(
        currentGoal.id,
        this.contributionAmountInCents(),
        this.contributionDate(),
      );
      this.contributionAmountInCents.set(0);
    } catch {
      this.contributionError.set("Impossible d'ajouter la contribution.");
    } finally {
      this.isSavingContribution.set(false);
    }
  }

  protected async removeContribution(goalId: string, contributionId: string): Promise<void> {
    if (!globalThis.confirm('Supprimer cette contribution ?')) {
      return;
    }
    await this.appStore.deleteGoalContribution(goalId, contributionId);
  }
}

function getTodayIsoDate(): string {
  const today = new Date();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}
