import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Subject, of } from 'rxjs';
import { PwaUpdateService } from './pwa-update.service';

describe('PwaUpdateService', () => {
  const originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

  beforeEach(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {},
    });
  });

  afterEach(() => {
    if (originalServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker);
      return;
    }

    Reflect.deleteProperty(navigator, 'serviceWorker');
  });

  it('should apply updates through the Angular service worker', async () => {
    const activateUpdate = vi.fn().mockResolvedValue(true);
    const reload = vi.fn();
    const versionUpdates = new Subject<{ type: string }>();
    const unrecoverable = new Subject<void>();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: true,
            versionUpdates,
            unrecoverable,
            checkForUpdate: vi.fn().mockResolvedValue(false),
            activateUpdate,
          },
        },
        {
          provide: ApplicationRef,
          useValue: {
            isStable: of(true),
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

  it('should mark an update as available when VERSION_READY is emitted', () => {
    const versionUpdates = new Subject<{ type: string }>();
    const unrecoverable = new Subject<void>();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: true,
            versionUpdates,
            unrecoverable,
            checkForUpdate: vi.fn().mockResolvedValue(false),
            activateUpdate: vi.fn(),
          },
        },
        {
          provide: ApplicationRef,
          useValue: {
            isStable: of(true),
          },
        },
      ],
    });

    const service = TestBed.inject(PwaUpdateService);

    versionUpdates.next({ type: 'VERSION_READY' });

    expect(service.updateAvailable()).toBe(true);
  });

  it('should check for updates when checkForUpdate is called manually', async () => {
    const checkForUpdate = vi.fn().mockResolvedValue(false);
    const versionUpdates = new Subject<{ type: string }>();
    const unrecoverable = new Subject<void>();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: true,
            versionUpdates,
            unrecoverable,
            checkForUpdate,
            activateUpdate: vi.fn(),
          },
        },
        {
          provide: ApplicationRef,
          useValue: {
            isStable: of(true),
          },
        },
      ],
    });

    const service = TestBed.inject(PwaUpdateService);

    await service.checkForUpdate();

    expect(checkForUpdate).toHaveBeenCalled();
    expect(service.checkMessage()).toContain('dernière version');
  });
});
