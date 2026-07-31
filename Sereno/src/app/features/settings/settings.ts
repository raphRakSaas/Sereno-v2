import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStore } from '../../core/store/app.store';
import {
  parseSerenoExportPayload,
  SerenoExportPayload,
  SerenoImportMode,
  SerenoImportSummary,
  summarizeSerenoImport,
} from '../../core/data/sereno-export';
import { CurrencyCode, ThemePreference } from '../../core/models/settings.model';
import { ImportDataDialog } from '../../shared/components/import-data-dialog/import-data-dialog';
import { PwaInstallCard } from '../../shared/components/pwa-install-card/pwa-install-card';
import { PwaUpdateCard } from '../../shared/components/pwa-update-card/pwa-update-card';
import { FeedbackService } from '../../core/services/feedback.service';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PwaInstallCard, PwaUpdateCard, ImportDataDialog],
  template: `
    @if (pendingImport(); as pending) {
      <app-import-data-dialog
        [fileName]="pending.fileName"
        [summary]="pending.summary"
        (cancelled)="cancelImport()"
        (confirmed)="confirmImport($event)"
      />
    }

    <div class="max-w-2xl space-y-6">
      <div>
        <h2 class="label-caps text-text-muted">Réglages</h2>
        <p class="mt-0.5 text-[12px] text-text-muted">Tes préférences et données de l'application</p>
      </div>

      @if (statusMessage()) {
        <p
          class="rounded-lg px-4 py-3 text-[12px]"
          [class.bg-income/10]="statusTone() === 'success'"
          [class.text-income]="statusTone() === 'success'"
          [class.bg-accent/10]="statusTone() === 'error'"
          [class.text-accent]="statusTone() === 'error'"
        >
          {{ statusMessage() }}
        </p>
      }

      <app-pwa-install-card />

      <app-pwa-update-card />

      <section class="bento-card overflow-hidden">
        <div class="border-b border-border px-5 py-4">
          <h3 class="label-caps text-text-muted">Données sur cet appareil</h3>
        </div>
        <div class="space-y-4 px-5 py-4">
          <div class="flex items-start gap-3">
            <span
              class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-income"
              aria-hidden="true"
              >lock</span
            >
            <div>
              <p class="text-[13px] font-medium text-text">100% local, 100% privé</p>
              <p class="mt-1 text-[12px] leading-relaxed text-text-muted">
                Toutes tes données financières restent sur cet appareil. Rien n'est envoyé sur un
                serveur. Sereno ne collecte aucune donnée personnelle.
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-border py-2">
            <div>
              <p class="text-[13px] font-medium text-text">Exporter mes données</p>
              <p class="text-[11px] text-text-muted">
                Sauvegarde complète : réglages, transactions, budgets, objectifs, récurrences et
                catégories.
              </p>
            </div>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
              (click)="exportData()"
            >
              <span class="material-symbols-outlined text-[14px]" aria-hidden="true">download</span>
              Exporter
            </button>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-border py-2">
            <div>
              <p class="text-[13px] font-medium text-text">Importer des données</p>
              <p class="text-[11px] text-text-muted">
                Restaurer ou fusionner une sauvegarde JSON exportée depuis Sereno.
              </p>
            </div>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
              (click)="openImportPicker()"
            >
              <span class="material-symbols-outlined text-[14px]" aria-hidden="true">upload</span>
              Importer
            </button>
            <input
              #importInput
              type="file"
              accept="application/json,.json"
              class="hidden"
              (change)="onImportFile($event)"
            />
          </div>
        </div>
      </section>

      <section class="bento-card overflow-hidden">
        <div class="border-b border-border px-5 py-4">
          <h3 class="label-caps text-text-muted">Affichage</h3>
        </div>
        <div class="divide-y divide-border">
          <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p class="text-[13px] font-medium text-text">Thème</p>
              <p class="text-[11px] text-text-muted">Apparence de l'interface</p>
            </div>
            <select
              class="rounded-lg border border-border bg-page px-3 py-1.5 text-[12px] text-text outline-none focus:border-accent"
              aria-label="Choisir le thème"
              [ngModel]="settings().theme"
              (ngModelChange)="onThemeChange($event)"
            >
              <option value="system">Système</option>
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p class="text-[13px] font-medium text-text">Devise</p>
              <p class="text-[11px] text-text-muted">Monnaie utilisée dans l'app</p>
            </div>
            <select
              class="rounded-lg border border-border bg-page px-3 py-1.5 text-[12px] text-text outline-none focus:border-accent"
              aria-label="Choisir la devise"
              [ngModel]="settings().currency"
              (ngModelChange)="onCurrencyChange($event)"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF (Fr)</option>
            </select>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p class="text-[13px] font-medium text-text">Afficher les centimes</p>
              <p class="text-[11px] text-text-muted">Montants avec décimales</p>
            </div>
            <label
              class="relative inline-flex cursor-pointer items-center"
              aria-label="Activer l'affichage des centimes"
            >
              <input
                type="checkbox"
                class="peer sr-only"
                [ngModel]="settings().showCents"
                (ngModelChange)="onShowCentsChange($event)"
              />
              <div
                class="h-5 w-9 rounded-full bg-border transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-4"
              ></div>
            </label>
          </div>
        </div>
      </section>

      <section class="bento-card overflow-hidden">
        <div class="border-b border-border px-5 py-4">
          <h3 class="label-caps text-text-muted">Tes données</h3>
        </div>
        <div class="divide-y divide-border">
          <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p class="text-[13px] font-medium text-text">Charger les données démo</p>
              <p class="text-[11px] text-text-muted">Remplace tes données par des exemples</p>
            </div>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-muted transition-colors hover:border-warning hover:text-warning"
              [disabled]="isBusy()"
              (click)="loadDemo()"
            >
              <span class="material-symbols-outlined text-[14px]" aria-hidden="true">science</span>
              Démo
            </button>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p class="text-[13px] font-medium text-text">Réinitialiser toutes les données</p>
              <p class="text-[11px] text-text-muted">Supprimer définitivement toutes tes données</p>
            </div>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg border border-accent/30 px-3 py-1.5 text-[12px] font-medium text-accent transition-colors hover:bg-accent/5"
              [disabled]="isBusy()"
              (click)="resetData()"
            >
              <span class="material-symbols-outlined text-[14px]" aria-hidden="true"
                >delete_forever</span
              >
              Supprimer
            </button>
          </div>
        </div>
      </section>

      <section class="bento-card overflow-hidden">
        <div class="border-b border-border px-5 py-4">
          <h3 class="label-caps text-text-muted">L'application</h3>
        </div>
        <div class="space-y-2 px-5 py-4">
          <div class="flex justify-between text-[12px]">
            <span class="text-text-muted">Version</span>
            <span class="font-medium text-text">2.0.0-beta</span>
          </div>
          <div class="flex justify-between text-[12px]">
            <span class="text-text-muted">Angular</span>
            <span class="font-medium text-text">22</span>
          </div>
          <div class="flex justify-between text-[12px]">
            <span class="text-text-muted">Stockage</span>
            <span class="font-medium text-text">IndexedDB (local)</span>
          </div>
          <div class="flex justify-between text-[12px]">
            <span class="text-text-muted">Thème actif</span>
            <span class="font-medium text-text capitalize">{{ resolvedTheme() }}</span>
          </div>
          <p class="mt-3 text-[11px] leading-relaxed text-text-muted">
            Sereno est une application de finance personnelle bienveillante. Elle est conçue pour
            t'accompagner sans jugement dans ta relation à l'argent.
          </p>
        </div>
      </section>
    </div>
  `,
})
export class Settings {
  private readonly appStore = inject(AppStore);
  private readonly router = inject(Router);
  private readonly feedbackService = inject(FeedbackService);

  protected readonly importFileInput = viewChild<ElementRef<HTMLInputElement>>('importInput');
  protected readonly settings = this.appStore.settings;
  protected readonly resolvedTheme = this.appStore.resolvedTheme;
  protected readonly statusMessage = signal('');
  protected readonly statusTone = signal<'success' | 'error'>('success');
  protected readonly isBusy = signal(false);
  protected readonly pendingImport = signal<{
    fileName: string;
    payload: SerenoExportPayload;
    summary: SerenoImportSummary;
  } | null>(null);

  protected openImportPicker(): void {
    this.importFileInput()?.nativeElement?.click();
  }

  protected async onThemeChange(theme: ThemePreference): Promise<void> {
    await this.appStore.updateSettings({ theme });
    this.flash('Thème mis à jour.');
  }

  protected async onCurrencyChange(currency: CurrencyCode): Promise<void> {
    await this.appStore.updateSettings({ currency });
    this.flash('Devise mise à jour.');
  }

  protected async onShowCentsChange(showCents: boolean): Promise<void> {
    await this.appStore.updateSettings({ showCents });
    this.flash(showCents ? 'Centimes affichés.' : 'Centimes masqués.');
  }

  protected async exportData(): Promise<void> {
    const payload = this.appStore.exportData();
    const json = JSON.stringify(payload, null, 2);
    const stamp = new Date().toISOString().slice(0, 10);
    const fileName = `sereno-export-${stamp}.json`;
    const file = new File([json], fileName, { type: 'application/json' });

    const shareCapableNavigator = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };

    if (shareCapableNavigator.canShare?.({ files: [file] })) {
      try {
        await shareCapableNavigator.share({
          files: [file],
          title: 'Export Sereno',
          text: 'Sauvegarde de mes données Sereno',
        });
        this.showExportFeedback(payload, 'Export prêt à être enregistré.');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    this.showExportFeedback(payload, 'Export téléchargé.');
  }

  protected async onImportFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const payload = parseSerenoExportPayload(text);
      this.pendingImport.set({
        fileName: file.name,
        payload,
        summary: summarizeSerenoImport(payload, 'merge'),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de lire ce fichier.";
      this.flash(message, 'error');
    }
  }

  protected cancelImport(): void {
    this.pendingImport.set(null);
  }

  protected async confirmImport(mode: SerenoImportMode): Promise<void> {
    const pending = this.pendingImport();
    if (!pending) {
      return;
    }

    this.pendingImport.set(null);
    this.isBusy.set(true);

    try {
      const summary = await this.appStore.importData(pending.payload, mode);
      this.feedbackService.showAfterReload(this.buildImportFeedback(summary));
      globalThis.location.reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible d'importer ce fichier.";
      this.feedbackService.show({
        title: 'Import impossible',
        detail: message,
        tone: 'error',
        kind: 'import',
      });
    } finally {
      this.isBusy.set(false);
    }
  }

  protected async loadDemo(): Promise<void> {
    if (
      !globalThis.confirm(
        'Charger les données démo ? Tes données actuelles seront remplacées.',
      )
    ) {
      return;
    }

    this.isBusy.set(true);
    try {
      await this.appStore.loadDemoData();
      this.flash('Données démo chargées.');
      await this.router.navigateByUrl('/');
    } catch {
      this.flash('Échec du chargement démo.', 'error');
    } finally {
      this.isBusy.set(false);
    }
  }

  protected async resetData(): Promise<void> {
    if (
      !globalThis.confirm(
        'Supprimer définitivement toutes tes données Sereno sur cet appareil ?',
      )
    ) {
      return;
    }

    this.isBusy.set(true);
    try {
      await this.appStore.resetAllData();
      this.flash('Données réinitialisées.');
      await this.router.navigateByUrl('/onboarding');
    } catch {
      this.flash('Échec de la réinitialisation.', 'error');
    } finally {
      this.isBusy.set(false);
    }
  }

  private showExportFeedback(payload: SerenoExportPayload, title: string): void {
    this.feedbackService.show({
      title,
      detail: this.buildDataSummary({
        transactions: payload.transactions.length,
        budgets: payload.budgets.length,
        goals: payload.goals.length,
        recurrences: payload.recurrences.length,
      }),
      tone: 'success',
      kind: 'export',
    });
  }

  private buildImportFeedback(summary: SerenoImportSummary) {
    return {
      title: summary.mode === 'merge' ? 'Fusion réussie' : 'Import réussi',
      detail: this.buildDataSummary(summary),
      tone: 'success' as const,
      kind: 'import' as const,
    };
  }

  private buildDataSummary(data: {
    transactions: number;
    budgets: number;
    goals: number;
    recurrences: number;
  }): string {
    return `${data.transactions} transactions, ${data.recurrences} récurrences, ${data.budgets} budgets et ${data.goals} objectifs.`;
  }

  private flash(message: string, tone: 'success' | 'error' = 'success'): void {
    this.statusTone.set(tone);
    this.statusMessage.set(message);
  }
}
