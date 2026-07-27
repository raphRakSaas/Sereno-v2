import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Goals } from './goals';
import { AppStore } from '../../core/store/app.store';

describe('Goals (unit)', () => {
  it('should read goals from the app store', async () => {
    await TestBed.configureTestingModule({
      imports: [Goals],
      providers: [
        provideRouter([]),
        {
          provide: AppStore,
          useValue: {
            goals: signal([]),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Goals);
    expect(fixture.componentInstance['allGoals']()).toEqual([]);
  });
});

describe('Goals (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Goals],
      providers: [
        provideRouter([]),
        {
          provide: AppStore,
          useValue: {
            goals: signal([]),
          },
        },
      ],
    }).compileComponents();
  });

  it('should show create link to goal detail', () => {
    const fixture = TestBed.createComponent(Goals);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain("Objectifs d'épargne");
    expect(element.textContent).toContain("Aucun objectif pour l'instant");
    expect(element.textContent).toContain('Créer mon premier objectif');
    expect(element.querySelector('a[href="/objectifs/creer"]')).toBeTruthy();
  });
});
