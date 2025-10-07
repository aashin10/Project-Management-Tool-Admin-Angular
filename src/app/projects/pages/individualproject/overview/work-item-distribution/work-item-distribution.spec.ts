
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { WorkItemDistributionComponent } from './work-item-distribution';


// describe('WorkItemDistributionComponent', () => {
//   let component: WorkItemDistributionComponent;
//   let fixture: ComponentFixture<WorkItemDistributionComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [WorkItemDistributionComponent] 
//     }).compileComponents();

//     fixture = TestBed.createComponent(WorkItemDistributionComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkItemDistributionComponent } from './work-item-distribution';

describe('WorkItemDistributionComponent', () => {
  let component: WorkItemDistributionComponent;
  let fixture: ComponentFixture<WorkItemDistributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkItemDistributionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkItemDistributionComponent);
    component = fixture.componentInstance;

    //  Mock some input data before detectChanges
    component.workItemDistribution = [
      { label: 'To Do', value: 5, percentage: 25, color: '#FF5733' },
      { label: 'In Progress', value: 10, percentage: 50, color: '#33C1FF' },
      { label: 'Done', value: 5, percentage: 25, color: '#75FF33' },
    ];
    component.totalItems = 20;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
