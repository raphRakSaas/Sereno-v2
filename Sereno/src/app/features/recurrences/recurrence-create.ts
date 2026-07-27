import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppStore } from '../../core/store/app.store';
import { Category } from '../../core/models/category.model';
import { RecurrenceFrequency } from '../../core/models/recurrence.model';
import { TransactionType } from '../../core/models/transaction.model';
import { MoneyInput } from '../../shared/components/money-input/money-input';

@Component({
  selector: 'app-recurrence-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, MoneyInput],
  template: `
    <div class="mx-auto max-w-xl space-y-5">
      <div class="flex items-center gap-3">
        <a
          routerLink="/recurrences"
          class="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-accent"
          aria-label="Retour aux récurrences"
        >
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </a>
        <div>
          <h2 class="text-[18px] font-semibold text-text">Nouvelle récurrence</h2>
          <p class="text-[12px] text-text-muted">Loyer, salaire, abonnement…</p>
        </div>
      </div>

      <form class="bento-card space-y-5 p-5" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div>
          <span class="label-caps mb-2 block text-text-muted">Type</span>
          <div class="flex overflow-hidden rounded-lg border border-border">
            <button
              type="button"
              class="flex-1 px-3 py-2.5 text-[13px] font-semibold transition-colors"
              [class.bg-accent]="recurrenceType() === 'expense'"
              [class.text-white]="recurrenceType() === 'expense'"
              [class.text-text-muted]="recurrenceType() !== 'expense'"
              (click)="setType('expense')"
            >
              Dépense
            </button>
            <button
              type="button"
              class="flex-1 px-3 py-2.5 text-[13px] font-semibold transition-colors"
              [class.bg-income]="recurrenceType() === 'income'"
              [class.text-white]="recurrenceType() === 'income'"
              [class.text-text-muted]="recurrenceType() !== 'income'"
              (click)="setType('income')"
            >
              Revenu
            </button>
          </div>
        </div>

        <label class="block">
          <span class="label-caps mb-2 block text-text-muted">Libellé</span>
          <input
            type="text"
            formControlName="note"
            placeholder="Ex. Loyer"
            class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          @if (form.controls.note.invalid && (form.controls.note.touched || submitted())) {
            <p class="mt-1 text-[12px] text-accent">Indique un libellé.</p>
          }
        </label>

        <app-money-input
          label="Montant"
          [amountInCents]="amountInCents()"
          (amountChange)="amountInCents.set($event)"
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
        </label>

        <label class="block">
          <span class="label-caps mb-2 block text-text-muted">Fréquence</span>
          <select
            formControlName="frequency"
            class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="daily">Quotidienne</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuelle</option>
            <option value="yearly">Annuelle</option>
          </select>
        </label>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="label-caps mb-2 block text-text-muted">Date de début</span>
            <input
              type="date"
              formControlName="startDate"
              class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>
          <label class="block">
            <span class="label-caps mb-2 block text-text-muted">Date de fin (optionnel)</span>
            <input
              type="date"
              formControlName="endDate"
              class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>
        </div>

        @if (errorMessage()) {
          <p class="rounded-lg bg-accent/10 px-3 py-2 text-[12px] text-accent">{{ errorMessage() }}</p>
        }

        <div class="flex justify-end gap-2">
          <a
            routerLink="/recurrences"
            class="rounded-lg border border-border px-4 py-2.5 text-[13px] font-semibold text-text transition-colors hover:border-accent hover:text-accent"
          >
            Annuler
          </a>
          <button
            type="submit"
            class="rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            [disabled]="isSaving()"
          >
            {{ isSaving() ? 'Création…' : 'Créer la récurrence' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class RecurrenceCreate {
  private readonly formBuilder = inject(FormBuilder);
  private readonly appStore = inject(AppStore);
  private readonly router = inject(Router);

  protected readonly recurrenceType = signal<TransactionType>('expense');
  protected readonly amountInCents = signal(0);
  protected readonly submitted = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    note: ['', [Validators.required, Validators.minLength(2)]],
    categoryId: ['', Validators.required],
    frequency: this.formBuilder.nonNullable.control<RecurrenceFrequency>('monthly'),
    startDate: [getTodayIsoDate(), Validators.required],
    endDate: [''],
  });

  protected readonly categoriesForType = computed(() => {
    const type = this.recurrenceType();
    const categories = this.appStore.activeCategories();
    if (type === 'income') {
      return categories.filter(
        (category: Category) => category.id === 'cat-income' || !category.isSystem,
      );
    }
    return categories.filter((category: Category) => category.id !== 'cat-income');
  });

  protected setType(type: TransactionType): void {
    this.recurrenceType.set(type);
    const available = this.categoriesForType();
    const current = this.form.controls.categoryId.value;
    if (!available.some((category: Category) => category.id === current)) {
      this.form.controls.categoryId.setValue(available[0]?.id ?? '');
    }
  }

  protected async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.form.invalid || this.amountInCents() <= 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    try {
      const values = this.form.getRawValue();
      await this.appStore.addRecurrence({
        type: this.recurrenceType(),
        amountInCents: this.amountInCents(),
        categoryId: values.categoryId,
        note: values.note,
        frequency: values.frequency,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
      });
      await this.router.navigateByUrl('/recurrences');
    } catch {
      this.errorMessage.set('Impossible de créer la récurrence. Réessaie.');
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
