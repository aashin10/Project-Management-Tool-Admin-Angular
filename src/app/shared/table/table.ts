import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  header: string;
  field: string;
  type?: 'text' | 'badge' | 'avatar' | 'user' | 'actions'|'roleIcon';
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  icon?: string;
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
  imports: [CommonModule, FormsModule],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class Table implements OnChanges, AfterViewChecked {

  @ViewChild('selectAllCheckbox') selectAllCheckbox!: ElementRef<HTMLInputElement>;

  isLastRows(index: number): boolean {
    return index === this.paginatedData.length - 1;
  }

  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showCheckbox: boolean = false;
  @Input() itemsPerPage: number = 10;
  @Input() selectAllAcrossPages: boolean = false;
  @Input() clearSelections: boolean = false;
  @Input() selectedItems: any[] = [];
  
  @Output() rowSelect = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{action: string, row: any}>();
  @Output() selectionChange = new EventEmitter<any[]>();
  
  currentPage: number = 1;
  selectedRows: Set<number> = new Set();
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clearSelections'] && changes['clearSelections'].currentValue === true) {
      this.selectedRows.clear();
      this.emitSelectionChange();
    }
    
    if (changes['data'] && this.selectedRows.size > 0) {
      const validIndices = new Set<number>();
      this.selectedRows.forEach(index => {
        if (index < this.data.length) {
          validIndices.add(index);
        }
      });
      this.selectedRows = validIndices;
    }

    if (changes['selectedItems']) {
      this.selectedRows.clear();
      if (this.selectedItems && this.selectedItems.length > 0) {
        this.data.forEach((item, index) => {
          if (this.selectedItems.some(selectedItem => this.isItemSelected(item, selectedItem))) {
            this.selectedRows.add(index);
          }
        });
      }
      this.emitSelectionChange();
    }
  }

  private isItemSelected(item: any, selectedItem: any): boolean {
    return item.actions === selectedItem.actions;
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

      if (allSelected) {
        this.selectedRows.clear();
      } else if (someSelected) {
        this.selectedRows.clear();
      } else {
        this.selectedRows.clear();
        for (let i = 0; i < this.data.length; i++) {
          this.selectedRows.add(i);
        }
      }
    } else {
      const allOnPageSelected = this.selectedRows.size === this.paginatedData.length;
      const someOnPageSelected = this.selectedRows.size > 0 && this.selectedRows.size < this.paginatedData.length;

      if (allOnPageSelected) {
        this.selectedRows.clear();
      } else if (someOnPageSelected) {
        this.selectedRows.clear();
      } else {
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

  onItemsPerPageChange() {
    this.currentPage = 1;
  }

  toggleRow(index: number) {
    let rowIndex: number;
    if (this.selectAllAcrossPages) {
      rowIndex = (this.currentPage - 1) * this.itemsPerPage + index;
    } else {
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

  getActionClass(customClass?: string): string {
    if (customClass === 'danger') {
      return 'text-red-600 hover:bg-red-50';
    }
    return 'text-gray-700';
  }

  getActionButtonClass(action: string): string {
    if (action === 'delete') {
      return 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200';
    }
    if (action === 'edit') {
      return 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200';
    }
    return 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200';
  }
}