import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { Editproject } from './editproject';
import { ProjectsService, UpdateProjectRequest, ProjectDTO } from '../../../services/projects.service';

describe('Editproject', () => {
  let component: Editproject;
  let fixture: ComponentFixture<Editproject>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockProjectsService: jasmine.SpyObj<ProjectsService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;

  const mockProjectData: ProjectDTO = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Project',
    key: 'TEST',
    description: 'Test Description',
    customerOrgName: 'Test Org',
    customerDomainUrl: 'https://test.com',
    customerDescription: 'Test customer',
    pocEmail: 'poc@test.com',
    pocPhone: '1234567890',
    projectManagerId: 1,
    projectManagerName: 'John Doe',
    projectManagerRoleId: 2,
    deliveryUnitId: 1,
    deliveryUnitName: 'Test DU',
    deliveryUnitCode: 'DU001',
    statusName: 'Active',
    statusId: 1,
    teamSize: 5,
    sprintCount: 0,
    additionalInformation: [],
    teams: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        params: { id: '123e4567-e89b-12d3-a456-426614174000' }
      }
    };
    mockProjectsService = jasmine.createSpyObj('ProjectsService', [
      'getProjectById',
      'updateProject',
      'getDeliveryUnits',
      'checkProjectKeyAvailability'
    ]);
    mockToastrService = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
      'warning',
      'info'
    ]);

    // Setup default mock responses
    mockProjectsService.getProjectById.and.returnValue(
      of({ status: 200, data: mockProjectData, message: 'Success' })
    );
    mockProjectsService.getDeliveryUnits.and.returnValue(
      of({ status: 200, data: [{ id: 1, name: 'Test DU', code: 'DU001' }], message: 'Success' })
    );
    mockProjectsService.updateProject.and.returnValue(
      of({ status: 200, data: mockProjectData, message: 'Project updated successfully' })
    );

    await TestBed.configureTestingModule({
      imports: [Editproject],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: ToastrService, useValue: mockToastrService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editproject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get manager initials for single name', () => {
    component.manager = 'Asha';
    expect(component.managerInitials).toBe('AS');
  });

  it('should get manager initials for two names', () => {
    component.manager = 'Asha Varma';
    expect(component.managerInitials).toBe('AV');
  });

  it('should load project data on initialization', () => {
    expect(mockProjectsService.getProjectById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    expect(component.projectName).toBe('Test Project');
    expect(component.projectKey).toBe('TEST');
    expect(component.status).toBe('Active');
    expect(component.selectedProjectManagerId).toBe(1);
    expect(component.selectedDeliveryUnitId).toBe(1);
  });

  it('should call onUpdateProject and update the project successfully', () => {
    // Setup component with required data
    component.projectId = '123e4567-e89b-12d3-a456-426614174000';
    component.projectName = 'Updated Project';
    component.projectKey = 'UPD';
    component.status = 'Active';
    component.selectedProjectManagerId = 1;
    component.selectedDeliveryUnitId = 1;
    component.description = 'Updated description';
    component.organisationName = 'Updated Org';
    component.pocEmail = 'updated@test.com';
    component.phoneNumber = '9876543210';

    // Call the method
    component.onUpdateProject();

    // Verify service was called
    expect(mockProjectsService.updateProject).toHaveBeenCalled();
    
    // Verify success message
    expect(mockToastrService.success).toHaveBeenCalledWith('Project updated successfully', 'Success');
    
    // Verify navigation
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects', '123e4567-e89b-12d3-a456-426614174000']);
  });

  it('should show error when project update fails', () => {
    // Setup mock to return error
    mockProjectsService.updateProject.and.returnValue(
      throwError(() => ({ status: 500, message: 'Server error' }))
    );

    // Setup component with required data
    component.projectId = '123e4567-e89b-12d3-a456-426614174000';
    component.projectName = 'Test Project';
    component.projectKey = 'TEST';
    component.status = 'Active';
    component.selectedProjectManagerId = 1;
    component.selectedDeliveryUnitId = 1;

    // Call the method
    component.onUpdateProject();

    // Verify error message
    expect(mockToastrService.error).toHaveBeenCalled();
    
    // Verify no navigation on error
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should show validation error when delivery unit is not selected', () => {
    component.projectId = '123e4567-e89b-12d3-a456-426614174000';
    component.projectName = 'Test Project';
    component.projectKey = 'TEST';
    component.status = 'Active';
    component.selectedProjectManagerId = 1;
    component.selectedDeliveryUnitId = 0; // Invalid

    component.onUpdateProject();

    expect(mockToastrService.error).toHaveBeenCalledWith('Please select a delivery unit', 'Validation Error');
    expect(mockProjectsService.updateProject).not.toHaveBeenCalled();
  });

  it('should show validation error when project manager is not selected', () => {
    component.projectId = '123e4567-e89b-12d3-a456-426614174000';
    component.projectName = 'Test Project';
    component.projectKey = 'TEST';
    component.status = 'Active';
    component.selectedProjectManagerId = 0; // Invalid
    component.selectedDeliveryUnitId = 1;

    component.onUpdateProject();

    expect(mockToastrService.error).toHaveBeenCalledWith('Please select a project manager', 'Validation Error');
    expect(mockProjectsService.updateProject).not.toHaveBeenCalled();
  });

  it('should call onCancel and navigate', () => {
    component.projectId = '123e4567-e89b-12d3-a456-426614174000';
    component.onCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects', '123e4567-e89b-12d3-a456-426614174000']);
  });

  it('should return true for canCreate when all required fields are filled', () => {
    component.projectName = 'Atlas';
    component.projectKey = 'ATL';
    component.status = 'Active';
    component.selectedProjectManagerId = 1;
    component.selectedDeliveryUnitId = 1;
    expect(component.canCreate).toBeTrue();
  });

  it('should return false for canCreate when required fields are missing', () => {
    component.projectName = '';
    component.projectKey = '';
    component.status = '';
    component.selectedProjectManagerId = 0;
    component.selectedDeliveryUnitId = 0;
    expect(component.canCreate).toBeFalse();
  });

  it('should return missing fields when required fields are empty', () => {
    component.projectName = '';
    component.projectKey = '';
    component.status = '';
    component.selectedProjectManagerId = 0;
    component.selectedDeliveryUnitId = 0;
    expect(component.missingFields).toEqual([
      'Project Name',
      'Project Key',
      'Status',
      'Project Manager',
      'Delivery Unit'
    ]);
  });

  it('should return empty array for missing fields when all required fields are filled', () => {
    component.projectName = 'Test Project';
    component.projectKey = 'TEST';
    component.status = 'Active';
    component.selectedProjectManagerId = 1;
    component.selectedDeliveryUnitId = 1;
    expect(component.missingFields).toEqual([]);
  });

  it('should handle form change events', () => {
    component.onProjectNameChange('New Name');
    expect(component.projectName).toBe('New Name');

    component.onProjectKeyChange('NEW');
    expect(component.projectKey).toBe('NEW');

    component.onDescriptionChange('New desc');
    expect(component.description).toBe('New desc');

    component.onOrganisationNameChange('New Org');
    expect(component.organisationName).toBe('New Org');

    component.onPocEmailChange('new@email.com');
    expect(component.pocEmail).toBe('new@email.com');

    component.onPhoneNumberChange('1234567890');
    expect(component.phoneNumber).toBe('1234567890');

    component.onManagerChange('New Manager');
    expect(component.manager).toBe('New Manager');

    component.onDeliveryUnitChange('New Unit');
    expect(component.deliveryUnit).toBe('New Unit');

    component.onAdditionalFieldsChange([{ id: 'test-id', name: 'Field1', value: 'Value1' }]);
    expect(component.additionalFields).toEqual([{ name: 'Field1', value: 'Value1' }]);
  });

  it('should get correct initials for project name', () => {
    component.projectName = 'Test Project';
    expect(component.getInitials()).toBe('TP');

    component.projectName = 'Single';
    expect(component.getInitials()).toBe('SI');

    component.projectName = '';
    expect(component.getInitials()).toBe('PN');

    component.projectName = '   ';
    expect(component.getInitials()).toBe('PN');
  });
});
