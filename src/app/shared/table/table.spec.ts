import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Table, TableColumn, ActionItem } from './table';

describe('Table Component', () => {
  let component: Table;
  let fixture: ComponentFixture<Table>;

  const mockColumns: TableColumn[] = [
    { header: 'Name', field: 'name', type: 'text', sortable: true },
    { header: 'Email', field: 'email', type: 'text' },
    { header: 'Status', field: 'status', type: 'badge' },
    { 
      header: 'Actions', 
      field: 'actions', 
      type: 'actions',
      actions: [
        { label: 'Edit', icon: 'edit.svg', action: 'edit' },
        { label: 'Delete', icon: 'delete.svg', action: 'delete', class: 'danger' }
      ]
    }
  ];

  const mockData = [
    { name: 'John Doe', email: 'john@example.com', status: 'active' },
    { name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
    { name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
    { name: 'Alice Williams', email: 'alice@example.com', status: 'active' },
    { name: 'Charlie Brown', email: 'charlie@example.com', status: 'inactive' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Table, CommonModule, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Table);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.columns).toEqual([]);
      expect(component.data).toEqual([]);
      expect(component.showCheckbox).toBe(false);
      expect(component.itemsPerPage).toBe(10);
      expect(component.currentPage).toBe(1);
      expect(component.selectedRows.size).toBe(0);
      expect(component.openActionMenuIndex).toBeNull();
    });

    it('should accept input properties', () => {
      component.columns = mockColumns;
      component.data = mockData;
      component.showCheckbox = true;
      component.itemsPerPage = 5;
      
      expect(component.columns.length).toBe(4);
      expect(component.data.length).toBe(5);
      expect(component.showCheckbox).toBe(true);
      expect(component.itemsPerPage).toBe(5);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      component.data = mockData;
      component.itemsPerPage = 2;
      component.currentPage = 1;
    });

    it('should calculate total pages correctly', () => {
      expect(component.totalPages).toBe(3);
    });

    it('should return correct paginated data', () => {
      const paginated = component.paginatedData;
      expect(paginated.length).toBe(2);
      expect(paginated[0].name).toBe('John Doe');
      expect(paginated[1].name).toBe('Jane Smith');
    });

    it('should calculate start index correctly', () => {
      component.currentPage = 2;
      expect(component.startIndex).toBe(3);
    });

    it('should calculate end index correctly', () => {
      component.currentPage = 2;
      expect(component.endIndex).toBe(4);
    });

    it('should navigate to next page', () => {
      component.nextPage();
      expect(component.currentPage).toBe(2);
    });

    it('should navigate to previous page', () => {
      component.currentPage = 2;
      component.previousPage();
      expect(component.currentPage).toBe(1);
    });

    it('should not go below page 1', () => {
      component.currentPage = 1;
      component.previousPage();
      expect(component.currentPage).toBe(1);
    });

    it('should not exceed total pages', () => {
      component.currentPage = 3;
      component.nextPage();
      expect(component.currentPage).toBe(3);
    });

    it('should go to specific page', () => {
      component.goToPage(2);
      expect(component.currentPage).toBe(2);
    });

    it('should not go to invalid page number', () => {
      component.currentPage = 1;
      component.goToPage(5);
      expect(component.currentPage).toBe(1);
      
      component.goToPage(0);
      expect(component.currentPage).toBe(1);
    });

    it('should handle last page with fewer items', () => {
      component.currentPage = 3;
      const paginated = component.paginatedData;
      expect(paginated.length).toBe(1);
      expect(component.endIndex).toBe(5);
    });
  });

  describe('Row Selection', () => {
    beforeEach(() => {
      component.data = mockData;
      component.itemsPerPage = 10;
      component.showCheckbox = true;
      component.selectedRows.clear();
    });

    it('should select a row', () => {
      component.toggleRow(0);
      expect(component.isRowSelected(0)).toBe(true);
      expect(component.selectedRows.size).toBe(1);
    });

    it('should deselect a selected row', () => {
      component.toggleRow(0);
      expect(component.isRowSelected(0)).toBe(true);
      
      component.toggleRow(0);
      expect(component.isRowSelected(0)).toBe(false);
      expect(component.selectedRows.size).toBe(0);
    });

    it('should select multiple rows', () => {
      component.toggleRow(0);
      component.toggleRow(1);
      component.toggleRow(2);
      
      expect(component.selectedRows.size).toBe(3);
      expect(component.isRowSelected(0)).toBe(true);
      expect(component.isRowSelected(1)).toBe(true);
      expect(component.isRowSelected(2)).toBe(true);
    });

    it('should select all rows on current page', () => {
      component.itemsPerPage = 3;
      component.toggleAll();
      
      expect(component.selectedRows.size).toBe(3);
    });

    it('should deselect all rows when all are selected', () => {
      component.itemsPerPage = 3;
      component.toggleAll();
      expect(component.selectedRows.size).toBe(3);
      
      component.toggleAll();
      expect(component.selectedRows.size).toBe(0);
    });

    it('should emit selection change event', () => {
      spyOn(component.selectionChange, 'emit');
      
      component.toggleRow(0);
      
      expect(component.selectionChange.emit).toHaveBeenCalled();
    });

    it('should emit correct selected data', () => {
      spyOn(component.selectionChange, 'emit');
      
      component.toggleRow(0);
      component.toggleRow(1);
      
      const expectedData = [mockData[0], mockData[1]];
      expect(component.selectionChange.emit).toHaveBeenCalledWith(expectedData);
    });
  });

  describe('Badge Styling', () => {
    beforeEach(() => {
      component.columns = mockColumns;
    });

    it('should return correct class for active status', () => {
      const column = mockColumns.find(col => col.field === 'status')!;
      const badgeClass = component.getBadgeClass('active', column);
      
      expect(badgeClass).toContain('bg-green-100 text-green-800');
    });

    it('should return correct class for inactive status', () => {
      const column = mockColumns.find(col => col.field === 'status')!;
      const badgeClass = component.getBadgeClass('inactive', column);
      
      expect(badgeClass).toContain('bg-gray-100 text-gray-800');
    });

    it('should use custom badge colors if provided', () => {
      const customColumn: TableColumn = {
        header: 'Status',
        field: 'status',
        type: 'badge',
        badgeColors: {
          'active': 'bg-blue-500 text-white'
        }
      };
      
      const badgeClass = component.getBadgeClass('active', customColumn);
      expect(badgeClass).toContain('bg-blue-500 text-white');
    });

    it('should return default class for unknown status', () => {
      const column = mockColumns.find(col => col.field === 'status')!;
      const badgeClass = component.getBadgeClass('unknown', column);
      
      expect(badgeClass).toContain('bg-gray-100 text-gray-800');
    });

    it('should always include base classes', () => {
      const column = mockColumns.find(col => col.field === 'status')!;
      const badgeClass = component.getBadgeClass('active', column);
      
      expect(badgeClass).toContain('px-2 py-1 rounded text-xs font-medium');
    });
  });

  describe('Actions Menu', () => {
    beforeEach(() => {
      component.openActionMenuIndex = null;
    });

    it('should toggle actions menu open', () => {
      component.toggleActionsMenu(0);
      expect(component.openActionMenuIndex).toBe(0);
    });

    it('should toggle actions menu closed', () => {
      component.openActionMenuIndex = 0;
      component.toggleActionsMenu(0);
      expect(component.openActionMenuIndex).toBeNull();
    });

    it('should close previous menu when opening new one', () => {
      component.toggleActionsMenu(0);
      expect(component.openActionMenuIndex).toBe(0);
      
      component.toggleActionsMenu(1);
      expect(component.openActionMenuIndex).toBe(1);
    });

    it('should close actions menu', () => {
      component.openActionMenuIndex = 0;
      component.closeActionsMenu();
      expect(component.openActionMenuIndex).toBeNull();
    });

    it('should identify last row correctly', () => {
      component.data = mockData;
      component.itemsPerPage = 3;
      
      expect(component.isLastRows(2)).toBe(true);
      expect(component.isLastRows(0)).toBe(false);
      expect(component.isLastRows(1)).toBe(false);
    });
  });

  describe('Action Handling', () => {
    beforeEach(() => {
      component.data = mockData;
    });

    it('should emit action click event', () => {
      spyOn(component.actionClick, 'emit');
      
      const row = mockData[0];
      component.handleAction('edit', row);
      
      expect(component.actionClick.emit).toHaveBeenCalledWith({
        action: 'edit',
        row: row
      });
    });

    it('should get danger class for delete action', () => {
      const actionClass = component.getActionClass('danger');
      expect(actionClass).toBe('text-red-600 hover:bg-red-50');
    });

    it('should get default class for normal action', () => {
      const actionClass = component.getActionClass();
      expect(actionClass).toBe('text-gray-700');
    });

    it('should get default class for undefined custom class', () => {
      const actionClass = component.getActionClass(undefined);
      expect(actionClass).toBe('text-gray-700');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data array', () => {
      component.data = [];
      component.itemsPerPage = 10;
      
      expect(component.paginatedData).toEqual([]);
      expect(component.totalPages).toBe(0);
      expect(component.startIndex).toBe(1);
      expect(component.endIndex).toBe(0);
    });

    it('should handle single item data', () => {
      component.data = [mockData[0]];
      component.itemsPerPage = 10;
      
      expect(component.paginatedData.length).toBe(1);
      expect(component.totalPages).toBe(1);
      expect(component.endIndex).toBe(1);
    });

    it('should handle itemsPerPage larger than data length', () => {
      component.data = mockData;
      component.itemsPerPage = 100;
      
      expect(component.paginatedData.length).toBe(5);
      expect(component.totalPages).toBe(1);
    });

    it('should handle selection with pagination change', () => {
      component.data = mockData;
      component.itemsPerPage = 2;
      component.currentPage = 1;
      
      // Select first row on page 1
      component.toggleRow(0);
      expect(component.selectedRows.has(0)).toBe(true);
      
      // Change to page 2
      component.currentPage = 2;
      
      // Selection should persist
      expect(component.selectedRows.has(0)).toBe(true);
    });

    it('should handle null or undefined badge value', () => {
      const column: TableColumn = {
        header: 'Status',
        field: 'status',
        type: 'badge'
      };
      
      const badgeClass = component.getBadgeClass(null as any, column);
      expect(badgeClass).toContain('bg-gray-100 text-gray-800');
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      component.columns = mockColumns;
      component.data = mockData;
      component.showCheckbox = true;
      component.itemsPerPage = 2;
      fixture.detectChanges();
    });

    it('should render table with correct number of rows', () => {
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
    });

    it('should render checkboxes when showCheckbox is true', () => {
      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should render column headers', () => {
      const headers = fixture.nativeElement.querySelectorAll('thead th');
      // +1 for checkbox column
      expect(headers.length).toBe(mockColumns.length + 1);
    });

    it('should update view when page changes', () => {
      component.nextPage();
      fixture.detectChanges();
      
      expect(component.currentPage).toBe(2);
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
    });

    it('should show pagination controls', () => {
      const paginationButtons = fixture.nativeElement.querySelectorAll('.flex.gap-1 button');
      expect(paginationButtons.length).toBe(4); // First, Previous, Next, Last
    });

    it('should display correct item count', () => {
      const itemCount = fixture.nativeElement.querySelector('.text-sm.text-gray-700');
      expect(itemCount.textContent).toContain('Showing 1-2 of 5 items');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        status: i % 2 === 0 ? 'active' : 'inactive'
      }));
      
      component.data = largeDataset;
      component.itemsPerPage = 10;
      
      const startTime = performance.now();
      const paginated = component.paginatedData;
      const endTime = performance.now();
      
      expect(paginated.length).toBe(10);
      expect(endTime - startTime).toBeLessThan(10); // Should complete in less than 10ms
    });

    it('should handle multiple rapid selections', () => {
      component.data = mockData;
      
      for (let i = 0; i < 100; i++) {
        component.toggleRow(i % mockData.length);
      }
      
      expect(component.selectedRows.size).toBeGreaterThanOrEqual(0);
      expect(component.selectedRows.size).toBeLessThanOrEqual(mockData.length);
    });
  });
});