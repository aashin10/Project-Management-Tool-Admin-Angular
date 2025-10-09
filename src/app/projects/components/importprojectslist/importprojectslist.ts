import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { Importprojectcard } from '../importprojectcard/importprojectcard';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-importprojectslist',
  standalone: true,
  imports: [Importprojectcard, CommonModule, CustomButton],
  templateUrl: './importprojectslist.html',
  styleUrl: './importprojectslist.css',
})
export class Importprojectslist implements OnInit, OnChanges {
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
