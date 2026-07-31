import { TestBed } from '@angular/core/testing';
import { PwaInstallService } from './pwa-install.service';

describe('PwaInstallService', () => {
  it('should close the ios guide', () => {
    TestBed.configureTestingModule({
      providers: [PwaInstallService],
    });

    const service = TestBed.inject(PwaInstallService);
    service.showIosGuide.set(true);

    service.closeIosGuide();

    expect(service.showIosGuide()).toBe(false);
  });
});
