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
    component.selectedDeliveryUnits = [];
    component.selectedManagers = [];
    component.showDeleteModal = false;
    component.projectToDelete = null;
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
    expect(component.showDeleteModal).toBe(false);
    expect(component.projectToDelete).toBeNull();
  });

  // Test 3: Projects Data
  it('should initialize with 50 projects', () => {
    expect(component.projects.length).toBe(50);
    expect(component.projects[0]).toEqual(jasmine.objectContaining({
      id: '1',
      name: 'Atlas App',
      status: 'Active',
      deliveryUnit: 'Engineering'
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
    component.selectedStatuses = ['Active'];
    const filtered = component.filteredProjects;
    expect(filtered.every(p => p.status === 'Active')).toBe(true);
  });

  // Test 6: Combined Filtering
  it('should apply multiple filters simultaneously', () => {
    component.searchQuery = 'App';
    component.selectedStatuses = ['Active'];
    component.selectedDeliveryUnits = ['Engineering'];

    const filtered = component.filteredProjects;
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(project => {
      expect(project.status).toBe('Active');
      expect(project.deliveryUnit).toBe('Engineering');
    });
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

  // Test 13: Selection Change Handling
  it('should handle selection changes from shared table', () => {
    const selectedRows = [
      { actions: '1', projectInfo: { name: 'Atlas App', initials: 'AT' } },
      { actions: '2', projectInfo: { name: 'RoadSim', initials: 'RO' } }
    ];

    component.handleSelectionChange(selectedRows);

    expect(component.projects[0].selected).toBe(true);
    expect(component.projects[1].selected).toBe(true);
    expect(component.selectedProjects.length).toBe(2);
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


  // Test 16: Filter Changes
  it('should handle filter changes', () => {
    const filters = {
      selectedStatuses: ['Active'],
      selectedDeliveryUnits: ['Engineering'],
      selectedManagers: ['Asha Varma']
    };

    component.onFiltersChanged(filters);
    expect(component.selectedStatuses).toEqual(['Active']);
    expect(component.selectedDeliveryUnits).toEqual(['Engineering']);
  });

  // Test 17: Archive Project
  it('should archive project', () => {
    const project = component.projects.find(p => p.id === '1');
    component.archiveProject('1');
    expect(project?.status).toBe('Inactive');
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
    component.projectToDelete = component.projects[0];

    component.cancelDelete();
    expect(component.showDeleteModal).toBe(false);
    expect(component.projectToDelete).toBeNull();
  });

  // Test 21: Empty Bulk Delete
  it('should not show delete modal when no projects selected', () => {
    component.deleteSelected();
    expect(component.showDeleteModal).toBe(false);
  });

  // Test 23: Selection Change Handling
  it('should handle selection changes from shared table', () => {
    const selectedRows = [
      { actions: '1', projectInfo: { name: 'Atlas App', initials: 'AT' } },
      { actions: '2', projectInfo: { name: 'RoadSim', initials: 'RO' } }
    ];

    component.handleSelectionChange(selectedRows);

    expect(component.projects[0].selected).toBe(true);
    expect(component.projects[1].selected).toBe(true);
    expect(component.selectedProjects.length).toBe(2);
  });

  // Test 24: Edge Cases
  it('should handle edge cases gracefully', () => {
    // Empty search
    component.searchQuery = '';
    expect(component.filteredProjects.length).toBe(50);

    // Invalid operations
    component.viewDetails('999');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', '999']);

  });

});

