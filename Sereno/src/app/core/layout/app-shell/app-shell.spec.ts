import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AppShell } from './app-shell';
import { AppStore } from '../../store/app.store';
import { DEFAULT_SETTINGS } from '../../models/settings.model';
import { providePwaTestMocks } from '../../pwa/pwa-test.providers';

describe('AppShell (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideRouter([]),
        ...providePwaTestMocks(),
        {
          provide: AppStore,
          useValue: {
            selectedMonthKey: signal('2026-07'),
            searchQuery: signal(''),
            settings: signal(DEFAULT_SETTINGS),
            setSelectedMonth: vi.fn(),
            setSearchQuery: vi.fn(),
            toggleTheme: vi.fn(),
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

  it('should size main content to viewport width minus sidebar on desktop', () => {
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();

    const mainElement = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(mainElement.className).toContain('lg:ml-sidebar');
    expect(mainElement.className).toContain('lg:w-[calc(100%-var(--spacing-sidebar))]');
    expect(mainElement.className).toContain('w-full');
  });
});
