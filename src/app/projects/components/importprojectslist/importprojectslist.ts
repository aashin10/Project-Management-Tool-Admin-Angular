import { Component, Input } from '@angular/core';
import { Importprojectcard } from '../importprojectcard/importprojectcard';
import { CommonModule } from '@angular/common';
import { CustomButton } from '../../../shared/custom-button/custom-button';

@Component({
  selector: 'app-importprojectslist',
  imports: [Importprojectcard, CommonModule, CustomButton],
  templateUrl: './importprojectslist.html',
  styleUrl: './importprojectslist.css',
})
export class Importprojectslist {
  @Input() projects: any[] = [];
  paginatedProjects: any = [];

  currentPage: number = 1;
  itemsPerPage: number = 3;

  ngOnInit() {
    this.updatePaginatedProjects();
  }

  updatePaginatedProjects() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProjects = this.projects.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePaginatedProjects();
  }

  get totalPages(): number {
    return Math.ceil(this.projects.length / this.itemsPerPage);
  }
}
