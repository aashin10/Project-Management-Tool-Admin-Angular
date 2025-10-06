import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewDashboardCard } from './overview-dashboard-card';

describe('OverviewDashboardCard', () => {
  let component: OverviewDashboardCard;
  let fixture: ComponentFixture<OverviewDashboardCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewDashboardCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewDashboardCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
