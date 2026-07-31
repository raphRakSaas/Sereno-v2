import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';

@Component({
  selector: 'app-pwa-install-guide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showInstallGuide()) {
      <button
        type="button"
        class="fixed inset-0 z-40 bg-black/40"
        aria-label="Fermer le guide d'installation"
        (click)="closeInstallGuide()"
      ></button>

      <div
        class="fixed inset-x-4 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 max-h-[min(70vh,32rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 lg:bottom-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <p class="label-caps text-accent">{{ installGuide().browserLabel }}</p>
            <h4 id="pwa-install-title" class="mt-1 text-[16px] font-semibold text-text">
              {{ installGuide().title }}
            </h4>
            <p class="mt-1 text-[12px] text-text-muted">{{ installGuide().subtitle }}</p>
          </div>
          <button
            type="button"
            class="rounded-full p-1 text-text-muted transition-colors hover:bg-page hover:text-text"
            aria-label="Fermer"
            (click)="closeInstallGuide()"
          >
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
          </button>
        </div>

        <ol class="space-y-3 text-[13px] text-text">
          @for (step of installGuide().steps; track step.text; let stepIndex = $index) {
            <li class="flex items-start gap-3">
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-surface text-accent"
              >
                @if (step.icon) {
                  <span class="material-symbols-outlined text-[16px]" aria-hidden="true">{{
                    step.icon
                  }}</span>
                } @else {
                  {{ stepIndex + 1 }}
                }
              </span>
              <span class="pt-1 leading-relaxed">{{ step.text }}</span>
            </li>
          }
        </ol>

        @if (installGuide().note) {
          <p class="mt-4 rounded-lg bg-page px-3 py-2 text-[12px] leading-relaxed text-text-muted">
            {{ installGuide().note }}
          </p>
        }
      </div>
    }
  `,
})
export class PwaInstallGuide {
  private readonly pwaInstallService = inject(PwaInstallService);

  protected readonly showInstallGuide = this.pwaInstallService.showInstallGuide;
  protected readonly installGuide = this.pwaInstallService.installGuide;

  protected closeInstallGuide(): void {
    this.pwaInstallService.closeInstallGuide();
  }
}
