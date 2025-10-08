import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Importprojectslist } from '../importprojectslist/importprojectslist';
import { Jiraservice } from '../../pages/importfromjira/jiraservice';
import { CommonModule } from '@angular/common';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';

@Component({
  selector: 'app-select-projects-section',
  imports: [CustomButton, SearchBar, Importprojectslist, CommonModule, LoadingIndicator],
  templateUrl: './select-projects-section.html',
  styleUrl: './select-projects-section.css',
})
export class SelectProjectsSection implements OnInit {
  constructor(private jiraService: Jiraservice, private cdr: ChangeDetectorRef) {}

  projects: any[] = [];
  allProjects: any[] = [];
  loadingProjects: boolean = true;
  cloudIds: any[] | undefined = [];

  dropdownOpen: boolean = false;

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onSearch(term: string) {
    if (term && term.trim() !== '') {
      this.projects = this.allProjects.filter(
        (project) =>
          project.name.toLowerCase().includes(term.toLowerCase()) ||
          project.key.toLowerCase().includes(term.toLowerCase())
      );
    } else {
      this.projects = [...this.allProjects];
    }
    this.cdr.detectChanges();
  }

  async ngOnInit() {
    const token = sessionStorage.getItem('jira_access_token');
    if (token) {
      const ids = await this.jiraService.getAccessibleResources(token);
      this.cloudIds = ids;
      console.log('Cloud IDs:', ids);
      if (ids && ids.length > 0) {
        await this.fetchProjectsByCloudId(ids[0].id); // Load default cloudId
      }
    }
    this.projects = [...this.allProjects];
    this.loadingProjects = false;
    this.cdr.detectChanges();
  }

  async fetchProjectsByCloudId(cloudId: string): Promise<void> {
    const token = sessionStorage.getItem('jira_access_token');
    if (token) {
      this.loadingProjects = true;
      this.allProjects = [];
      this.projects = [];

      const importedProjects: any = await this.jiraService.fetchJiraProjects(token, cloudId);
      this.allProjects = importedProjects.map((project: any) => ({
        name: project.name,
        key: project.key,
        id: project.id,
        selected: false,
      }));

      this.projects = [...this.allProjects];
      this.loadingProjects = false;
      this.cdr.detectChanges();
    }
  }

  onCloudIdChange(event: Event): void {
    const newCloudId = (event.target as HTMLSelectElement).value;
    this.fetchProjectsByCloudId(newCloudId);
    this.cdr.detectChanges();
  }

  selectAllProjects(): void {
    this.projects.forEach((project) => (project.selected = true));
    this.allProjects.forEach((project) => (project.selected = true));
    this.cdr.detectChanges();
  }
}
