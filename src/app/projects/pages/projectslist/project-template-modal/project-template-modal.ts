// project-template-modal.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Modal } from '../../../../shared/modal/modal';
import { CustomButton } from '../../../../shared/custom-button/custom-button';

@Component({
  selector: 'app-project-template-modal',
  standalone: true,
  imports: [CommonModule, Modal, CustomButton],
  templateUrl: './project-template-modal.html',
  styleUrl: './project-template-modal.css'
})
export class ProjectTemplateModal {
  @Output() templateSelected = new EventEmitter<string>();
  @Output() closeModal = new EventEmitter<void>();

  selectTemplate(template: string): void {
    this.templateSelected.emit(template);
    this.closeModal.emit();
  }

  onClose(): void {
    this.closeModal.emit();
  }
}