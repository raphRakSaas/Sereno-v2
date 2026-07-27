import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OnboardingLottie } from './onboarding-lottie';

const loadAnimationMock = vi.fn(() => ({
  destroy: vi.fn(),
}));

vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: loadAnimationMock,
  },
}));

@Component({
  imports: [OnboardingLottie],
  template: `
    <app-onboarding-lottie
      [animationPath]="animationPath"
      [ariaLabel]="ariaLabel"
    />
  `,
})
class OnboardingLottieHost {
  animationPath = '/onboarding/first-animation.json';
  ariaLabel = 'Animation de test';
}

describe('OnboardingLottie', () => {
  let fixture: ComponentFixture<OnboardingLottieHost>;

  afterEach(() => {
    loadAnimationMock.mockClear();
    fixture?.destroy();
  });

  it('should create the animation container with accessibility label (unit)', async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingLottieHost],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingLottieHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const container = fixture.debugElement.query(By.css('[role="img"]'));
    expect(container).toBeTruthy();
    expect(container.nativeElement.getAttribute('aria-label')).toBe('Animation de test');
  });

  it('should load the Lottie animation after render (integration)', async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingLottieHost],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingLottieHost);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(loadAnimationMock).toHaveBeenCalled();
    const firstCallConfig = loadAnimationMock.mock.calls.at(0)?.at(0) as
      | Record<string, unknown>
      | undefined;
    expect(firstCallConfig).toMatchObject({
      path: '/onboarding/first-animation.json',
      loop: true,
      autoplay: true,
      renderer: 'svg',
    });
  });
});
