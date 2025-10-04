// pagination.component.ts (or pagination.ts)
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class Pagination {
  // Inputs
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems: number = 0;
  @Input() startIndex: number = 0;
  @Input() endIndex: number = 0;
  @Input() rowsPerPage: number = 10;
  @Input() rowsPerPageOptions: number[] = [10, 20, 30, 50, 100];
  @Input() itemLabel: string = 'items';

  // Outputs
  @Output() rowsPerPageChange = new EventEmitter<number>();
  @Output() firstPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() lastPage = new EventEmitter<void>();

  onRowsPerPageChange(): void {
    this.rowsPerPageChange.emit(this.rowsPerPage);
  }

  onFirstPage(): void {
    if (this.currentPage !== 1) {
      this.firstPage.emit();
    }
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.previousPage.emit();
    }
  }

  onNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.nextPage.emit();
    }
  }

  onLastPage(): void {
    if (this.currentPage !== this.totalPages) {
      this.lastPage.emit();
    }
  }

  get isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  get isLastPage(): boolean {
    return this.currentPage === this.totalPages;
  }
}