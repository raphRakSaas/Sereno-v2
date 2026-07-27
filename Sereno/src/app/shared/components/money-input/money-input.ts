import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { formatMoneyInput, parseMoneyInput } from '../../utils/parse-money-input';

@Component({
  selector: 'app-money-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <label class="block" [class.flex-1]="compact()">
      @if (label() && !compact()) {
        <span class="label-caps mb-2 block text-text-muted">{{ label() }}</span>
      }
      <div class="relative">
        <input
          type="text"
          inputmode="decimal"
          [formControl]="control"
          [attr.placeholder]="placeholder()"
          [attr.aria-label]="label() || placeholder()"
          class="w-full rounded-lg border border-border bg-surface pr-9 text-sm text-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
          [class.h-11]="!compact()"
          [class.h-9]="compact()"
          [class.px-4]="!compact()"
          [class.px-3]="compact()"
          [class.text-right]="compact()"
          [class.monetary-tabular]="compact()"
          (blur)="onBlur()"
        />
        <span
          class="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-text-muted"
          [class.right-4]="!compact()"
          >€</span
        >
      </div>
      @if (hint() && !compact()) {
        <p class="mt-2 text-[13px] text-text-muted">{{ hint() }}</p>
      }
    </label>
  `,
})
export class MoneyInput {
  readonly label = input<string>('');
  readonly placeholder = input<string>('0,00');
  readonly hint = input<string>('');
  readonly amountInCents = input<number>(0);
  readonly compact = input(false);

  readonly amountChange = output<number>();

  protected readonly control = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  constructor() {
    effect(() => {
      const formatted = formatMoneyInput(this.amountInCents());
      if (this.control.value !== formatted) {
        this.control.setValue(formatted, { emitEvent: false });
      }
    });
  }

  protected onBlur(): void {
    const parsed = parseMoneyInput(this.control.value);

    if (parsed === null) {
      this.control.setValue(formatMoneyInput(0));
      this.amountChange.emit(0);
      return;
    }

    this.control.setValue(formatMoneyInput(parsed));
    this.amountChange.emit(parsed);
  }
}
