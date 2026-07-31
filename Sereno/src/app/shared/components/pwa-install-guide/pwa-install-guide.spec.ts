import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PwaInstallGuide } from './pwa-install-guide';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';

describe('PwaInstallGuide', () => {
  let fixture: ComponentFixture<PwaInstallGuide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PwaInstallGuide],
      providers: [
        {
          provide: PwaInstallService,
          useValue: {
            showInstallGuide: signal(true),
            installGuide: signal({
              browserLabel: 'Safari sur iPhone',
              title: 'Installer Sereno sur iPhone',
              subtitle: 'Deux étapes',
              steps: [{ icon: 'ios_share', text: 'Appuie sur Partager' }],
              note: 'Astuce Safari',
            }),
            closeInstallGuide: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PwaInstallGuide);
    fixture.detectChanges();
  });

  it('should render browser-specific installation steps', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Safari sur iPhone');
    expect(compiled.textContent).toContain('Partager');
    expect(compiled.textContent).toContain('Astuce Safari');
  });
});
