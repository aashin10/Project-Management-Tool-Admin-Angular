import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancedFilters } from './advanced-filters';

describe('AdvancedFilters', () => {
  let component: AdvancedFilters;
  let fixture: ComponentFixture<AdvancedFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedFilters]
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancedFilters);
    component = fixture.componentInstance;
    component.projects = [
      { id: '1', name: 'Atlas', projectCode: 'P1', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Alice', teamSize: 5 },
      { id: '2', name: 'Beta', projectCode: 'P2', status: 'Inactive', deliveryUnit: 'DU2', projectManager: 'Bob', teamSize: 3 },
      { id: '3', name: 'Cloud', projectCode: 'P3', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Charlie', teamSize: 4 },
      { id: '4', name: 'Delta', projectCode: 'P4', status: 'Active', deliveryUnit: 'DU2', projectManager: 'Alice', teamSize: 6 }
    ] as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute uniqueManagers', () => {
    const managers = component.uniqueManagers;
    expect(managers).toContain('Alice');
    expect(managers.length).toBeGreaterThan(0);
  });

  it('should filter managers by search query', () => {
    component.managerSearchQuery = 'Ali';
    const filtered = component.filteredManagers;
    expect(filtered.every(m => m.toLowerCase().includes('ali'))).toBeTrue();
  });

  it('toggleStatusFilter should update selection and emit', () => {
    spyOn(component['filtersChanged'], 'emit');
    component.toggleStatusFilter('Active');
    expect(component.selectedStatuses).toContain('Active');
    expect(component['filtersChanged'].emit).toHaveBeenCalled();
  });

});
