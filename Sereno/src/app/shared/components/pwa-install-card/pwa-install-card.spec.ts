import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PwaInstallCard } from './pwa-install-card';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';
import { signal } from '@angular/core';

describe('PwaInstallCard', () => {
  let fixture: ComponentFixture<PwaInstallCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PwaInstallCard],
      providers: [
        {
          provide: PwaInstallService,
          useValue: {
            isInstalled: signal(false),
            canNativeInstall: signal(true),
            platform: signal('android'),
            install: vi.fn().mockResolvedValue('installed'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PwaInstallCard);
    fixture.detectChanges();
  });

  it('should render the install button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Télécharger Sereno');
  });
});

describe('PwaInstallCard (integration)', () => {
  it('should call install when the button is clicked', async () => {
    const install = vi.fn().mockResolvedValue('installed');

    await TestBed.configureTestingModule({
      imports: [PwaInstallCard],
      providers: [
        {
          provide: PwaInstallService,
          useValue: {
            isInstalled: signal(false),
            canNativeInstall: signal(true),
            platform: signal('android'),
            install,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PwaInstallCard);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(install).toHaveBeenCalled();
  });
});
