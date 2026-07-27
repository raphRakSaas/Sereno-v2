import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';
import { RecurrenceCreate } from './recurrence-create';
import { AppStore } from '../../core/store/app.store';
import { SYSTEM_CATEGORIES } from '../../core/data/system-categories';

const addRecurrence = vi.fn().mockResolvedValue({ id: 'rec-1' });

describe('RecurrenceCreate (integration)', () => {
  beforeEach(async () => {
    addRecurrence.mockClear();
    await TestBed.configureTestingModule({
      imports: [RecurrenceCreate],
      providers: [
        provideRouter([]),
        {
          provide: AppStore,
          useValue: {
            addRecurrence,
            activeCategories: computed(() => SYSTEM_CATEGORIES),
            categories: signal(SYSTEM_CATEGORIES),
          },
        },
      ],
    }).compileComponents();
  });

  it('should render recurrence creation form', () => {
    const fixture = TestBed.createComponent(RecurrenceCreate);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Nouvelle récurrence');
    expect(element.textContent).toContain('Fréquence');
  });

  it('should block submit without amount and label', async () => {
    const fixture = TestBed.createComponent(RecurrenceCreate);
    fixture.detectChanges();
    await fixture.componentInstance['onSubmit']();
    expect(addRecurrence).not.toHaveBeenCalled();
  });
});
