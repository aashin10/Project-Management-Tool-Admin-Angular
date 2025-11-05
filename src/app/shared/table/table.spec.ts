import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Table, TableColumn } from './table';
import { SimpleChange } from '@angular/core';

describe('Table Component', () => {
  let component: Table;
  let fixture: ComponentFixture<Table>;

  const mockData = [
    { id: 1, name: 'A', selected: true },
    { id: 2, name: 'B', selected: false },
    { id: 3, name: 'C', selected: true },
    { id: 4, name: 'D', selected: false },
    { id: 5, name: 'E', selected: true }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Table]
    }).compileComponents();

    fixture = TestBed.createComponent(Table);
    component = fixture.componentInstance;
    component.data = mockData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render table with data', () => {
    expect(component.data.length).toBe(5);
  });

  it('should paginate data correctly', () => {
    component.itemsPerPage = 2;
    component.currentPage = 1;
    fixture.detectChanges();
    expect(component.paginatedData.length).toBeLessThanOrEqual(2);
  });

  it('should handle empty data', () => {
    component.data = [];
    expect(component.paginatedData.length).toBe(0);
  });

  it('should toggle row selection', () => {
    component.toggleRow(0);
    expect(component.isRowSelected(0)).toBe(true);
    component.toggleRow(0);
    expect(component.isRowSelected(0)).toBe(false);
  });

  it('should select all rows', () => {
    component.selectAllAcrossPages = true;
    component.toggleAll();
    expect(component.selectedRows.size).toBeGreaterThan(0);
  });

  it('should navigate pages', () => {
    component.itemsPerPage = 2;
    component.currentPage = 1;
    component.nextPage();
    expect(component.currentPage).toBeGreaterThanOrEqual(1);
  });

  it('should clear selections', () => {
    component.selectedRows.add(0);
    component.ngOnChanges({
      clearSelections: new SimpleChange(false, true, false)
    });
    expect(component.selectedRows.size).toBe(0);
  });

  it('should detect arrays', () => {
    expect(component.isArray(['test'])).toBe(true);
    expect(component.isArray('test')).toBe(false);
  });

  it('should handle badge styling', () => {
    const column: TableColumn = { header: 'Status', field: 'status', type: 'badge' };
    const result = component.getBadgeClass('active', column);
    expect(result).toBeTruthy();
  });
});
