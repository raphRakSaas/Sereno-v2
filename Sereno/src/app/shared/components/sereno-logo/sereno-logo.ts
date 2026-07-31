import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  SERENO_BRAND,
  SERENO_LOGO_SIZE_CLASSES,
  SERENO_WORDMARK_SIZE_CLASSES,
  SerenoLogoSize,
  SerenoLogoVariant,
} from '../../brand/sereno-brand';

@Component({
  selector: 'app-sereno-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex max-w-full min-w-0 items-center',
  },
  template: `
    <span
      class="inline-flex items-center gap-2"
      role="img"
      [attr.aria-label]="altText()"
    >
      <img
        [src]="iconSrc"
        alt=""
        aria-hidden="true"
        class="aspect-square w-auto object-contain"
        [class]="sizeClass()"
        decoding="async"
      />
      @if (variant() === 'full') {
        <span
          class="font-semibold tracking-tight text-text lowercase"
          [class]="wordmarkClass()"
          aria-hidden="true"
        >
          {{ brandName }}
        </span>
      }
    </span>
  `,
})
export class SerenoLogo {
  readonly variant = input<SerenoLogoVariant>('full');
  readonly size = input<SerenoLogoSize>('md');
  readonly altText = input<string>(SERENO_BRAND.name);

  protected readonly iconSrc = SERENO_BRAND.iconSrc;
  protected readonly brandName = SERENO_BRAND.name.toLowerCase();

  protected readonly sizeClass = computed(() => SERENO_LOGO_SIZE_CLASSES[this.size()]);
  protected readonly wordmarkClass = computed(() => SERENO_WORDMARK_SIZE_CLASSES[this.size()]);
}
