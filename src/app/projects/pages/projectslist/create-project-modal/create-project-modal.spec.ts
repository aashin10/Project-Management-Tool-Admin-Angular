import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateProjectModal } from './create-project-modal';

describe('CreateProjectModal', () => {
  let component: CreateProjectModal;
  let fixture: ComponentFixture<CreateProjectModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProjectModal]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectModal);
    component = fixture.componentInstance;
    component.projects = [
      { id: '1', name: 'Atlas', projectCode: 'P1', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Alice', teamSize: 5 }
    ] as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('generateProjectKey should create a key from name', () => {
    component.projectName = 'Atlas App';
    component.generateProjectKey();
    expect(component.projectKey).toBe('ATL');
  });

  it('onProjectSearchChange should filter projects', () => {
    component.projectSearchQuery = 'atlas';
    component.onProjectSearchChange();
    expect(component.filteredProjects.length).toBeGreaterThan(0);
  });

  it('onCreate should emit when name present', () => {
    spyOn(component.createProject, 'emit');
    component.projectName = 'NewProj';
    component.generateProjectKey();
    component.onCreate();
    expect(component.createProject.emit).toHaveBeenCalled();
  });

});
