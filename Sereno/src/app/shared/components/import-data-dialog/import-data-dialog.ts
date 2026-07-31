import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { SerenoImportMode, SerenoImportSummary } from '../../../core/data/sereno-export';

@Component({
  selector: 'app-import-data-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <section
        class="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-data-title"
      >
        <h3 id="import-data-title" class="text-[15px] font-semibold text-text">
          Importer une sauvegarde
        </h3>
        <p class="mt-1 truncate text-[12px] text-text-muted">{{ fileName() }}</p>

        <ul class="mt-4 grid grid-cols-2 gap-2 text-[12px] text-text-muted">
          <li>{{ summary().transactions }} transactions</li>
          <li>{{ summary().recurrences }} récurrences</li>
          <li>{{ summary().budgets }} budgets</li>
          <li>{{ summary().goals }} objectifs</li>
          <li>{{ summary().categories }} catégories</li>
        </ul>

        <fieldset class="mt-5 space-y-2">
          <legend class="label-caps mb-2 text-text-muted">Mode d'import</legend>

          <label
            class="flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors"
            [class.border-accent]="selectedMode() === 'merge'"
            [class.bg-accent-surface/40]="selectedMode() === 'merge'"
            [class.border-border]="selectedMode() !== 'merge'"
          >
            <input
              type="radio"
              name="import-mode"
              class="mt-1"
              [checked]="selectedMode() === 'merge'"
              (change)="selectedMode.set('merge')"
            />
            <span>
              <span class="block text-[13px] font-medium text-text">Fusionner</span>
              <span class="mt-0.5 block text-[11px] leading-relaxed text-text-muted">
                Conserver tes données actuelles et ajouter celles du fichier. En cas de doublon,
                la version importée est conservée.
              </span>
            </span>
          </label>

          <label
            class="flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors"
            [class.border-accent]="selectedMode() === 'replace'"
            [class.bg-accent-surface/40]="selectedMode() === 'replace'"
            [class.border-border]="selectedMode() !== 'replace'"
          >
            <input
              type="radio"
              name="import-mode"
              class="mt-1"
              [checked]="selectedMode() === 'replace'"
              (change)="selectedMode.set('replace')"
            />
            <span>
              <span class="block text-[13px] font-medium text-text">Remplacer</span>
              <span class="mt-0.5 block text-[11px] leading-relaxed text-text-muted">
                Supprimer toutes les données actuelles sur cet appareil, puis appliquer uniquement
                la sauvegarde importée.
              </span>
            </span>
          </label>
        </fieldset>

        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            class="rounded-lg border border-border px-3 py-2.5 text-[13px] font-semibold text-text sm:flex-1"
            (click)="cancelled.emit()"
          >
            Annuler
          </button>
          <button
            type="button"
            class="rounded-lg bg-accent px-3 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 sm:flex-1"
            (click)="confirmed.emit(selectedMode())"
          >
            Importer
          </button>
        </div>
      </section>
    </div>
  `,
})
export class ImportDataDialog {
  readonly fileName = input.required<string>();
  readonly summary = input.required<SerenoImportSummary>();

  readonly cancelled = output<void>();
  readonly confirmed = output<SerenoImportMode>();

  protected readonly selectedMode = signal<SerenoImportMode>('merge');
}
