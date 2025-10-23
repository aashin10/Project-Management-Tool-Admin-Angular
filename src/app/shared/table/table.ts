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

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class Table implements OnChanges, AfterViewChecked {
  @ViewChild('selectAllCheckbox') selectAllCheckbox!: ElementRef<HTMLInputElement>;

  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showCheckbox: boolean = false;
  @Input() itemsPerPage: number = 10;
  @Input() selectAllAcrossPages: boolean = false;
  @Input() clearSelections: boolean = false;
  @Input() rowClickAction: 'navigate' | 'select' = 'select';
  @Input() resetPagination: boolean = false;
  
  @Output() rowSelect = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{action: string, row: any}>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() rowClick = new EventEmitter<{row: any, index: number}>();
  
  currentPage: number = 1;
  selectedRows: Set<number> = new Set();
  openActionMenuIndex: number | null = null;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clearSelections'] && changes['clearSelections'].currentValue === true) {
      this.selectedRows.clear();
      this.emitSelectionChange();
    }

    // Reset pagination when explicitly requested (e.g., when filters are applied)
    if (changes['resetPagination'] && changes['resetPagination'].currentValue === true) {
      this.currentPage = 1;
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

  get paginatedData() {
    const totalPages = this.totalPages;
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages || 1;
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.data.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.data.length / this.itemsPerPage);
  }

  get startIndex() {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex() {
    return Math.min(this.currentPage * this.itemsPerPage, this.data.length);
  }

  isAllSelected(): boolean {
    if (this.selectAllAcrossPages) {
      return this.selectedRows.size === this.data.length;
    } else {
      return this.selectedRows.size === this.paginatedData.length;
    }
  }

  isSomeSelected(): boolean {
    const selectedCount = this.selectedRows.size;
    if (this.selectAllAcrossPages) {
      return selectedCount > 0 && selectedCount < this.data.length;
    } else {
      return selectedCount > 0 && selectedCount < this.paginatedData.length;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  toggleAll() {
    if (this.selectAllAcrossPages) {
      const allSelected = this.selectedRows.size === this.data.length;
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
        this.selectedRows.clear();
        for (let i = 0; i < this.data.length; i++) {
          this.selectedRows.add(i);
          // Update data item
          if (this.data && this.data[i]) {
            this.data[i].selected = true;
          }
        }
      }
    } else {
      const allOnPageSelected = this.selectedRows.size === this.paginatedData.length;
      const someOnPageSelected = this.selectedRows.size > 0 && this.selectedRows.size < this.paginatedData.length;

      if (allOnPageSelected || someOnPageSelected) {
        // All or some on page selected - deselect all on page
        // Clear selections for current page items
        const pageStart = (this.currentPage - 1) * this.itemsPerPage;
        for (let i = 0; i < this.paginatedData.length; i++) {
          const globalIndex = pageStart + i;
          this.selectedRows.delete(globalIndex);
          // Update data item
          if (this.data && this.data[globalIndex]) {
            this.data[globalIndex].selected = false;
          }
        }
      } else {
        // None on page selected - select all on current page
        const pageStart = (this.currentPage - 1) * this.itemsPerPage;
        for (let i = 0; i < this.paginatedData.length; i++) {
          const globalIndex = pageStart + i;
          this.selectedRows.add(globalIndex);
          // Update data item
          if (this.data && this.data[globalIndex]) {
            this.data[globalIndex].selected = true;
          }
        }
      }
    }
    this.emitSelectionChange();
    this.updateCheckboxState();
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
  }

  toggleRow(index: number) {
    let rowIndex: number;
    let dataIndex: number;
    if (this.selectAllAcrossPages) {
      rowIndex = (this.currentPage - 1) * this.itemsPerPage + index;
      dataIndex = rowIndex;
    } else {
      rowIndex = index;
      dataIndex = (this.currentPage - 1) * this.itemsPerPage + index;
    }

    if (this.selectedRows.has(rowIndex)) {
      this.selectedRows.delete(rowIndex);
      // Update the data item's selected property
      if (this.data && this.data[dataIndex]) {
        this.data[dataIndex].selected = false;
      }
    } else {
      this.selectedRows.add(rowIndex);
      // Update the data item's selected property
      if (this.data && this.data[dataIndex]) {
        this.data[dataIndex].selected = true;
      }
    }
    this.emitSelectionChange();
  }

  isRowSelected(index: number): boolean {
    if (this.selectAllAcrossPages) {
      const globalIndex = (this.currentPage - 1) * this.itemsPerPage + index;
      return this.selectedRows.has(globalIndex);
    } else {
      return this.selectedRows.has(index);
    }
  }
  
  emitSelectionChange() {
    let selectedData;
    if (this.selectAllAcrossPages) {
      selectedData = Array.from(this.selectedRows).map(index => this.data[index]);
    } else {
      selectedData = Array.from(this.selectedRows).map(index => this.paginatedData[index]);
    }
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
      // For navigation tables (like projects list), always emit rowClick for navigation
      this.rowClick.emit({ row, index });
    } else {
      // For selection tables, toggle selection on row click
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
    return index === this.paginatedData.length - 1;
  }
}