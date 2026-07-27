import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  SERENO_BRAND,
  SERENO_LOGO_SIZE_CLASSES,
  SerenoLogoSize,
  SerenoLogoVariant,
} from '../../brand/sereno-brand';

@Component({
  selector: 'app-sereno-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex items-center',
  },
  template: `
    @if (variant() === 'full') {
      <img
        [src]="fullLogoSrc"
        [alt]="altText()"
        class="w-auto object-contain"
        [class]="sizeClass()"
        decoding="async"
      />
    } @else {
      <img
        [src]="iconSrc"
        alt=""
        aria-hidden="true"
        class="aspect-square w-auto object-contain"
        [class]="sizeClass()"
        decoding="async"
      />
    }
  `,
})
export class SerenoLogo {
  readonly variant = input<SerenoLogoVariant>('full');
  readonly size = input<SerenoLogoSize>('md');
  readonly altText = input<string>(SERENO_BRAND.name);

  protected readonly fullLogoSrc = SERENO_BRAND.fullLogoSrc;
  protected readonly iconSrc = SERENO_BRAND.iconSrc;

  protected readonly sizeClass = computed(() => SERENO_LOGO_SIZE_CLASSES[this.size()]);
}
