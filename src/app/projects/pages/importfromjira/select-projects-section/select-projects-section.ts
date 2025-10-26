import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../../shared/components/search-bar/search-bar';
import { LoadingIndicator } from '../../../../shared/loading-indicator/loading-indicator';
import { ImportProjectCardList } from '../import-projects-list/import-project-card-list';
import { JiraService } from '../services/jira-service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ToastrService } from 'ngx-toastr';
import { JiraApi } from '../services/jira-api';

@Component({
  selector: 'app-select-projects-section',
  imports: [CustomButton, SearchBar, ImportProjectCardList, CommonModule, LoadingIndicator],
  templateUrl: './select-projects-section.html',
  styleUrl: './select-projects-section.css',
})
export class SelectProjectsSection implements OnInit {
  constructor(
    private jiraService: JiraService,
    private jiraApi: JiraApi,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private notificationService: NotificationService
  ) {}

  projects: any[] = [];
  allProjects: any[] = [];
  loadingProjects: boolean = false;
  cloudIds: any[] | undefined = [];
  selectedCloudId: string = '';

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
    this.loadingProjects = true;
    const token = sessionStorage.getItem('jira_access_token');
    if (token) {
      const ids = await this.jiraService.getAccessibleResources(token);
      if (!ids) {
        throw new Error('No accessible resources found');
      }
      this.cloudIds = ids;
      if (ids && ids.length > 0) {
        await this.fetchProjectsByCloudId(ids[0].id); // Load default cloudId
      }
      this.projects = [...this.allProjects];
      this.loadingProjects = false;
      this.cdr.detectChanges();
    } else {
      throw new Error('No access token found in session storage.');
    }
  }

  async fetchProjectsByCloudId(cloudId: string): Promise<void> {
    const token = sessionStorage.getItem('jira_access_token');
    if (token) {
      this.loadingProjects = true;
      this.allProjects = [];
      this.projects = [];

      const importedProjects: ImportProjectMinimal[] = await this.jiraService.fetchJiraProjects(
        token,
        cloudId
      );
      this.allProjects = importedProjects.map((project: ImportProjectMinimal) => ({
        name: project.name,
        key: project.key,
        id: project.id,
        selected: false,
      }));

      this.projects = [...this.allProjects];
      this.loadingProjects = false;
      this.cdr.detectChanges();
    } else {
      throw new Error('No access token found in session storage.');
    }
  }

  onCloudIdChange(event: Event): void {
    const newCloudId = (event.target as HTMLSelectElement).value;
    this.fetchProjectsByCloudId(newCloudId);
    this.selectedCloudId = newCloudId;
    this.cdr.detectChanges();
  }

  selectAllProjects(): void {
    this.projects.forEach((project) => (project.selected = true));
    this.allProjects.forEach((project) => (project.selected = true));
    this.cdr.detectChanges();
  }

  get selectedProjectCount(): number {
    return this.allProjects.filter((project) => project.selected).length;
  }

  get allSelected(): boolean {
    return this.allProjects.length > 0 && this.allProjects.every((project) => project.selected);
  }

  toggleSelectAll(): void {
    const shouldSelect = !this.allSelected;
    this.projects.forEach((project) => (project.selected = shouldSelect));
    this.allProjects.forEach((project) => (project.selected = shouldSelect));
    this.cdr.detectChanges();
  }

  importProjects(): void {
    const selectedProjects = this.allProjects.filter((project) => project.selected);
    if (selectedProjects.length === 0) {
      this.toastr.warning('Please select at least one project to import.', 'No Projects Selected');
      return;
    }
    this.toastr.info('Import functionality is not yet implemented.', 'Import Projects');
    // this.jiraApi
    //   .importProjectsFromJira(
    //     this.selectedCloudId,
    //     sessionStorage.getItem('jira_access_token')!,
    //     selectedProjects.map((project) => project.id)
    //   )
    //   .subscribe({
    //     next: (response) => {
    //       this.toastr.success('Projects imported successfully!', 'Import Successful');
    //     },
    //     error: (error) => {
    //       this.toastr.error('Failed to import projects.', 'Import Failed');
    //     },
    //   });
  }
}
