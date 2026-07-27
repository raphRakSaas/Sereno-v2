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
});
