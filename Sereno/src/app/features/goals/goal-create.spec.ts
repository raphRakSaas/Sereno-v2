import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GoalCreate } from './goal-create';
import { AppStore } from '../../core/store/app.store';

const addGoal = vi.fn().mockResolvedValue({ id: 'goal-1' });

describe('GoalCreate (integration)', () => {
  beforeEach(async () => {
    addGoal.mockClear();
    await TestBed.configureTestingModule({
      imports: [GoalCreate],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: { addGoal } },
      ],
    }).compileComponents();
  });

  it('should render goal creation form', () => {
    const fixture = TestBed.createComponent(GoalCreate);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Créer un objectif');
    expect(element.textContent).toContain('Montant cible');
  });

  it('should require a name and positive target amount', async () => {
    const fixture = TestBed.createComponent(GoalCreate);
    fixture.detectChanges();
    await fixture.componentInstance['onSubmit']();
    expect(addGoal).not.toHaveBeenCalled();
  });
});
