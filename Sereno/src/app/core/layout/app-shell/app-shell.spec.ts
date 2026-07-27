import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppShell } from './app-shell';

describe('AppShell (integration)', () => {
  let fixture: ComponentFixture<AppShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideRouter([
          {
            path: '',
            loadComponent: () => import('../../../features/home/home').then((module) => module.Home),
          },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
  });

  it('should render sidebar navigation', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Accueil');
    expect(compiled.textContent).toContain('Nouvelle transaction');
  });

  it('should update month label when navigating months', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Juillet 2026');

    const nextButton = compiled.querySelector('[aria-label="Mois suivant"]') as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Août 2026');
  });
});
