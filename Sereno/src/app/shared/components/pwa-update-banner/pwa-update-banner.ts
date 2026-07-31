import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PwaUpdateService } from '../../../core/pwa/pwa-update.service';

@Component({
  selector: 'app-pwa-update-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (updateAvailable()) {
      <section
        class="fixed inset-x-4 top-[calc(4.25rem+env(safe-area-inset-top))] z-40 mx-auto flex max-w-content-max items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-surface px-4 py-3 shadow-lg sm:inset-x-6 lg:left-[calc(var(--spacing-sidebar)+1.5rem)] lg:right-6"
        role="status"
        aria-live="polite"
      >
        <div class="min-w-0">
          <p class="text-[13px] font-semibold text-text">Mise à jour disponible</p>
          <p class="text-[11px] text-text-muted">Une nouvelle version de Sereno est prête.</p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          (click)="applyUpdate()"
        >
          Mettre à jour
        </button>
      </section>
    }
  `,
})
export class PwaUpdateBanner {
  private readonly pwaUpdateService = inject(PwaUpdateService);

  protected readonly updateAvailable = this.pwaUpdateService.updateAvailable;

  protected applyUpdate(): void {
    void this.pwaUpdateService.applyUpdate();
  }
}
