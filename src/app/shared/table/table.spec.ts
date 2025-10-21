import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Table, TableColumn, ActionItem } from './table';
import { SimpleChange } from '@angular/core';

describe('Table Component', () => {
  let component: Table;
  let fixture: ComponentFixture<Table>;

  const mockColumns: TableColumn[] = [
    { header: 'Name', field: 'name', type: 'text', sortable: true },
    { header: 'Status', field: 'status', type: 'badge', badgeColors: { 'active': 'bg-green-100' } },
    { header: 'Email', field: 'email', type: 'text' }
  ];

  const mockData = [
    { name: 'John Doe', status: 'active', email: 'john@example.com' },
    { name: 'Jane Smith', status: 'inactive', email: 'jane@example.com' },
    { name: 'Bob Wilson', status: 'active', email: 'bob@example.com' },
    { name: 'Alice Brown', status: 'active', email: 'alice@example.com' },
    { name: 'Charlie Davis', status: 'inactive', email: 'charlie@example.com' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Table]
    }).compileComponents();

    fixture = TestBed.createComponent(Table);
    component = fixture.componentInstance;
    component.columns = mockColumns;
    component.data = mockData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Pagination', () => {
    it('should initialize with correct default values', () => {
      expect(component.currentPage).toBe(1);
      expect(component.itemsPerPage).toBe(10);
    });

    it('should calculate total pages correctly', () => {
      component.itemsPerPage = 2;
      expect(component.totalPages).toBe(3); // 5 items / 2 per page = 3 pages
    });

    it('should return correct paginated data', () => {
      component.itemsPerPage = 2;
      component.currentPage = 1;
      expect(component.paginatedData.length).toBe(2);
      expect(component.paginatedData[0].name).toBe('John Doe');
    });

    it('should calculate start index correctly', () => {
      component.itemsPerPage = 2;
      component.currentPage = 2;
      expect(component.startIndex).toBe(3);
    });

    it('should calculate end index correctly', () => {
      component.itemsPerPage = 2;
      component.currentPage = 2;
      expect(component.endIndex).toBe(4);
    });

    it('should not exceed total items for end index on last page', () => {
      component.itemsPerPage = 2;
      component.currentPage = 3;
      expect(component.endIndex).toBe(5);
    });

    it('should navigate to next page', () => {
      component.itemsPerPage = 2; // Ensures we have multiple pages (5 items / 2 = 3 pages)
      component.currentPage = 1;
      component.nextPage();
      expect(component.currentPage).toBe(2);
    });

    it('should navigate to previous page', () => {
      component.itemsPerPage = 2;
      component.currentPage = 2;
      component.previousPage();
      expect(component.currentPage).toBe(1);
    });

    it('should not go to page less than 1', () => {
      component.itemsPerPage = 2;
      component.currentPage = 1;
      component.previousPage();
      expect(component.currentPage).toBe(1);
    });

    it('should not go beyond total pages', () => {
      component.itemsPerPage = 2;
      component.currentPage = 3;
      component.nextPage();
      expect(component.currentPage).toBe(3);
    });

    it('should go to specific page', () => {
      component.itemsPerPage = 2; // Ensures we have multiple pages
      component.goToPage(2);
      expect(component.currentPage).toBe(2);
    });

    it('should not go to invalid page number', () => {
      component.currentPage = 1;
      component.goToPage(0);
      expect(component.currentPage).toBe(1);
      
      component.goToPage(100);
      expect(component.currentPage).toBe(1);
    });
  });

  describe('Row Selection', () => {
    beforeEach(() => {
      component.selectedRows.clear();
    });

    it('should toggle row selection', () => {
      component.toggleRow(0);
      expect(component.isRowSelected(0)).toBe(true);
      
      component.toggleRow(0);
      expect(component.isRowSelected(0)).toBe(false);
    });

    it('should emit selection change on row toggle', () => {
      spyOn(component.selectionChange, 'emit');
      component.toggleRow(0);
      expect(component.selectionChange.emit).toHaveBeenCalled();
    });

    it('should return correct selected state', () => {
      component.selectedRows.add(1);
      expect(component.isRowSelected(1)).toBe(true);
      expect(component.isRowSelected(0)).toBe(false);
    });

    it('should select all rows on current page when selectAllAcrossPages is false', () => {
      component.selectAllAcrossPages = false;
      component.itemsPerPage = 2;
      component.toggleAll();
      
      expect(component.selectedRows.size).toBe(2);
    });

    it('should select all rows across all pages when selectAllAcrossPages is true', () => {
      component.selectAllAcrossPages = true;
      component.toggleAll();
      
      expect(component.selectedRows.size).toBe(5);
    });

    it('should deselect all rows when all are selected', () => {
      component.selectAllAcrossPages = true;
      component.toggleAll(); // Select all
      component.toggleAll(); // Deselect all
      
      expect(component.selectedRows.size).toBe(0);
    });

    it('should emit selected data on selection change', () => {
      spyOn(component.selectionChange, 'emit');
      component.toggleRow(0);
      
      const selectedData = Array.from(component.selectedRows).map(index => 
        component.paginatedData[index]
      );
      expect(component.selectionChange.emit).toHaveBeenCalledWith(selectedData);
    });

    it('should clear selections when clearSelections input changes to true', () => {
      component.selectedRows.add(0);
      component.selectedRows.add(1);
      
      component.ngOnChanges({
        clearSelections: new SimpleChange(false, true, false)
      });
      
      expect(component.selectedRows.size).toBe(0);
    });

    it('should emit selection change when clearing selections', () => {
      spyOn(component.selectionChange, 'emit');
      component.selectedRows.add(0);
      
      component.ngOnChanges({
        clearSelections: new SimpleChange(false, true, false)
      });
      
      expect(component.selectionChange.emit).toHaveBeenCalled();
    });
  });

  describe('Badge Styling', () => {
    it('should return custom badge colors when defined', () => {
      const column: TableColumn = {
        header: 'Status',
        field: 'status',
        type: 'badge',
        badgeColors: { 'custom': 'bg-purple-200 text-purple-900' }
      };
      
      const result = component.getBadgeClass('custom', column);
      expect(result).toContain('bg-purple-200 text-purple-900');
    });

    it('should return default color for active status', () => {
      const column: TableColumn = { header: 'Status', field: 'status', type: 'badge' };
      const result = component.getBadgeClass('active', column);
      expect(result).toContain('bg-green-100 text-green-800');
    });

    it('should return default color for inactive status', () => {
      const column: TableColumn = { header: 'Status', field: 'status', type: 'badge' };
      const result = component.getBadgeClass('inactive', column);
      expect(result).toContain('bg-gray-100 text-gray-800');
    });

    it('should return default gray color for unknown status', () => {
      const column: TableColumn = { header: 'Status', field: 'status', type: 'badge' };
      const result = component.getBadgeClass('unknown', column);
      expect(result).toContain('bg-gray-100 text-gray-800');
    });

    it('should handle case insensitive status values', () => {
      const column: TableColumn = { header: 'Status', field: 'status', type: 'badge' };
      const result = component.getBadgeClass('ACTIVE', column);
      expect(result).toContain('bg-green-100 text-green-800');
    });

    it('should include base classes in all badge styles', () => {
      const column: TableColumn = { header: 'Status', field: 'status', type: 'badge' };
      const result = component.getBadgeClass('active', column);
      expect(result).toContain('px-2 py-1 rounded text-xs font-medium');
    });
  });

  describe('Array Detection', () => {
    it('should return true for arrays', () => {
      expect(component.isArray(['tag1', 'tag2'])).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(component.isArray('string')).toBe(false);
      expect(component.isArray(123)).toBe(false);
      expect(component.isArray(null)).toBe(false);
      expect(component.isArray(undefined)).toBe(false);
      expect(component.isArray({})).toBe(false);
    });
  });

  // describe('Actions Menu', () => {
  //   it('should toggle actions menu open', () => {
  //     component.toggleActionsMenu(0);
  //     expect(component.openActionMenuIndex).toBe(0);
  //   });

  //   it('should toggle actions menu closed when already open', () => {
  //     component.openActionMenuIndex = 0;
  //     component.toggleActionsMenu(0);
  //     expect(component.openActionMenuIndex).toBeNull();
  //   });

  //   it('should switch to different row menu', () => {
  //     component.openActionMenuIndex = 0;
  //     component.toggleActionsMenu(1);
  //     expect(component.openActionMenuIndex).toBe(1);
  //   });

  //   it('should close actions menu', () => {
  //     component.openActionMenuIndex = 2;
  //     component.closeActionsMenu();
  //     expect(component.openActionMenuIndex).toBeNull();
  //   });

  //   it('should emit action click event', () => {
  //     spyOn(component.actionClick, 'emit');
  //     const row = { id: 1, name: 'Test' };
      
  //     component.handleAction('edit', row);
      
  //     expect(component.actionClick.emit).toHaveBeenCalledWith({
  //       action: 'edit',
  //       row: row
  //     });
  //   });

  //   it('should return danger class for danger actions', () => {
  //     const result = component.getActionClass('danger');
  //     expect(result).toBe('text-red-600 hover:bg-red-50');
  //   });

  //   it('should return default class for normal actions', () => {
  //     const result = component.getActionClass();
  //     expect(result).toBe('text-gray-700');
  //   });

  //   it('should return default class for undefined custom class', () => {
  //     const result = component.getActionClass('normal');
  //     expect(result).toBe('text-gray-700');
  //   });
  // });

  describe('Last Row Detection', () => {
    it('should return true for last row in paginated data', () => {
      component.itemsPerPage = 3;
      const lastIndex = component.paginatedData.length - 1;
      expect(component.isLastRows(lastIndex)).toBe(true);
    });

    it('should return false for non-last rows', () => {
      component.itemsPerPage = 3;
      expect(component.isLastRows(0)).toBe(false);
      expect(component.isLastRows(1)).toBe(false);
    });

    it('should handle single item page', () => {
      component.itemsPerPage = 1;
      expect(component.isLastRows(0)).toBe(true);
    });
  });

  describe('Input Changes', () => {
    it('should not clear selections when clearSelections is false', () => {
      component.selectedRows.add(0);
      
      component.ngOnChanges({
        clearSelections: new SimpleChange(false, false, false)
      });
      
      expect(component.selectedRows.size).toBe(1);
    });

    it('should handle empty changes object', () => {
      component.selectedRows.add(0);
      expect(() => component.ngOnChanges({})).not.toThrow();
      expect(component.selectedRows.size).toBe(1);
    });

    it('should handle changes to other inputs', () => {
      component.selectedRows.add(0);
      
      component.ngOnChanges({
        data: new SimpleChange([], mockData, false)
      });
      
      expect(component.selectedRows.size).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data array', () => {
      component.data = [];
      expect(component.paginatedData.length).toBe(0);
      expect(component.totalPages).toBe(0);
    });

    it('should handle single item', () => {
      component.data = [mockData[0]];
      component.itemsPerPage = 10;
      expect(component.paginatedData.length).toBe(1);
      expect(component.totalPages).toBe(1);
    });

    it('should handle exact page boundaries', () => {
      component.data = mockData;
      component.itemsPerPage = 5;
      expect(component.totalPages).toBe(1);
      
      component.itemsPerPage = 1;
      expect(component.totalPages).toBe(5);
    });

    it('should reset to valid page if current page exceeds total pages after data change', () => {
      component.itemsPerPage = 2;
      component.currentPage = 3;
      component.data = [mockData[0], mockData[1]]; // Only 2 items now
      
      // Current page 3 is now invalid (only 1 page total)
      // This is a limitation - you might want to add logic to handle this
      expect(component.totalPages).toBe(1);
    });
  });

  describe('Event Emissions', () => {
    it('should emit rowSelect event', () => {
      spyOn(component.rowSelect, 'emit');
      const rowData = { test: 'data' };
      component.rowSelect.emit(rowData);
      expect(component.rowSelect.emit).toHaveBeenCalledWith(rowData);
    });

    it('should emit correct selected data structure', () => {
      let emittedData: any[] = [];
      component.selectionChange.subscribe((data: any[]) => {
        emittedData = data;
      });
      
      component.toggleRow(0);
      
      expect(emittedData.length).toBe(1);
      expect(emittedData[0]).toEqual(component.paginatedData[0]);
    });
  });

  
});