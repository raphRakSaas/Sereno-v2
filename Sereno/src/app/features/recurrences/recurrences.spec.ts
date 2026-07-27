import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Recurrences } from './recurrences';

describe('Recurrences (unit)', () => {
  it('should start without fabricated recurrence demo data', async () => {
    await TestBed.configureTestingModule({
      imports: [Recurrences],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(Recurrences);
    expect(fixture.componentInstance['recurrences']()).toEqual([]);
  });
});

describe('Recurrences (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recurrences],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render empty invitation instead of fake salary/rent rows', () => {
    const fixture = TestBed.createComponent(Recurrences);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Récurrences');
    expect(element.textContent).toContain('Aucune récurrence pour l\'instant');
    expect(element.textContent).not.toContain('Spotify');
    expect(element.textContent).not.toContain('Voyage Japon');
  });
});
