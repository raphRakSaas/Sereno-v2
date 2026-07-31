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
    expect(compiled.textContent).toContain('Juil. 26');
  });

  it('should keep the page title on its own line for mobile width', () => {
    const title = fixture.nativeElement.querySelector('h1') as HTMLHeadingElement;
    expect(title.className).toContain('flex-1');
    expect(title.className).toContain('truncate');
  });

  it('should emit searchSubmit when the search form is submitted', () => {
    const submitSpy = vi.fn();
    fixture.componentInstance.searchSubmit.subscribe(submitSpy);
    fixture.componentInstance['draftQuery'].set('loyer');
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    expect(submitSpy).toHaveBeenCalledWith('loyer');
  });
});
