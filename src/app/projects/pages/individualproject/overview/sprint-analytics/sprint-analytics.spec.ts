import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintAnalytics } from './sprint-analytics';

describe('SprintAnalytics', () => {
  let component: SprintAnalytics;
  let fixture: ComponentFixture<SprintAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintAnalytics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SprintAnalytics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
