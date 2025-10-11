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

    // Reset component state
    component.selectedStatuses = [];
    component.selectedDeliveryUnits = [];
    component.selectedManagers = [];
    component.managerSearchQuery = '';
    component.showAllManagers = false;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showFilters).toBe(false);
    expect(component.projects).toEqual([]);
    expect(component.statusOptions).toEqual([]);
    expect(component.deliveryUnitOptions).toEqual([]);
    expect(component.selectedStatuses).toEqual([]);
    expect(component.selectedDeliveryUnits).toEqual([]);
    expect(component.selectedManagers).toEqual([]);
    expect(component.managerSearchQuery).toBe('');
    expect(component.showAllManagers).toBe(false);
  });

  it('should accept input properties correctly', () => {
    component.showFilters = true;
    component.projects = [{ id: '1', name: 'Test', projectCode: 'TST-001', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'John Doe', teamSize: 5 }];
    component.statusOptions = ['Ongoing', 'Completed'];
    component.deliveryUnitOptions = ['Engineering', 'Product Management'];

    expect(component.showFilters).toBe(true);
    expect(component.projects.length).toBe(1);
    expect(component.statusOptions).toEqual(['Ongoing', 'Completed']);
    expect(component.deliveryUnitOptions).toEqual(['Engineering', 'Product Management']);
  });

  it('should return false for hasActiveFilters when no filters selected', () => {
    expect(component.hasActiveFilters).toBe(false);
  });

  it('should return true for hasActiveFilters when statuses are selected', () => {
    component.selectedStatuses = ['Ongoing'];
    expect(component.hasActiveFilters).toBe(true);
  });

  it('should return true for hasActiveFilters when delivery units are selected', () => {
    component.selectedDeliveryUnits = ['Engineering'];
    expect(component.hasActiveFilters).toBe(true);
  });

  it('should return true for hasActiveFilters when managers are selected', () => {
    component.selectedManagers = ['John Doe'];
    expect(component.hasActiveFilters).toBe(true);
  });

  it('should compute unique managers from projects data', () => {
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'John Doe', teamSize: 5 },
      { id: '2', name: 'Test2', projectCode: 'TST-002', status: 'Completed', deliveryUnit: 'Engineering', projectManager: 'John Doe', teamSize: 3 },
      { id: '3', name: 'Test3', projectCode: 'TST-003', status: 'Active', deliveryUnit: 'Design', projectManager: 'Jane Smith', teamSize: 8 }
    ];

    expect(component.uniqueManagers).toEqual(['Jane Smith', 'John Doe']);
  });

  it('should filter managers based on search query', () => {
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'John Doe', teamSize: 5 },
      { id: '2', name: 'Test2', projectCode: 'TST-002', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'Jane Smith', teamSize: 3 },
      { id: '3', name: 'Test3', projectCode: 'TST-003', status: 'Active', deliveryUnit: 'Design', projectManager: 'Bob Wilson', teamSize: 8 }
    ];

    component.managerSearchQuery = 'John';
    expect(component.filteredManagers).toEqual(['John Doe']);

    component.managerSearchQuery = 'smith';
    expect(component.filteredManagers).toEqual(['Jane Smith']);

    component.managerSearchQuery = 'nonexistent';
    expect(component.filteredManagers).toEqual([]);
  });

  it('should limit filtered managers to first 4 when showAllManagers is false', () => {
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Alice', teamSize: 5 },
      { id: '2', name: 'Test2', projectCode: 'TST-002', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'Bob', teamSize: 3 },
      { id: '3', name: 'Test3', projectCode: 'TST-003', status: 'Active', deliveryUnit: 'Design', projectManager: 'Charlie', teamSize: 8 },
      { id: '4', name: 'Test4', projectCode: 'TST-004', status: 'Inactive', deliveryUnit: 'Engineering', projectManager: 'Diana', teamSize: 6 },
      { id: '5', name: 'Test5', projectCode: 'TST-005', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'Eve', teamSize: 4 }
    ];

    expect(component.showAllManagers).toBe(false);
    expect(component.filteredManagers).toEqual(['Alice', 'Bob', 'Charlie', 'Diana']);
  });

  it('should show all managers when showAllManagers is true', () => {
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Alice', teamSize: 5 },
      { id: '2', name: 'Test2', projectCode: 'TST-002', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'Bob', teamSize: 3 },
      { id: '3', name: 'Test3', projectCode: 'TST-003', status: 'Active', deliveryUnit: 'Design', projectManager: 'Charlie', teamSize: 8 }
    ];

    component.toggleShowAllManagers();
    expect(component.showAllManagers).toBe(true);
    expect(component.filteredManagers).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should return correct displayed manager count', () => {
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Alice', teamSize: 5 },
      { id: '2', name: 'Test2', projectCode: 'TST-002', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'Bob', teamSize: 3 },
      { id: '3', name: 'Test3', projectCode: 'TST-003', status: 'Active', deliveryUnit: 'Design', projectManager: 'Charlie', teamSize: 8 }
    ];

    expect(component.displayedManagerCount).toBe(3);
  });

  it('should return correct total manager count', () => {
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Alice', teamSize: 5 },
      { id: '2', name: 'Test2', projectCode: 'TST-002', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'Bob', teamSize: 3 },
      { id: '3', name: 'Test3', projectCode: 'TST-003', status: 'Active', deliveryUnit: 'Design', projectManager: 'Charlie', teamSize: 8 }
    ];

    expect(component.totalManagerCount).toBe(3);
  });

  it('should return correct active filter count', () => {
    component.selectedStatuses = ['Active', 'Completed'];
    component.selectedDeliveryUnits = ['Engineering'];
    component.selectedManagers = ['John Doe', 'Jane Smith'];

    expect(component.getActiveFilterCount()).toBe(5);
  });

  it('should check if status is selected correctly', () => {
    component.selectedStatuses = ['Active', 'Completed'];

    expect(component.isStatusSelected('Active')).toBe(true);
    expect(component.isStatusSelected('Inactive')).toBe(false);
  });

  it('should check if delivery unit is selected correctly', () => {
    component.selectedDeliveryUnits = ['Engineering', 'Product Management'];

    expect(component.isDeliveryUnitSelected('Engineering')).toBe(true);
    expect(component.isDeliveryUnitSelected('Design')).toBe(false);
  });

  it('should check if manager is selected correctly', () => {
    component.selectedManagers = ['John Doe', 'Jane Smith'];

    expect(component.isManagerSelected('John Doe')).toBe(true);
    expect(component.isManagerSelected('Bob Wilson')).toBe(false);
  });

  it('should toggle status filter correctly', () => {
    spyOn(component.filtersChanged, 'emit');

    component.toggleStatusFilter('Active');
    expect(component.selectedStatuses).toEqual(['Active']);
    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      selectedStatuses: ['Active'],
      selectedDeliveryUnits: [],
      selectedManagers: []
    });

    component.toggleStatusFilter('Active'); // Remove
    expect(component.selectedStatuses).toEqual([]);
    expect(component.filtersChanged.emit).toHaveBeenCalledTimes(2);
  });

  it('should toggle delivery unit filter correctly', () => {
    spyOn(component.filtersChanged, 'emit');

    component.toggleDeliveryUnitFilter('Engineering');
    expect(component.selectedDeliveryUnits).toEqual(['Engineering']);
    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      selectedStatuses: [],
      selectedDeliveryUnits: ['Engineering'],
      selectedManagers: []
    });

    component.toggleDeliveryUnitFilter('Engineering'); // Remove
    expect(component.selectedDeliveryUnits).toEqual([]);
    expect(component.filtersChanged.emit).toHaveBeenCalledTimes(2);
  });

  it('should toggle manager filter correctly', () => {
    spyOn(component.filtersChanged, 'emit');

    component.toggleManagerFilter('John Doe');
    expect(component.selectedManagers).toEqual(['John Doe']);
    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      selectedStatuses: [],
      selectedDeliveryUnits: [],
      selectedManagers: ['John Doe']
    });

    component.toggleManagerFilter('John Doe'); // Remove
    expect(component.selectedManagers).toEqual([]);
    expect(component.filtersChanged.emit).toHaveBeenCalledTimes(2);
  });

  it('should remove status filter correctly', () => {
    spyOn(component.filtersChanged, 'emit');
    component.selectedStatuses = ['Ongoing', 'Completed'];

    component.removeStatusFilter('Ongoing');
    expect(component.selectedStatuses).toEqual(['Completed']);
    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      selectedStatuses: ['Completed'],
      selectedDeliveryUnits: [],
      selectedManagers: []
    });
  });

  it('should remove delivery unit filter correctly', () => {
    spyOn(component.filtersChanged, 'emit');
    component.selectedDeliveryUnits = ['Engineering', 'Product Management'];

    component.removeDeliveryUnitFilter('Engineering');
    expect(component.selectedDeliveryUnits).toEqual(['Product Management']);
    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      selectedStatuses: [],
      selectedDeliveryUnits: ['Product Management'],
      selectedManagers: []
    });
  });

  it('should remove manager filter correctly', () => {
    spyOn(component.filtersChanged, 'emit');
    component.selectedManagers = ['John Doe', 'Jane Smith'];

    component.removeManagerFilter('John Doe');
    expect(component.selectedManagers).toEqual(['Jane Smith']);
    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      selectedStatuses: [],
      selectedDeliveryUnits: [],
      selectedManagers: ['Jane Smith']
    });
  });

  it('should clear all filters correctly', () => {
    spyOn(component.filtersChanged, 'emit');
    component.selectedStatuses = ['Active'];
    component.selectedDeliveryUnits = ['Engineering'];
    component.selectedManagers = ['John Doe'];

    component.clearAllFilters();

    expect(component.selectedStatuses).toEqual([]);
    expect(component.selectedDeliveryUnits).toEqual([]);
    expect(component.selectedManagers).toEqual([]);
    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      selectedStatuses: [],
      selectedDeliveryUnits: [],
      selectedManagers: []
    });
  });

  it('should toggle show all managers correctly', () => {
    expect(component.showAllManagers).toBe(false);

    component.toggleShowAllManagers();
    expect(component.showAllManagers).toBe(true);

    component.toggleShowAllManagers();
    expect(component.showAllManagers).toBe(false);
  });

  it('should handle empty projects array gracefully', () => {
    component.projects = [];

    expect(component.uniqueManagers).toEqual([]);
    expect(component.filteredManagers).toEqual([]);
    expect(component.hasActiveFilters).toBe(false);
    expect(component.getActiveFilterCount()).toBe(0);
  });

  it('should handle case insensitive manager search', () => {
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'John Doe', teamSize: 5 }
    ];

    component.managerSearchQuery = 'JOHN';
    expect(component.filteredManagers).toEqual(['John Doe']);

    component.managerSearchQuery = 'doe';
    expect(component.filteredManagers).toEqual(['John Doe']);
  });

  it('should handle null and undefined project managers', () => {
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Active', deliveryUnit: 'Engineering', projectManager: null, teamSize: 5 },
      { id: '2', name: 'Test2', projectCode: 'TST-002', status: 'Completed', deliveryUnit: 'Product Management', projectManager: undefined, teamSize: 3 },
      { id: '3', name: 'Test3', projectCode: 'TST-003', status: 'Active', deliveryUnit: 'Design', projectManager: '', teamSize: 4 }
    ] as any;

    const uniqueManagers = component.uniqueManagers as any[];
    expect(uniqueManagers.length).toBe(3);
    expect(uniqueManagers).toContain('');
    expect(uniqueManagers).toContain(null);
    expect(uniqueManagers).toContain(undefined);
  });

  it('should emit filters changed with correct data structure', () => {
    spyOn(component.filtersChanged, 'emit');

    component.selectedStatuses = ['Ongoing'];
    component.selectedDeliveryUnits = ['Engineering'];
    component.selectedManagers = ['John Doe'];

    component.clearAllFilters();

    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      selectedStatuses: [],
      selectedDeliveryUnits: [],
      selectedManagers: []
    });
  });

  it('should maintain filter state independently', () => {
    component.selectedStatuses = ['Active'];
    component.selectedDeliveryUnits = ['Engineering'];
    component.selectedManagers = ['John Doe'];

    expect(component.selectedStatuses).toEqual(['Active']);
    expect(component.selectedDeliveryUnits).toEqual(['Engineering']);
    expect(component.selectedManagers).toEqual(['John Doe']);

    component.removeStatusFilter('Active');
    expect(component.selectedStatuses).toEqual([]);
    expect(component.selectedDeliveryUnits).toEqual(['Engineering']); // Should remain
    expect(component.selectedManagers).toEqual(['John Doe']); // Should remain
  });

  it('should handle multiple manager filtering with search', () => {
    component.projects = [
      { id: '1', name: 'Test1', projectCode: 'TST-001', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'John Smith', teamSize: 5 },
      { id: '2', name: 'Test2', projectCode: 'TST-002', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'John Doe', teamSize: 3 },
      { id: '3', name: 'Test3', projectCode: 'TST-003', status: 'Active', deliveryUnit: 'Design', projectManager: 'Jane Smith', teamSize: 8 }
    ];

    component.managerSearchQuery = 'John';
    expect(component.filteredManagers).toEqual(['John Doe', 'John Smith']);

    component.managerSearchQuery = 'Smith';
    expect(component.filteredManagers).toEqual(['Jane Smith', 'John Smith']);
  });

  it('should handle complex filter combinations correctly', () => {
    component.selectedStatuses = ['Active', 'Completed'];
    component.selectedDeliveryUnits = ['Engineering', 'Product Management'];
    component.selectedManagers = ['John Doe'];

    expect(component.hasActiveFilters).toBe(true);
    expect(component.getActiveFilterCount()).toBe(5);

    component.clearAllFilters();
    expect(component.hasActiveFilters).toBe(false);
    expect(component.getActiveFilterCount()).toBe(0);
  });
});