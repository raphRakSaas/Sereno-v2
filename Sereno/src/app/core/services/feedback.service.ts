import {
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type FeedbackTone = 'success' | 'error';
export type FeedbackKind = 'export' | 'import' | 'info';

export interface FeedbackMessage {
  title: string;
  detail?: string;
  tone: FeedbackTone;
  kind: FeedbackKind;
}

const PENDING_FEEDBACK_STORAGE_KEY = 'sereno-feedback-pending';
const DEFAULT_VISIBLE_DURATION_MS = 5500;

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly activeMessage = signal<FeedbackMessage | null>(null);

  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      this.restorePendingMessage();
    });
  }

  show(message: FeedbackMessage, visibleDurationMs = DEFAULT_VISIBLE_DURATION_MS): void {
    this.clearDismissTimer();
    this.activeMessage.set(message);
    this.dismissTimer = setTimeout(() => this.dismiss(), visibleDurationMs);
  }

  showAfterReload(message: FeedbackMessage): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    sessionStorage.setItem(PENDING_FEEDBACK_STORAGE_KEY, JSON.stringify(message));
  }

  restorePendingMessage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const rawMessage = sessionStorage.getItem(PENDING_FEEDBACK_STORAGE_KEY);

    if (!rawMessage) {
      return;
    }

    sessionStorage.removeItem(PENDING_FEEDBACK_STORAGE_KEY);

    try {
      const message = JSON.parse(rawMessage) as FeedbackMessage;
      this.show(message, 6500);
    } catch {
      this.dismiss();
    }
  }

  dismiss(): void {
    this.clearDismissTimer();
    this.activeMessage.set(null);
  }

  private clearDismissTimer(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }
}
