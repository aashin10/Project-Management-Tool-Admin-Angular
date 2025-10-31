import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared-module';
import { ProjectTeams } from './project-teams/project-teams';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProjectsService, Project } from '../../services/projects.service';

@Component({
  selector: 'app-individualproject',
  standalone: true,
  imports: [CommonModule, SharedModule, ProjectTeams],
  templateUrl: './individualproject.html',
  styleUrl: './individualproject.css'
})
export class IndividualprojectComponent implements OnInit, OnDestroy {
  projectId: string = '';
  
  // Project data - now loaded from service
  project: Project | null = null;

  // Loading / error states
  isLoading: boolean = false;
  private loadTimeout: any;
  // Delete modal state
  showDeleteModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private projectsService: ProjectsService,
    private cdr: ChangeDetectorRef
  ) {
    // Get project ID from route params
    const id = this.route.snapshot.paramMap.get('id');
    this.projectId = id !== null ? id : '';
  }

  ngOnInit(): void {
    console.log('IndividualProjectComponent initialized with projectId:', this.projectId);
    
    // Load project data when component initializes
    this.fetchProject();
  }

  ngOnDestroy(): void {
    // Clear any pending timeout
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }
  }

  /**
   * Load project data from service (to be implemented)
   * For now, using mock data
   */
  private loadProjectData(): void {
    // TODO: Call your service to fetch project data
    // this.projectService.getProjectById(this.projectId).subscribe(data => {
    //   this.project = data.project;
    //   this.stats = data.stats;
    //   this.customerDetails = data.customerDetails;
    //   this.projectDetails = data.projectDetails;
    // });
    
    console.log('Loading project data for ID:', this.projectId);
  }

  /**
   * Fetch the project detail from service.
   */
  fetchProject(): void {
    console.log('fetchProject called for projectId:', this.projectId);
    
    // Prevent multiple concurrent requests
    if (this.isLoading) {
      console.log('Already loading, skipping duplicate request');
      return;
    }
    
    if (!this.projectId || this.projectId.trim() === '') {
      console.error('Invalid projectId:', this.projectId);
      this.notificationService.addNotification('error', 'Invalid project ID', 'Load Failed');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    // Set timeout to show "project not found" after 10 seconds
    this.loadTimeout = setTimeout(() => {
      if (this.isLoading) {
        console.log('Load timeout reached, showing project not found');
        this.isLoading = false;
        this.project = null; // This will show the "project not found" message
        this.cdr.detectChanges();
      }
    }, 10000);

    console.log('Making API call to get project by ID');
    
    this.projectsService.getProjectById(this.projectId).subscribe({
      next: (response) => {
        // Clear the timeout since we got a response
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }

        console.log('API response received:', response);
        
        if (response && response.status === 200 && response.data) {
          console.log('Mapping project data:', response.data);
          this.project = this.mapProjectDTOToProject(response.data);
          console.log('Project mapped successfully:', this.project);
        } else {
          console.warn('Invalid response or status:', response);
          this.notificationService.addNotification('error', response?.message || 'Failed to load project', 'Load Failed');
        }
        this.isLoading = false;
        console.log('Loading completed, isLoading set to false');
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Clear the timeout since we got an error
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }

        console.error('API call failed:', err);
        this.isLoading = false;
        this.notificationService.addNotification('error', err?.error?.message || err?.message || 'Failed to load project details.', 'Load Failed');
        console.log('Error state set');
        this.cdr.detectChanges();
      }
    });
  }

  private mapProjectDTOToProject(dto: any): Project {
    return {
      id: dto.id,
      name: dto.name || '',
      projectCode: dto.key || '',
      status: dto.statusName as 'Active' | 'Inactive' | 'Completed' || 'Active',
      deliveryUnit: dto.deliveryUnitCode || '',
      projectManager: dto.projectManagerName || '',
      teamSize: dto.teamSize,
      template: 'Scrum', // Default
      description: dto.description,
      organisationName: dto.customerOrgName,
      organisationDescription: dto.customerDescription,
      organisationWebsite: dto.customerDomainUrl,
      pocEmail: dto.pocEmail,
      pocPhone: dto.pocPhone,
      additionalInformation: dto.additionalInformation || [],
      teams: dto.teams || [],
      teamMembers: dto.teamMembers || [],
      isImportedFromJira: dto.isImportedFromJira,
      selected: false
    };
  }

  retryFetchProject(): void {
    this.fetchProject();
  }

  /**
   * Navigate back to projects list
   */
  goBackToProjects(): void {
    this.router.navigate(['/projects']);
  }

  /**
   * Open edit project dialog/page
   */
  editProject(): void {
    // Navigate to the edit page for this project
    console.log('Edit project:', this.projectId);
    if (this.projectId) {
      this.router.navigate(['/projects', this.projectId, 'edit']);
    }
  }


  /**
   * Delete the current project
   */
  // Open the delete confirmation modal
  deleteProject(): void {
    this.showDeleteModal = true;
  }

  // Cancel delete modal
  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  // Confirm deletion from modal
  confirmDelete(): void {
    this.showDeleteModal = false;
    if (!this.projectId) return;
    
    // Call the service to delete the project
    const deleted = this.projectsService.deleteProject(this.projectId);
    
    if (deleted) {
      this.notificationService.addNotification('error', `Project "${this.project?.name || this.projectId}" was deleted successfully.`, 'Project Deleted');
      this.router.navigate(['/projects']);
    } else {
      this.notificationService.addNotification('error', 'Failed to delete the project. Please try again.', 'Delete Failed');
    }
  }

  /**
   * Open customer website in new tab
   */
  openWebsite(): void {
    if (this.project?.organisationWebsite) {
      window.open(this.project.organisationWebsite, '_blank');
    }
  }

  /**
   * Open email client
   */
  sendEmail(): void {
    if (this.project?.pocEmail) {
      window.location.href = `mailto:${this.project.pocEmail}`;
    }
  }

  /**
   * Initiate phone call
   */
  makeCall(): void {
    if (this.project?.pocPhone) {
      window.location.href = `tel:${this.project.pocPhone}`;
    }
  }

  /**
   * Get status badge classes
   */
  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'ongoing': 'bg-green-100 text-green-700 border-green-200',
      'completed': 'bg-blue-100 text-blue-700 border-blue-200',
      'on-hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
      'Active': 'bg-green-100 text-green-700 border-green-200',
      'Inactive': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Completed': 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  /**
   * Get initials from name
   */
  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').substring(0, 2);
  }

  /**
   * Format date string
   */
  formatDate(dateString: string): string {
    // Simple date formatting - enhance as needed
    return dateString;
  }
}