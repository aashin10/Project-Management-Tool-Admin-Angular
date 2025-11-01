import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  header: string;
  field: string;
  type?: 'text' | 'badge' | 'avatar' | 'user' | 'actions' | 'roleIcon';
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  icon?: string;
  iconPosition?: 'left' | 'right';
  badgeColors?: { [key: string]: string };
  actions?: ActionItem[];
}

export interface ActionItem {
  label: string;
  icon?: string;
  action: string;
  class?: string;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Component({
  selector: 'app-paginated-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paginated-table.html',
  styleUrl: './paginated-table.css'
})
export class PaginatedTable implements OnChanges, AfterViewChecked {
  @ViewChild('selectAllCheckbox') selectAllCheckbox!: ElementRef<HTMLInputElement>;

  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showCheckbox: boolean = false;
  @Input() pagination: PaginationState = {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0
  };
  @Input() loading: boolean = false;
  @Input() selectAllAcrossPages: boolean = false;
  @Input() clearSelections: boolean = false;
  @Input() rowClickAction: 'navigate' | 'select' = 'select';
  
  @Output() rowSelect = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{action: string, row: any}>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() rowClick = new EventEmitter<{row: any, index: number}>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{sortBy: string, sortOrder: 'asc' | 'desc'}>();
  
  selectedRows: Set<number> = new Set();
  openActionMenuIndex: number | null = null;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clearSelections'] && changes['clearSelections'].currentValue === true) {
      this.selectedRows.clear();
      this.emitSelectionChange();
    }

    // When data changes, reinitialize selections
    if (changes['data']) {
      // Clear existing selections
      this.selectedRows.clear();

      // Initialize selection state based on data items that have selected property
      if (this.data && this.data.length > 0) {
        this.data.forEach((item, index) => {
          if (item.selected) {
            this.selectedRows.add(index);
          }
        });
      }
    }
  }

  ngAfterViewChecked(): void {
    this.updateCheckboxState();
  }

  private updateCheckboxState(): void {
    if (this.selectAllCheckbox && this.showCheckbox) {
      const checkbox = this.selectAllCheckbox.nativeElement;
      const isIndeterminate = this.isSomeSelected();
      const allSelected = this.isAllSelected();

      checkbox.indeterminate = isIndeterminate || allSelected;
      checkbox.checked = false;
    }
  }

  get totalPages() {
    return Math.ceil(this.pagination.totalCount / this.pagination.pageSize);
  }

  get startIndex() {
    if (this.pagination.totalCount === 0) return 0;
    return (this.pagination.currentPage - 1) * this.pagination.pageSize + 1;
  }

  get endIndex() {
    return Math.min(this.pagination.currentPage * this.pagination.pageSize, this.pagination.totalCount);
  }

  isAllSelected(): boolean {
    if (this.selectAllAcrossPages) {
      return this.selectedRows.size === this.pagination.totalCount;
    } else {
      return this.data.length > 0 && this.selectedRows.size === this.data.length;
    }
  }

  isSomeSelected(): boolean {
    const selectedCount = this.selectedRows.size;
    if (this.selectAllAcrossPages) {
      return selectedCount > 0 && selectedCount < this.pagination.totalCount;
    } else {
      return selectedCount > 0 && selectedCount < this.data.length;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.pagination.currentPage) {
      this.pageChange.emit(page);
    }
  }

  toggleAll() {
    if (this.selectAllAcrossPages) {
      const allSelected = this.selectedRows.size === this.pagination.totalCount;
      const someSelected = this.isSomeSelected();

      if (allSelected || someSelected) {
        // All or some selected - deselect all
        this.selectedRows.clear();
        // Update all data items
        if (this.data) {
          this.data.forEach(item => {
            item.selected = false;
          });
        }
      } else {
        // Select all across pages - need to track this differently
        // For now, just select current page items
        this.selectedRows.clear();
        for (let i = 0; i < this.data.length; i++) {
          this.selectedRows.add(i);
          if (this.data && this.data[i]) {
            this.data[i].selected = true;
          }
        }
      }
    } else {
      const allOnPageSelected = this.data.length > 0 && this.selectedRows.size === this.data.length;
      const someOnPageSelected = this.selectedRows.size > 0 && this.selectedRows.size < this.data.length;

      if (allOnPageSelected || someOnPageSelected) {
        // All or some on page selected - deselect all on page
        for (let i = 0; i < this.data.length; i++) {
          this.selectedRows.delete(i);
          if (this.data && this.data[i]) {
            this.data[i].selected = false;
          }
        }
      } else {
        // None on page selected - select all on current page
        for (let i = 0; i < this.data.length; i++) {
          this.selectedRows.add(i);
          if (this.data && this.data[i]) {
            this.data[i].selected = true;
          }
        }
      }
    }
    this.emitSelectionChange();
    this.updateCheckboxState();
  }

  previousPage() {
    this.goToPage(this.pagination.currentPage - 1);
  }

  nextPage() {
    this.goToPage(this.pagination.currentPage + 1);
  }

  onPageSizeChange() {
    this.pageSizeChange.emit(this.pagination.pageSize);
    // Reset to page 1 when changing page size
    if (this.pagination.currentPage !== 1) {
      this.pageChange.emit(1);
    }
  }

  toggleRow(index: number) {
    if (this.selectedRows.has(index)) {
      this.selectedRows.delete(index);
      if (this.data && this.data[index]) {
        this.data[index].selected = false;
      }
    } else {
      this.selectedRows.add(index);
      if (this.data && this.data[index]) {
        this.data[index].selected = true;
      }
    }
    this.emitSelectionChange();
  }

  isRowSelected(index: number): boolean {
    return this.selectedRows.has(index);
  }
  
  emitSelectionChange() {
    const selectedData = Array.from(this.selectedRows).map(index => this.data[index]).filter(item => item);
    this.selectionChange.emit(selectedData);
  }

  getBadgeClass(value: string, column: TableColumn): string {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    
    if (column.badgeColors && column.badgeColors[value]) {
      return `${baseClasses} ${column.badgeColors[value]}`;
    }
    
    const colorMap: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'internal': 'bg-blue-100 text-blue-800',
      'external': 'bg-orange-100 text-orange-800',
      'customer': 'bg-purple-100 text-purple-800'
    };
    
    return `${baseClasses} ${colorMap[value?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`;
  }
  
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  handleAction(action: string, row: any) {
    this.actionClick.emit({ action, row });
  }

  handleRowClick(row: any, index: number) {
    if (this.rowClickAction === 'navigate') {
      this.rowClick.emit({ row, index });
    } else {
      this.toggleRow(index);
    }
  }

  getActionClass(customClass?: string): string {
    if (customClass === 'danger') {
      return 'text-red-600 hover:bg-red-50';
    }
    return 'text-gray-700';
  }

  getActionButtonClass(action: string): string {
    if (action === 'delete') {
      return 'text-red-600 hover:bg-red-50';
    }
    if (action === 'edit') {
      return 'text-blue-600 hover:bg-blue-50';
    }
    return 'text-gray-600 hover:bg-gray-50';
  }

  toggleActionsMenu(index: number): void {
    if (this.openActionMenuIndex === index) {
      this.openActionMenuIndex = null;
    } else {
      this.openActionMenuIndex = index;
    }
  }

  closeActionsMenu(): void {
    this.openActionMenuIndex = null;
  }

  isLastRows(index: number): boolean {
    return index === this.data.length - 1;
  }

  // Get visible page numbers for pagination
  getVisiblePages(): number[] {
    const currentPage = this.pagination.currentPage;
    const totalPages = this.totalPages;
    const pages: number[] = [];
    
    // Show max 5 page numbers at a time (current + 2 on each side)
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page (1 page on each side)
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add pages around current page
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push(-1);
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  }
}
