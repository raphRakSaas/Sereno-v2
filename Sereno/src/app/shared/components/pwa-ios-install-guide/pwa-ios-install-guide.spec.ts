import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PwaIosInstallGuide } from './pwa-ios-install-guide';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';

describe('PwaIosInstallGuide', () => {
  let fixture: ComponentFixture<PwaIosInstallGuide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PwaIosInstallGuide],
      providers: [
        {
          provide: PwaInstallService,
          useValue: {
            showIosGuide: signal(true),
            closeIosGuide: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PwaIosInstallGuide);
    fixture.detectChanges();
  });

  it('should render iOS installation steps', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Installer sur iPhone');
    expect(compiled.textContent).toContain("Sur l'écran d'accueil");
  });
});
