import { TestBed } from '@angular/core/testing';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [FeedbackService],
    });
    service = TestBed.inject(FeedbackService);
  });

  it('should show a visible feedback message (unit)', () => {
    service.show({
      title: 'Export réussi',
      detail: '12 transactions sauvegardées.',
      tone: 'success',
      kind: 'export',
    });

    expect(service.activeMessage()?.title).toBe('Export réussi');
  });

  it('should restore a pending message after reload (integration)', () => {
    service.showAfterReload({
      title: 'Import terminé',
      detail: '24 transactions importées.',
      tone: 'success',
      kind: 'import',
    });

    service.restorePendingMessage();

    expect(service.activeMessage()?.title).toBe('Import terminé');
    expect(sessionStorage.getItem('sereno-feedback-pending')).toBeNull();
  });
});
