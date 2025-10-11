import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  header: string;
  field: string;
  type?: 'text' | 'badge' | 'avatar' | 'user' | 'actions'|'roleIcon';
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right'; // Text alignment
  icon?: string; // Icon path for text type
  badgeColors?: { [key: string]: string }; // For different badge colors
  actions?:ActionItem [];
}
export interface ActionItem {
  label: string;
  icon?: string;
  action: string;
  class?: string; // For styling (e.g., danger for delete)
}

@Component({
  selector: 'app-table',
  imports: [CommonModule,FormsModule],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class Table implements OnChanges, AfterViewChecked {

  @ViewChild('selectAllCheckbox') selectAllCheckbox!: ElementRef<HTMLInputElement>;

 isLastRows(index: number): boolean {
  // Show dropdown above only for the last row
  return index === this.paginatedData.length - 1;
}

  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showCheckbox: boolean = false;
  @Input() itemsPerPage: number = 10;
  @Input() selectAllAcrossPages: boolean = false;
  @Input() clearSelections: boolean = false;
  @Input() rowClickAction: 'navigate' | 'select' = 'select';
  
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

    // When data changes, reinitialize selections based on data items' selected property
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

      // When all selected, show indeterminate (dash) like many UI libraries do
      // When some selected, show indeterminate (dash)
      // When none selected, show unchecked
      checkbox.indeterminate = isIndeterminate || allSelected;
      checkbox.checked = false;
    }
  }

  

  get paginatedData() {
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
      // Select/deselect all items across all pages
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
        // None selected - select all items across all pages
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
      // Select/deselect only current page
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

  toggleRow(index: number) {
    let rowIndex: number;
    let dataIndex: number;
    if (this.selectAllAcrossPages) {
      // When selecting across pages, convert paginated index to global index
      rowIndex = (this.currentPage - 1) * this.itemsPerPage + index;
      dataIndex = rowIndex;
    } else {
      // When selecting per page, use paginated index directly
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
      // When selecting across pages, convert paginated index to global index
      const globalIndex = (this.currentPage - 1) * this.itemsPerPage + index;
      return this.selectedRows.has(globalIndex);
    } else {
      // When selecting per page, use paginated index directly
      return this.selectedRows.has(index);
    }
  }
  
  emitSelectionChange() {
    let selectedData;
    if (this.selectAllAcrossPages) {
      // When selecting across pages, selectedRows contains global indices
      selectedData = Array.from(this.selectedRows).map(index => this.data[index]);
    } else {
      // When selecting per page, selectedRows contains paginated indices
      selectedData = Array.from(this.selectedRows).map(index => this.paginatedData[index]);
    }
    this.selectionChange.emit(selectedData);
  }

  getBadgeClass(value: string, column: TableColumn): string {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    
    if (column.badgeColors && column.badgeColors[value]) {
      return `${baseClasses} ${column.badgeColors[value]}`;
    }

   
    
    // Default colors
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
  

  // ... existing methods

  toggleActionsMenu(index: number) {
    if (this.openActionMenuIndex === index) {
      this.openActionMenuIndex = null;
    } else {
      this.openActionMenuIndex = index;
    }
  }

  closeActionsMenu() {
    this.openActionMenuIndex = null;
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
}


function isLastRows(index: any, number: any) {
  throw new Error('Function not implemented.');

}
