import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { GoalsCard } from './goals-card';

describe('GoalsCard', () => {
  let fixture: ComponentFixture<GoalsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalsCard],
    }).compileComponents();

    fixture = TestBed.createComponent(GoalsCard);
  });

  it('should show an empty state invitation when no goal exists (unit)', () => {
    fixture.componentRef.setInput('goal', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Objectifs');
    expect(fixture.nativeElement.textContent).toContain('Aucun objectif pour l’instant');
    expect(fixture.nativeElement.textContent).toContain('Créer un objectif');
  });

  it('should render the active savings goal (integration)', () => {
    fixture.componentRef.setInput('goal', {
      id: 'goal-1',
      name: 'Vacances',
      targetDateLabel: 'Août 2026',
      savedInCents: 40000,
      targetInCents: 100000,
      monthlyContributionInCents: 10000,
      icon: 'flight',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Vacances');
    expect(fixture.nativeElement.textContent).toContain('Progression');
  });
});
