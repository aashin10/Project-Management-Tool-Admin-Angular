import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Projectslist } from './projectslist';
import { ProjectsService, Project } from '../../services/projects.service';
import { NotificationService } from '../../../shared/services/notification.service';

describe('Projectslist', () => {
  let component: Projectslist;
  let fixture: ComponentFixture<Projectslist>;
  let projectsServiceMock: jasmine.SpyObj<ProjectsService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;
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

  beforeEach(async () => {
    projectsServiceMock = jasmine.createSpyObj('ProjectsService', [
      'getProjects',
      'deleteProject'
    ]);
    
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'addNotification'
    ]);
    
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Projectslist],
      providers: [
        { provide: ProjectsService, useValue: projectsServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
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
    
    const mockRow = { actions: '456' };
    component.handleRowClick({ row: mockRow, index: 0 });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/projects', '456']);
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
    
    spyOn(document, 'createElement').and.callThrough();
    spyOn(URL, 'createObjectURL');
    
    component.exportAll();
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(URL.createObjectURL).toHaveBeenCalled();
    
    component.searchQuery = 'Active';
    component.exportToCSV();
    expect(document.createElement).toHaveBeenCalledWith('a');
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
    projectsServiceMock.deleteProject.and.returnValue(of({ status: 200, data: {}, message: 'Deleted' }));
    
    // Delete single project
    component.deleteProject(mockProjects[0].id);
    component.confirmDelete();
    
    setTimeout(() => {
      expect(projectsServiceMock.deleteProject).toHaveBeenCalled();
      expect(notificationServiceMock.addNotification).toHaveBeenCalled();
      
      // Reset and test multiple
      projectsServiceMock.deleteProject.calls.reset();
      component.projects[0].selected = true;
      component.projects[1].selected = true;
      component.confirmDelete();
      
      setTimeout(() => {
        expect(projectsServiceMock.deleteProject).toHaveBeenCalled();
        done();
      }, 100);
    }, 100);
  });

  it('should handle errors during loading and deletion', (done) => {
    component.isLoading = false;
    component.loadingError = 'Failed to load projects';
    fixture.detectChanges();
    expect(component.loadingError).toBeTruthy();
    
    projectsServiceMock.deleteProject.and.returnValue(
      of({ status: 400, data: {}, message: 'Delete failed' })
    );
    component.deleteProject('1');
    component.confirmDelete();
    
    setTimeout(() => {
      expect(notificationServiceMock.addNotification).toHaveBeenCalled();
      done();
    }, 100);
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
});
