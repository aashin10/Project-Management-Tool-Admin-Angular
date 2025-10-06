import { Component } from '@angular/core';
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
  projects = [
    {
      title: 'Demo Project',
      description: 'Demo project for testing purposes.',
      issuesCount: 45,
    },

    {
      title: 'Client Portal',
      description: 'Portal for client interactions and feedback.',
      issuesCount: 12,
    },
    {
      title: 'Internal Tools',
      description: 'Tools for internal team productivity.',
      issuesCount: 30,
    },
    {
      title: 'Demo Project',
      description: 'Demo project for testing purposes.',
      issuesCount: 45,
    },

    {
      title: 'Client Portal',
      description: 'Portal for client interactions and feedback.',
      issuesCount: 12,
    },
    {
      title: 'Internal Tools',
      description: 'Tools for internal team productivity.',
      issuesCount: 30,
    },
    {
      title: 'Demo Project',
      description: 'Demo project for testing purposes.',
      issuesCount: 45,
    },

    {
      title: 'Client Portal',
      description: 'Portal for client interactions and feedback.',
      issuesCount: 12,
    },
    {
      title: 'Internal Tools',
      description: 'Tools for internal team productivity.',
      issuesCount: 30,
    },
    {
      title: 'Demo Project',
      description: 'Demo project for testing purposes.',
      issuesCount: 45,
    },

    {
      title: 'Client Portal',
      description: 'Portal for client interactions and feedback.',
      issuesCount: 12,
    },
    {
      title: 'Internal Tools',
      description: 'Tools for internal team productivity.',
      issuesCount: 30,
    },
    {
      title: 'Demo Project',
      description: 'Demo project for testing purposes.',
      issuesCount: 45,
    },

    {
      title: 'Client Portal',
      description: 'Portal for client interactions and feedback.',
      issuesCount: 12,
    },
    {
      title: 'Internal Tools',
      description: 'Tools for internal team productivity.',
      issuesCount: 30,
    },
    {
      title: 'Demo Project',
      description: 'Demo project for testing purposes.',
      issuesCount: 45,
    },

    {
      title: 'Client Portal',
      description: 'Portal for client interactions and feedback.',
      issuesCount: 12,
    },
    {
      title: 'Internal Tools',
      description: 'Tools for internal team productivity.',
      issuesCount: 30,
    },
    {
      title: 'Demo Project',
      description: 'Demo project for testing purposes.',
      issuesCount: 45,
    },

    {
      title: 'Client Portal',
      description: 'Portal for client interactions and feedback.',
      issuesCount: 12,
    },
    {
      title: 'Internal Tools',
      description: 'Tools for internal team productivity.',
      issuesCount: 30,
    },
    {
      title: 'Demo Project',
      description: 'Demo project for testing purposes.',
      issuesCount: 45,
    },

    {
      title: 'Client Portal',
      description: 'Portal for client interactions and feedback.',
      issuesCount: 12,
    },
    {
      title: 'Internal Tools',
      description: 'Tools for internal team productivity.',
      issuesCount: 30,
    },
  ];
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
