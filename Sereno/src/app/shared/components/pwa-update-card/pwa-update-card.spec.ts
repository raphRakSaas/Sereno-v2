import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PwaUpdateCard } from './pwa-update-card';
import { PwaUpdateService } from '../../../core/pwa/pwa-update.service';

describe('PwaUpdateCard', () => {
  let fixture: ComponentFixture<PwaUpdateCard>;
  const checkForUpdate = vi.fn().mockResolvedValue(false);
  const applyUpdate = vi.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    checkForUpdate.mockClear();
    applyUpdate.mockClear();

    await TestBed.configureTestingModule({
      imports: [PwaUpdateCard],
      providers: [
        {
          provide: PwaUpdateService,
          useValue: {
            isEnabled: signal(true),
            updateAvailable: signal(false),
            isChecking: signal(false),
            checkMessage: signal<string | null>(null),
            checkForUpdate,
            applyUpdate,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PwaUpdateCard);
    fixture.detectChanges();
  });

  it('should render the manual update check action', () => {
    expect(fixture.nativeElement.textContent).toContain('Vérifier les mises à jour');
  });

  it('should trigger a manual update check', () => {
    const button = [...fixture.nativeElement.querySelectorAll('button')].find(
      (element: Element) => element.textContent?.includes('Vérifier les mises à jour'),
    ) as HTMLButtonElement;

    button.click();

    expect(checkForUpdate).toHaveBeenCalledTimes(1);
  });
});
