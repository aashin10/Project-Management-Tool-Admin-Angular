import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProjectsService, UserFilterResponse } from '../../services/projects.service';
import { DeliveryUnitService } from '../../../duservice/deliveryunits.service';
import { ProjectStatusService } from '../../../shared/services/project-status/project-status.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { BasicInformationComponent } from './basicinfo/basicinfo';
import { TeamOrganizationComponent } from './teaminfo/teaminfo';
import { ProjectPreviewComponent } from './projectpreview/projectpreview';
import { Additionalinfo } from './additionalinfo/additionalinfo';
@Component({
  selector: 'app-createproject',
  standalone: true,
  imports: [
    CommonModule, 
    Sectiontitle,
    BasicInformationComponent,
    TeamOrganizationComponent,
    ProjectPreviewComponent,
    Additionalinfo
  ],
  templateUrl: './createproject.html',
  styleUrl: './createproject.css'
})
export class Createproject {
  // Form properties
  projectName: string = '';
  projectKey: string = '';
  description: string = '';
  // Customer info
  organisationName: string = '';
  organisationDescription: string = '';
  organisationWebsite: string = '';
  pocEmail: string = '';
  phoneNumber: string = '';
  manager: string = '';
  managerId: number | null = null; // Store the selected manager ID
  status: string = 'Active'; // default to 'Active'
  deliveryUnit: string = '';
  deliveryUnits: any[] = [];
  additionalFields: Array<{name: string, value: string}> = [];
  // Project dates
  startDate: string = '';
  endDate: string = '';
  totalSprintCount: number = 0;
  // Keep template and sharing info if passed from list
  selectedTemplate: string = '';
  shareWithExisting: boolean = false;
  selectedProjectToShare: string = '';
  showSuccess: boolean = false;
  
  // Project Manager dropdown data
  filteredUsers: UserFilterResponse[] = [];
  allUsers: UserFilterResponse[] = []; // Master list of all users
  isLoadingUsers: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private projectsService: ProjectsService,
    private deliveryUnitsService: DeliveryUnitService,
    private projectStatusService: ProjectStatusService,
    private toastr: ToastrService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['template']) {
        this.selectedTemplate = params['template'];
      }
      if (params['name']) this.projectName = params['name'];
      if (params['projectKey']) this.projectKey = params['projectKey'];
      if (params['shareWithExisting'] !== undefined) this.shareWithExisting = params['shareWithExisting'] === 'true' || params['shareWithExisting'] === true;
      if (params['selectedProject']) {
        this.selectedProjectToShare = params['selectedProject'];
        // Auto-fill details from selected project
        this.projectsService.getProjectById(params['selectedProject']).subscribe({
          next: (response) => {
            if (response.status === 200) {
              const selectedProject = response.data;
              this.selectedTemplate = 'Scrum'; // Default
              this.deliveryUnit = selectedProject.deliveryUnitCode || '';
              this.status = selectedProject.statusName || '';
            }
          },
          error: (err) => {
          }
        });
      }
    });
  }

  async ngOnInit() {
    await this.loadDeliveryUnits();
    this.loadAllUsers();
  }

  loadAllUsers() {
    this.isLoadingUsers = true;
    this.projectsService.getAllUsers().subscribe({
      next: (response) => {
        if (response.status === 200 && response.data) {
          // Store the master list and initialize filtered list
          this.allUsers = response.data.map(u => ({ id: u.id, name: u.name, email: u.email }));
          this.filteredUsers = [...this.allUsers]; // Copy all users to filtered list initially
        } else {
          this.allUsers = [];
          this.filteredUsers = [];
        }
        this.isLoadingUsers = false;
      },
      error: (error) => {
        this.allUsers = [];
        this.filteredUsers = [];
        this.isLoadingUsers = false;
        this.toastr.warning('Could not load user list', 'User Fetch Warning');
      }
    });
  }

  async loadDeliveryUnits(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.deliveryUnitsService.getAllDeliveryUnits().subscribe({
        next: (deliveryUnits) => {
          this.deliveryUnits = deliveryUnits;
          resolve();
        },
        error: (err) => {
          this.deliveryUnits = [];
          resolve(); // Resolve anyway to not block initialization
        }
      });
    });
  }

  onProjectNameChange(name: string) {
    this.projectName = name;
  }

  onProjectKeyChange(key: string) {
    this.projectKey = key;
  }

  onDescriptionChange(description: string) {
    this.description = description;
  }

  onTemplateChange(template: string) {
    this.selectedTemplate = template;
  }

  onOrganisationNameChange(name: string) {
    this.organisationName = name;
  }

  onPocEmailChange(email: string) {
    this.pocEmail = email;
  }

  onPhoneNumberChange(phone: string) {
    this.phoneNumber = phone;
  }

  onManagerChange(manager: string) {
    this.manager = manager;
    // Clear managerId when text changes (user is typing, not selecting)
    // But only if the manager name doesn't match the currently selected user
    if (this.managerId) {
      const selectedUser = this.allUsers.find(u => u.id === this.managerId);
      if (!selectedUser || selectedUser.name !== manager) {
        this.managerId = null;
      }
    } else {
      // Try to find a user with this name and set managerId
      const matchingUser = this.allUsers.find(u => u.name === manager);
      if (matchingUser) {
        this.managerId = matchingUser.id;
      }
    }
  }

  onManagerSearch(searchTerm: string) {
    // If no search term, show all users
    if (!searchTerm || searchTerm.trim().length === 0) {
      this.filteredUsers = [...this.allUsers];
      return;
    }
    
    // Filter from master list based on search term
    const term = searchTerm.trim().toLowerCase();
    this.filteredUsers = this.allUsers.filter(u =>
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  }

  onManagerSelect(user: UserFilterResponse) {
    this.manager = user.name;
    this.managerId = user.id;
  }

  get deliveryUnitOptions() {
    return this.deliveryUnits?.map(du => ({
      value: du.code,
      label: du.name,
      description: du.description
    })) || [];
  }

  get statusOptions(): Observable<{value: string, label: string, description: string}[]> {
    return this.projectStatusService.getStatuses().pipe(
      map(statuses => statuses.map(status => ({
        value: status.code,
        label: status.name,
        description: status.description || ''
      })))
    );
  }

  onDeliveryUnitChange(unit: string) {
    this.deliveryUnit = unit;
  }

  onStatusChange(status: string) {
    this.status = status;
  }

  // Check if core required fields are filled to enable create button
  get isFormValid(): boolean {
    return !!(
      this.projectName?.trim() &&
      this.projectKey?.trim() &&
      this.status &&
      this.managerId &&
      this.deliveryUnit
    );
  }

  onCreateProject() {
    // Validate only core required fields: project name, project key, status, project manager, delivery unit
    if (!this.projectName || !this.projectKey) {
      this.toastr.error('Please fill in project name and project key', 'Validation Error');
      return;
    }

    if (!this.status) {
      this.toastr.error('Please select a project status', 'Validation Error');
      return;
    }

    if (!this.managerId) {
      this.toastr.error('Please select a project manager from the dropdown', 'Validation Error');
      return;
    }

    // Find delivery unit ID by code/name
    const selectedDeliveryUnit = this.deliveryUnits.find(du => 
      du.code === this.deliveryUnit || du.name === this.deliveryUnit
    );

    if (!selectedDeliveryUnit) {
      this.toastr.error('Please select a valid delivery unit', 'Validation Error');
      return;
    }

    // Validate email format if provided
    if (this.pocEmail && this.pocEmail.trim() !== '') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.pocEmail)) {
        this.toastr.error('Please enter a valid email address', 'Validation Error');
        return;
      }
    }

    // Validate phone format if provided
    if (this.phoneNumber && this.phoneNumber.trim() !== '') {
      const phonePattern = /^\+?[\d\s\-()]{7,}$/;
      if (!phonePattern.test(this.phoneNumber)) {
        this.toastr.error('Please enter a valid phone number (at least 7 digits)', 'Validation Error');
        return;
      }
    }

    // Create project request object matching API structure
    const createProjectRequest = {
      name: this.projectName,
      key: this.projectKey,
      description: this.description || '',
      customerOrgName: this.organisationName || '', // Optional customer info
      customerDomainUrl: this.organisationWebsite || '',
      customerDescription: this.organisationDescription || '',
      pocEmail: this.pocEmail || '', // Optional customer info
      pocPhone: this.phoneNumber || '',
      projectManagerId: this.managerId,
      projectManagerRoleId: 2, // Default role ID - you might want to make this configurable
      statusId: 1, // Active status - you might want to get this dynamically
      deliveryUnitId: selectedDeliveryUnit.id,
      isImportedFromJira: false
    };
    // Call the API
    this.projectsService.createProject(createProjectRequest).subscribe({
      next: (response) => {
        // Show notification using NotificationService
        this.notificationService.addNotification(
          'success',
          `${this.projectName} created successfully`,
          'Project Created'
        );

        // Show Toastr success message
        this.toastr.success(
          `${this.projectName} created successfully with ID: ${response.data.id}`,
          'Project Created',
          {
            timeOut: 3000,
            progressBar: true,
            closeButton: true
          }
        );

        // Show success message
        this.showSuccess = true;

        // Navigate after short delay
        setTimeout(() => {
          this.router.navigate(['/projects']);
        }, 600);
      },
      error: (error) => {
        this.toastr.error(
          error.message || 'Failed to create project. Please try again.',
          'Creation Failed',
          {
            timeOut: 5000,
            progressBar: true,
            closeButton: true
          }
        );
      }
    });
  }
  

  onCancel() {
    // Navigate back to projects list
    this.router.navigate(['/projects']);
  }
}
