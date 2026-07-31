import { TestBed } from '@angular/core/testing';
import { PwaInstallService } from './pwa-install.service';

describe('PwaInstallService', () => {
  it('should close the install guide', () => {
    TestBed.configureTestingModule({
      providers: [PwaInstallService],
    });

    const service = TestBed.inject(PwaInstallService);
    service.showInstallGuide.set(true);

    service.closeInstallGuide();

    expect(service.showInstallGuide()).toBe(false);
  });

  it('should open the browser-specific guide when native install is unavailable', async () => {
    TestBed.configureTestingModule({
      providers: [PwaInstallService],
    });

    const service = TestBed.inject(PwaInstallService);
    service.platform.set('ios');

    const result = await service.install();

    expect(result).toBe('guide');
    expect(service.showInstallGuide()).toBe(true);
    expect(service.installGuide().steps.length).toBeGreaterThan(0);
  });
});
