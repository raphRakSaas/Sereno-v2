import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Settings } from './settings';
import { AppStore } from '../../core/store/app.store';
import { DEFAULT_SETTINGS } from '../../core/models/settings.model';
import { providePwaTestMocks } from '../../core/pwa/pwa-test.providers';

const updateSettings = vi.fn().mockResolvedValue(undefined);
const exportData = vi.fn().mockReturnValue({ version: 1, settings: DEFAULT_SETTINGS });
const loadDemoData = vi.fn().mockResolvedValue(undefined);
const resetAllData = vi.fn().mockResolvedValue(undefined);

const mockAppStore = {
  settings: signal(DEFAULT_SETTINGS),
  resolvedTheme: signal('light' as const),
  updateSettings,
  exportData,
  importData: vi.fn(),
  loadDemoData,
  resetAllData,
};

describe('Settings (integration)', () => {
  beforeEach(async () => {
    updateSettings.mockClear();
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        provideRouter([]),
        ...providePwaTestMocks(),
        { provide: AppStore, useValue: mockAppStore },
      ],
    }).compileComponents();
  });

  it('should render all settings sections including the PWA card', () => {
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Application mobile');
    expect(element.textContent).toContain('Mises à jour');
    expect(element.textContent).toContain('Données sur cet appareil');
    expect(element.textContent).toContain('Affichage');
    expect(element.textContent).toContain('Tes données');
    expect(element.textContent).toContain("L'application");
  });

  it('should render privacy message', () => {
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('100% local');
    expect(element.textContent).toContain('privé');
  });

  it('should display theme and currency selects', () => {
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const selects = element.querySelectorAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(2);
    expect(element.textContent).toContain('Thème');
    expect(element.textContent).toContain('Devise');
  });

  it('should persist theme changes through the store', async () => {
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    await fixture.componentInstance['onThemeChange']('dark');
    expect(updateSettings).toHaveBeenCalledWith({ theme: 'dark' });
  });
});
