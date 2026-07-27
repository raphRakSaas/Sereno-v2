import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BalanceCard } from './balance-card';
import { HOME_DEMO_DATA } from '../../data/home-demo.data';

describe('BalanceCard', () => {
  let fixture: ComponentFixture<BalanceCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceCard],
    }).compileComponents();

    fixture = TestBed.createComponent(BalanceCard);
    fixture.componentRef.setInput('summary', HOME_DEMO_DATA.summary);
    fixture.detectChanges();
  });

  it('should render formatted balance', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('12\u202f842,50\u00a0€');
  });
});
