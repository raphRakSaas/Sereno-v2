import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { SERENO_BRAND } from '../../brand/sereno-brand';
import { SerenoLogo } from './sereno-logo';

describe('SerenoLogo', () => {
  let fixture: ComponentFixture<SerenoLogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SerenoLogo],
    }).compileComponents();

    fixture = TestBed.createComponent(SerenoLogo);
    fixture.detectChanges();
  });

  it('should render the icon and theme-aware wordmark for the full variant (unit)', () => {
    const image = fixture.debugElement.query(By.css('img'));
    const wordmark = fixture.debugElement.query(By.css('span[aria-hidden="true"]'));
    const root = fixture.debugElement.query(By.css('[role="img"]'));

    expect(image).toBeTruthy();
    expect(image.nativeElement.getAttribute('src')).toBe(SERENO_BRAND.iconSrc);
    expect(image.nativeElement.getAttribute('aria-hidden')).toBe('true');
    expect(wordmark.nativeElement.textContent.trim()).toBe('sereno');
    expect(wordmark.nativeElement.className).toContain('text-text');
    expect(root.nativeElement.getAttribute('aria-label')).toBe('Sereno');
  });

  it('should render the icon variant without the wordmark (integration)', () => {
    fixture.componentRef.setInput('variant', 'icon');
    fixture.detectChanges();

    const image = fixture.debugElement.query(By.css('img'));
    const wordmark = fixture.debugElement.query(By.css('span.lowercase'));

    expect(image.nativeElement.getAttribute('src')).toBe(SERENO_BRAND.iconSrc);
    expect(wordmark).toBeNull();
  });

  it('should apply the selected size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const image = fixture.debugElement.query(By.css('img'));
    const wordmark = fixture.debugElement.query(By.css('span.lowercase'));

    expect(image.nativeElement.className).toContain('h-14');
    expect(wordmark.nativeElement.className).toContain('text-2xl');
  });
});
