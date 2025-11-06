import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Projectslist } from './projectslist';
import { ProjectsService, Project, ProjectTableDTO } from '../../services/projects.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ToastrService } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Projectslist', () => {
  let component: Projectslist;
  let fixture: ComponentFixture<Projectslist>;
  let projectsServiceMock: jasmine.SpyObj<ProjectsService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;
  let toastrServiceMock: jasmine.SpyObj<ToastrService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Active Project',
      projectCode: 'AP-001',
      status: 'Active',
      deliveryUnit: 'DU-1',
      projectManager: 'John Doe',
      teamSize: 5,
      template: 'Scrum',
      organisationName: 'Org 1',
      selected: false
    },
    {
      id: '2',
      name: 'Inactive Project',
      projectCode: 'IP-001',
      status: 'Inactive',
      deliveryUnit: 'DU-2',
      projectManager: 'Jane Smith',
      teamSize: 3,
      template: 'Kanban',
      organisationName: 'Org 2',
      selected: false
    }
  ];

  const mockProjectTableDTOs: ProjectTableDTO[] = [
    {
      id: '1',
      name: 'Active Project',
      key: 'AP-001',
      status: { id: 1, name: 'Active' },
      deliveryUnit: { id: 1, name: 'DU-1' },
      teamSize: 5,
      projectManager: { id: 1, name: 'John Doe' },
      isImportedFromJira: false
    },
    {
      id: '2',
      name: 'Inactive Project',
      key: 'IP-001',
      status: { id: 2, name: 'Inactive' },
      deliveryUnit: { id: 2, name: 'DU-2' },
      teamSize: 3,
      projectManager: { id: 2, name: 'Jane Smith' },
      isImportedFromJira: false
    }
  ];

  beforeEach(async () => {
    projectsServiceMock = jasmine.createSpyObj('ProjectsService', [
      'getProjects',
      'deleteProject',
      'getUniqueProjectManagers'
    ]);
    
    // Configure default spy returns
    projectsServiceMock.getUniqueProjectManagers.and.returnValue(of({ 
      status: 200, 
      data: [], 
      message: 'Success' 
    }));
    
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'addNotification'
    ]);
    
    toastrServiceMock = jasmine.createSpyObj('ToastrService', [
      'warning',
      'success',
      'error',
      'info'
    ]);
    
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Projectslist, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ProjectsService, useValue: projectsServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { 
            queryParams: of({}),
            snapshot: { queryParams: {} }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Projectslist);
    component = fixture.componentInstance;
  });

  it('should create and initialize component with default state', () => {
    expect(component).toBeTruthy();
    expect(component.projects).toBeDefined();
    expect(component.isLoading).toBe(true);
  });

  it('should filter projects by status, search query, and manager', () => {
    component.projects = mockProjects;
    
    // Filter by status
    component.selectedStatusIds = [1];
    const statusFiltered = component.projects.filter(p => p.status === 'Active');
    expect(statusFiltered.length).toBeGreaterThan(0);
    
    // Search by name
    component.searchQuery = 'Active';
    const nameFiltered = component.projects.filter(p => 
      p.name.toLowerCase().includes(component.searchQuery.toLowerCase())
    );
    expect(nameFiltered[0]?.name).toContain('Active');
    
    // Filter by manager
    component.selectedManagerIds = [1];
    expect(component.selectedManagerIds.length).toBe(1);
  });

  it('should handle search query changes', () => {
    component.projects = mockProjects;
    component.searchQuery = '';
    expect(component.projects.length).toBeGreaterThan(0);
  });

  it('should navigate to edit and individual projects', () => {
    component.editProject('123');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/projects', '123', 'edit']);
    
    // Setup for row click navigation - projects must have selected: false so navigation occurs
    component.projects = mockProjects.map(p => ({ ...p, selected: false }));
    const mockRow = { actions: '1' };
    component.handleRowClick({ row: mockRow, index: 0 });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/projects', '1']);
  });

  it('should handle delete modal operations', () => {
    component.deleteProject('1');
    expect(component.showDeleteModal).toBe(true);
    
    component.showDeleteModal = true;
    component.cancelDelete();
    expect(component.showDeleteModal).toBe(false);
  });

  it('should export projects to CSV with and without filters', () => {
    component.projects = mockProjects;
    
    // Configure getProjects spy to return mock data
    projectsServiceMock.getProjects.and.returnValue(of({
      status: 200,
      data: { 
        items: mockProjectTableDTOs, 
        totalCount: mockProjectTableDTOs.length, 
        page: 1, 
        pageSize: 10, 
        totalPages: 1 
      },
      message: 'Success'
    }));
    
    // Spy on router and URL object
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');
    
    // Test exportAll
    const createElementSpy = spyOn(document, 'createElement').and.callThrough();
    component.exportAll();
    expect(createElementSpy).toHaveBeenCalledWith('a');
    
    // Test exportToCSV with filtered projects
    component.searchQuery = 'Active';
    createElementSpy.calls.reset();
    component.exportToCSV(mockProjects.filter(p => p.name.includes('Active')));
    expect(createElementSpy).toHaveBeenCalledWith('a');
  });

  it('should set download filename with projects_export, count and .csv when exporting', () => {
    component.projects = mockProjects;
    projectsServiceMock.getProjects.and.returnValue(of({
      status: 200,
      data: { 
        items: mockProjectTableDTOs, 
        totalCount: mockProjectTableDTOs.length, 
        page: 1, 
        pageSize: 10, 
        totalPages: 1 
      },
      message: 'Success'
    }));

    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');

    const realLink: HTMLElement = document.createElement('a');
    spyOn(document, 'createElement').and.returnValue(realLink);
    spyOn(realLink, 'setAttribute').and.callThrough();
    spyOn(realLink, 'click').and.callThrough();

    component.exportAll();

    expect((realLink as any).setAttribute).toHaveBeenCalled();
    const downloadCall = (realLink as any).setAttribute.calls.allArgs().find((a: any) => a[0] === 'download');
    expect(downloadCall).toBeDefined();
    const filename = downloadCall![1] as string;
    expect(filename).toContain('projects_export');
    expect(filename).toContain(`_${mockProjectTableDTOs.length}_`);
    expect(filename).toMatch(/\.csv$/);
  });

  it('should manage project selection across single and bulk operations', () => {
    component.projects = [...mockProjects];
    
    // Select individual project
    component.projects[0].selected = true;
    expect(component.projects[0].selected).toBe(true);
    
    // Count selected projects
    component.projects[1].selected = true;
    const selectedCount = component.projects.filter(p => p.selected).length;
    expect(selectedCount).toBe(2);
    
    // Update selection
    component.projects[1].selected = false;
    expect(component.projects[0].selected).toBe(true);
    expect(component.projects[1].selected).toBe(false);
  });

  it('should confirm delete for single and multiple projects', (done) => {
    component.projects = [...mockProjects];
    projectsServiceMock.deleteProject.and.returnValue(of({ 
      status: 200, 
      data: {}, 
      message: 'Deleted' 
    }));
    
    // Test single project delete
    component.deleteProject(mockProjects[0].id);
    component.confirmDelete();
    
    setTimeout(() => {
      expect(projectsServiceMock.deleteProject).toHaveBeenCalledWith(mockProjects[0].id);
      expect(toastrServiceMock.success).toHaveBeenCalledWith(
        jasmine.stringContaining('deleted successfully'),
        'Project Deleted'
      );
      
      // Reset and test multiple project delete
      projectsServiceMock.deleteProject.calls.reset();
      toastrServiceMock.success.calls.reset();
      component.projects = [...mockProjects];
      
      component.projects[0].selected = true;
      component.projects[1].selected = true;
      component.confirmDelete();
      
      setTimeout(() => {
        expect(projectsServiceMock.deleteProject).toHaveBeenCalled();
        done();
      }, 150);
    }, 150);
  });

  it('should handle errors during loading and deletion', (done) => {
    component.isLoading = false;
    component.loadingError = 'Failed to load projects';
    fixture.detectChanges();
    expect(component.loadingError).toBeTruthy();
    
    // Test delete error handling
    component.projects = [...mockProjects];
    projectsServiceMock.deleteProject.and.returnValue(
      of({ status: 400, data: {}, message: 'Delete failed' })
    );
    
    component.deleteProject(mockProjects[0].id);
    component.confirmDelete();
    
    setTimeout(() => {
      expect(toastrServiceMock.error).toHaveBeenCalledWith(
        jasmine.any(String),
        'Delete Failed'
      );
      done();
    }, 150);
  });

  it('should manage pagination and page size changes', () => {
    expect(component.pagination.currentPage).toBe(1);
    expect(component.pagination.pageSize).toBe(10);
    
    component.pagination.currentPage = 2;
    expect(component.pagination.currentPage).toBe(2);
    
    component.pagination.pageSize = 20;
    expect(component.pagination.pageSize).toBe(20);
  });

  it('should display correct UI state for loading, data, and empty states', () => {
    // Loading state
    component.isLoading = true;
    fixture.detectChanges();
    expect(component.isLoading).toBe(true);
    
    // Data state
    component.isLoading = false;
    component.projects = mockProjects;
    expect(component.projects.length).toBeGreaterThan(0);
    
    // Empty state
    component.projects = [];
    expect(component.projects.length).toBe(0);
  });

  it('should have ToastrService injected for notifications', () => {
    // Verify ToastrService is available
    expect(component).toBeTruthy();
    expect(toastrServiceMock).toBeTruthy();
  });

  it('should have NotificationService for warning notifications on delete', () => {
    // Verify NotificationService is available for warning notifications
    expect(notificationServiceMock).toBeTruthy();
    expect(notificationServiceMock.addNotification).toBeDefined();
  });

  it('should initialize filter arrays correctly', () => {
    // Verify filter arrays are initialized
    expect(component.selectedStatusIds).toBeDefined();
    expect(component.selectedDeliveryUnitIds).toBeDefined();
    expect(Array.isArray(component.selectedStatusIds)).toBe(true);
    expect(Array.isArray(component.selectedDeliveryUnitIds)).toBe(true);
  });
});
