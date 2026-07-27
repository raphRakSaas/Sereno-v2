import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import type { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-onboarding-lottie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #container
      class="mx-auto aspect-square w-full max-w-lg [&_svg]:h-full [&_svg]:w-full"
      [attr.aria-label]="ariaLabel()"
      role="img"
    ></div>
  `,
})
export class OnboardingLottie implements OnDestroy {
  private readonly injector = inject(Injector);

  private animation: AnimationItem | null = null;
  private activeSource: string | null = null;
  private loadToken = 0;

  readonly animationPath = input.required<string>();
  readonly ariaLabel = input('Illustration animée de l’onboarding');

  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('container');

  constructor() {
    // afterNextRender = le DOM (div #container) existe vraiment côté navigateur.
    // effect a besoin d’un Injector car on est hors du constructeur à ce moment-là.
    afterNextRender(() => {
      effect(
        (onCleanup) => {
          const source = this.animationPath();
          const containerElement = this.container().nativeElement;
          const token = ++this.loadToken;

          onCleanup(() => {
            this.destroyAnimation();
          });

          void this.loadAnimation(source, containerElement, token);
        },
        { injector: this.injector },
      );
    });
  }

  ngOnDestroy(): void {
    this.destroyAnimation();
  }

  private destroyAnimation(): void {
    this.animation?.destroy();
    this.animation = null;
    this.activeSource = null;
  }

  private async loadAnimation(
    source: string,
    containerElement: HTMLDivElement,
    token: number,
  ): Promise<void> {
    if (this.activeSource === source && this.animation) {
      return;
    }

    this.destroyAnimation();
    this.activeSource = source;
    containerElement.replaceChildren();

    try {
      const lottie = await import('lottie-web');

      if (token !== this.loadToken) {
        return;
      }

      this.animation = lottie.default.loadAnimation({
        container: containerElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: source,
      });
    } catch (error) {
      console.error('Impossible de charger l’animation Lottie:', source, error);
      this.activeSource = null;
    }
  }
}
