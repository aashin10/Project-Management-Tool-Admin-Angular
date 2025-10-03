import { Component } from '@angular/core';
import { Importprojectcard } from '../importprojectcard/importprojectcard';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-importprojectslist',
  imports: [Importprojectcard, CommonModule],
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
  ];
}
