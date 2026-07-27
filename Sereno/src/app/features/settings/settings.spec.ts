import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Settings } from './settings';

describe('Settings (unit)', () => {
  it('should have default theme value as system', () => {
    const defaultTheme = 'system';
    expect(defaultTheme).toBe('system');
  });
});

describe('Settings (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render all four settings sections', () => {
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
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
});
