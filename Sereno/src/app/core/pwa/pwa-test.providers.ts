import { signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { PwaInstallService } from './pwa-install.service';
import { PwaUpdateService } from './pwa-update.service';

export function providePwaTestMocks() {
  return [
    {
      provide: PwaInstallService,
      useValue: {
        isInstalled: signal(false),
        canNativeInstall: signal(false),
        platform: signal('unknown'),
        showIosGuide: signal(false),
        install: async () => 'unavailable' as const,
        closeIosGuide: () => undefined,
        refreshInstallState: () => undefined,
      },
    },
    {
      provide: PwaUpdateService,
      useValue: {
        updateAvailable: signal(false),
        isChecking: signal(false),
        isEnabled: signal(false),
        checkForUpdate: async () => false,
        applyUpdate: async () => undefined,
      },
    },
    {
      provide: SwUpdate,
      useValue: {
        isEnabled: false,
        versionUpdates: { pipe: () => ({ subscribe: () => undefined }) },
        checkForUpdate: async () => false,
        activateUpdate: async () => true,
      },
    },
  ];
}
