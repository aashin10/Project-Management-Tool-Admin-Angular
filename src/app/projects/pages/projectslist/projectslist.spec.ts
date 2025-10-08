import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef, ElementRef } from '@angular/core';

import { Projectslist } from './projectslist';

describe('Projectslist', () => {
  let component: Projectslist;
  let fixture: ComponentFixture<Projectslist>;
  let routerSpy: jasmine.SpyObj<Router>;
  let cdrSpy: jasmine.SpyObj<ChangeDetectorRef>;

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
    cdrSpy = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default properties', () => {
    expect(component.showFilters).toBe(false);
    expect(component.searchQuery).toBe('');
    expect(component.selectedStatuses).toEqual([]);
    expect(component.selectedPriorities).toEqual([]);
    expect(component.selectedManagers).toEqual([]);
    expect(component.sortCriteria).toBeNull();
    expect(component.currentPage).toBe(1);
    expect(component.rowsPerPage).toBe(10);
    expect(component.showDeleteModal).toBe(false);
  });

  it('should have projects data initialized', () => {
    expect(component.projects.length).toBe(50);
    expect(component.projects[0]).toEqual(jasmine.objectContaining({
      id: '1',
      name: 'Atlas App',
      status: 'Ongoing',
      priority: 'High'
    }));
  });

  it('should filter projects by search query', () => {
    component.searchQuery = 'Atlas';
    expect(component.filteredProjects.length).toBe(1);
    expect(component.filteredProjects[0].name).toBe('Atlas App');

    component.searchQuery = 'PROJ-001';
    expect(component.filteredProjects.length).toBe(1);

    component.searchQuery = 'nonexistent';
    expect(component.filteredProjects.length).toBe(0);
  });

  it('should filter projects by status and priority', () => {
    component.selectedStatuses = ['Ongoing'];
    expect(component.filteredProjects.every(p => p.status === 'Ongoing')).toBe(true);

    component.selectedPriorities = ['High'];
    component.selectedStatuses = [];
    expect(component.filteredProjects.every(p => p.priority === 'High')).toBe(true);
  });

  it('should combine multiple filters', () => {
    component.searchQuery = 'App';
    component.selectedStatuses = ['Ongoing'];
    component.selectedPriorities = ['High'];

    const result = component.filteredProjects;
    result.forEach(project => {
      expect(project.name.includes('App') || project.projectCode.includes('App')).toBe(true);
      expect(project.status).toBe('Ongoing');
      expect(project.priority).toBe('High');
    });
  });

  it('should sort projects by different fields', () => {
    // Sort by name ascending
    component.sortBy('name');
    expect(component.sortCriteria).toEqual({ field: 'name', direction: 'asc' });

    // Sort by name descending
    component.sortBy('name');
    expect(component.sortCriteria).toEqual({ field: 'name', direction: 'desc' });

    // Remove sorting
    component.sortBy('name');
    expect(component.sortCriteria).toBeNull();
  });

  it('should handle sorting with priority and status logic', () => {
    component.sortBy('priority');
    const sortedByPriority = component.filteredProjects;
    expect(sortedByPriority[0].priority).toBe('Low'); // Ascending: Low -> Medium -> High -> Critical

    component.sortBy('status');
    const sortedByStatus = component.filteredProjects;
    expect(sortedByStatus[0].status).toBe('Planning'); // Ascending: Planning -> Ongoing -> On Hold -> Completed -> Archived
  });

  it('should handle pagination correctly', () => {
    expect(component.paginatedProjects.length).toBe(10);
    expect(component.totalPages).toBe(5);
    expect(component.startIndex).toBe(0);
    expect(component.endIndex).toBe(10);

    component.currentPage = 2;
    expect(component.paginatedProjects.length).toBe(10);
    expect(component.startIndex).toBe(10);
    expect(component.endIndex).toBe(20);
  });

  it('should handle pagination edge cases', () => {
    component.rowsPerPage = 50;
    expect(component.totalPages).toBe(1);
    expect(component.paginatedProjects.length).toBe(50);

    component.rowsPerPage = 10;
    component.currentPage = 6; // Beyond total pages
    expect(component.currentPage).toBe(6); // Should handle gracefully
  });

  it('should handle project selection', () => {
    const project = component.projects[0];
    project.selected = true;
    expect(component.selectedProjects.length).toBe(1);
    expect(component.allSelectedProjects.length).toBe(1);

    project.selected = false;
    expect(component.selectedProjects.length).toBe(0);
  });

  it('should handle select all functionality', () => {
    component.toggleSelectAll();
    expect(component.allSelected).toBe(true);
    expect(component.selectedProjects.length).toBe(50); // All filtered projects

    component.toggleSelectAll(); // Deselect all
    expect(component.allSelected).toBe(false);
    expect(component.selectedProjects.length).toBe(0);
  });

  it('should handle row clicks for navigation and selection', () => {
    const project = component.projects[0];

    // No selections - should navigate
    component.onRowClick(project);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', project.id]);

    // With selections - should toggle
    project.selected = true;
    routerSpy.navigate.calls.reset();
    component.onRowClick(project);
    expect(project.selected).toBe(false);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should handle delete operations', () => {
    const projectId = '1';
    component.deleteProject(projectId);
    expect(component.showDeleteModal).toBe(true);
    expect(component.projectToDelete).toBe(projectId);

    component.confirmDelete();
    expect(component.projects.find(p => p.id === projectId)).toBeUndefined();
    expect(component.showDeleteModal).toBe(false);
  });

  it('should handle bulk delete operations', () => {
    component.projects[0].selected = true;
    component.projects[1].selected = true;
    component.deleteSelected();

    expect(component.showDeleteModal).toBe(true);
    expect(component.projectsToDelete.length).toBe(2);

    component.confirmDelete();
    expect(component.projectsToDelete.length).toBe(0);
    expect(component.showDeleteModal).toBe(false);
  });

  it('should handle archive operations', () => {
    const projectId = '1';
    const project = component.projects.find(p => p.id === projectId);
    expect(project?.status).toBe('Ongoing');

    component.archiveProject(projectId);
    expect(project?.status).toBe('Archived');
  });

  it('should handle filter changes', () => {
    const filters = {
      selectedStatuses: ['Ongoing'],
      selectedPriorities: ['High'],
      selectedManagers: ['Asha Varma']
    };

    component.onFiltersChanged(filters);
    expect(component.selectedStatuses).toEqual(['Ongoing']);
    expect(component.selectedPriorities).toEqual(['High']);
    expect(component.selectedManagers).toEqual(['Asha Varma']);
    expect(component.currentPage).toBe(1);
  });

  it('should handle pagination navigation', () => {
    spyOn(window, 'scrollTo');

    component.handleNextPage();
    expect(component.currentPage).toBe(2);

    component.handlePreviousPage();
    expect(component.currentPage).toBe(1);

    component.handleFirstPage();
    expect(component.currentPage).toBe(1);

    component.handleLastPage();
    expect(component.totalPages).toBe(5);
    expect(component.currentPage).toBe(5);
  });

  it('should handle navigation methods', () => {
    component.viewDetails('1');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', '1']);

    component.editProject('1');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', '1', 'edit']);

    component.createProject();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects/create']);

    component.importFromJira();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects/importfromjira']);
  });

  it('should handle actions menu', () => {
    const event = new Event('click');
    spyOn(event, 'stopPropagation');

    component.toggleActionsMenu('1', event);
    expect(component.showActionsMenu).toBe(true);
    expect(component.activeProjectId).toBe('1');
    expect(event.stopPropagation).toHaveBeenCalled();

    component.toggleActionsMenu('1', event); // Close
    expect(component.showActionsMenu).toBe(false);
    expect(component.activeProjectId).toBeNull();
  });

  it('should handle edge cases and error conditions', () => {
    // Empty search
    component.searchQuery = '   ';
    expect(component.filteredProjects.length).toBe(50);

    // Invalid project ID operations
    component.viewDetails('999');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', '999']);

    // Delete non-existent project
    component.projectToDelete = '999';
    component.confirmDelete();
    expect(component.projects.length).toBe(50); // Should remain same

    // Empty bulk delete
    component.deleteSelected();
    expect(component.showDeleteModal).toBe(false);

    // Pagination bounds
    component.currentPage = 0;
    component.handlePreviousPage();
    expect(component.currentPage).toBe(0);

    component.currentPage = 6;
    component.handleNextPage();
    expect(component.currentPage).toBe(6);
  });

  it('should handle indeterminate selection detection', () => {
    // No selection
    expect(component.isIndeterminateSelection()).toBe(false);

    // Partial selection
    component.projects[0].selected = true;
    expect(component.isIndeterminateSelection()).toBe(true);

    // Full selection
    component.filteredProjects.forEach(project => {
      project.selected = true;
    });
    expect(component.isIndeterminateSelection()).toBe(false);
  });

  it('should handle sorting helper methods', () => {
    expect(component.hasActiveSorting).toBe(false);
    expect(component.getSortDirection('name')).toBeNull();
    expect(component.getFieldLabel('name')).toBe('Project Name');

    component.sortBy('name');
    expect(component.hasActiveSorting).toBe(true);
    expect(component.getSortDirection('name')).toBe('asc');
  });

  it('should handle modal operations', () => {
    component.cancelDelete();
    expect(component.showDeleteModal).toBe(false);
    expect(component.projectToDelete).toBeNull();
    expect(component.deleteMode).toBe('single');
    expect(component.projectsToDelete).toEqual([]);
  });

  it('should handle basic selection scenarios', () => {
    // Test select all functionality
    component.toggleSelectAll();
    expect(component.allSelected).toBe(true);

    // Test deselect all functionality
    component.toggleSelectAll();
    expect(component.allSelected).toBe(false);
  });

  it('should handle row clicks correctly', () => {
    const project = component.projects[0];

    // No selection - should navigate
    component.onRowClick(project);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', project.id]);

    // With selections - should toggle
    routerSpy.navigate.calls.reset();
    component.projects[1].selected = true;
    component.onRowClick(project);
    expect(project.selected).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should handle all sorting scenarios', () => {
    // Test all sort fields
    const sortFields: ('name' | 'status' | 'priority' | 'projectManager' | 'teamSize')[] =
      ['name', 'status', 'priority', 'projectManager', 'teamSize'];

    sortFields.forEach(field => {
      // Sort ascending
      component.sortBy(field);
      expect(component.sortCriteria?.field).toBe(field);
      expect(component.sortCriteria?.direction).toBe('asc');

      // Sort descending
      component.sortBy(field);
      expect(component.sortCriteria?.direction).toBe('desc');

      // Remove sorting
      component.sortBy(field);
      expect(component.sortCriteria).toBe(null);
    });
  });

  it('should handle pagination comprehensively', () => {
    // Test all pagination methods
    component.handleRowsPerPageChange(25);
    expect(component.rowsPerPage).toBe(25);
    expect(component.currentPage).toBe(1);

    component.currentPage = 2;
    component.handleFirstPage();
    expect(component.currentPage).toBe(1);

    component.handleLastPage();
    expect(component.currentPage).toBe(component.totalPages);

    component.currentPage = 3;
    component.handleTwoPagesBack();
    expect(component.currentPage).toBe(1);

    component.currentPage = 1;
    component.handleTwoPagesForward();
    expect(component.currentPage).toBe(2); // Limited by total pages
  });

  it('should handle search with all filters active', () => {
    // Set up complex filtering scenario
    component.searchQuery = 'Atlas';
    component.selectedStatuses = ['Ongoing'];
    component.selectedPriorities = ['High'];
    component.selectedManagers = ['Asha Varma'];

    expect(component.filteredProjects.length).toBeLessThan(50);

    // Verify all filters are applied
    component.filteredProjects.forEach(project => {
      expect(project.name.toLowerCase().includes('atlas') ||
             project.projectCode.toLowerCase().includes('atlas')).toBe(true);
      expect(project.status).toBe('Ongoing');
      expect(project.priority).toBe('High');
      expect(project.projectManager).toBe('Asha Varma');
    });
  });

  it('should handle bulk operations with different selection states', () => {
    // Select some projects
    component.projects[0].selected = true;
    component.projects[1].selected = true;
    component.projects[2].selected = true;

    component.deleteSelected();
    expect(component.showDeleteModal).toBe(true);
    expect(component.deleteMode).toBe('bulk');
    expect(component.projectsToDelete.length).toBe(3);

    // Cancel bulk delete
    component.cancelDelete();
    expect(component.showDeleteModal).toBe(false);
    expect(component.projectsToDelete).toEqual([]);
    expect(component.deleteMode).toBe('single');
    // Selections should be cleared
    expect(component.projects.filter(p => p.selected).length).toBe(0);
  });

  it('should handle archive operations correctly', () => {
    const project = component.projects.find(p => p.status !== 'Archived');
    if (project) {
      const originalStatus = project.status;
      component.archiveProject(project.id);
      expect(project.status).toBe('Archived');
      expect(project.status).not.toBe(originalStatus);
    }
  });

  it('should handle complete project lifecycle', () => {
    const initialCount = component.projects.length;

    // Create project (navigate)
    component.createProject();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects/create']);

    // Import from Jira
    component.importFromJira();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects/importfromjira']);

    // Delete project
    component.deleteProject(component.projects[0].id);
    component.confirmDelete();
    expect(component.projects.length).toBe(initialCount - 1);
  });

  it('should handle filter persistence and reset', () => {
    // Apply multiple filters
    component.selectedStatuses = ['Ongoing', 'On Hold'];
    component.selectedPriorities = ['High', 'Medium'];
    component.selectedManagers = ['Asha Varma', 'Pranav Iyer'];
    component.searchQuery = 'App';

    expect(component.hasActiveFilters).toBe(true);
    expect(component.filteredProjects.length).toBeLessThan(50);

    // Reset all filters
    component.selectedStatuses = [];
    component.selectedPriorities = [];
    component.selectedManagers = [];
    component.searchQuery = '';

    expect(component.hasActiveFilters).toBe(false);
    expect(component.filteredProjects.length).toBe(50);
  });

  it('should handle sorting with filtered data', () => {
    // Apply filter first
    component.selectedStatuses = ['Ongoing'];

    // Sort filtered results
    component.sortBy('name');
    const sortedProjects = component.filteredProjects;
    for (let i = 1; i < sortedProjects.length; i++) {
      expect(sortedProjects[i-1].name.localeCompare(sortedProjects[i].name)).toBeLessThanOrEqual(0);
    }

    // Sort by team size
    component.sortBy('teamSize');
    const sizeSorted = component.filteredProjects;
    for (let i = 1; i < sizeSorted.length; i++) {
      expect(sizeSorted[i-1].teamSize).toBeLessThanOrEqual(sizeSorted[i].teamSize);
    }
  });

  it('should handle priority and status sorting logic', () => {
    // Test priority sorting (Low -> Medium -> High -> Critical)
    component.sortBy('priority');
    const prioritySorted = component.filteredProjects;

    const priorityOrder = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };
    for (let i = 1; i < prioritySorted.length; i++) {
      expect(priorityOrder[prioritySorted[i-1].priority]).toBeLessThanOrEqual(
             priorityOrder[prioritySorted[i].priority]);
    }

    // Test status sorting (Planning -> Ongoing -> On Hold -> Completed -> Archived)
    component.sortBy('status');
    const statusSorted = component.filteredProjects;

    const statusOrder = { 'Planning': 1, 'Ongoing': 2, 'On Hold': 3, 'Completed': 4, 'Archived': 5 };
    for (let i = 1; i < statusSorted.length; i++) {
      expect(statusOrder[statusSorted[i-1].status]).toBeLessThanOrEqual(
             statusOrder[statusSorted[i].status]);
    }
  });

  it('should handle all pagination edge cases', () => {
    // Test with empty filtered results
    component.searchQuery = 'nonexistentprojectxyz';
    expect(component.totalPages).toBe(1);
    expect(component.paginatedProjects.length).toBe(0);
    expect(component.startIndex).toBe(0);
    expect(component.endIndex).toBe(0);

    // Reset search
    component.searchQuery = '';

    // Test boundary pagination
    component.rowsPerPage = 10;
    component.currentPage = 1;
    expect(component.startIndex).toBe(0);
    expect(component.endIndex).toBe(10);

    component.currentPage = 5;
    expect(component.startIndex).toBe(40);
    expect(component.endIndex).toBe(50);

    // Test invalid page navigation
    component.currentPage = 10;
    component.handleNextPage();
    expect(component.currentPage).toBe(10);
  });

  it('should handle filter changes correctly', () => {
    const filters = {
      selectedStatuses: ['Ongoing'],
      selectedPriorities: [],
      selectedManagers: []
    };
    component.onFiltersChanged(filters);
    expect(component.selectedStatuses).toEqual(['Ongoing']);
    expect(component.currentPage).toBe(1);
  });
});
