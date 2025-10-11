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
  
  @Output() rowSelect = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{action: string, row: any}>();
  @Output() selectionChange = new EventEmitter<any[]>();
  
  currentPage: number = 1;
  selectedRows: Set<number> = new Set();
  openActionMenuIndex: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clearSelections'] && changes['clearSelections'].currentValue === true) {
      this.selectedRows.clear();
      this.emitSelectionChange();
    }
    
    // When data changes, clear selections that are out of bounds
    if (changes['data'] && this.selectedRows.size > 0) {
      const validIndices = new Set<number>();
      this.selectedRows.forEach(index => {
        if (index < this.data.length) {
          validIndices.add(index);
        }
      });
      this.selectedRows = validIndices;
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

      if (allSelected) {
        // All selected - deselect all
        this.selectedRows.clear();
      } else if (someSelected) {
        // Some selected (indeterminate/dash) - deselect all
        this.selectedRows.clear();
      } else {
        // None selected - select all items across all pages
        this.selectedRows.clear();
        for (let i = 0; i < this.data.length; i++) {
          this.selectedRows.add(i);
        }
      }
    } else {
      // Select/deselect only current page
      const allOnPageSelected = this.selectedRows.size === this.paginatedData.length;
      const someOnPageSelected = this.selectedRows.size > 0 && this.selectedRows.size < this.paginatedData.length;

      if (allOnPageSelected) {
        // All on page selected - deselect all
        this.selectedRows.clear();
      } else if (someOnPageSelected) {
        // Some on page selected (indeterminate/dash) - deselect all
        this.selectedRows.clear();
      } else {
        // None on page selected - select all on current page
        this.selectedRows.clear();
        for (let i = 0; i < this.paginatedData.length; i++) {
          this.selectedRows.add(i);
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
    if (this.selectAllAcrossPages) {
      // When selecting across pages, convert paginated index to global index
      rowIndex = (this.currentPage - 1) * this.itemsPerPage + index;
    } else {
      // When selecting per page, use paginated index directly
      rowIndex = index;
    }

    if (this.selectedRows.has(rowIndex)) {
      this.selectedRows.delete(rowIndex);
    } else {
      this.selectedRows.add(rowIndex);
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
