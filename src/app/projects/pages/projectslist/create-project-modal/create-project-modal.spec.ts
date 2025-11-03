import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CreateProjectModal } from './create-project-modal';
import { ProjectsService, Project } from '../../../services/projects.service';

describe('CreateProjectModal', () => {
  let component: CreateProjectModal;
  let fixture: ComponentFixture<CreateProjectModal>;
  let projectsServiceMock: jasmine.SpyObj<ProjectsService>;

  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Atlas',
      projectCode: 'P1',
      status: 'Active',
      deliveryUnit: 'DU1',
      projectManager: 'Alice',
      teamSize: 5,
      template: 'Scrum',
      organisationName: 'Org 1'
    },
    {
      id: '2',
      name: 'Beta Project',
      projectCode: 'P2',
      status: 'Inactive',
      deliveryUnit: 'DU2',
      projectManager: 'Bob',
      teamSize: 3,
      template: 'Kanban',
      organisationName: 'Org 2'
    }
  ];

  const mockApiResponse = {
    status: 200,
    data: {
      items: mockProjects.map(p => ({
        id: p.id,
        name: p.name,
        key: p.projectCode,
        status: { name: p.status },
        deliveryUnit: { code: p.deliveryUnit },
        projectManager: { name: p.projectManager },
        teamSize: p.teamSize
      })),
      totalCount: 2,
      page: 1,
      pageSize: 1000,
      totalPages: 1
    },
    message: 'Success'
  };

  beforeEach(async () => {
    projectsServiceMock = jasmine.createSpyObj('ProjectsService', ['getProjects']);
    projectsServiceMock.getProjects.and.returnValue(of(mockApiResponse as any));

    await TestBed.configureTestingModule({
      imports: [CreateProjectModal],
      providers: [{ provide: ProjectsService, useValue: projectsServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectModal);
    component = fixture.componentInstance;
    component.projects = mockProjects;
  });

  it('should create component with default values and load projects', () => {
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
    expect(component.projectName).toBe('');
    expect(component.projectKey).toBe('');
    expect(component.shareWithExisting).toBe(false);
    expect(projectsServiceMock.getProjects).toHaveBeenCalledWith(1, 1000);
  });

  it('should generate correct project key from name', () => {
    component.projectName = 'Testing';
    component.generateProjectKey();
    expect(component.projectKey.length).toBe(3);
    expect(component.projectKey).toMatch(/^[A-Z0-9]{3}$/);
    
    component.projectName = 'Customer Relationship Management';
    component.generateProjectKey();
    expect(component.projectKey).toBe('CRM');
    
    component.projectName = 'Atlas App';
    component.generateProjectKey();
    expect(component.projectKey.length).toBe(3);
    
    component.projectName = '';
    component.generateProjectKey();
    expect(component.projectKey).toBe('PRJ');
  });

  it('should search and filter projects by name and code', () => {
    fixture.detectChanges();
    
    component.projectSearchQuery = 'Atlas';
    component.onProjectSearchChange();
    expect(component.filteredProjects.length).toBe(1);
    expect(component.filteredProjects[0].name).toBe('Atlas');
    
    component.projectSearchQuery = 'P2';
    component.onProjectSearchChange();
    expect(component.filteredProjects.length).toBe(1);
    expect(component.filteredProjects[0].projectCode).toBe('P2');
    
    component.projectSearchQuery = '';
    component.onProjectSearchChange();
    expect(component.filteredProjects.length).toBe(2);
  });

  it('should handle share settings correctly', (done) => {
    fixture.detectChanges();
    
    component.shareWithExisting = true;
    component.selectedProject = '1';
    component.onShareSettingsChange();
    expect(component.selectedProject).toBe('1');
    
    component.shareWithExisting = false;
    component.onShareSettingsChange();
    expect(component.selectedProject).toBe('');
    done();
  });

  it('should emit createProject with valid project data', () => {
    spyOn(component.createProject, 'emit');
    component.projectName = 'New Project';
    component.projectKey = 'NP1';
    component.shareWithExisting = false;
    
    component.onCreate();
    
    expect(component.createProject.emit).toHaveBeenCalledWith({
      name: 'New Project',
      projectKey: 'NP1',
      shareWithExisting: false,
      selectedProject: ''
    });
  });

  it('should handle share and get selected project name', () => {
    fixture.detectChanges();
    
    component.selectedProject = '1';
    expect(component.getSelectedProjectName()).toBe('Atlas');
    
    component.selectedProject = '2';
    expect(component.getSelectedProjectName()).toBe('Beta Project');
    
    component.selectedProject = '999';
    expect(component.getSelectedProjectName()).toBe('');
  });

  it('should not emit createProject with empty or whitespace name', () => {
    spyOn(component.createProject, 'emit');
    
    component.projectName = '';
    component.onCreate();
    expect(component.createProject.emit).not.toHaveBeenCalled();
    
    component.projectName = '   ';
    component.onCreate();
    expect(component.createProject.emit).not.toHaveBeenCalled();
  });

  it('should emit modal events correctly', () => {
    spyOn(component.cancel, 'emit');
    spyOn(component.back, 'emit');
    
    component.onCancel();
    expect(component.cancel.emit).toHaveBeenCalled();
    
    component.onBack();
    expect(component.back.emit).toHaveBeenCalled();
  });

  it('should auto-generate key and handle special characters', () => {
    component.projectName = '@Project #123';
    component.onProjectNameChange();
    expect(component.projectKey).toMatch(/^[A-Z0-9]{3}$/);
    
    component.projectName = 'Test';
    component.generateProjectKey();
    expect(component.projectKey.length).toBe(3);
  });

  it('should handle API errors gracefully', () => {
    projectsServiceMock.getProjects.and.returnValue(
      new Observable(subscriber => subscriber.error(new Error('API Error')))
    );
    spyOn(console, 'error');
    
    const newComponent = TestBed.createComponent(CreateProjectModal);
    newComponent.detectChanges();
    
    expect(console.error).toHaveBeenCalledWith(
      'Failed to load projects for modal:',
      jasmine.any(Error)
    );
  });
});

import { Observable } from 'rxjs';
