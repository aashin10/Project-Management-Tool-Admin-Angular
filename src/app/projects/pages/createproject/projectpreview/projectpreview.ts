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

  @Output() createProject = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

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