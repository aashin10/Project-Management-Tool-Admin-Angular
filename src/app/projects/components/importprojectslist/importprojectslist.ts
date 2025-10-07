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
  imports: [Importprojectcard, CommonModule, CustomButton],
  templateUrl: './importprojectslist.html',
  styleUrl: './importprojectslist.css',
})
export class Importprojectslist implements OnInit, OnChanges {
  public constructor(private cd: ChangeDetectorRef) {}

  @Input() projects: any[] = [];
  paginatedProjects: any = [];

  currentPage: number = 1;
  itemsPerPage: number = 3;

  ngOnInit() {
    this.updatePaginatedProjects();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['projects'] && changes['projects'].currentValue) {
      this.updatePaginatedProjects();
      this.cd.detectChanges();
    }
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
