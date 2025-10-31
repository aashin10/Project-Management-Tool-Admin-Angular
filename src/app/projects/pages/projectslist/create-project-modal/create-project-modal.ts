// create-project-modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../../../shared/modal/modal';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { ProjectsService, Project } from '../../../services/projects.service';

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
    this.projectsService.getProjects(1, 1000).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.projects = response.data.items.map(item => this.mapProjectTableDTOToProject(item));
          this.filteredProjects = this.projects;
        }
      },
      error: (err) => {
        console.error('Failed to load projects for modal:', err);
      }
    });
  }

  private mapProjectTableDTOToProject(dto: any): Project {
    return {
      id: dto.id,
      name: dto.name || '',
      projectCode: dto.key || '',
      status: dto.status?.name as 'Active' | 'Inactive' | 'Completed' || 'Active',
      deliveryUnit: dto.deliveryUnit?.code || '',
      projectManager: dto.projectManager?.name || '',
      teamSize: dto.teamSize,
      template: 'Scrum',
      organisationName: '',
      selected: false
    };
  }

  onProjectNameChange(): void {
    this.generateProjectKey();
  }

  // Generate project key using the first 3 alphanumeric characters of the project name (uppercase)
  generateProjectKey(): void {
    // User-specified rules:
    // - If project name has 3 or more words: key = first letter of word1 + first letter of word2 + first letter of word3
    // - If project name has 2 words: key = first letter of word1 + first letter of word2 + last letter of word2
    // - If project name has 1 word: key = first letter + middle letter + last letter of that word
    // - If empty or unable to form letters, fallback to 'PRJ'
    const fallback = 'PRJ';
    if (this.projectName && this.projectName.trim()) {
      const words = this.projectName.trim().split(/\s+/).filter(w => w.length > 0);
      if (words.length >= 3) {
        // Use first letters of the first three words
        const chs = [words[0][0], words[1][0], words[2][0]].map(c => (c ? c.toUpperCase() : ''));
        const candidate = chs.join('').replace(/[^A-Z0-9]/g, '');
        this.projectKey = candidate.length === 3 ? candidate : (candidate + 'X'.repeat(Math.max(0, 3 - candidate.length))).slice(0, 3);
      } else if (words.length === 2) {
        // Two-word rule: first letter of word1, first letter of word2, last letter of word2
        const w1 = words[0];
        const w2 = words[1];
        const ch1 = w1[0] ? w1[0].toUpperCase() : '';
        const ch2 = w2[0] ? w2[0].toUpperCase() : '';
        const ch3 = w2[w2.length - 1] ? w2[w2.length - 1].toUpperCase() : '';
        const candidate = (ch1 + ch2 + ch3).replace(/[^A-Z0-9]/g, '');
        this.projectKey = candidate.length === 3 ? candidate : (candidate + 'X'.repeat(Math.max(0, 3 - candidate.length))).slice(0, 3);
      } else if (words.length === 1) {
        const w = words[0];
        const first = w[0] ? w[0].toUpperCase() : '';
        // middle char: for even length choose left-middle (Math.floor((len-1)/2))
        const midIndex = Math.floor((w.length - 1) / 2);
        const middle = w[midIndex] ? w[midIndex].toUpperCase() : '';
        const last = w[w.length - 1] ? w[w.length - 1].toUpperCase() : '';
        const candidate = (first + middle + last).replace(/[^A-Z0-9]/g, '');
        this.projectKey = candidate.length === 3 ? candidate : (candidate + 'X'.repeat(Math.max(0, 3 - candidate.length))).slice(0, 3);
      } else {
        this.projectKey = fallback;
      }
    } else {
      this.projectKey = fallback;
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