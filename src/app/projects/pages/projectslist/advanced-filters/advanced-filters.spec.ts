import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancedFilters } from './advanced-filters';
import { Project } from '../../../services/projects.service';

describe('AdvancedFilters', () => {
  let component: AdvancedFilters;
  let fixture: ComponentFixture<AdvancedFilters>;

  const mockStatusOptions = [
    { id: 1, code: 'Active' },
    { id: 2, code: 'Inactive' },
    { id: 3, code: 'Completed' }
  ];

  const mockDeliveryUnitOptions = [
    { id: 1, code: 'DU1' },
    { id: 2, code: 'DU2' }
  ];

  const mockManagerOptions = [
    { id: 1, name: 'Alice Johnson' },
    { id: 2, name: 'Bob Smith' },
    { id: 3, name: 'Charlie Brown' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedFilters]
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancedFilters);
    component = fixture.componentInstance;
    component.statusOptions = mockStatusOptions;
    component.deliveryUnitOptions = mockDeliveryUnitOptions;
    component.managerOptions = mockManagerOptions;
    fixture.detectChanges();
  });

  it('should create and initialize with empty filters', () => {
    expect(component).toBeTruthy();
    expect(component.selectedStatusIds.length).toBe(0);
    expect(component.selectedDeliveryUnitIds.length).toBe(0);
    expect(component.selectedManagerIds.length).toBe(0);
    expect(component.hasActiveFilters).toBe(false);
  });

  it('should toggle status, delivery unit, and manager filters', () => {
    spyOn(component.filtersChanged, 'emit');
    
    component.toggleStatusFilter('Active');
    expect(component.selectedStatusIds).toContain(1);
    
    component.toggleDeliveryUnitFilter('DU1');
    expect(component.selectedDeliveryUnitIds).toContain(1);
    
    component.toggleManagerFilter(1);
    expect(component.selectedManagerIds).toContain(1);
    
    expect(component.filtersChanged.emit).toHaveBeenCalled();
  });

  it('should check if filters are selected', () => {
    component.selectedStatusIds = [1, 2];
    expect(component.isStatusSelected('Active')).toBe(true);
    expect(component.isStatusSelected('Completed')).toBe(false);
    
    component.selectedDeliveryUnitIds = [1];
    expect(component.isDeliveryUnitSelected('DU1')).toBe(true);
    expect(component.isDeliveryUnitSelected('DU2')).toBe(false);
    
    component.selectedManagerIds = [1];
    expect(component.isManagerSelected(1)).toBe(true);
    expect(component.isManagerSelected(2)).toBe(false);
  });

  it('should remove specific filters and emit event', () => {
    spyOn(component.filtersChanged, 'emit');
    component.selectedStatusIds = [1, 2];
    component.selectedDeliveryUnitIds = [1];
    component.selectedManagerIds = [1, 2];
    
    component.removeStatusFilter('Active');
    expect(component.selectedStatusIds).not.toContain(1);
    
    component.removeDeliveryUnitFilter('DU1');
    expect(component.selectedDeliveryUnitIds).not.toContain(1);
    
    component.removeManagerFilter(1);
    expect(component.selectedManagerIds).not.toContain(1);
    
    expect(component.filtersChanged.emit).toHaveBeenCalledTimes(3);
  });

  it('should return correct filter objects and count', () => {
    component.selectedStatusIds = [1, 2];
    const selectedStatus = component.selectedStatusObjects;
    expect(selectedStatus.length).toBe(2);
    expect(selectedStatus.map(s => s.code)).toContain('Active');
    
    component.selectedDeliveryUnitIds = [1];
    const selectedUnits = component.selectedDeliveryUnitObjects;
    expect(selectedUnits.length).toBe(1);
    
    component.selectedManagerIds = [1, 2];
    const selectedManagers = component.selectedManagerObjects;
    expect(selectedManagers.length).toBe(2);
    
    expect(component.getActiveFilterCount()).toBe(5);
  });

  it('should manage manager search and display', () => {
    component.managerSearchQuery = 'Alice';
    expect(component.filteredManagers.length).toBe(1);
    expect(component.filteredManagers[0].name).toBe('Alice Johnson');
    
    expect(component.displayedManagerCount).toBeLessThanOrEqual(3);
    expect(component.totalManagerCount).toBe(1);
    
    component.toggleShowAllManagers();
    expect(component.showAllManagers).toBe(true);
    
    component.managerSearchQuery = '';
    expect(component.totalManagerCount).toBe(3);
  });

  it('should handle manager modal operations', () => {
    component.openManagerModal();
    expect(component.showManagerModal).toBe(true);
    expect(component.modalFilteredManagers.length).toBeGreaterThan(0);
    
    component.modalSearchQuery = 'Bob';
    component.updateModalManagersList();
    expect(component.modalFilteredManagers.length).toBe(1);
    
    component.closeManagerModal();
    expect(component.showManagerModal).toBe(false);
    expect(component.modalSearchQuery).toBe('');
  });

  it('should clear all filters', () => {
    spyOn(component.filtersChanged, 'emit');
    component.selectedStatusIds = [1, 2];
    component.selectedDeliveryUnitIds = [1];
    component.selectedManagerIds = [1];
    
    component.clearAllFilters();
    
    expect(component.selectedStatusIds.length).toBe(0);
    expect(component.selectedDeliveryUnitIds.length).toBe(0);
    expect(component.selectedManagerIds.length).toBe(0);
    expect(component.filtersChanged.emit).toHaveBeenCalled();
  });

  it('should initialize with provided filter values', () => {
    const newComponent = TestBed.createComponent(AdvancedFilters);
    const instance = newComponent.componentInstance;
    instance.initialSelectedStatusIds = [1, 2];
    instance.initialSelectedDeliveryUnitIds = [1];
    instance.statusOptions = mockStatusOptions;
    instance.deliveryUnitOptions = mockDeliveryUnitOptions;
    
    newComponent.detectChanges();
    
    expect(instance.selectedStatusIds).toEqual([1, 2]);
    expect(instance.selectedDeliveryUnitIds).toEqual([1]);
  });

  it('should handle edge cases', () => {
    component.toggleStatusFilter('NonExistent');
    expect(component.selectedStatusIds.length).toBe(0);
    
    component.managerOptions = [];
    expect(component.displayedManagerCount).toBe(0);
    
    component.managerSearchQuery = '@#$%';
    expect(component.filteredManagers.length).toBe(0);
  });
});
