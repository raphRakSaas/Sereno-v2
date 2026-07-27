import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { GoalDetail } from './goal-detail';
import { AppStore } from '../../core/store/app.store';

const addGoalContribution = vi.fn().mockResolvedValue(undefined);
const deleteGoalContribution = vi.fn().mockResolvedValue(undefined);

const goalsSignal = signal([
  {
    id: 'goal-1',
    name: 'Toulouse',
    targetAmountInCents: 300000,
    icon: 'flight_takeoff',
    createdAt: '2026-07-01T00:00:00.000Z',
    contributions: [{ id: 'c1', amountInCents: 50000, date: '2026-07-10' }],
  },
]);

describe('GoalDetail (integration)', () => {
  beforeEach(async () => {
    addGoalContribution.mockClear();
    await TestBed.configureTestingModule({
      imports: [GoalDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ goalId: 'goal-1' })),
          },
        },
        {
          provide: AppStore,
          useValue: {
            goals: goalsSignal,
            addGoalContribution,
            deleteGoalContribution,
          },
        },
      ],
    }).compileComponents();
  });

  it('should render goal progress and contribution form', () => {
    const fixture = TestBed.createComponent(GoalDetail);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Toulouse');
    expect(element.textContent).toContain('Ajouter une contribution');
    expect(element.textContent).toContain('Via une transaction');
    expect(element.textContent).toContain('Historique des contributions');
  });
});
