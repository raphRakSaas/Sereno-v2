import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, Event } from '@angular/router';
import { Subject } from 'rxjs';
import { BottomNavScrollService } from './bottom-nav-scroll.service';

describe('BottomNavScrollService', () => {
  let service: BottomNavScrollService;
  let routerEvents: Subject<Event>;

  beforeEach(() => {
    routerEvents = new Subject<Event>();

    TestBed.configureTestingModule({
      providers: [
        BottomNavScrollService,
        {
          provide: Router,
          useValue: {
            events: routerEvents.asObservable(),
          },
        },
      ],
    });

    service = TestBed.inject(BottomNavScrollService);
  });

  it('should hide the bottom nav when scrolling down the page (unit)', () => {
    service.updateScrollPosition(0);
    service.updateScrollPosition(120);

    expect(service.isVisible()).toBe(false);
  });

  it('should show the bottom nav when scrolling up the page (unit)', () => {
    service.updateScrollPosition(200);
    service.updateScrollPosition(140);

    expect(service.isVisible()).toBe(true);
  });

  it('should keep the bottom nav visible at the top of the page (integration)', () => {
    service.updateScrollPosition(40);
    service.updateScrollPosition(0);

    expect(service.isVisible()).toBe(true);
  });

  it('should reveal the bottom nav after route changes', () => {
    service.updateScrollPosition(0);
    service.updateScrollPosition(160);
    expect(service.isVisible()).toBe(false);

    routerEvents.next(new NavigationEnd(1, '/budgets', '/budgets'));

    expect(service.isVisible()).toBe(true);
  });
});
