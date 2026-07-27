import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AppShell } from './app-shell';
import { AppStore } from '../../store/app.store';

describe('AppShell (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideRouter([]),
        {
          provide: AppStore,
          useValue: {
            selectedMonthKey: signal('2026-07'),
            setSelectedMonth: vi.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  it('should render sidebar navigation and brand logo', () => {
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Accueil');
    expect(compiled.textContent).toContain('Nouvelle transaction');
    expect(compiled.querySelector('app-sereno-logo')).toBeTruthy();
  });
});
