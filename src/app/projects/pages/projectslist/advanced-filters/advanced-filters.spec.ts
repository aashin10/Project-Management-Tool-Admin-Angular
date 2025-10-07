import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedFilters } from './advanced-filters';

describe('AdvancedFilters', () => {
  let component: AdvancedFilters;
  let fixture: ComponentFixture<AdvancedFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default properties', () => {
    expect(component.showFilters).toBe(false);
    expect(component.selectedStatuses).toEqual([]);
    expect(component.selectedPriorities).toEqual([]);
    expect(component.selectedManagers).toEqual([]);
    expect(component.managerSearchQuery).toBe('');
    expect(component.showAllManagers).toBe(false);
  });

  it('should accept input properties', () => {
    component.showFilters = true;
    component.projects = [
      { id: '1', name: 'Test', projectCode: 'TST-001', status: 'Ongoing', priority: 'High', projectManager: 'John Doe', managerInitials: 'JD', teamSize: 5 }
    ];
    component.statusOptions = ['Ongoing', 'Completed'];
    component.priorityOptions = ['High', 'Medium'];

    expect(component.showFilters).toBe(true);
    expect(component.projects.length).toBe(1);
    expect(component.statusOptions).toEqual(['Ongoing', 'Completed']);
    expect(component.priorityOptions).toEqual(['High', 'Medium']);
  });

  it('should compute unique managers from projects', () => {
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Ongoing', priority: 'High', projectManager: 'John Doe', managerInitials: 'JD', teamSize: 5 },
      { id: '2', name: 'Test2', projectCode: 'TST-002', status: 'Completed', priority: 'Medium', projectManager: 'John Doe', managerInitials: 'JD', teamSize: 3 },
      { id: '3', name: 'Test3', projectCode: 'TST-003', status: 'Planning', priority: 'Low', projectManager: 'Jane Smith', managerInitials: 'JS', teamSize: 8 }
    ];

    expect(component.uniqueManagers).toEqual(['Jane Smith', 'John Doe']);
  });

  it('should filter managers based on search query', () => {
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Ongoing', priority: 'High', projectManager: 'John Doe', managerInitials: 'JD', teamSize: 5 },
      { id: '2', name: 'Test2', projectCode: 'TST-002', status: 'Completed', priority: 'Medium', projectManager: 'Jane Smith', managerInitials: 'JS', teamSize: 3 }
    ];

    component.managerSearchQuery = 'John';
    expect(component.filteredManagers).toEqual(['John Doe']);

    component.managerSearchQuery = 'smith';
    expect(component.filteredManagers).toEqual(['Jane Smith']);

    component.managerSearchQuery = '';
    expect(component.filteredManagers.length).toBe(2);
  });

  it('should handle show all managers toggle', () => {
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Ongoing', priority: 'High', projectManager: 'John Doe', managerInitials: 'JD', teamSize: 5 },
      { id: '2', name: 'Test2', projectCode: 'TST-002', status: 'Completed', priority: 'Medium', projectManager: 'Jane Smith', managerInitials: 'JS', teamSize: 3 },
      { id: '3', name: 'Test3', projectCode: 'TST-003', status: 'Planning', priority: 'Low', projectManager: 'Bob Wilson', managerInitials: 'BW', teamSize: 8 },
      { id: '4', name: 'Test4', projectCode: 'TST-004', status: 'On Hold', priority: 'High', projectManager: 'Alice Brown', managerInitials: 'AB', teamSize: 6 },
      { id: '5', name: 'Test5', projectCode: 'TST-005', status: 'Archived', priority: 'Medium', projectManager: 'Charlie Davis', managerInitials: 'CD', teamSize: 4 }
    ];

    // Default: show first 4
    expect(component.filteredManagers.length).toBe(4);
    expect(component.showAllManagers).toBe(false);

    component.toggleShowAllManagers();
    expect(component.showAllManagers).toBe(true);
    expect(component.filteredManagers.length).toBe(5);

    component.toggleShowAllManagers();
    expect(component.showAllManagers).toBe(false);
  });

  it('should check if filters are active', () => {
    expect(component.hasActiveFilters).toBe(false);

    component.selectedStatuses = ['Ongoing'];
    expect(component.hasActiveFilters).toBe(true);

    component.selectedStatuses = [];
    component.selectedPriorities = ['High'];
    expect(component.hasActiveFilters).toBe(true);

    component.selectedPriorities = [];
    component.selectedManagers = ['John Doe'];
    expect(component.hasActiveFilters).toBe(true);
  });

  it('should check filter selections', () => {
    component.selectedStatuses = ['Ongoing', 'Completed'];
    component.selectedPriorities = ['High'];
    component.selectedManagers = ['John Doe'];

    expect(component.isStatusSelected('Ongoing')).toBe(true);
    expect(component.isStatusSelected('Planning')).toBe(false);

    expect(component.isPrioritySelected('High')).toBe(true);
    expect(component.isPrioritySelected('Medium')).toBe(false);

    expect(component.isManagerSelected('John Doe')).toBe(true);
    expect(component.isManagerSelected('Jane Smith')).toBe(false);
  });

  it('should toggle status filters', () => {
    spyOn(component.filtersChanged, 'emit');

    component.toggleStatusFilter('Ongoing');
    expect(component.selectedStatuses).toEqual(['Ongoing']);
    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      selectedStatuses: ['Ongoing'],
      selectedPriorities: [],
      selectedManagers: []
    });

    component.toggleStatusFilter('Ongoing'); // Remove
    expect(component.selectedStatuses).toEqual([]);
    expect(component.filtersChanged.emit).toHaveBeenCalledTimes(2);
  });

  it('should toggle priority filters', () => {
    spyOn(component.filtersChanged, 'emit');

    component.togglePriorityFilter('High');
    expect(component.selectedPriorities).toEqual(['High']);
    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      selectedStatuses: [],
      selectedPriorities: ['High'],
      selectedManagers: []
    });

    component.togglePriorityFilter('High'); // Remove
    expect(component.selectedPriorities).toEqual([]);
    expect(component.filtersChanged.emit).toHaveBeenCalledTimes(2);
  });

  it('should toggle manager filters', () => {
    spyOn(component.filtersChanged, 'emit');

    component.toggleManagerFilter('John Doe');
    expect(component.selectedManagers).toEqual(['John Doe']);
    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      selectedStatuses: [],
      selectedPriorities: [],
      selectedManagers: ['John Doe']
    });

    component.toggleManagerFilter('John Doe'); // Remove
    expect(component.selectedManagers).toEqual([]);
    expect(component.filtersChanged.emit).toHaveBeenCalledTimes(2);
  });

  it('should remove specific filters', () => {
    spyOn(component.filtersChanged, 'emit');

    component.selectedStatuses = ['Ongoing', 'Completed'];
    component.selectedPriorities = ['High', 'Medium'];
    component.selectedManagers = ['John Doe', 'Jane Smith'];

    component.removeStatusFilter('Ongoing');
    expect(component.selectedStatuses).toEqual(['Completed']);
    expect(component.filtersChanged.emit).toHaveBeenCalled();

    component.removePriorityFilter('High');
    expect(component.selectedPriorities).toEqual(['Medium']);
    expect(component.filtersChanged.emit).toHaveBeenCalledTimes(2);

    component.removeManagerFilter('John Doe');
    expect(component.selectedManagers).toEqual(['Jane Smith']);
    expect(component.filtersChanged.emit).toHaveBeenCalledTimes(3);
  });

  it('should clear all filters', () => {
    spyOn(component.filtersChanged, 'emit');

    component.selectedStatuses = ['Ongoing'];
    component.selectedPriorities = ['High'];
    component.selectedManagers = ['John Doe'];

    component.clearAllFilters();

    expect(component.selectedStatuses).toEqual([]);
    expect(component.selectedPriorities).toEqual([]);
    expect(component.selectedManagers).toEqual([]);
    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      selectedStatuses: [],
      selectedPriorities: [],
      selectedManagers: []
    });
  });

  it('should calculate active filter count', () => {
    expect(component.getActiveFilterCount()).toBe(0);

    component.selectedStatuses = ['Ongoing', 'Completed'];
    expect(component.getActiveFilterCount()).toBe(2);

    component.selectedPriorities = ['High'];
    expect(component.getActiveFilterCount()).toBe(3);

    component.selectedManagers = ['John Doe', 'Jane Smith'];
    expect(component.getActiveFilterCount()).toBe(5);
  });

  it('should handle edge cases', () => {
    // Empty projects array
    component.projects = [];
    expect(component.uniqueManagers).toEqual([]);
    expect(component.filteredManagers).toEqual([]);

    // No matching search
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Ongoing', priority: 'High', projectManager: 'John Doe', managerInitials: 'JD', teamSize: 5 }
    ];
    component.managerSearchQuery = 'nonexistent';
    expect(component.filteredManagers).toEqual([]);

    // Case insensitive search
    component.managerSearchQuery = 'JOHN';
    expect(component.filteredManagers).toEqual(['John Doe']);

    // Multiple same manager (should be unique)
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Ongoing', priority: 'High', projectManager: 'John Doe', managerInitials: 'JD', teamSize: 5 },
      { id: '2', name: 'Test2', projectCode: 'TST-002', status: 'Completed', priority: 'Medium', projectManager: 'John Doe', managerInitials: 'JD', teamSize: 3 }
    ];
    expect(component.uniqueManagers).toEqual(['John Doe']);
  });
});
