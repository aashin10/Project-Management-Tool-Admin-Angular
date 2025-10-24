import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared-module';
import { ProjectTeams } from './project-teams/project-teams';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProjectsService, Project } from '../../../shared/services/projects.service';

@Component({
  selector: 'app-individualproject',
  standalone: true,
  imports: [CommonModule, SharedModule, ProjectTeams],
  templateUrl: './individualproject.html',
  styleUrl: './individualproject.css'
})
export class IndividualprojectComponent implements OnInit {
  projectId: string = '';
  
  // Project data - now loaded from service
  project: Project | null = null;

  // Loading / error states
  isLoading: boolean = false;
  loadingError: string | null = null;
  // Delete modal state
  showDeleteModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private projectsService: ProjectsService
  ) {
    // Get project ID from route params
    const id = this.route.snapshot.paramMap.get('id');
    this.projectId = id !== null ? id : '';
  }

  ngOnInit(): void {
    // Load project data when component initializes
    this.fetchProject();
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
    // If project data is already present, skip showing spinner
    if (this.project) {
      this.isLoading = false;
      this.loadingError = null;
      return;
    }

    this.isLoading = true;
    this.loadingError = null;

    try {
      // Load project from service
      const projectData = this.projectsService.getProjectById(this.projectId);
      
      if (projectData) {
        this.project = projectData;
        this.isLoading = false;
      } else {
        // Project not found
        this.isLoading = false;
        this.loadingError = 'Project not found';
      }
    } catch (err: any) {
      this.isLoading = false;
      this.loadingError = err?.message || 'Failed to load project details.';
    }
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