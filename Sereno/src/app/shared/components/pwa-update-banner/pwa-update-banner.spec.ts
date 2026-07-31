import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PwaUpdateBanner } from './pwa-update-banner';
import { PwaUpdateService } from '../../../core/pwa/pwa-update.service';

describe('PwaUpdateBanner', () => {
  let fixture: ComponentFixture<PwaUpdateBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PwaUpdateBanner],
      providers: [
        {
          provide: PwaUpdateService,
          useValue: {
            updateAvailable: signal(true),
            applyUpdate: vi.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PwaUpdateBanner);
    fixture.detectChanges();
  });

  it('should show the update banner when a new version is available', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Mise à jour disponible');
  });
});
