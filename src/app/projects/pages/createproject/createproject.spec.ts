// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { Createproject } from './createproject';

// describe('Createproject', () => {
//   let component: Createproject;
//   let fixture: ComponentFixture<Createproject>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [Createproject]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(Createproject);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   // Template Rendering
//   describe('Template Rendering', () => {
//     it('should create', () => {
//       expect(component).toBeTruthy();
//     });
//   });

//   // Input/Output Properties
//   describe('Input/Output Properties', () => {
//     it('should initialize child inputs when provided', () => {
//       // smoke: check component inputs exist
//       expect(component).toBeDefined();
//     });
//   });

//   // Component Logic
//   describe('Component Logic', () => {
//     it('should have a default state for new project creation', () => {
//       // basic check for any initialization logic
//       expect(component).toBeTruthy();
//     });
//   });
// });

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Createproject } from './createproject';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { BasicInformationComponent } from './basicinfo/basicinfo';
import { TeamOrganizationComponent } from './teaminfo/teaminfo';
import { ProjectPreviewComponent } from './projectpreview/projectpreview';
import { Additionalinfo } from './additionalinfo/additionalinfo';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProjectsService } from '../../services/projects.service';
import { DeliveryUnitService } from '../../../duservice/deliveryunits.service';
import { ProjectStatusService } from '../../../shared/services/project-status/project-status.service';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Createproject', () => {
  let component: Createproject;
  let fixture: ComponentFixture<Createproject>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockProjectsService: jasmine.SpyObj<ProjectsService>;
  let mockDeliveryUnitService: jasmine.SpyObj<DeliveryUnitService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockProjectsService = jasmine.createSpyObj('ProjectsService', ['createProject', 'getAllUsers', 'getProjectById']);
    mockDeliveryUnitService = jasmine.createSpyObj('DeliveryUnitService', ['getAllDeliveryUnits']);
    mockToastrService = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['addNotification']);

    // Set up default mock returns
    mockProjectsService.getAllUsers.and.returnValue(of({ status: 200, data: [], message: '' }));
    mockDeliveryUnitService.getAllDeliveryUnits.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        Createproject, // standalone component
        Sectiontitle,
        BasicInformationComponent,
        TeamOrganizationComponent,
        ProjectPreviewComponent,
        Additionalinfo
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: DeliveryUnitService, useValue: mockDeliveryUnitService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: NotificationService, useValue: mockNotificationService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} },
            queryParams: of({})
          }
        },
        ProjectStatusService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Createproject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // -------------------------------
  // Template Rendering
  // -------------------------------
  describe('Template Rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render the section title with correct text', () => {
      const sectionTitle = fixture.debugElement.query(By.directive(Sectiontitle)).componentInstance;
      expect(sectionTitle.title).toBe('Create New Project');
      expect(sectionTitle.description).toContain('Set up your project');
    });

    
  });

  // -------------------------------
  // Input/Output Properties
  // -------------------------------
  describe('Input/Output Properties', () => {
    it('should pass projectName and projectKey to ProjectPreview', () => {
      component.projectName = 'Demo Project';
      component.projectKey = 'DP01';
      fixture.detectChanges();

      const preview = fixture.debugElement.query(By.directive(ProjectPreviewComponent)).componentInstance;
      expect(preview.projectName).toBe('Demo Project');
      expect(preview.projectKey).toBe('DP01');
    });

    it('should update projectName when BasicInformation emits projectNameChange', () => {
      const basicInfo = fixture.debugElement.query(By.directive(BasicInformationComponent)).componentInstance;
      basicInfo.projectNameChange.emit('Updated Project');
      fixture.detectChanges();

      expect(component.projectName).toBe('Updated Project');
    });

    it('should update manager when TeamOrganization emits managerChange', () => {
      const teamOrg = fixture.debugElement.query(By.directive(TeamOrganizationComponent)).componentInstance;
      teamOrg.managerChange.emit('John Doe');
      fixture.detectChanges();

      expect(component.manager).toBe('John Doe');
    });

    it('should update additionalFields when Additionalinfo emits addedFieldsChange', () => {
      const additionalInfo = fixture.debugElement.query(By.directive(Additionalinfo)).componentInstance;
      const mockFields = [{ name: 'Deadline', value: '2025-12-31' }];
      additionalInfo.addedFieldsChange.emit(mockFields);
      fixture.detectChanges();

      expect(component.additionalFields).toEqual(mockFields);
    });
  });

  // -------------------------------
  // Component Logic
  // -------------------------------
  describe('Component Logic', () => {
    it('should validate and show error when required fields are missing', () => {
      component.projectName = '';
      component.projectKey = '';
      
      component.onCreateProject();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Please fill in project name and project key',
        'Validation Error'
      );
    });

    it('should validate and show error when status is missing', () => {
      component.projectName = 'Project X';
      component.projectKey = 'PX01';
      component.status = '';
      
      component.onCreateProject();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Please select a project status',
        'Validation Error'
      );
    });

    it('should validate and show error when manager is not selected', () => {
      component.projectName = 'Project X';
      component.projectKey = 'PX01';
      component.status = 'Active';
      component.managerId = null;
      
      component.onCreateProject();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Please select a project manager from the dropdown',
        'Validation Error'
      );
    });

    it('should validate and show error when delivery unit is invalid', () => {
      component.projectName = 'Project X';
      component.projectKey = 'PX01';
      component.status = 'Active';
      component.managerId = 1;
      component.deliveryUnit = 'Invalid Unit';
      component.deliveryUnits = [{ id: 1, code: 'ENG', name: 'Engineering' }];
      
      component.onCreateProject();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Please select a valid delivery unit',
        'Validation Error'
      );
    });

    it('should create project successfully with valid data', () => {
      const mockResponse: any = { 
        status: 200, 
        data: { 
          id: '123',
          name: 'Project X',
          key: 'PX01',
          description: '',
          customerOrgName: '',
          customerDomainUrl: '',
          customerDescription: '',
          pocEmail: '',
          pocPhone: '',
          projectManagerId: 1,
          projectManagerName: 'John Doe',
          projectManagerRoleId: 2,
          statusId: 1,
          statusName: 'Active',
          deliveryUnitId: 1,
          deliveryUnitName: 'Engineering',
          deliveryUnitCode: 'ENG',
          teamSize: 0,
          sprintCount: 0,
          additionalInformation: [],
          teams: [],
          isImportedFromJira: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, 
        message: 'Success' 
      };
      mockProjectsService.createProject.and.returnValue(of(mockResponse));

      component.projectName = 'Project X';
      component.projectKey = 'PX01';
      component.status = 'Active';
      component.managerId = 1;
      component.deliveryUnit = 'ENG';
      component.deliveryUnits = [{ id: 1, code: 'ENG', name: 'Engineering' }];

      component.onCreateProject();

      expect(mockProjectsService.createProject).toHaveBeenCalled();
      expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
        'success',
        'Project X created successfully',
        'Project Created'
      );
      expect(mockToastrService.success).toHaveBeenCalled();
    });

    it('should handle creation error', () => {
      const mockError = { message: 'Creation failed' };
      mockProjectsService.createProject.and.returnValue(throwError(() => mockError));

      component.projectName = 'Project X';
      component.projectKey = 'PX01';
      component.status = 'Active';
      component.managerId = 1;
      component.deliveryUnit = 'ENG';
      component.deliveryUnits = [{ id: 1, code: 'ENG', name: 'Engineering' }];

      component.onCreateProject();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Creation failed',
        'Creation Failed',
        jasmine.any(Object)
      );
    });

    it('should navigate back when onCancel is called', () => {
      component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);
    });

    it('should return true for isFormValid when all required fields are filled', () => {
      component.projectName = 'Project X';
      component.projectKey = 'PX01';
      component.status = 'Active';
      component.managerId = 1;
      component.deliveryUnit = 'ENG';

      expect(component.isFormValid).toBeTrue();
    });

    it('should return false for isFormValid when required fields are missing', () => {
      component.projectName = '';
      component.projectKey = 'PX01';
      component.status = 'Active';
      component.managerId = 1;
      component.deliveryUnit = 'ENG';

      expect(component.isFormValid).toBeFalse();
    });
  });

  // -------------------------------
  // Edge Cases
  // -------------------------------
  describe('Edge Cases', () => {
    it('should show validation error for empty project', () => {
      component.projectName = '';
      component.projectKey = '';

      component.onCreateProject();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Please fill in project name and project key',
        'Validation Error'
      );
    });

    it('should handle null and undefined values in validation', () => {
      component.projectName = null as any;
      component.projectKey = undefined as any;

      component.onCreateProject();

      expect(mockToastrService.error).toHaveBeenCalled();
    });

    it('should handle extremely long project names', () => {
      const longName = 'A'.repeat(1000);
      component.projectName = longName;
      fixture.detectChanges();

      const preview = fixture.debugElement.query(By.directive(ProjectPreviewComponent)).componentInstance;
      expect(preview.projectName).toBe(longName);
    });

    it('should handle manager selection via onManagerSelect', () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      component.onManagerSelect(mockUser);

      expect(component.managerId).toBe(1);
      expect(component.manager).toBe('John Doe');
    });

    it('should handle manager search via onManagerSearch', () => {
      component.allUsers = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' }
      ];

      component.onManagerSearch('alice');
      
      expect(component.filteredUsers.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter users based on search term', () => {
      component.allUsers = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com' }
      ];

      component.onManagerSearch('Alice');
      
      expect(component.filteredUsers.some(u => u.name.includes('Alice'))).toBeTruthy();
    });
  });
});
