import { Component, OnInit } from '@angular/core';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Importprojectslist } from '../importprojectslist/importprojectslist';
import { Jiraservice } from '../../pages/importfromjira/jiraservice';

@Component({
  selector: 'app-select-projects-section',
  imports: [CustomButton, SearchBar, Importprojectslist],
  templateUrl: './select-projects-section.html',
  styleUrl: './select-projects-section.css',
})
export class SelectProjectsSection implements OnInit {
  public constructor(private jiraService: Jiraservice) {}
  projects: any[] = [];
  tempProjects = [];
  async ngOnInit() {
    const token = sessionStorage.getItem('jira_access_token');
    if (token) {
      const ids = await this.jiraService.getAccessibleResources(token);
      console.log('Cloud IDs:', ids);
      if (ids && ids.length > 0) {
        const cloudId = ids[0].id;
        const importedProjects: any = await this.jiraService.fetchJiraProjects(token, cloudId);
        console.log('Jira Projects:', importedProjects);
        importedProjects.forEach((project: any) => {
          this.projects.push({
            name: project.name,
            key: project.key,
            id: project.id,
            selected: false,
          });
        });
        console.log('Mapped Projects:', this.projects);
      }
    }
  }
}
