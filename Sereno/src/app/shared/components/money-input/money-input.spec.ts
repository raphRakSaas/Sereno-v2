import { TestBed } from '@angular/core/testing';
import { MoneyInput } from './money-input';

describe('MoneyInput', () => {
  it('should emit parsed cents on blur', () => {
    const fixture = TestBed.createComponent(MoneyInput);
    const emitted: number[] = [];

    fixture.componentInstance.amountChange.subscribe((value) => emitted.push(value));
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      control: { setValue: (value: string) => void };
      onBlur: () => void;
    };

    component.control.setValue('1234,56');
    component.onBlur();
    fixture.detectChanges();

    expect(emitted).toContain(123456);
  });

  it('should render a compact input without stacked label', () => {
    const fixture = TestBed.createComponent(MoneyInput);
    fixture.componentRef.setInput('label', 'Logement');
    fixture.componentRef.setInput('compact', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.label-caps')).toBeNull();
    expect(fixture.nativeElement.querySelector('input')?.classList.contains('h-9')).toBe(true);
  });
});
