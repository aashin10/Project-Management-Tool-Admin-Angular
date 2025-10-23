import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared-module';
import { ProjectTeams } from './project-teams/project-teams';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-individualproject',
  standalone: true,
  imports: [CommonModule, SharedModule, ProjectTeams],
  templateUrl: './individualproject.html',
  styleUrl: './individualproject.css'
})
export class IndividualprojectComponent implements OnInit {
  projectId: string = '';
  
  // Project data
  project = {
    name: 'Atlas App',
    code: 'PROJ-001',
    status: 'Ongoing',
    description: 'Mobile application for atlas navigation and mapping',
    avatar: 'AA',
    avatarColor: '#3b82f6' // blue-500
  };

  // Stats data
  stats = {
    totalSprintCount: 12,
    teamMembers: 23
  };

  // Customer details
  customerDetails = {
    organisationName: 'Acme Corporation',
    description: 'A leading technology company specializing in cloud solutions and enterprise software. Acme has been in business for over 20 years and serves Fortune 500 clients globally.',
    website: 'https://www.acmecorp.com',
    pocEmail: 'contact@acmecorp.com',
    pocPhone: '+1 (555) 123-4567'
  };

  // Project details
  projectDetails = {
    projectManager: {
      name: 'Asha Varma',
      avatar: 'AV',
      role: 'Project Manager',
      avatarColor: '#3b82f6' // blue-500
    },
    deliveryUnit: 'Engineering',
    startDate: 'Jan 2, 2025',
    endDate: 'Jan 9, 2025',
    status: 'ongoing',
    teamSize: 23
  };

  // Loading / error states
  isLoading: boolean = false;
  loadingError: string | null = null;
  // Delete modal state
  showDeleteModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
    , private notificationService: NotificationService
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
   * Fetch the project detail. Replace with real service call.
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

    setTimeout(() => {
      try {
        // Simulate success; in a real app, load and assign the data.
        // Keep spinner visible briefly so loading indicator is noticeable.
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      } catch (err: any) {
        // Hide spinner after a short delay and show error message
        setTimeout(() => {
          this.isLoading = false;
          this.loadingError = err?.message || 'Failed to load project details.';
        }, 1000);
      }
    }, 1000);
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
    // In a real app, call the service to delete, then navigate. Here we navigate and let the list remove it.
    // Notify the app about deletion
    this.notificationService.addNotification('success', `Project "${this.project?.name || this.projectId}" was deleted.`, 'Project Deleted');
    this.router.navigate(['/projects'], { queryParams: { deleted: this.projectId } });
  }

  /**
   * Open customer website in new tab
   */
  openWebsite(): void {
    window.open(this.customerDetails.website, '_blank');
  }

  /**
   * Open email client
   */
  sendEmail(): void {
    window.location.href = `mailto:${this.customerDetails.pocEmail}`;
  }

  /**
   * Initiate phone call
   */
  makeCall(): void {
    window.location.href = `tel:${this.customerDetails.pocPhone}`;
  }

  /**
   * Get status badge classes
   */
  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'ongoing': 'bg-green-100 text-green-700 border-green-200',
      'completed': 'bg-blue-100 text-blue-700 border-blue-200',
      'on-hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200'
    };
    return statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  /**
   * Format date string
   */
  formatDate(dateString: string): string {
    // Simple date formatting - enhance as needed
    return dateString;
  }
}