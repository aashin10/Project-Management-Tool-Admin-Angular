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
import { ImportNavigationService } from '../services/import-navigation-service';

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
    private notificationService: NotificationService,
    private navigationService: ImportNavigationService
  ) {}

  isImporting = false;
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
    if (sessionStorage.getItem('isImporting') === 'true') {
      this.isImporting = true;
      return;
    }
    this.loadingProjects = true;
    let token = sessionStorage.getItem('jira_access_token');
    if (token && this.jiraService.isJwtExpired(token)) {
      const refreshToken = sessionStorage.getItem('jira_refresh_token');
      if (refreshToken) {
        try {
          const response = await this.jiraService.refreshAccessToken(refreshToken);
          sessionStorage.setItem('jira_access_token', response.access_token);
          token = response.access_token;
          if (response.refresh_token) {
            sessionStorage.setItem('jira_refresh_token', response.refresh_token);
          }
        } catch (error) {
          console.error('Error refreshing access token', error);
        }
      }
    }

    if (token) {
      const ids = await this.jiraService.getAccessibleResources(token);
      if (!ids) {
        throw new Error('No accessible resources found');
      }
      this.cloudIds = ids;
      this.selectedCloudId = ids[0].id;
      if (ids && ids.length > 0) {
        await this.fetchProjectsByCloudId(ids[0].id); // Load default cloudId
      }
      this.allProjects = this.allProjects.filter((project) => project.style === 'next-gen');
      this.projects = [...this.allProjects];
      this.loadingProjects = false;
      this.cdr.detectChanges();
    } else {
      throw new Error('No access token found in session storage.');
    }
  }

  async fetchProjectsByCloudId(cloudId: string): Promise<void> {
    let token = sessionStorage.getItem('jira_access_token');

    if (token && this.jiraService.isJwtExpired(token)) {
      const refreshToken = sessionStorage.getItem('jira_refresh_token');
      if (refreshToken) {
        try {
          const response = await this.jiraService.refreshAccessToken(refreshToken);
          sessionStorage.setItem('jira_access_token', response.access_token);
          token = response.access_token;
          if (response.refresh_token) {
            sessionStorage.setItem('jira_refresh_token', response.refresh_token);
          }
        } catch (error) {
          console.error('Error refreshing access token', error);
        }
      }
    }

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
        style: project.style,
      }));

      this.allProjects = this.allProjects.filter((project) => project.style === 'next-gen');
      console.log('sdfsfd' + this.allProjects);
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

  async importProjects(): Promise<void> {
    const selectedProjects = this.allProjects.filter((project) => project.selected);
    if (selectedProjects.length === 0) {
      this.toastr.warning('Please select at least one project to import.', 'No Projects Selected');
      return;
    }
    alert(this.selectedCloudId);

    let token = sessionStorage.getItem('jira_access_token');

    if (token) {
      const refreshToken = sessionStorage.getItem('jira_refresh_token');
      if (refreshToken) {
        try {
          const response = await this.jiraService.refreshAccessToken(refreshToken);
          sessionStorage.setItem('jira_access_token', response.access_token);
          if (response.refresh_token) {
            sessionStorage.setItem('jira_refresh_token', response.refresh_token);
            token = response.access_token;
          }
        } catch (error) {
          console.error('Error refreshing access token', error);
        }
      }
    }

    //this.navigationService.onNext();
    this.isImporting = true;
    sessionStorage.setItem('isImporting', 'true');
    //this.toastr.info('Import functionality is not yet implemented.', 'Import Projects');
    this.jiraApi
      .importProjectsFromJira(
        this.selectedCloudId,
        token || '',
        selectedProjects.map((project) => project.id)
      )
      .subscribe({
        next: (response) => {
          console.log('Import Response:', response);
          sessionStorage.setItem('users_missing', JSON.stringify(response.data));
          this.isImporting = false;
          sessionStorage.setItem('isImporting', 'false');
          this.cdr.detectChanges();
          this.toastr.success('Projects imported successfully!', 'Import Successful');
          this.navigationService.onNext();
        },
        error: (error) => {
          this.isImporting = false;
          sessionStorage.setItem('isImporting', 'false');
          this.toastr.error('Failed to import projects.', 'Import Failed');
          this.cdr.detectChanges();
        },
      });
  }
}
