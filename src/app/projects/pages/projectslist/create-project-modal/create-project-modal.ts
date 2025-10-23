// create-project-modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../../../shared/modal/modal';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { ProjectsService, Project } from '../../../../shared/services/projects.service';

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

  constructor(private projectsService: ProjectsService) {}

  ngOnInit(): void {
    this.projects = this.projectsService.getProjects();
    this.filteredProjects = this.projects;
  }

  onProjectNameChange(): void {
    this.generateProjectKey();
  }

  // Generate project key using the first 3 alphanumeric characters of the project name (uppercase)
  generateProjectKey(): void {
    if (this.projectName && this.projectName.trim()) {
      const normalized = this.projectName.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      // take first 3 characters
      this.projectKey = normalized.substring(0, 3);
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