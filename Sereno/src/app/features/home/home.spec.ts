import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { AppStore } from '../../core/store/app.store';
import { HOME_DEMO_DATA } from './data/home-demo.data';
import { Home } from './home';

describe('Home (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        {
          provide: AppStore,
          useValue: {
            dashboardData: computed(() => HOME_DEMO_DATA),
          },
        },
      ],
    }).compileComponents();
  });

  it('should render the available balance', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Solde disponible');
    expect(compiled.textContent).toContain('12\u202f842,50\u00a0€');
  });

  it('should render budget categories from store data', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Logement');
    expect(compiled.textContent).toContain('Courses');
  });
});
