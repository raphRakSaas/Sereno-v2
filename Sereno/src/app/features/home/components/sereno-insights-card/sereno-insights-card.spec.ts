import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SerenoInsightsCard } from './sereno-insights-card';

describe('SerenoInsightsCard', () => {
  let fixture: ComponentFixture<SerenoInsightsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SerenoInsightsCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SerenoInsightsCard);
    fixture.detectChanges();
  });

  it('should render the welcome message (unit)', () => {
    expect(fixture.nativeElement.textContent).toContain('Analyses de Sereno');
    expect(fixture.nativeElement.textContent).toContain('Bienvenue sur ton aperçu');
  });

  it('should encourage filling the main dimensions (integration)', () => {
    expect(fixture.nativeElement.textContent).toContain('Enregistre une dépense');
    expect(fixture.nativeElement.textContent).toContain('Affirme tes budgets');
    expect(fixture.nativeElement.textContent).toContain('Pose un objectif');
  });
});
