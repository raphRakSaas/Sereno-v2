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
        browser: signal('unknown'),
        showInstallGuide: signal(false),
        installGuide: signal({
          browserLabel: 'Test',
          title: 'Installer',
          subtitle: 'Subtitle',
          steps: [],
        }),
        shouldShowMobileInstallPrompt: signal(false),
        install: async () => 'guide' as const,
        openInstallGuide: () => undefined,
        closeInstallGuide: () => undefined,
        refreshInstallState: () => undefined,
      },
    },
    {
      provide: PwaUpdateService,
      useValue: {
        updateAvailable: signal(false),
        isChecking: signal(false),
        isEnabled: signal(true),
        checkMessage: signal<string | null>(null),
        checkForUpdate: async () => false,
        applyUpdate: async () => undefined,
      },
    },
    {
      provide: SwUpdate,
      useValue: {
        isEnabled: false,
        versionUpdates: { pipe: () => ({ subscribe: () => undefined }) },
        unrecoverable: { pipe: () => ({ subscribe: () => undefined }) },
        checkForUpdate: async () => false,
        activateUpdate: async () => true,
      },
    },
  ];
}
