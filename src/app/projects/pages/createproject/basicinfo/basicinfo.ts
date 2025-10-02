import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-basic-information',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './basicinfo.html',
  styleUrl: './basicinfo.css'
})
export class BasicInformationComponent {
  @Input() projectName: string = '';
  @Input() projectKey: string = '';
  @Input() description: string = '';
  @Input() priority: string = '';

  @Output() projectNameChange = new EventEmitter<string>();
  @Output() projectKeyChange = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();
  @Output() priorityChange = new EventEmitter<string>();

  onProjectNameChange() {
    this.projectNameChange.emit(this.projectName);
    this.generateProjectKey();
  }

  generateProjectKey() {
    if (this.projectName) {
      const cleanName = this.projectName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      this.projectKey = `${cleanName.substring(0, 3)}-001`;
    } else {
      this.projectKey = 'PRJ-001';
    }
    this.projectKeyChange.emit(this.projectKey);
  }
}