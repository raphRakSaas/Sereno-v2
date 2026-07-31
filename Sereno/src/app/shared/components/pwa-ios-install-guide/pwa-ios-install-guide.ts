import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';

@Component({
  selector: 'app-pwa-ios-install-guide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showIosGuide()) {
      <button
        type="button"
        class="fixed inset-0 z-40 bg-black/40"
        aria-label="Fermer le guide d'installation iOS"
        (click)="closeIosGuide()"
      ></button>

      <div
        class="fixed inset-x-4 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-border bg-surface p-5 shadow-xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 lg:bottom-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h4 id="ios-install-title" class="text-[16px] font-semibold text-text">
              Installer sur iPhone
            </h4>
            <p class="mt-1 text-[12px] text-text-muted">
              Apple ne permet pas l'installation automatique. Deux gestes suffisent :
            </p>
          </div>
          <button
            type="button"
            class="rounded-full p-1 text-text-muted transition-colors hover:bg-page hover:text-text"
            aria-label="Fermer"
            (click)="closeIosGuide()"
          >
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
          </button>
        </div>

        <ol class="space-y-3 text-[13px] text-text">
          <li class="flex items-start gap-3">
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-surface text-accent"
              >1</span
            >
            <span>
              Appuie sur
              <strong class="inline-flex items-center gap-1 font-semibold text-text">
                <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
                  >ios_share</span
                >
                Partager
              </strong>
              en bas de Safari.
            </span>
          </li>
          <li class="flex items-start gap-3">
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-surface text-accent"
              >2</span
            >
            <span>
              Choisis
              <strong class="font-semibold text-text">« Sur l'écran d'accueil »</strong>, puis
              confirme.
            </span>
          </li>
        </ol>
      </div>
    }
  `,
})
export class PwaIosInstallGuide {
  private readonly pwaInstallService = inject(PwaInstallService);

  protected readonly showIosGuide = this.pwaInstallService.showIosGuide;

  protected closeIosGuide(): void {
    this.pwaInstallService.closeIosGuide();
  }
}
