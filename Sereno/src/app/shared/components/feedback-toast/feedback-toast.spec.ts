import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FeedbackToast } from './feedback-toast';
import { FeedbackService } from '../../../core/services/feedback.service';

describe('FeedbackToast', () => {
  let fixture: ComponentFixture<FeedbackToast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackToast],
      providers: [
        {
          provide: FeedbackService,
          useValue: {
            activeMessage: signal({
              title: 'Export réussi',
              detail: 'Sauvegarde complète téléchargée.',
              tone: 'success',
              kind: 'export',
            }),
            dismiss: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackToast);
    fixture.detectChanges();
  });

  it('should render a visible success toast', () => {
    expect(fixture.nativeElement.textContent).toContain('Export réussi');
    expect(fixture.nativeElement.textContent).toContain('Sauvegarde complète téléchargée.');
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeTruthy();
  });
});
