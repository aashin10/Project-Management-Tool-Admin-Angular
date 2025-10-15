import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomButton } from '../../../../shared/custom-button/custom-button';


@Component({
  selector: 'app-project-preview',
  standalone: true,
  imports: [CommonModule, CustomButton],
  templateUrl: './projectpreview.html',
  styleUrl: './projectpreview.css'
})
export class ProjectPreviewComponent {
  @Input() projectName: string = '';
  @Input() projectKey: string = '';
  @Input() organisationName: string = '';
  @Input() pocEmail: string = '';
  @Input() phoneNumber: string = '';
  @Input() manager: string = '';
  @Input() deliveryUnit: string = '';
  @Input() mode: 'create' | 'edit' = 'create'; // New input for mode

  @Output() createProject = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get buttonLabel(): string {
    return this.mode === 'edit' ? 'Update Project' : 'Create Project';
  }

  get buttonIcon(): string {
    return this.mode === 'edit' ? '/images/edit.svg' : '/images/plus.svg';
  }

  get canCreate(): boolean {
    // required fields across Basic, Team and Customer sections:
    // Basic: projectName, projectKey
    // Team: manager, deliveryUnit
    // Customer: organisationName, pocEmail, phoneNumber
    const basic = !!(this.projectName && this.projectName.trim() && this.projectKey && this.projectKey.trim());
    const team = !!(this.manager && this.manager.trim() && this.deliveryUnit && this.deliveryUnit.trim());
    const customer = !!(this.organisationName && this.organisationName.trim() && this.pocEmail && this.pocEmail.trim() && this.phoneNumber && this.phoneNumber.trim());
    return basic && team && customer;
  }

  get missingFields(): string[] {
    const missing: string[] = [];
    if (!this.projectName || !this.projectName.trim()) missing.push('Project Name');
    if (!this.projectKey || !this.projectKey.trim()) missing.push('Project Key');
    if (!this.manager || !this.manager.trim()) missing.push('Project Manager');
    if (!this.deliveryUnit || !this.deliveryUnit.trim()) missing.push('Delivery Unit');
    if (!this.organisationName || !this.organisationName.trim()) missing.push('Organisation Name');
    if (!this.pocEmail || !this.pocEmail.trim()) missing.push('POC Email');
    if (!this.phoneNumber || !this.phoneNumber.trim()) missing.push('Phone Number');
    return missing;
  }

  getInitials(): string {
    if (!this.projectName) {
      return 'PN';
    }
    const words = this.projectName.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 0) {
      return 'PN';
    }
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    // Safe access to avoid undefined character access
    const firstChar = words[0] && words[0][0] ? words[0][0] : 'P';
    const secondChar = words[1] && words[1][0] ? words[1][0] : 'N';
    return (firstChar + secondChar).toUpperCase();
  }
}