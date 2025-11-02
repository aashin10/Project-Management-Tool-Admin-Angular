import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { IndividualprojectComponent } from './individualproject';
import { ProjectsService, ApiResponse, Project } from '../../services/projects.service';
import { NotificationService } from '../../../shared/services/notification.service';

describe('IndividualprojectComponent', () => {
  let component: IndividualprojectComponent;
  let fixture: ComponentFixture<IndividualprojectComponent>;
  let projectsServiceMock: jasmine.SpyObj<ProjectsService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;
  let routerMock: jasmine.SpyObj<Router>;
  let paramMapSubject: Subject<any>;

  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    projectCode: 'TP-001',
    status: 'Active',
    deliveryUnit: 'DU-1',
    projectManager: 'John Doe',
    teamSize: 5,
    template: 'Scrum',
    description: 'Test description',
    organisationName: 'Test Org',
    organisationDescription: 'Test Org Desc',
    organisationWebsite: 'https://test.com',
    pocEmail: 'poc@test.com',
    pocPhone: '1234567890',
    additionalInformation: [],
    teams: [],
    teamMembers: [],
    isImportedFromJira: false,
    selected: false
  };

  const mockApiResponse: ApiResponse<any> = {
    status: 200,
    data: mockProject,
    message: 'Success'
  };

  const mockDeleteResponse: ApiResponse<any> = {
    status: 200,
    data: {},
    message: 'Project deleted successfully'
  };

  beforeEach(async () => {
    paramMapSubject = new Subject();
    
    projectsServiceMock = jasmine.createSpyObj('ProjectsService', [
      'getProjectById',
      'deleteProject'
    ]);
    
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'addNotification'
    ]);
    
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [IndividualprojectComponent],
      providers: [
        { provide: ProjectsService, useValue: projectsServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } },
            paramMap: paramMapSubject.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IndividualprojectComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization & Loading', () => {
    it('should create and initialize with loading state', () => {
      expect(component).toBeTruthy();
      expect(component.isLoading).toBe(true);
      expect(component.project).toBeNull();
      expect(component.loadingError).toBe('');
    });

    it('should fetch project on init and handle success', (done) => {
      projectsServiceMock.getProjectById.and.returnValue(of(mockApiResponse));
      component.ngOnInit();
      paramMapSubject.next({ get: (key: string) => key === 'id' ? '1' : null });
      
      setTimeout(() => {
        expect(projectsServiceMock.getProjectById).toHaveBeenCalledWith('1');
        expect(component.project?.name).toBe('Test Project');
        expect(component.isLoading).toBe(false);
        done();
      }, 50);
    });

    it('should handle fetch error with retry capability', (done) => {
      projectsServiceMock.getProjectById.and.returnValue(throwError(() => new Error('API Failed')));
      component.fetchProject();
      
      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        expect(component.loadingError).toBeTruthy();
        done();
      }, 100);
    });
  });

  describe('Navigation & Editing', () => {
    it('should navigate back to projects list', () => {
      component.goBackToProjects();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/projects']);
    });

    it('should navigate to edit or handle missing projectId', () => {
      component.projectId = '123';
      component.editProject();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/projects', '123', 'edit']);
      
      component.projectId = '';
      routerMock.navigate.calls.reset();
      component.editProject();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Delete Workflow', () => {
    it('should open delete modal and cancel', () => {
      component.deleteProject();
      expect(component.showDeleteModal).toBe(true);
      
      component.cancelDelete();
      expect(component.showDeleteModal).toBe(false);
    });

    it('should confirm delete with success notification and navigate', (done) => {
      component.projectId = '1';
      component.project = mockProject;
      projectsServiceMock.deleteProject.and.returnValue(of(mockDeleteResponse));
      
      component.confirmDelete();
      
      setTimeout(() => {
        expect(projectsServiceMock.deleteProject).toHaveBeenCalledWith('1');
        expect(notificationServiceMock.addNotification).toHaveBeenCalledWith(
          'success',
          jasmine.stringContaining('Test Project'),
          'Project Deleted'
        );
        expect(routerMock.navigate).toHaveBeenCalledWith(['/projects']);
        done();
      }, 100);
    });

    it('should handle delete error', (done) => {
      component.projectId = '1';
      component.project = mockProject;
      projectsServiceMock.deleteProject.and.returnValue(throwError(() => new Error('Delete failed')));
      
      component.confirmDelete();
      
      setTimeout(() => {
        expect(notificationServiceMock.addNotification).toHaveBeenCalledWith(
          'error',
          jasmine.any(String),
          'Error'
        );
        done();
      }, 100);
    });
  });

  describe('Contact Actions', () => {
    beforeEach(() => {
      component.project = mockProject;
    });

    it('should open website or handle missing URL', () => {
      spyOn(window, 'open');
      component.openWebsite();
      expect(window.open).toHaveBeenCalledWith('https://test.com', '_blank');
      
      component.project!.organisationWebsite = undefined;
      (window.open as jasmine.Spy).calls.reset();
      component.openWebsite();
      expect(window.open).not.toHaveBeenCalled();
    });

    it('should initiate email and phone contact', () => {
      spyOn(window, 'open');
      component.sendEmail();
      expect(window.open).toHaveBeenCalledWith('mailto:poc@test.com', '_self');
      
      component.makeCall();
      expect(window.open).toHaveBeenCalledWith('tel:1234567890', '_self');
    });
  });

  describe('State Management', () => {
    it('should handle route parameter changes', (done) => {
      projectsServiceMock.getProjectById.and.returnValue(of(mockApiResponse));
      component.ngOnInit();
      
      // First project
      paramMapSubject.next({ get: (key: string) => key === 'id' ? '1' : null });
      
      setTimeout(() => {
        expect(component.projectId).toBe('1');
        
        // Second project (reuse scenario)
        projectsServiceMock.getProjectById.calls.reset();
        projectsServiceMock.getProjectById.and.returnValue(of(mockApiResponse));
        paramMapSubject.next({ get: (key: string) => key === 'id' ? '2' : null });
        
        setTimeout(() => {
          expect(component.projectId).toBe('2');
          done();
        }, 50);
      }, 50);
    });
  });
});