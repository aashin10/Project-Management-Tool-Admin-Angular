import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomButton } from '../../../../shared/custom-button/custom-button';

@Component({
  selector: 'app-bulk-actions',
  standalone: true,
  imports: [CommonModule, CustomButton],
  templateUrl: './bulk-actions.html',
  styleUrl: './bulk-actions.css'
})
export class BulkActions {
  @Input() selectedCount: number = 0;
  @Output() delete = new EventEmitter<void>();

  onDelete(): void {
    this.delete.emit();
  }
}
