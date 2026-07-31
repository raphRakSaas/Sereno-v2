import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, fromEvent } from 'rxjs';

const SCROLL_DELTA_THRESHOLD_PX = 8;

@Injectable({ providedIn: 'root' })
export class BottomNavScrollService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly isVisible = signal(true);

  private lastScrollY = 0;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.lastScrollY = window.scrollY;

    fromEvent(window, 'scroll', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateScrollPosition(window.scrollY);
      });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.show();
        this.lastScrollY = window.scrollY;
      });
  }

  show(): void {
    this.isVisible.set(true);
  }

  updateScrollPosition(currentScrollY: number): void {
    const delta = currentScrollY - this.lastScrollY;

    if (Math.abs(delta) < SCROLL_DELTA_THRESHOLD_PX) {
      return;
    }

    if (currentScrollY <= 0) {
      this.isVisible.set(true);
    } else if (delta > 0) {
      this.isVisible.set(false);
    } else {
      this.isVisible.set(true);
    }

    this.lastScrollY = currentScrollY;
  }
}
