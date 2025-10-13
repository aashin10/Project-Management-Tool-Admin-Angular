import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { ImportProjectCard } from '../import-project-card/import-project-card';
import { CommonModule } from '@angular/common';
import { CustomButton } from '../../../../shared/custom-button/custom-button';

@Component({
  selector: 'app-import-project-card-list',
  standalone: true,
  imports: [ImportProjectCard, CommonModule, CustomButton],
  templateUrl: './import-project-card-list.html',
  styleUrl: './import-project-card-list.css',
})
export class ImportProjectCardList implements OnInit, OnChanges {
  constructor(private cd: ChangeDetectorRef) {}

  @Input() projects: ImportProjectMinimal[] = [];
  paginatedProjects: ImportProjectMinimal[] = [];

  currentPage = 1;
  itemsPerPage = 3;

  onProjectSelect(event: { selected: boolean; id: string }): void {
    // Find the project in the original projects array (this is the key fix)
    const project = this.projects.find((p) => p.id === event.id);
    if (project) {
      project.selected = event.selected;
      // Update paginated projects to reflect the change
      const paginatedProject = this.paginatedProjects.find((p) => p.id === event.id);
      if (paginatedProject) {
        paginatedProject.selected = event.selected;
      }
      this.cd.detectChanges();
    }
  }

  ngOnInit(): void {
    this.updatePaginatedProjects();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projects']) {
      // Reset to first page when projects change (e.g., during search)
      this.currentPage = 1;
      this.updatePaginatedProjects();
    }
  }

  updatePaginatedProjects(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProjects = this.projects.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.updatePaginatedProjects();
  }

  get totalPages(): number {
    return Math.ceil(this.projects.length / this.itemsPerPage) || 1;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
