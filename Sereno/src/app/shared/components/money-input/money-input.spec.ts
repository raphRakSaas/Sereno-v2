import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  it('should keep zero amounts empty so the placeholder stays visible', () => {
    const fixture = TestBed.createComponent(MoneyInput);
    fixture.componentRef.setInput('amountInCents', 0);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input.getAttribute('placeholder')).toBe('0,00');
  });

  it('should clear the field on focus when the amount is zero', () => {
    const fixture = TestBed.createComponent(MoneyInput);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    fixture.detectChanges();

    expect(input.value).toBe('');
  });

  it('should emit zero and keep the field empty when blur happens without input', () => {
    const fixture = TestBed.createComponent(MoneyInput);
    const emitted: number[] = [];

    fixture.componentInstance.amountChange.subscribe((value) => emitted.push(value));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    fixture.detectChanges();

    expect(emitted).toContain(0);
    expect(input.value).toBe('');
  });
});

describe('MoneyInput (integration)', () => {
  let fixture: ComponentFixture<MoneyInput>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MoneyInput);
    fixture.componentRef.setInput('amountInCents', 250000);
    fixture.detectChanges();
  });

  it('should display a formatted non-zero amount', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2500,00');
  });

  it('should clear zero values on focus but keep existing amounts editable', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    fixture.detectChanges();

    expect(input.value).toBe('2500,00');
  });
});
