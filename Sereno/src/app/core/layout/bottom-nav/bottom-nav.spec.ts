import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { BottomNav } from './bottom-nav';
import { AppStore } from '../../store/app.store';
import { DEFAULT_SETTINGS } from '../../models/settings.model';
import { providePwaTestMocks } from '../../pwa/pwa-test.providers';

describe('BottomNav', () => {
  let fixture: ComponentFixture<BottomNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNav],
      providers: [
        provideRouter([]),
        ...providePwaTestMocks(),
        {
          provide: AppStore,
          useValue: {
            settings: signal(DEFAULT_SETTINGS),
            toggleTheme: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNav);
    fixture.detectChanges();
  });

  it('should render icon labels in the main navigation', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Accueil');
    expect(compiled.textContent).toContain('Activité');
    expect(compiled.textContent).toContain('Ajouter');
    expect(compiled.textContent).toContain('Budgets');
    expect(compiled.textContent).toContain('Plus');
  });

  it('should keep the navigation bar centered with symmetric horizontal insets', () => {
    const nav = fixture.nativeElement.querySelector('nav[aria-label="Navigation principale"]') as HTMLElement;
    expect(nav.className).toContain('left-4');
    expect(nav.className).toContain('right-4');
  });
});

describe('BottomNav (integration)', () => {
  let fixture: ComponentFixture<BottomNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNav],
      providers: [
        provideRouter([]),
        ...providePwaTestMocks(),
        {
          provide: AppStore,
          useValue: {
            settings: signal(DEFAULT_SETTINGS),
            toggleTheme: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNav);
    fixture.detectChanges();
  });

  it('should open the more menu when the plus button is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const moreButton = compiled.querySelector('button[aria-label="Plus d\'options"]') as HTMLButtonElement;

    moreButton.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Calendrier');
    expect(moreButton.getAttribute('aria-expanded')).toBe('true');
  });
});
