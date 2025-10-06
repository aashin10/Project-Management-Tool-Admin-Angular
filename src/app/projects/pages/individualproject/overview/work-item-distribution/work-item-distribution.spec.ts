
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
