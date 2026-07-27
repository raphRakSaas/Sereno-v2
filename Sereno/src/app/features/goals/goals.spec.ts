import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Goals } from './goals';

describe('Goals (unit)', () => {
  it('should start without fabricated demo goals', async () => {
    await TestBed.configureTestingModule({
      imports: [Goals],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(Goals);
    expect(fixture.componentInstance['allGoals']()).toEqual([]);
  });
});

describe('Goals (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Goals],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should show an empty invitation instead of fake goals', () => {
    const fixture = TestBed.createComponent(Goals);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain("Objectifs d'épargne");
    expect(element.textContent).toContain("Aucun objectif pour l'instant");
    expect(element.textContent).not.toContain('Voyage Japon 2027');
    expect(element.textContent).toContain('Créer mon premier objectif');
  });
});
