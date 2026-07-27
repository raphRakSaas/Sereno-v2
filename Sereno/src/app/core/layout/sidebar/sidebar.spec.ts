import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])],
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
});
