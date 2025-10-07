import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintAnalyticsComponent } from './sprint-analytics';

describe('SprintAnalyticsComponent', () => {
  let component: SprintAnalyticsComponent;
  let fixture: ComponentFixture<SprintAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SprintAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
