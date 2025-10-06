import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkTypesComponent } from './types-of-work';


describe('WorkTypesComponent', () => {
  let component: WorkTypesComponent;
  let fixture: ComponentFixture<WorkTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Add more meaningful tests
  it('should display work types when provided', () => {
    const mockWorkTypes = [
      { name: 'Story', percentage: 45, color: '#059669', icon: 'file-text' },
      { name: 'Task', percentage: 32, color: '#3B82F6', icon: 'check-square' }
    ];
    
    component.workTypes = mockWorkTypes;
    fixture.detectChanges();

    const workTypeElements = fixture.nativeElement.querySelectorAll('.group');
    expect(workTypeElements.length).toBe(2);
  });

  it('should return correct SVG icons', () => {
    const icon = component.getWorkTypeIcon('file-text');
    expect(icon).toContain('svg');
    expect(icon).toContain('file-text');
  });

  it('should handle unknown icon names', () => {
    const icon = component.getWorkTypeIcon('unknown-icon');
    expect(icon).toBe('');
  });
});