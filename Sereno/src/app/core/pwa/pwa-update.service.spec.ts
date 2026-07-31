import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { PwaUpdateService } from './pwa-update.service';

describe('PwaUpdateService', () => {
  it('should apply updates through the Angular service worker', async () => {
    const activateUpdate = vi.fn().mockResolvedValue(true);
    const reload = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: true,
            versionUpdates: { pipe: () => ({ subscribe: () => undefined }) },
            checkForUpdate: vi.fn().mockResolvedValue(false),
            activateUpdate,
          },
        },
      ],
    });

    const service = TestBed.inject(PwaUpdateService);
    const originalLocation = globalThis.location;
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: { ...originalLocation, reload },
    });

    await service.applyUpdate();

    expect(activateUpdate).toHaveBeenCalled();
    expect(reload).toHaveBeenCalled();

    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });
});
