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

  it('should render the full logo image (unit)', () => {
    const image = fixture.debugElement.query(By.css('img'));
    expect(image).toBeTruthy();
    expect(image.nativeElement.getAttribute('src')).toBe(SERENO_BRAND.fullLogoSrc);
    expect(image.nativeElement.getAttribute('alt')).toBe('Sereno');
  });

  it('should render the icon variant without alt text (integration)', () => {
    fixture.componentRef.setInput('variant', 'icon');
    fixture.detectChanges();

    const image = fixture.debugElement.query(By.css('img'));
    expect(image.nativeElement.getAttribute('src')).toBe(SERENO_BRAND.iconSrc);
    expect(image.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('should apply the selected size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const image = fixture.debugElement.query(By.css('img'));
    expect(image.nativeElement.className).toContain('h-14');
  });
});
