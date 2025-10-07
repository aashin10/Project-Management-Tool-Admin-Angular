import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-actions-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actions-menu.html',
  styleUrl: './actions-menu.css'
})
export class ActionsMenu {
  @Input() projectId: string = '';
  @Input() isOpen: boolean = false;
  @Input() isActive: boolean = false;

  @Output() viewDetails = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() archive = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  onViewDetails(): void {
    this.viewDetails.emit(this.projectId);
  }

  onEdit(): void {
    this.edit.emit(this.projectId);
  }

  onArchive(): void {
    this.archive.emit(this.projectId);
  }

  onDelete(): void {
    this.delete.emit(this.projectId);
  }
}
