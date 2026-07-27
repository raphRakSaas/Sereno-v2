import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ThemeOption = 'system' | 'light' | 'dark';
type CurrencyOption = 'EUR' | 'USD' | 'GBP' | 'CHF';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-6 max-w-2xl">
      <div>
        <h2 class="label-caps text-text-muted">Réglages</h2>
        <p class="mt-0.5 text-[12px] text-text-muted">Tes préférences et données de l'application</p>
      </div>

      <!-- Données sur cet appareil -->
      <section class="bento-card overflow-hidden">
        <div class="px-5 py-4 border-b border-border">
          <h3 class="label-caps text-text-muted">Données sur cet appareil</h3>
        </div>
        <div class="px-5 py-4 space-y-4">
          <div class="flex items-start gap-3">
            <span
              class="material-symbols-outlined text-[20px] text-income shrink-0 mt-0.5"
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

          <div class="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p class="text-[13px] font-medium text-text">Exporter mes données</p>
              <p class="text-[11px] text-text-muted">Télécharger un fichier JSON de tes données</p>
            </div>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <span class="material-symbols-outlined text-[14px]" aria-hidden="true">download</span>
              Exporter
            </button>
          </div>

          <div class="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p class="text-[13px] font-medium text-text">Importer des données</p>
              <p class="text-[11px] text-text-muted">Restaurer depuis un fichier JSON</p>
            </div>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <span class="material-symbols-outlined text-[14px]" aria-hidden="true">upload</span>
              Importer
            </button>
          </div>
        </div>
      </section>

      <!-- Affichage -->
      <section class="bento-card overflow-hidden">
        <div class="px-5 py-4 border-b border-border">
          <h3 class="label-caps text-text-muted">Affichage</h3>
        </div>
        <div class="divide-y divide-border">
          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <p class="text-[13px] font-medium text-text">Thème</p>
              <p class="text-[11px] text-text-muted">Apparence de l'interface</p>
            </div>
            <select
              [(ngModel)]="theme"
              class="rounded-lg border border-border bg-page px-3 py-1.5 text-[12px] text-text outline-none focus:border-accent"
              aria-label="Choisir le thème"
            >
              <option value="system">Système</option>
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </div>

          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <p class="text-[13px] font-medium text-text">Devise</p>
              <p class="text-[11px] text-text-muted">Monnaie utilisée dans l'app</p>
            </div>
            <select
              [(ngModel)]="currency"
              class="rounded-lg border border-border bg-page px-3 py-1.5 text-[12px] text-text outline-none focus:border-accent"
              aria-label="Choisir la devise"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF (Fr)</option>
            </select>
          </div>

          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <p class="text-[13px] font-medium text-text">Afficher les centimes</p>
              <p class="text-[11px] text-text-muted">Montants avec décimales</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center" aria-label="Activer l'affichage des centimes">
              <input
                type="checkbox"
                [(ngModel)]="showCents"
                class="sr-only peer"
              />
              <div
                class="h-5 w-9 rounded-full bg-border peer-checked:bg-accent transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4"
              ></div>
            </label>
          </div>
        </div>
      </section>

      <!-- Tes données -->
      <section class="bento-card overflow-hidden">
        <div class="px-5 py-4 border-b border-border">
          <h3 class="label-caps text-text-muted">Tes données</h3>
        </div>
        <div class="divide-y divide-border">
          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <p class="text-[13px] font-medium text-text">Charger les données démo</p>
              <p class="text-[11px] text-text-muted">Remplace tes données par des exemples</p>
            </div>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-muted transition-colors hover:border-warning hover:text-warning"
            >
              <span class="material-symbols-outlined text-[14px]" aria-hidden="true">science</span>
              Démo
            </button>
          </div>

          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <p class="text-[13px] font-medium text-text">Réinitialiser toutes les données</p>
              <p class="text-[11px] text-text-muted">Supprimer définitivement toutes tes données</p>
            </div>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg border border-accent/30 px-3 py-1.5 text-[12px] font-medium text-accent transition-colors hover:bg-accent/5"
            >
              <span class="material-symbols-outlined text-[14px]" aria-hidden="true">delete_forever</span>
              Supprimer
            </button>
          </div>
        </div>
      </section>

      <!-- L'application -->
      <section class="bento-card overflow-hidden">
        <div class="px-5 py-4 border-b border-border">
          <h3 class="label-caps text-text-muted">L'application</h3>
        </div>
        <div class="px-5 py-4 space-y-2">
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
  protected theme = signal<ThemeOption>('system');
  protected currency = signal<CurrencyOption>('EUR');
  protected showCents = signal(true);
}
