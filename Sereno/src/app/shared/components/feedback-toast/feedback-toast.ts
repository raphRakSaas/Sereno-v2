import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FeedbackKind, FeedbackService } from '../../../core/services/feedback.service';

@Component({
  selector: 'app-feedback-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (activeMessage(); as message) {
      <div
        class="fixed inset-x-4 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md lg:inset-x-auto lg:right-6 lg:bottom-6"
        role="status"
        aria-live="polite"
      >
        <div
          class="flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_12px_40px_rgba(23,20,18,0.16)] backdrop-blur-sm"
          [class.border-income/30]="message.tone === 'success'"
          [class.bg-income/10]="message.tone === 'success'"
          [class.border-error/30]="message.tone === 'error'"
          [class.bg-error/10]="message.tone === 'error'"
        >
          <span
            class="material-symbols-outlined mt-0.5 shrink-0 text-[20px]"
            [class.text-income]="message.tone === 'success'"
            [class.text-error]="message.tone === 'error'"
            aria-hidden="true"
          >
            {{ iconName() }}
          </span>

          <div class="min-w-0 flex-1">
            <p
              class="text-[13px] font-semibold"
              [class.text-income]="message.tone === 'success'"
              [class.text-error]="message.tone === 'error'"
            >
              {{ message.title }}
            </p>
            @if (message.detail) {
              <p class="mt-0.5 text-[11px] leading-relaxed text-text-muted">{{ message.detail }}</p>
            }
          </div>

          <button
            type="button"
            class="shrink-0 rounded-lg p-1 text-text-muted transition-colors hover:bg-page hover:text-text"
            aria-label="Fermer la notification"
            (click)="dismiss()"
          >
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
          </button>
        </div>
      </div>
    }
  `,
})
export class FeedbackToast {
  private readonly feedbackService = inject(FeedbackService);

  protected readonly activeMessage = this.feedbackService.activeMessage;

  protected readonly iconName = computed(() => {
    const message = this.activeMessage();

    if (!message) {
      return 'info';
    }

    if (message.tone === 'error') {
      return 'error';
    }

    return iconForKind(message.kind);
  });

  protected dismiss(): void {
    this.feedbackService.dismiss();
  }
}

function iconForKind(kind: FeedbackKind): string {
  switch (kind) {
    case 'export':
      return 'download_done';
    case 'import':
      return 'published_with_changes';
    default:
      return 'check_circle';
  }
}
