import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopBar } from './top-bar';

describe('TopBar', () => {
  let fixture: ComponentFixture<TopBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBar],
    }).compileComponents();

    fixture = TestBed.createComponent(TopBar);
    fixture.componentRef.setInput('year', 2026);
    fixture.componentRef.setInput('monthIndex', 6);
    fixture.detectChanges();
  });

  it('should display the formatted month label', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Juillet 2026');
  });

  it('should emit previousMonth when clicking previous button', () => {
    const previousSpy = vi.fn();
    fixture.componentInstance.previousMonth.subscribe(previousSpy);

    const button = fixture.nativeElement.querySelector(
      '[aria-label="Mois précédent"]',
    ) as HTMLButtonElement;
    button.click();

    expect(previousSpy).toHaveBeenCalled();
  });
});
