import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  BeforeInstallPromptEvent,
  detectPwaPlatform,
  isStandaloneDisplayMode,
  PwaPlatform,
} from './pwa-platform';

export type PwaInstallResult = 'installed' | 'ios-guide' | 'dismissed' | 'unavailable';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private readonly platformId = inject(PLATFORM_ID);

  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  readonly platform = signal<PwaPlatform>('unknown');
  readonly isInstalled = signal(false);
  readonly canNativeInstall = signal(false);
  readonly showIosGuide = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.refreshInstallState();
    this.platform.set(detectPwaPlatform(navigator.userAgent));

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.canNativeInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canNativeInstall.set(false);
      this.isInstalled.set(true);
      this.showIosGuide.set(false);
    });
  }

  refreshInstallState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isInstalled.set(isStandaloneDisplayMode());
  }

  closeIosGuide(): void {
    this.showIosGuide.set(false);
  }

  async install(): Promise<PwaInstallResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return 'unavailable';
    }

    this.refreshInstallState();

    if (this.isInstalled()) {
      return 'unavailable';
    }

    if (this.platform() === 'ios') {
      this.showIosGuide.set(true);
      return 'ios-guide';
    }

    if (!this.deferredPrompt) {
      return 'unavailable';
    }

    await this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.canNativeInstall.set(false);

    if (choice.outcome === 'accepted') {
      this.isInstalled.set(true);
      return 'installed';
    }

    return 'dismissed';
  }
}
