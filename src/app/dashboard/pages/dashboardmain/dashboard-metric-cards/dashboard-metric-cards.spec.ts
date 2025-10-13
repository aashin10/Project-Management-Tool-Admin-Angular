import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMetricCards } from './dashboard-metric-cards';

describe('DashboardMetricCards', () => {
  let component: DashboardMetricCards;
  let fixture: ComponentFixture<DashboardMetricCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardMetricCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardMetricCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
