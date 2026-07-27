import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home (integration)', () => {
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
  });

  it('should render the available balance', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Solde disponible');
    expect(compiled.textContent).toContain('12\u202f842,50\u00a0€');
  });

  it('should render budget categories from demo data', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Logement');
    expect(compiled.textContent).toContain('Courses');
    expect(compiled.textContent).toContain('Transport');
  });

  it('should render recent transactions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Courses Carrefour');
    expect(compiled.textContent).toContain('Salaire');
  });

  it('should render savings goal card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Voyage Japon 2027');
  });
});
