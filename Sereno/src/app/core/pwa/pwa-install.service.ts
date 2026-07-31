import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  BeforeInstallPromptEvent,
  PwaBrowser,
  detectPwaBrowser,
  detectPwaPlatform,
  isStandaloneDisplayMode,
  needsManualInstallGuide,
  PwaPlatform,
} from './pwa-platform';
import { getPwaInstallGuide, PwaInstallGuide } from './pwa-install-guides';

export type PwaInstallResult = 'installed' | 'guide' | 'dismissed' | 'unavailable';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private readonly platformId = inject(PLATFORM_ID);

  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  readonly platform = signal<PwaPlatform>('unknown');
  readonly browser = signal<PwaBrowser>('unknown');
  readonly isInstalled = signal(false);
  readonly canNativeInstall = signal(false);
  readonly showInstallGuide = signal(false);

  readonly installGuide = computed<PwaInstallGuide>(() => getPwaInstallGuide(this.browser()));
  readonly shouldShowMobileInstallPrompt = computed(
    () => !this.isInstalled() && (this.platform() === 'ios' || this.platform() === 'android'),
  );

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.refreshInstallState();
    this.platform.set(detectPwaPlatform(navigator.userAgent));
    this.browser.set(detectPwaBrowser(navigator.userAgent));

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.canNativeInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canNativeInstall.set(false);
      this.isInstalled.set(true);
      this.showInstallGuide.set(false);
    });
  }

  refreshInstallState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isInstalled.set(isStandaloneDisplayMode());
  }

  openInstallGuide(): void {
    this.showInstallGuide.set(true);
  }

  closeInstallGuide(): void {
    this.showInstallGuide.set(false);
  }

  async install(): Promise<PwaInstallResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return 'unavailable';
    }

    this.refreshInstallState();

    if (this.isInstalled()) {
      return 'unavailable';
    }

    if (this.deferredPrompt) {
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

    if (needsManualInstallGuide(this.platform(), this.canNativeInstall())) {
      this.openInstallGuide();
      return 'guide';
    }

    this.openInstallGuide();
    return 'guide';
  }
}
