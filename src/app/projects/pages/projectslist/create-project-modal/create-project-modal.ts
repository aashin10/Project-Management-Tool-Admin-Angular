// create-project-modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../../../shared/modal/modal';
import { CustomButton } from '../../../../shared/custom-button/custom-button';

interface Project {
  id: string;
  name: string;
  projectCode: string;
  status: 'Active' | 'Inactive' | 'Completed';
  deliveryUnit: string;
  projectManager: string;
  teamSize: number;
  selected?: boolean;
}

@Component({
  selector: 'app-create-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, CustomButton],
  templateUrl: './create-project-modal.html',
  styleUrl: './create-project-modal.css'
})
export class CreateProjectModal implements OnInit {
  @Input() selectedTemplate: string = 'Scrum';
  @Input() projects: Project[] = [];
  @Output() createProject = new EventEmitter<{ 
    name: string; 
    projectKey: string; 
    shareWithExisting: boolean;
    selectedProject?: string;
  }>();
  @Output() cancel = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  projectName: string = '';
  projectKey: string = '';
  shareWithExisting: boolean = false;
  selectedProject: string = '';
  projectSearchQuery: string = '';
  filteredProjects: Project[] = [];

  ngOnInit(): void {
    this.filteredProjects = this.projects;
  }

  onProjectNameChange(): void {
    this.generateProjectKey();
  }

  generateProjectKey(): void {
    if (this.projectName.trim()) {
      const prefix = this.projectName.trim().substring(0, 3).toUpperCase();
      const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.projectKey = `${prefix}-${randomId}`;
    } else {
      this.projectKey = '';
    }
  }

  onCreate(): void {
    if (this.projectName.trim()) {
      this.createProject.emit({
        name: this.projectName,
        projectKey: this.projectKey,
        shareWithExisting: this.shareWithExisting,
        selectedProject: this.selectedProject
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBack(): void {
    this.back.emit();
  }

  onShareSettingsChange(): void {
    if (!this.shareWithExisting) {
      this.selectedProject = '';
    }
  }

  onProjectSearchChange(): void {
    if (this.projectSearchQuery.trim()) {
      this.filteredProjects = this.projects.filter(project =>
        project.name.toLowerCase().includes(this.projectSearchQuery.toLowerCase()) ||
        project.projectCode.toLowerCase().includes(this.projectSearchQuery.toLowerCase())
      );
    } else {
      this.filteredProjects = this.projects;
    }
  }

  getSelectedProjectName(): string {
    if (this.selectedProject) {
      const project = this.projects.find(p => p.id === this.selectedProject);
      return project ? project.name : '';
    }
    return '';
  }
}