import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppStore } from '../../core/store/app.store';
import { MoneyInput } from '../../shared/components/money-input/money-input';
import { GOAL_ICON_OPTIONS } from '../../shared/data/category-appearance';

@Component({
  selector: 'app-goal-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, MoneyInput],
  template: `
    <div class="mx-auto max-w-xl space-y-5">
      <div class="flex items-center gap-3">
        <a
          routerLink="/objectifs"
          class="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-accent"
          aria-label="Retour aux objectifs"
        >
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </a>
        <div>
          <h2 class="text-[18px] font-semibold text-text">Créer un objectif</h2>
          <p class="text-[12px] text-text-muted">Un but d'épargne, suivi à la main</p>
        </div>
      </div>

      <form class="bento-card space-y-5 p-5" [formGroup]="form" (ngSubmit)="onSubmit()">
        <label class="block">
          <span class="label-caps mb-2 block text-text-muted">Nom</span>
          <input
            type="text"
            formControlName="name"
            placeholder="Ex. Fonds d'urgence"
            class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          @if (form.controls.name.invalid && (form.controls.name.touched || submitted())) {
            <p class="mt-1 text-[12px] text-accent">Donne un nom à ton objectif.</p>
          }
        </label>

        <app-money-input
          label="Montant cible"
          [amountInCents]="targetAmountInCents()"
          (amountChange)="targetAmountInCents.set($event)"
        />
        @if (submitted() && targetAmountInCents() <= 0) {
          <p class="text-[12px] text-accent">Le montant cible doit être supérieur à 0.</p>
        }

        <label class="block">
          <span class="label-caps mb-2 block text-text-muted">Date cible (optionnel)</span>
          <input
            type="date"
            formControlName="targetDate"
            class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>

        <div>
          <span class="label-caps mb-2 block text-text-muted">Icône</span>
          <div class="flex flex-wrap gap-2">
            @for (icon of iconOptions; track icon) {
              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
                [class.border-accent]="form.controls.icon.value === icon"
                [class.bg-accent-surface]="form.controls.icon.value === icon"
                [class.border-border]="form.controls.icon.value !== icon"
                [attr.aria-label]="'Icône ' + icon"
                (click)="form.controls.icon.setValue(icon)"
              >
                <span class="material-symbols-outlined text-[18px] text-text">{{ icon }}</span>
              </button>
            }
          </div>
        </div>

        @if (errorMessage()) {
          <p class="rounded-lg bg-error/10 px-3 py-2 text-[12px] text-error">{{ errorMessage() }}</p>
        }

        <div class="flex justify-end gap-2">
          <a
            routerLink="/objectifs"
            class="rounded-lg border border-border px-4 py-2.5 text-[13px] font-semibold text-text transition-colors hover:border-accent hover:text-accent"
          >
            Annuler
          </a>
          <button
            type="submit"
            class="rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            [disabled]="isSaving()"
          >
            {{ isSaving() ? 'Création…' : "Créer l'objectif" }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class GoalCreate {
  private readonly formBuilder = inject(FormBuilder);
  private readonly appStore = inject(AppStore);
  private readonly router = inject(Router);

  protected readonly iconOptions = GOAL_ICON_OPTIONS;
  protected readonly targetAmountInCents = signal(0);
  protected readonly submitted = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    targetDate: [''],
    icon: this.formBuilder.nonNullable.control<string>('flag'),
  });

  protected async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.form.invalid || this.targetAmountInCents() <= 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    try {
      const values = this.form.getRawValue();
      await this.appStore.addGoal({
        name: values.name,
        targetAmountInCents: this.targetAmountInCents(),
        targetDate: values.targetDate || undefined,
        icon: values.icon,
      });
      await this.router.navigateByUrl('/objectifs');
    } catch {
      this.errorMessage.set("Impossible de créer l'objectif. Réessaie.");
    } finally {
      this.isSaving.set(false);
    }
  }
}
