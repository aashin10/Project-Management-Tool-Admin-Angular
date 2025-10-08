import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { Projectslist } from './projectslist';

describe('Projectslist Component', () => {
  let component: Projectslist;
  let fixture: ComponentFixture<Projectslist>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const cdrSpyObj = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [Projectslist],
      providers: [
        { provide: Router, useValue: routerSpyObj },
        { provide: ChangeDetectorRef, useValue: cdrSpyObj }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Projectslist);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    resetComponentState();
    fixture.detectChanges();
  });

  function resetComponentState() {
    component.searchQuery = '';
    component.selectedStatuses = [];
    component.selectedPriorities = [];
    component.selectedManagers = [];
    component.sortCriteria = null;
    component.currentPage = 1;
    component.rowsPerPage = 10;
    component.showDeleteModal = false;
    component.showActionsMenu = false;
    component.activeProjectId = null;
    component.projects.forEach(p => p.selected = false);
  }

  // Test 1: Component Creation
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Initial Properties
  it('should initialize with correct default properties', () => {
    expect(component.showFilters).toBe(false);
    expect(component.searchQuery).toBe('');
    expect(component.currentPage).toBe(1);
    expect(component.rowsPerPage).toBe(10);
    expect(component.sortCriteria).toBeNull();
    expect(component.showDeleteModal).toBe(false);
  });

  // Test 3: Projects Data
  it('should initialize with 50 projects', () => {
    expect(component.projects.length).toBe(50);
    expect(component.projects[0]).toEqual(jasmine.objectContaining({
      id: '1',
      name: 'Atlas App',
      status: 'Ongoing'
    }));
  });

  // Test 4: Search Filtering
  it('should filter projects by search query', () => {
    component.searchQuery = 'Atlas';
    expect(component.filteredProjects.length).toBe(1);
    expect(component.filteredProjects[0].name).toBe('Atlas App');

    component.searchQuery = 'nonexistent';
    expect(component.filteredProjects.length).toBe(0);
  });

  // Test 5: Status Filtering
  it('should filter projects by status', () => {
    component.selectedStatuses = ['Ongoing'];
    const filtered = component.filteredProjects;
    expect(filtered.every(p => p.status === 'Ongoing')).toBe(true);
  });

  // Test 6: Combined Filtering
  it('should apply multiple filters simultaneously', () => {
    component.searchQuery = 'App';
    component.selectedStatuses = ['Ongoing'];
    component.selectedPriorities = ['High'];

    const filtered = component.filteredProjects;
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(project => {
      expect(project.status).toBe('Ongoing');
      expect(project.priority).toBe('High');
    });
  });

  // Test 7: Sorting by Name
  it('should sort projects by name', () => {
    component.sortBy('name');
    expect(component.sortCriteria).toEqual({ field: 'name', direction: 'asc' });

    component.sortBy('name'); // Toggle to desc
    expect(component.sortCriteria?.direction).toBe('desc');

    component.sortBy('name'); // Remove sorting
    expect(component.sortCriteria).toBeNull();
  });

  // Test 8: Sorting by Status and Priority
  it('should sort projects by status and priority', () => {
    component.sortBy('status');
    expect(component.sortCriteria?.field).toBe('status');
    expect(component.getSortDirection('status')).toBe('asc');

    component.sortBy('priority');
    expect(component.sortCriteria?.field).toBe('priority');
    expect(component.getFieldLabel('priority')).toBe('Priority');
  });

  // Test 9: Pagination Navigation
  it('should handle pagination navigation', () => {
    component.handleNextPage();
    expect(component.currentPage).toBe(2);

    component.handlePreviousPage();
    expect(component.currentPage).toBe(1);

    component.handleFirstPage();
    expect(component.currentPage).toBe(1);

    component.handleLastPage();
    expect(component.currentPage).toBe(component.totalPages);
  });

  // Test 10: Rows Per Page Change
  it('should handle rows per page changes', () => {
    component.handleRowsPerPageChange(25);
    expect(component.rowsPerPage).toBe(25);
    expect(component.currentPage).toBe(1);
  });

  // Test 11: Project Selection
  it('should handle individual project selection', () => {
    const project = component.projects[0];
    project.selected = true;
    expect(component.selectedProjects.length).toBe(1);

    project.selected = false;
    expect(component.selectedProjects.length).toBe(0);
  });

  // Test 12: Select All Functionality
  it('should handle select all toggle', () => {
    component.toggleSelectAll();
    expect(component.allSelected).toBe(true);
    expect(component.selectedProjects.length).toBe(50);

    component.toggleSelectAll();
    expect(component.allSelected).toBe(false);
    expect(component.selectedProjects.length).toBe(0);
  });

  // Test 13: Row Click Behavior
  it('should handle row clicks correctly', () => {
    // Without selections - navigate
    component.onRowClick(component.projects[0]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', component.projects[0].id]);

    // With selections - toggle selection
    component.projects[1].selected = true;
    routerSpy.navigate.calls.reset();
    component.onRowClick(component.projects[0]);
    expect(component.projects[0].selected).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  // Test 14: Navigation Methods
  it('should handle navigation methods', () => {
    component.viewDetails('1');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', '1']);

    component.editProject('1');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', '1', 'edit']);

    component.createProject();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects/create']);
  });

  // Test 15: Actions Menu
  it('should toggle actions menu', () => {
    const event = new Event('click');
    spyOn(event, 'stopPropagation');

    component.toggleActionsMenu('1', event);
    expect(component.showActionsMenu).toBe(true);
    expect(component.activeProjectId).toBe('1');

    component.closeActionsMenu();
    expect(component.showActionsMenu).toBe(false);
    expect(component.activeProjectId).toBeNull();
  });

  // Test 16: Filter Changes
  it('should handle filter changes', () => {
    const filters = {
      selectedStatuses: ['Ongoing'],
      selectedPriorities: ['High'],
      selectedManagers: ['Asha Varma']
    };

    component.onFiltersChanged(filters);
    expect(component.selectedStatuses).toEqual(['Ongoing']);
    expect(component.selectedPriorities).toEqual(['High']);
    expect(component.currentPage).toBe(1);
  });

  // Test 17: Archive Project
  it('should archive project', () => {
    const project = component.projects.find(p => p.id === '1');
    component.archiveProject('1');
    expect(project?.status).toBe('Archived');
  });

  // Test 18: Single Delete
  it('should handle single project deletion', () => {
    const initialCount = component.projects.length;
    component.deleteProject('2');
    component.confirmDelete();
    expect(component.projects.length).toBe(initialCount - 1);
  });

  // Test 19: Bulk Delete
  it('should handle bulk project deletion', () => {
    const initialCount = component.projects.length;
    component.projects[0].selected = true;
    component.projects[1].selected = true;
    component.deleteSelected();
    component.confirmDelete();
    expect(component.projects.length).toBe(initialCount - 2);
  });

  // Test 20: Cancel Delete
  it('should cancel delete operation', () => {
    component.showDeleteModal = true;
    component.projectToDelete = '1';

    component.cancelDelete();
    expect(component.showDeleteModal).toBe(false);
    expect(component.projectToDelete).toBeNull();
  });

  // Test 21: Empty Bulk Delete
  it('should not show delete modal when no projects selected', () => {
    component.deleteSelected();
    expect(component.showDeleteModal).toBe(false);
  });

  // Test 22: Search Change
  it('should reset page on search change', () => {
    component.currentPage = 3;
    component.onSearchChange();
    expect(component.currentPage).toBe(1);
  });

  // Test 23: Helper Methods
  it('should provide correct helper method results', () => {
    expect(component.getProjectName('1')).toBe('Atlas App');
    expect(component.getProjectName('999')).toBe('');
    expect(component.getFieldLabel('name')).toBe('Project Name');
    expect(component.hasActiveSorting).toBe(false);
  });

  // Test 24: Edge Cases
  it('should handle edge cases gracefully', () => {
    // Empty search
    component.searchQuery = '';
    expect(component.filteredProjects.length).toBe(50);

    // Invalid operations
    component.viewDetails('999');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', '999']);

    // Pagination bounds
    component.currentPage = 1;
    component.handlePreviousPage();
    expect(component.currentPage).toBe(1);
  });

  // Test 25: Complex Sorting
  it('should handle complex sorting for all sortable fields', () => {
    const sortFields: ('name' | 'status' | 'priority' | 'projectManager' | 'teamSize')[] =
      ['name', 'status', 'priority', 'projectManager', 'teamSize'];

    sortFields.forEach(field => {
      component.sortBy(field);
      expect(component.sortCriteria?.field).toBe(field);
      expect(component.sortCriteria?.direction).toBe('asc');

      component.sortBy(field); // Toggle direction
      expect(component.sortCriteria?.direction).toBe('desc');

      component.sortBy(field); // Remove sorting
      expect(component.sortCriteria).toBeNull();
    });
  });
});
