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

  @Input() status: string = '';
  @Output() statusChange = new EventEmitter<string>();

  @Output() projectNameChange = new EventEmitter<string>();
  @Output() projectKeyChange = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();
  @Output() priorityChange = new EventEmitter<string>();

  statusOptions = [
    { value: '', label: 'Select status', color: '' },
    { value: 'inprogress', label: 'In Progress', color: '#2196F3' },
    { value: 'completed', label: 'Completed', color: '#4CAF50' },
    { value: 'pending', label: 'Pending', color: '#FF9800' },
    { value: 'archived', label: 'Archived', color: '#9E9E9E' }
  ];

  statusDropdownOpen = false;

  get selectedStatus() {
    return this.statusOptions.find(opt => opt.value === this.status) || this.statusOptions[0];
  }

  toggleStatusDropdown() {
    this.statusDropdownOpen = !this.statusDropdownOpen;
  }

  selectStatus(value: string) {
    this.status = value;
    this.statusChange.emit(this.status);
    this.statusDropdownOpen = false;
  }

  priorityOptions = [
    { value: '', label: 'Select priority', color: '' },
    { value: 'high', label: 'High', color: '#F44336' },
    { value: 'medium', label: 'Medium', color: '#FFC107' },
    { value: 'low', label: 'Low', color: '#4CAF50' }
  ];

  priorityDropdownOpen = false;

  get selectedPriority() {
    return this.priorityOptions.find(opt => opt.value === this.priority) || this.priorityOptions[0];
  }

  togglePriorityDropdown() {
    this.priorityDropdownOpen = !this.priorityDropdownOpen;
  }

  selectPriority(value: string) {
    this.priority = value;
    this.priorityChange.emit(this.priority);
    this.priorityDropdownOpen = false;
  }

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