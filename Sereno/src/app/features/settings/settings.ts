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
import { AppStore, SerenoExportPayload } from '../../core/store/app.store';
import { CurrencyCode, ThemePreference } from '../../core/models/settings.model';
import { PwaInstallCard } from '../../shared/components/pwa-install-card/pwa-install-card';
import { PwaUpdateService } from '../../core/pwa/pwa-update.service';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PwaInstallCard],
  template: `
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

      @if (updateAvailable()) {
        <section class="bento-card overflow-hidden border-accent/30 bg-accent-surface/40">
          <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p class="text-[13px] font-medium text-text">Mise à jour disponible</p>
              <p class="text-[11px] text-text-muted">
                Une nouvelle version déployée est prête à être installée.
              </p>
            </div>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
              (click)="applyUpdate()"
            >
              <span class="material-symbols-outlined text-[14px]" aria-hidden="true">update</span>
              Mettre à jour
            </button>
          </div>
        </section>
      }

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
              <p class="text-[11px] text-text-muted">Télécharger un fichier JSON de tes données</p>
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
              <p class="text-[11px] text-text-muted">Restaurer depuis un fichier JSON</p>
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
  private readonly pwaUpdateService = inject(PwaUpdateService);

  protected readonly importFileInput = viewChild<ElementRef<HTMLInputElement>>('importInput');
  protected readonly settings = this.appStore.settings;
  protected readonly resolvedTheme = this.appStore.resolvedTheme;
  protected readonly updateAvailable = this.pwaUpdateService.updateAvailable;
  protected readonly statusMessage = signal('');
  protected readonly statusTone = signal<'success' | 'error'>('success');
  protected readonly isBusy = signal(false);

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

  protected exportData(): void {
    const payload = this.appStore.exportData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `sereno-export-${stamp}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.flash('Export téléchargé.');
  }

  protected applyUpdate(): void {
    void this.pwaUpdateService.applyUpdate();
  }

  protected async onImportFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    this.isBusy.set(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as SerenoExportPayload;
      await this.appStore.importData(payload);
      this.flash('Données importées avec succès.');
    } catch {
      this.flash("Impossible d'importer ce fichier.", 'error');
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

  private flash(message: string, tone: 'success' | 'error' = 'success'): void {
    this.statusTone.set(tone);
    this.statusMessage.set(message);
  }
}
