import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkItemDistribution } from './work-item-distribution';

describe('WorkItemDistribution', () => {
  let component: WorkItemDistribution;
  let fixture: ComponentFixture<WorkItemDistribution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkItemDistribution]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkItemDistribution);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
