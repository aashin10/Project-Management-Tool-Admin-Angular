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
    const words = this.projectName.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}