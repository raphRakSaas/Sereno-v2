import { ApplicationRef, DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first, fromEvent, interval, switchMap } from 'rxjs';
import { isServiceWorkerSupported } from './pwa-platform';

const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly swUpdate = inject(SwUpdate);
  private readonly applicationRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly updateAvailable = signal(false);
  readonly isChecking = signal(false);
  readonly isEnabled = signal(false);
  readonly checkMessage = signal<string | null>(null);

  constructor() {
    if (!isPlatformBrowser(this.platformId) || !isServiceWorkerSupported()) {
      return;
    }

    this.isEnabled.set(this.swUpdate.isEnabled);

    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.type === 'VERSION_DETECTED') {
          this.checkMessage.set('Téléchargement de la nouvelle version…');
          return;
        }

        if (event.type === 'VERSION_READY') {
          this.updateAvailable.set(true);
          this.checkMessage.set(null);
        }
      });

    this.swUpdate.unrecoverable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const shouldReload = globalThis.confirm(
        'Sereno doit se recharger pour récupérer une version compatible.',
      );

      if (shouldReload) {
        globalThis.location.reload();
      }
    });

    this.applicationRef.isStable
      .pipe(
        first((isStable) => isStable),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        void this.checkForUpdate();
      });

    this.applicationRef.isStable
      .pipe(
        first((isStable) => isStable),
        switchMap(() => interval(UPDATE_CHECK_INTERVAL_MS)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        void this.checkForUpdate();
      });

    if (typeof document !== 'undefined') {
      fromEvent(document, 'visibilitychange')
        .pipe(
          filter(() => document.visibilityState === 'visible'),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          void this.checkForUpdate();
        });
    }
  }

  async checkForUpdate(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return false;
    }

    this.isChecking.set(true);

    try {
      const hasUpdate = await this.swUpdate.checkForUpdate();

      if (!hasUpdate && !this.updateAvailable()) {
        this.checkMessage.set('Tu as déjà la dernière version.');
      }

      return hasUpdate;
    } catch {
      this.checkMessage.set('Impossible de vérifier les mises à jour pour le moment.');
      return false;
    } finally {
      this.isChecking.set(false);
    }
  }

  async applyUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled) {
      globalThis.location.reload();
      return;
    }

    try {
      await this.swUpdate.activateUpdate();
    } catch {
      // Reload anyway so the browser can pick up a waiting worker on next load.
    } finally {
      globalThis.location.reload();
    }
  }
}
