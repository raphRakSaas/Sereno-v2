import { ApplicationRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first, interval, switchMap } from 'rxjs';
import { isServiceWorkerSupported } from './pwa-platform';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly swUpdate = inject(SwUpdate);
  private readonly applicationRef = inject(ApplicationRef);

  readonly updateAvailable = signal(false);
  readonly isChecking = signal(false);
  readonly isEnabled = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId) || !isServiceWorkerSupported()) {
      return;
    }

    this.isEnabled.set(this.swUpdate.isEnabled);

    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => {
        this.updateAvailable.set(true);
      });

    this.applicationRef.isStable
      .pipe(
        first((isStable) => isStable),
        switchMap(() => interval(60 * 60 * 1000)),
      )
      .subscribe(() => {
        void this.checkForUpdate();
      });
  }

  async checkForUpdate(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return false;
    }

    this.isChecking.set(true);

    try {
      const hasUpdate = await this.swUpdate.checkForUpdate();
      return hasUpdate;
    } finally {
      this.isChecking.set(false);
    }
  }

  async applyUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    await this.swUpdate.activateUpdate();
    globalThis.location.reload();
  }
}
