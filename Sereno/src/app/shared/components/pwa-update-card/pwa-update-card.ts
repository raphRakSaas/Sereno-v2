import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PwaUpdateService } from '../../../core/pwa/pwa-update.service';

@Component({
  selector: 'app-pwa-update-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isEnabled()) {
      <section class="bento-card overflow-hidden" [class.border-accent/30]="updateAvailable()" [class.bg-accent-surface/40]="updateAvailable()">
        <div class="border-b border-border px-5 py-4">
          <h3 class="label-caps text-text-muted">Mises à jour</h3>
        </div>

        <div class="space-y-4 px-5 py-4">
          <div class="flex items-start gap-3">
            <span
              class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-accent"
              aria-hidden="true"
              >system_update</span
            >
            <div>
              <p class="text-[13px] font-medium text-text">Version de l'application</p>
              <p class="mt-1 text-[12px] leading-relaxed text-text-muted">
                @if (updateAvailable()) {
                  Une nouvelle version déployée est prête à être installée.
                } @else {
                  Sereno vérifie automatiquement les nouvelles versions au lancement et à chaque
                  retour dans l'application.
                }
              </p>
            </div>
          </div>

          @if (checkMessage()) {
            <p class="rounded-lg bg-page px-3 py-2 text-[12px] text-text-muted" role="status">
              {{ checkMessage() }}
            </p>
          }

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-text transition-colors hover:border-accent hover:text-accent disabled:cursor-wait disabled:opacity-60"
              [disabled]="isChecking()"
              (click)="onCheckForUpdate()"
            >
              <span class="material-symbols-outlined text-[14px]" aria-hidden="true">refresh</span>
              {{ isChecking() ? 'Vérification…' : 'Vérifier les mises à jour' }}
            </button>

            @if (updateAvailable()) {
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                (click)="onApplyUpdate()"
              >
                <span class="material-symbols-outlined text-[14px]" aria-hidden="true">update</span>
                Mettre à jour
              </button>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class PwaUpdateCard {
  private readonly pwaUpdateService = inject(PwaUpdateService);

  protected readonly isEnabled = this.pwaUpdateService.isEnabled;
  protected readonly updateAvailable = this.pwaUpdateService.updateAvailable;
  protected readonly isChecking = this.pwaUpdateService.isChecking;
  protected readonly checkMessage = this.pwaUpdateService.checkMessage;

  protected onCheckForUpdate(): void {
    void this.pwaUpdateService.checkForUpdate();
  }

  protected onApplyUpdate(): void {
    void this.pwaUpdateService.applyUpdate();
  }
}
