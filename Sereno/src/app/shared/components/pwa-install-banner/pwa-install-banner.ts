import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';

@Component({
  selector: 'app-pwa-install-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (shouldShowBanner()) {
      <section
        class="fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-20 flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-surface px-4 py-3 shadow-lg lg:hidden"
        aria-label="Installer l'application Sereno"
      >
        <div class="min-w-0">
          <p class="text-[13px] font-semibold text-text">Installer Sereno</p>
          <p class="truncate text-[11px] text-text-muted">{{ bannerHint() }}</p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg bg-accent px-3 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          (click)="install()"
        >
          {{ actionLabel() }}
        </button>
      </section>
    }
  `,
})
export class PwaInstallBanner {
  private readonly pwaInstallService = inject(PwaInstallService);

  protected readonly shouldShowBanner = this.pwaInstallService.shouldShowMobileInstallPrompt;

  protected readonly actionLabel = computed(() =>
    this.pwaInstallService.platform() === 'ios' ? 'Voir le tuto' : 'Télécharger',
  );

  protected readonly bannerHint = computed(() => {
    if (this.pwaInstallService.platform() === 'ios') {
      return `Tutoriel ${this.pwaInstallService.installGuide().browserLabel}`;
    }

    return 'Accès rapide depuis ton écran d’accueil';
  });

  protected install(): void {
    void this.pwaInstallService.install();
  }
}
