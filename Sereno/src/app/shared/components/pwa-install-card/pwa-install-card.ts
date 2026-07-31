import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';

@Component({
  selector: 'app-pwa-install-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-card overflow-hidden">
      <div class="border-b border-border px-5 py-4">
        <h3 class="label-caps text-text-muted">Application mobile</h3>
      </div>

      <div class="space-y-4 px-5 py-4">
        <div class="flex items-start gap-3">
          <span
            class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-accent"
            aria-hidden="true"
            >install_mobile</span
          >
          <div>
            <p class="text-[13px] font-medium text-text">Installer Sereno</p>
            <p class="mt-1 text-[12px] leading-relaxed text-text-muted">
              {{ description() }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-60"
          [disabled]="isInstalled()"
          (click)="onInstallClick()"
        >
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">{{
            buttonIcon()
          }}</span>
          {{ buttonLabel() }}
        </button>
      </div>
    </section>
  `,
})
export class PwaInstallCard {
  private readonly pwaInstallService = inject(PwaInstallService);

  protected readonly isInstalled = this.pwaInstallService.isInstalled;
  protected readonly canNativeInstall = this.pwaInstallService.canNativeInstall;
  protected readonly platform = this.pwaInstallService.platform;

  protected readonly buttonLabel = computed(() => {
    if (this.isInstalled()) {
      return 'Application installée';
    }

    if (this.platform() === 'ios') {
      return 'Installer sur cet iPhone';
    }

    return 'Télécharger Sereno';
  });

  protected readonly buttonIcon = computed(() => (this.isInstalled() ? 'check_circle' : 'download'));

  protected readonly description = computed(() => {
    if (this.isInstalled()) {
      return 'Sereno est installé sur cet appareil. Tu peux l’ouvrir depuis ton écran d’accueil.';
    }

    if (this.platform() === 'ios') {
      return 'Ajoute Sereno à ton écran d’accueil pour une expérience plein écran, comme une vraie application.';
    }

    if (this.canNativeInstall()) {
      return 'Installe Sereno en un clic pour un accès rapide, hors ligne et plein écran.';
    }

    return 'Installe Sereno pour y accéder plus vite, même sans réseau.';
  });

  protected async onInstallClick(): Promise<void> {
    await this.pwaInstallService.install();
  }
}
