import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { PwaInstallBanner } from './pwa-install-banner';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';

describe('PwaInstallBanner', () => {
  let fixture: ComponentFixture<PwaInstallBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PwaInstallBanner],
      providers: [
        {
          provide: PwaInstallService,
          useValue: {
            shouldShowMobileInstallPrompt: signal(true),
            platform: signal('ios'),
            installGuide: signal({
              browserLabel: 'Safari sur iPhone',
              title: 'Installer',
              subtitle: 'Subtitle',
              steps: [],
            }),
            install: vi.fn().mockResolvedValue('guide'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PwaInstallBanner);
    fixture.detectChanges();
  });

  it('should show a visible install banner on mobile', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Installer Sereno');
    expect(compiled.textContent).toContain('Voir le tuto');
  });
});

describe('PwaInstallBanner (integration)', () => {
  it('should call install when the banner button is clicked', async () => {
    const install = vi.fn().mockResolvedValue('guide');

    await TestBed.configureTestingModule({
      imports: [PwaInstallBanner],
      providers: [
        {
          provide: PwaInstallService,
          useValue: {
            shouldShowMobileInstallPrompt: signal(true),
            platform: signal('ios'),
            installGuide: computed(() => ({
              browserLabel: 'Safari sur iPhone',
              title: 'Installer',
              subtitle: 'Subtitle',
              steps: [],
            })),
            install,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PwaInstallBanner);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(install).toHaveBeenCalled();
  });
});
