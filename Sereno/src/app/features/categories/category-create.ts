import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppStore } from '../../core/store/app.store';
import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
} from '../../shared/data/category-appearance';

@Component({
  selector: 'app-category-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-xl space-y-5">
      <div class="flex items-center gap-3">
        <a
          routerLink="/budgets"
          class="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-accent"
          aria-label="Retour aux budgets"
        >
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </a>
        <div>
          <h2 class="text-[18px] font-semibold text-text">Nouvelle catégorie</h2>
          <p class="text-[12px] text-text-muted">Personnalise ton suivi de dépenses</p>
        </div>
      </div>

      <form class="bento-card space-y-5 p-5" [formGroup]="form" (ngSubmit)="onSubmit()">
        <label class="block">
          <span class="label-caps mb-2 block text-text-muted">Nom</span>
          <input
            type="text"
            formControlName="name"
            placeholder="Ex. Sport"
            class="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          @if (form.controls.name.invalid && (form.controls.name.touched || submitted())) {
            <p class="mt-1 text-[12px] text-accent">Donne un nom à la catégorie.</p>
          }
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
                <span class="material-symbols-outlined text-[18px]" [style.color]="form.controls.color.value">
                  {{ icon }}
                </span>
              </button>
            }
          </div>
        </div>

        <div>
          <span class="label-caps mb-2 block text-text-muted">Couleur</span>
          <div class="flex flex-wrap gap-2">
            @for (color of colorOptions; track color) {
              <button
                type="button"
                class="h-8 w-8 rounded-full border-2 transition-transform hover:scale-105"
                [style.backgroundColor]="color"
                [class.border-text]="form.controls.color.value === color"
                [class.border-transparent]="form.controls.color.value !== color"
                [attr.aria-label]="'Couleur ' + color"
                (click)="form.controls.color.setValue(color)"
              ></button>
            }
          </div>
        </div>

        <div class="flex items-center gap-3 rounded-xl border border-border bg-page/60 px-4 py-3">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-lg"
            [style.backgroundColor]="form.controls.color.value + '22'"
          >
            <span
              class="material-symbols-outlined text-[20px]"
              [style.color]="form.controls.color.value"
              aria-hidden="true"
            >
              {{ form.controls.icon.value }}
            </span>
          </span>
          <div>
            <p class="text-[13px] font-semibold text-text">
              {{ form.controls.name.value || 'Aperçu' }}
            </p>
            <p class="text-[11px] text-text-muted">Catégorie personnalisée</p>
          </div>
        </div>

        @if (errorMessage()) {
          <p class="rounded-lg bg-accent/10 px-3 py-2 text-[12px] text-accent">{{ errorMessage() }}</p>
        }

        <div class="flex justify-end gap-2">
          <a
            routerLink="/budgets"
            class="rounded-lg border border-border px-4 py-2.5 text-[13px] font-semibold text-text transition-colors hover:border-accent hover:text-accent"
          >
            Annuler
          </a>
          <button
            type="submit"
            class="rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            [disabled]="isSaving()"
          >
            {{ isSaving() ? 'Création…' : 'Créer la catégorie' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CategoryCreate {
  private readonly formBuilder = inject(FormBuilder);
  private readonly appStore = inject(AppStore);
  private readonly router = inject(Router);

  protected readonly iconOptions = CATEGORY_ICON_OPTIONS;
  protected readonly colorOptions = CATEGORY_COLOR_OPTIONS;
  protected readonly submitted = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    icon: this.formBuilder.nonNullable.control<string>(CATEGORY_ICON_OPTIONS[0]),
    color: this.formBuilder.nonNullable.control<string>(CATEGORY_COLOR_OPTIONS[0]),
  });

  protected async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    try {
      const values = this.form.getRawValue();
      await this.appStore.addCategory({
        name: values.name,
        icon: values.icon,
        color: values.color,
      });
      await this.router.navigateByUrl('/budgets');
    } catch {
      this.errorMessage.set('Impossible de créer la catégorie. Réessaie.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
