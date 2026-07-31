import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';
import { AppStore } from '../../store/app.store';
import { DEFAULT_SETTINGS } from '../../models/settings.model';
import { providePwaTestMocks } from '../../pwa/pwa-test.providers';

describe('Sidebar', () => {
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
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

    fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the Sereno logo', () => {
    expect(fixture.nativeElement.querySelector('app-sereno-logo')).toBeTruthy();
  });

  it('should expose eight navigation items', () => {
    const links = fixture.nativeElement.querySelectorAll('nav a');
    expect(links.length).toBe(8);
  });

  it('should show a theme toggle button', () => {
    expect(fixture.nativeElement.textContent).toContain('Thème');
  });
});
