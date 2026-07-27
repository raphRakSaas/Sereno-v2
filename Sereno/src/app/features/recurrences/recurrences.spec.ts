import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Recurrences } from './recurrences';
import { AppStore } from '../../core/store/app.store';

describe('Recurrences (unit)', () => {
  it('should start from store recurrences', async () => {
    await TestBed.configureTestingModule({
      imports: [Recurrences],
      providers: [
        provideRouter([]),
        {
          provide: AppStore,
          useValue: {
            recurrences: signal([]),
            categories: signal([]),
            updateRecurrence: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Recurrences);
    expect(fixture.componentInstance['recurrenceViews']()).toEqual([]);
  });
});

describe('Recurrences (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recurrences],
      providers: [
        provideRouter([]),
        {
          provide: AppStore,
          useValue: {
            recurrences: signal([]),
            categories: signal([]),
            updateRecurrence: vi.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  it('should render empty invitation with create CTA', () => {
    const fixture = TestBed.createComponent(Recurrences);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Récurrences');
    expect(element.textContent).toContain("Aucune récurrence pour l'instant");
    expect(element.textContent).toContain('Créer une récurrence');
  });
});
