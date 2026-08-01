import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AppStore } from '../../core/store/app.store';
import { Category } from '../../core/models/category.model';
import { RecurrenceFrequency } from '../../core/models/recurrence.model';
import { TransactionType } from '../../core/models/transaction.model';
import { MoneyInput } from '../../shared/components/money-input/money-input';

@Component({
  selector: 'app-transaction-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, MoneyInput],
  template: `
    <div class="mx-auto max-w-xl space-y-5">
      <div class="flex items-center gap-3">
        <a
          routerLink="/activite"
          class="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-accent"
          aria-label="Retour à l'activité"
        >
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </a>
        <div>
          <h2 class="text-[18px] font-semibold text-text">
            {{ isEditMode() ? 'Modifier la transaction' : 'Nouvelle transaction' }}
          </h2>
          <p class="text-[12px] text-text-muted">Enregistrée localement sur cet appareil</p>
        </div>
      </div>

      <form class="bento-card space-y-5 p-5" [formGroup]="form" (ngSubmit)="onSubmit(false)">
        <div>
          <span class="label-caps mb-2 block text-text-muted">Type</span>
          <div class="flex overflow-hidden rounded-lg border border-border">
            <button
              type="button"
              class="flex-1 px-3 py-2.5 text-[13px] font-semibold transition-colors"
              [class.bg-accent]="transactionType() === 'expense'"
              [class.text-white]="transactionType() === 'expense'"
              [class.text-text-muted]="transactionType() !== 'expense'"
              (click)="setType('expense')"
            >
              Dépense
            </button>
            <button
              type="button"
              class="flex-1 px-3 py-2.5 text-[13px] font-semibold transition-colors"
              [class.bg-income]="transactionType() === 'income'"
              [class.text-white]="transactionType() === 'income'"
              [class.text-text-muted]="transactionType() !== 'income'"
              (click)="setType('income')"
            >
              Revenu
            </button>
          </div>
        </div>

        <app-money-input
          label="Montant"
          [amountInCents]="amountInCents()"
          (amountChange)="onAmountChange($event)"
        />
        @if (submitted() && amountInCents() <= 0) {
          <p class="text-[12px] text-accent">Indique un montant supérieur à 0.</p>
        }

        <label class="block">
          <span class="label-caps mb-2 block text-text-muted">Catégorie</span>
          <select
            formControlName="categoryId"
            class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="" disabled>Choisir une catégorie</option>
            @for (category of categoriesForType(); track category.id) {
              <option [value]="category.id">{{ category.name }}</option>
            }
          </select>
          @if (
            form.controls.categoryId.invalid && (form.controls.categoryId.touched || submitted())
          ) {
            <p class="mt-1 text-[12px] text-accent">Choisis une catégorie.</p>
          }
        </label>

        <p class="text-[12px]">
          <a routerLink="/categories/nouvelle" class="font-medium text-accent hover:underline">
            + Créer une catégorie
          </a>
        </p>

        <label class="block">
          <span class="label-caps mb-2 block text-text-muted">Date</span>
          <input
            type="date"
            formControlName="date"
            class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>

        <label class="block">
          <span class="label-caps mb-2 block text-text-muted">Libellé (optionnel)</span>
          <input
            type="text"
            formControlName="note"
            placeholder="Ex. Courses Carrefour"
            class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>

        <div>
          <span class="label-caps mb-2 block text-text-muted">Transaction récurrente</span>
          <div class="flex overflow-hidden rounded-lg border border-border">
            <button
              type="button"
              class="flex-1 px-3 py-2.5 text-[13px] font-semibold transition-colors"
              [class.bg-page]="!isRecurring()"
              [class.text-text]="!isRecurring()"
              [class.text-text-muted]="isRecurring()"
              (click)="setRecurring(false)"
            >
              Non
            </button>
            <button
              type="button"
              class="flex-1 px-3 py-2.5 text-[13px] font-semibold transition-colors"
              [class.bg-accent]="isRecurring()"
              [class.text-white]="isRecurring()"
              [class.text-text-muted]="!isRecurring()"
              (click)="setRecurring(true)"
            >
              Oui
            </button>
          </div>
          <p class="mt-1 text-[11px] text-text-muted">
            Par défaut non — active pour créer aussi une récurrence (loyer, salaire…).
          </p>
        </div>

        @if (isRecurring()) {
          <div class="space-y-4 rounded-xl border border-border bg-page/50 p-4">
            <label class="block">
              <span class="label-caps mb-2 block text-text-muted">Fréquence</span>
              <select
                formControlName="recurrenceFrequency"
                class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="daily">Tous les jours</option>
                <option value="weekly">Toutes les semaines</option>
                <option value="monthly">Tous les mois</option>
                <option value="yearly">Tous les ans</option>
              </select>
            </label>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="label-caps mb-2 block text-text-muted">Début</span>
                <input
                  type="date"
                  formControlName="recurrenceStartDate"
                  class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
              <label class="block">
                <span class="label-caps mb-2 block text-text-muted">Fin (optionnel)</span>
                <input
                  type="date"
                  formControlName="recurrenceEndDate"
                  class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
            </div>

            @if (
              submitted() &&
              form.controls.recurrenceEndDate.value &&
              form.controls.recurrenceEndDate.value < form.controls.recurrenceStartDate.value
            ) {
              <p class="text-[12px] text-accent">La date de fin doit être après la date de début.</p>
            }

            <p class="text-[11px] leading-relaxed text-text-muted">
              La transaction d'aujourd'hui est enregistrée maintenant. Sereno créera les
              prochaines occurrences selon la fréquence choisie.
            </p>
          </div>
        }

        <label class="block">
          <span class="label-caps mb-2 block text-text-muted">Contribuer à un objectif</span>
          <select
            formControlName="goalId"
            class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="">Aucun</option>
            @for (goal of activeGoals(); track goal.id) {
              <option [value]="goal.id">{{ goal.name }}</option>
            }
          </select>
          <p class="mt-1 text-[11px] text-text-muted">
            Le montant sera aussi compté dans la progression de l'objectif choisi.
          </p>
        </label>

        @if (errorMessage()) {
          <p class="rounded-lg bg-error/10 px-3 py-2 text-[12px] text-error">{{ errorMessage() }}</p>
        }

        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <a
            routerLink="/activite"
            class="rounded-lg border border-border px-4 py-2.5 text-center text-[13px] font-semibold text-text transition-colors hover:border-accent hover:text-accent"
          >
            Annuler
          </a>
          @if (!isEditMode()) {
            <button
              type="button"
              class="rounded-lg border border-accent/40 px-4 py-2.5 text-[13px] font-semibold text-accent transition-colors hover:bg-accent-surface"
              [disabled]="isSaving()"
              (click)="onSubmit(true)"
            >
              Enregistrer et ajouter une autre
            </button>
          }
          <button
            type="submit"
            class="rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            [disabled]="isSaving()"
          >
            {{
              isSaving()
                ? 'Enregistrement…'
                : isEditMode()
                  ? 'Enregistrer les modifications'
                  : 'Enregistrer'
            }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class TransactionForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly appStore = inject(AppStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly transactionId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('transactionId'))),
    { initialValue: null as string | null },
  );

  private readonly queryGoalId = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('goalId') ?? '')),
    { initialValue: '' },
  );

  protected readonly isEditMode = computed(() => Boolean(this.transactionId()));

  protected readonly transactionType = signal<TransactionType>('expense');
  protected readonly isRecurring = signal(false);
  protected readonly amountInCents = signal(0);
  protected readonly submitted = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  private readonly formHydrated = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    categoryId: ['', Validators.required],
    date: [getTodayIsoDate(), Validators.required],
    note: [''],
    goalId: [''],
    recurrenceFrequency: this.formBuilder.nonNullable.control<RecurrenceFrequency>('monthly'),
    recurrenceStartDate: [getTodayIsoDate(), Validators.required],
    recurrenceEndDate: [''],
  });

  protected readonly activeGoals = computed(() =>
    this.appStore.goals().filter((goal) => !goal.completedAt),
  );

  protected readonly categoriesForType = computed(() => {
    const type = this.transactionType();
    const categories = this.appStore.activeCategories();

    if (type === 'income') {
      return categories.filter(
        (category: Category) => category.id === 'cat-income' || !category.isSystem,
      );
    }

    return categories.filter((category: Category) => category.id !== 'cat-income');
  });

  constructor() {
    effect(() => {
      const id = this.transactionId();
      const queryGoal = this.queryGoalId();

      if (this.formHydrated()) {
        return;
      }

      if (id) {
        const existing = this.appStore.transactions().find((transaction) => transaction.id === id);
        if (!existing) {
          return;
        }

        this.transactionType.set(existing.type);
        this.amountInCents.set(existing.amountInCents);
        this.isRecurring.set(Boolean(existing.recurrenceId));
        this.form.patchValue({
          categoryId: existing.categoryId,
          date: existing.date,
          note: existing.note,
          goalId: existing.goalId ?? '',
          recurrenceStartDate: existing.date,
        });
        this.formHydrated.set(true);
        return;
      }

      if (queryGoal) {
        this.form.controls.goalId.setValue(queryGoal);
      }
      this.formHydrated.set(true);
    });
  }

  protected setType(type: TransactionType): void {
    this.transactionType.set(type);
    const available = this.categoriesForType();
    const current = this.form.controls.categoryId.value;
    if (!available.some((category: Category) => category.id === current)) {
      this.form.controls.categoryId.setValue(available[0]?.id ?? '');
    }
  }

  protected setRecurring(enabled: boolean): void {
    this.isRecurring.set(enabled);
    if (enabled) {
      const transactionDate = this.form.controls.date.value;
      if (!this.form.controls.recurrenceStartDate.value) {
        this.form.controls.recurrenceStartDate.setValue(transactionDate);
      }
    }
  }

  protected onAmountChange(amountInCents: number): void {
    this.amountInCents.set(amountInCents);
  }

  protected async onSubmit(addAnother: boolean): Promise<void> {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.form.invalid || this.amountInCents() <= 0) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    if (
      this.isRecurring() &&
      values.recurrenceEndDate &&
      values.recurrenceEndDate < values.recurrenceStartDate
    ) {
      return;
    }

    this.isSaving.set(true);

    try {
      const payload = {
        type: this.transactionType(),
        amountInCents: this.amountInCents(),
        date: values.date,
        categoryId: values.categoryId,
        note: values.note,
        goalId: values.goalId || undefined,
        recurrence:
          this.isRecurring() && !this.isEditMode()
            ? {
                frequency: values.recurrenceFrequency,
                startDate: values.recurrenceStartDate || values.date,
                endDate: values.recurrenceEndDate || undefined,
              }
            : undefined,
      };

      const editId = this.transactionId();
      if (editId) {
        await this.appStore.updateTransaction(editId, {
          type: payload.type,
          amountInCents: payload.amountInCents,
          date: payload.date,
          categoryId: payload.categoryId,
          note: payload.note,
          goalId: payload.goalId,
        });
        await this.router.navigateByUrl('/activite');
        return;
      }

      await this.appStore.addTransaction(payload);

      if (addAnother) {
        this.amountInCents.set(0);
        this.isRecurring.set(false);
        this.form.patchValue({
          note: '',
          date: getTodayIsoDate(),
          goalId: values.goalId,
          recurrenceEndDate: '',
          recurrenceStartDate: getTodayIsoDate(),
        });
        this.submitted.set(false);
      } else if (payload.recurrence) {
        await this.router.navigateByUrl('/recurrences');
      } else if (values.goalId) {
        await this.router.navigate(['/objectifs', values.goalId]);
      } else {
        await this.router.navigateByUrl('/activite');
      }
    } catch {
      this.errorMessage.set("Impossible d'enregistrer la transaction. Réessaie.");
    } finally {
      this.isSaving.set(false);
    }
  }
}

function getTodayIsoDate(): string {
  const today = new Date();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}
