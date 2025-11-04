import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../../shared/sectiontitle/sectiontitle';
import { BasicInformationComponent } from '../../../pages/createproject/basicinfo/basicinfo';
import { TeamOrganizationComponent } from '../../../pages/createproject/teaminfo/teaminfo';
import { Additionalinfo } from '../../../pages/createproject/additionalinfo/additionalinfo';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { ProjectsService, Project, UpdateProjectRequest, UserFilterResponse, DeliveryUnit, CustomFieldDTO } from '../../../services/projects.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';
import { ProjectStatusService, ProjectStatus } from '../../../../shared/services/project-status/project-status.service';

@Component({
  selector: 'app-editproject',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    Sectiontitle,
    BasicInformationComponent,
    TeamOrganizationComponent,
    Additionalinfo,
    CustomButton
  ],
  templateUrl: './editproject.html',
  styleUrl: './editproject.css'
})
export class Editproject implements OnInit {
  status: string = '';
  get managerInitials(): string {
    if (!this.manager) return '';
    const names = this.manager.trim().split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names.map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
  projectId: string = '';
  
  // Form properties
  projectName: string = '';
  projectKey: string = '';
  originalProjectKey: string = ''; // Store original key to detect changes
  description: string = '';
  
  // Customer info
  organisationName: string = '';
  customerDescription: string = '';
  domainLink: string = '';
  pocEmail: string = '';
  phoneNumber: string = '';
  
  // Team info
  manager: string = '';
  deliveryUnit: string = '';
  selectedProjectManagerId: number = 0;
  selectedDeliveryUnitId: number = 0;
  
  // Additional fields
  additionalFields: Array<{id?: string, name: string, value: string}> = [];
  originalAdditionalFields: Array<{id?: string, name: string, value: string}> = []; // Store original for comparison

  // Dropdown data
  filteredUsers$: Observable<UserFilterResponse[]> = of([]);
  deliveryUnits: DeliveryUnit[] = [];
  projectStatuses: ProjectStatus[] = [];
  
  // Loading states
  isLoadingUsers = false;
  isUpdatingProject = false;

  showSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private projectStatusService: ProjectStatusService
  ) {}

  ngOnInit() {
    // Get project ID from route
    this.projectId = this.route.snapshot.params['id'];
    // Load data immediately
    this.loadDeliveryUnits();
    this.loadProjectStatuses();
    this.loadProjectData();
    this.setupProjectManagerSearch();
    
    // Fallback: Force change detection after a short delay to ensure everything is rendered
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  loadProjectData() {
    if (!this.projectId) {
      this.toastr.error('Invalid project ID', 'Error');
      return;
    }

    this.projectsService.getProjectById(this.projectId).subscribe({
      next: (response) => {
        
        
        if (response.status === 200 && response.data) {
          const project = response.data;
          
          // Populate form fields
          this.projectName = project.name || '';
          this.projectKey = project.key || '';
          this.originalProjectKey = project.key || ''; // Store original for comparison
          this.description = project.description || '';
          this.organisationName = project.customerOrgName || '';
          this.customerDescription = project.customerDescription || '';
          this.domainLink = project.customerDomainUrl || '';
          this.pocEmail = project.pocEmail || '';
          this.phoneNumber = project.pocPhone || '';
          this.manager = project.projectManagerName || '';
          this.deliveryUnit = project.deliveryUnitCode || '';
          this.selectedProjectManagerId = project.projectManagerId || 0;
          this.selectedDeliveryUnitId = project.deliveryUnitId || 0;
          this.status = project.statusName || 'Active';
          this.additionalFields = project.additionalInformation || [];
          // Store original fields for detecting changes
          this.originalAdditionalFields = JSON.parse(JSON.stringify(project.additionalInformation || []));
          // Force change detection to update child components immediately
          this.cdr.detectChanges();
          
          // Also force update after a short delay to ensure child components are updated
          setTimeout(() => {
            this.cdr.detectChanges();
          }, 100);
        } else {
          this.toastr.error('Invalid project data received', 'Error');
        }
      },
      error: (err) => {
        this.toastr.error('Failed to load project data. Please try refreshing the page.', 'Error');
      }
    });
  }

  private loadDeliveryUnits() {
    this.projectsService.getDeliveryUnits().subscribe({
      next: (response) => {
        this.deliveryUnits = response.data || [];
        // Force change detection to update child components
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastr.error('Failed to load delivery units', 'Error');
      }
    });
  }

  private loadProjectStatuses() {
    this.projectStatusService.getStatuses().subscribe({
      next: (statuses) => {
        this.projectStatuses = statuses || [];
        // Force change detection to update child components
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastr.error('Failed to load project statuses', 'Error');
      }
    });
  }

  private setupProjectManagerSearch() {
    // This would be connected to a search input field
    // For now, we'll create a method that can be called when searching
    this.filteredUsers$ = of([]);
  }

  searchProjectManagers(searchTerm: string) {
    // Clear results for empty or short search terms
    if (!searchTerm || searchTerm.trim().length < 3) {
      this.filteredUsers$ = of([]);
      this.isLoadingUsers = false;
      return;
    }
    
    // Validate search term - only allow alphanumeric, spaces, and common name characters
    const cleanSearchTerm = searchTerm.trim().replace(/[^a-zA-Z0-9\s\-\.]/g, '');
    if (cleanSearchTerm !== searchTerm.trim()) {
    }
    
    if (cleanSearchTerm.length < 3) {
      this.filteredUsers$ = of([]);
      this.isLoadingUsers = false;
      return;
    }
    
    this.isLoadingUsers = true;
    this.filteredUsers$ = this.projectsService.getFilteredUsers({}).pipe(
      map((response: any) => {
        this.isLoadingUsers = false;
        // Filter users by search term on the client side
        const allUsers = response.data || [];
        const searchLower = cleanSearchTerm.toLowerCase();
        return allUsers.filter((user: any) => 
          user.name?.toLowerCase().includes(searchLower) || 
          user.email?.toLowerCase().includes(searchLower)
        );
      }),
      catchError((error) => {
        this.isLoadingUsers = false;
        // Show user-friendly error message
        if (error.message?.includes('400')) {
          this.toastr.error('Invalid search term. Please use only letters, numbers, and spaces.', 'Search Error');
        } else if (error.message?.includes('500')) {
          this.toastr.error('Server error while searching for users. Please try again later.', 'Search Error');
        } else {
          this.toastr.error('Failed to search for users. Please check your connection.', 'Search Error');
        }
        
        return of([]);
      })
    );
  }

  onProjectManagerSelect(user: UserFilterResponse) {
    this.selectedProjectManagerId = user.id;
    this.manager = user.name;
  }

  onDeliveryUnitSelect(deliveryUnitId: number) {
    this.selectedDeliveryUnitId = deliveryUnitId;
    const selectedDU = this.deliveryUnits.find(du => du.id === deliveryUnitId);
    if (selectedDU) {
      this.deliveryUnit = selectedDU.code;
    }
  }

  // Event handlers for form changes
  onProjectNameChange(name: string) {
    this.projectName = name;
  }

  onProjectKeyChange(key: string) {
    this.projectKey = key;
  }

  onDescriptionChange(desc: string) {
    this.description = desc;
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

  onCustomerDescriptionChange(description: string) {
    this.customerDescription = description;
  }

  onDomainLinkChange(link: string) {
    this.domainLink = link;
  }

  onManagerChange(manager: string) {
    this.manager = manager;
  }

  onDeliveryUnitChange(unit: string) {
    this.deliveryUnit = unit;
    
    // Find the corresponding delivery unit ID
    const selectedDU = this.deliveryUnits.find(du => du.code === unit);
    if (selectedDU) {
      this.selectedDeliveryUnitId = selectedDU.id;
    }
  }

  onAdditionalFieldsChange(fields: Array<{id?: string, name: string, value: string}>) {
    this.additionalFields = fields;
  }

  private getStatusIdByName(statusName: string): number {
    const status = this.projectStatuses.find(s => s.name === statusName || s.code === statusName);
    return status ? status.id : 1; // Default to 1 (Active) if not found
  }

  // Sync custom fields to backend: delete removed, create new, update modified
  private async syncCustomFields(): Promise<void> {
    try {
      // Track fields to delete, create, and update
      const fieldsToDelete: Array<{id?: string, name: string, value: string}> = [];
      const fieldsToCreate: Array<{id?: string, name: string, value: string}> = [];
      const fieldsToUpdate: Array<{id?: string, name: string, value: string}> = [];

      // Find deleted fields (in original but not in current by ID)
      this.originalAdditionalFields.forEach(originalField => {
        const exists = this.additionalFields.some(
          field => field.id === originalField.id  // Only check by ID, not name
        );
        if (!exists && originalField.id) {
          fieldsToDelete.push(originalField);
        }
      });

      // Find new and modified fields
      this.additionalFields.forEach(currentField => {
        const originalField = this.originalAdditionalFields.find(f => f.id === currentField.id);
        
        if (!originalField) {
          // New field - no ID yet
          if (!currentField.id) {
            fieldsToCreate.push(currentField);
          }
        } else if (originalField.name !== currentField.name || originalField.value !== currentField.value) {
          // Modified field
          fieldsToUpdate.push(currentField);
        }
      });
      // Delete removed fields
      for (const field of fieldsToDelete) {
        if (field.id) {
          try {
            await this.deleteCustomField(field.id).toPromise();
          } catch (error) {
          }
        }
      }

      // Create new fields
      for (const field of fieldsToCreate) {
        try {
          await this.createCustomField(field).toPromise();
        } catch (error) {
        }
      }

      // Handle updated fields by deleting old and creating new with updated values
      if (fieldsToUpdate.length > 0) {
        for (const field of fieldsToUpdate) {
          if (field.id) {
            try {
              await this.deleteCustomField(field.id).toPromise();
              // Recreate with new values
              try {
                await this.createCustomField(field).toPromise();
              } catch (createError) {
              }
            } catch (deleteError) {
            }
          }
        }
      }
    } catch (error) {
      this.toastr.error('Failed to sync custom fields', 'Error');
    }
  }

  private deleteCustomField(fieldId: string) {
    return this.projectsService.deleteCustomField(fieldId);
  }

  private createCustomField(field: {id?: string, name: string, value: string}) {
    return this.projectsService.createCustomField(this.projectId, field.name, field.value);
  }

  onUpdateProject() {
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

    // Validate required fields before sending
    if (!this.projectId) {
      this.toastr.error('Project ID is missing', 'Validation Error');
      return;
    }

    if (this.selectedDeliveryUnitId === 0) {
      this.toastr.error('Please select a delivery unit', 'Validation Error');
      return;
    }

    if (this.selectedProjectManagerId === 0) {
      this.toastr.error('Please select a project manager', 'Validation Error');
      return;
    }

    // Create the update request with the correct structure (matching backend UpdateProjectCommand)
    const updateRequest: UpdateProjectRequest = {
      id: this.projectId, // Required - GUID format
      name: this.projectName?.trim() || '',
      key: this.projectKey?.trim() || '',
      description: this.description?.trim() || undefined,
      customerOrgName: this.organisationName?.trim() || undefined,
      customerDomainUrl: this.domainLink?.trim() || undefined,
      customerDescription: this.customerDescription?.trim() || undefined,
      pocEmail: this.pocEmail?.trim() || undefined,
      pocPhone: this.phoneNumber?.trim() || undefined,
      projectManagerId: this.selectedProjectManagerId > 0 ? this.selectedProjectManagerId : undefined,
      projectManagerRoleId: this.selectedProjectManagerId > 0 ? 2 : undefined,
      statusId: this.getStatusIdByName(this.status),
      deliveryUnitId: this.selectedDeliveryUnitId > 0 ? this.selectedDeliveryUnitId : undefined
      // NOTE: Custom fields are NOT sent with project update
      // They are managed separately through custom field API endpoints
    };

    // Validate required fields before API call
    // Final validation before sending
    if (!this.projectId || this.projectId.trim() === '') {
      this.toastr.error('Project ID is required', 'Validation Error');
      return;
    }

    if (!updateRequest.name || updateRequest.name.trim() === '') {
      this.toastr.error('Project name is required', 'Validation Error');
      return;
    }

    if (!updateRequest.key || updateRequest.key.trim() === '') {
      this.toastr.error('Project key is required', 'Validation Error');
      return;
    }

    if (!updateRequest.statusId || updateRequest.statusId <= 0) {
      this.toastr.error('Valid status is required', 'Validation Error');
      return;
    }

    if (!updateRequest.deliveryUnitId || updateRequest.deliveryUnitId <= 0) {
      this.toastr.error('Valid delivery unit is required', 'Validation Error');
      return;
    }

    

    // Update the project using the service (now returns Observable)
    this.isUpdatingProject = true;
    this.projectsService.updateProject(this.projectId, updateRequest).subscribe({
      next: (response) => {
        this.isUpdatingProject = false;
        // After successful project update, sync custom fields
        this.syncCustomFields().then(() => {
          // Show success message
          this.showSuccess = true;
          this.toastr.success(
            `${this.projectName} updated successfully`,
            'Success',
            {
              timeOut: 3000,
              progressBar: true,
              closeButton: true
            }
          );
          setTimeout(() => {
            this.showSuccess = false;
            this.router.navigate(['/projects']);
          }, 1800);
        }).catch((syncError) => {
          // Show partial success (project updated but fields sync failed)
          this.showSuccess = true;
          this.toastr.warning(
            `${this.projectName} updated, but some custom fields may not have been synchronized properly`,
            'Partial Success',
            {
              timeOut: 4000,
              progressBar: true,
              closeButton: true
            }
          );
          
          setTimeout(() => {
            this.showSuccess = false;
            this.router.navigate(['/projects']);
          }, 2000);
        });
      },
      error: (error) => {
        this.isUpdatingProject = false;
        // The enhanced error handling from service will provide detailed logs
        let errorMessage = 'Failed to update project. Please check your input and try again.';
        let errorTitle = 'Update Failed';
        
        // Check for specific error types
        if (error.message && error.message.includes('Project Key Conflict')) {
          const suggestion = this.originalProjectKey && this.originalProjectKey !== this.projectKey 
            ? ` Try using the original key "${this.originalProjectKey}" or choose a unique key.`
            : ' Please choose a different project key.';
          errorMessage = `The project key "${this.projectKey}" is already used by another project.${suggestion}`;
          errorTitle = 'Duplicate Project Key';
        } else if (error.message && error.message.includes('Data Conflict')) {
          errorMessage = 'Some of the data conflicts with existing records. Please check for duplicate values and try again.';
          errorTitle = 'Data Conflict';
        } else if (error.message && error.message.includes('400')) {
          errorMessage = 'Invalid data provided. Please verify all required fields are correctly filled and try again.';
          errorTitle = 'Validation Error';
        } else if (error.message && error.message.includes('401')) {
          errorMessage = 'You are not authorized to update this project.';
          errorTitle = 'Authorization Error';
        } else if (error.message && error.message.includes('404')) {
          errorMessage = 'Project not found. It may have been deleted.';
          errorTitle = 'Project Not Found';
        } else if (error.message && error.message.includes('500')) {
          errorMessage = 'Server error occurred. Please try again later.';
          errorTitle = 'Server Error';
        }
        
        this.toastr.error(
          errorMessage,
          errorTitle,
          {
            timeOut: 7000,
            progressBar: true,
            closeButton: true
          }
        );
      }
    });
  }

  onEditTeamMembers() {
    // Navigate to team members edit page
    this.router.navigate(['/projects', this.projectId, 'team']);
  }

  onCancel() {
    // Navigate back to project details
    this.router.navigate(['/projects', this.projectId]);
  }

  // Debug method - remove after fixing
  debugDataStatus() {
  }

  // Force refresh method - remove after fixing
  forceRefresh() {
    this.loadProjectData();
    this.loadDeliveryUnits();
    
    // Force immediate change detection
    this.cdr.detectChanges();
    
    // Also trigger after a delay
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 50);
  }

  // Debug update data method - remove after fixing
  debugUpdateData() {
    // Test if the button is actually calling the method
    // Show current form validation status
    if (!this.canCreate) {
      this.toastr.warning(
        `Cannot update: Missing ${this.missingFields.join(', ')}`,
        'Validation Check'
      );
    } else {
      this.toastr.info(
        'All required fields are filled. Ready to update!',
        'Validation Check'
      );
    }
  }

  // Test minimal update - for debugging API issues
  testMinimalUpdate() {
    if (!this.projectId) {
      this.toastr.error('Project ID is required for testing', 'Test Error');
      return;
    }
    const minimalRequest: UpdateProjectRequest = {
      id: this.projectId,
      name: this.projectName?.trim() || 'Test Project Name',
      key: this.projectKey?.trim() || 'TEST-KEY',
      description: this.description?.trim() || 'Test Description',
      customerOrgName: this.organisationName?.trim() || 'Test Organization',
      pocEmail: this.pocEmail?.trim() || 'test@example.com',
      projectManagerId: this.selectedProjectManagerId || 1,
      statusId: 1,
      deliveryUnitId: this.selectedDeliveryUnitId || 1
    };

    

    this.projectsService.updateProject(this.projectId, minimalRequest).subscribe({
      next: (response) => {
        this.toastr.success('Minimal update test passed!', 'Test Success');
      },
      error: (error) => {
        this.toastr.error('Minimal update test failed', 'Test Failed');
      }
    });
  }

  // Test user filter endpoint - remove after fixing
  testUserEndpoint() {
    this.projectsService.testUserFilterEndpoint().subscribe({
      next: (response) => {
        this.toastr.success('User endpoint is working!', 'Test Result');
      },
      error: (error) => {
        this.toastr.error(`User endpoint failed: ${error.status} - ${error.message}`, 'Test Result');
      }
    });
  }

  get canCreate(): boolean {
    // Check core fields: project name, project key, status, project manager, and delivery unit
    const coreFieldsValid = !!(
      this.projectName?.trim() &&
      this.projectKey?.trim() &&
      this.status &&
      this.selectedProjectManagerId &&
      this.selectedDeliveryUnitId
    );

    if (!coreFieldsValid) {
      return false;
    }

    // Validate email if provided (must be valid or empty)
    if (this.pocEmail && this.pocEmail.trim() !== '') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.pocEmail)) {
        return false;
      }
    }

    // Validate phone if provided (must be valid or empty)
    if (this.phoneNumber && this.phoneNumber.trim() !== '') {
      const phonePattern = /^\+?[\d\s\-()]{7,}$/;
      if (!phonePattern.test(this.phoneNumber)) {
        return false;
      }
    }

    return true;
  }

  get missingFields(): string[] {
    const missing: string[] = [];
    if (!this.projectName || !this.projectName.trim()) missing.push('Project Name');
    if (!this.projectKey || !this.projectKey.trim()) missing.push('Project Key');
    if (!this.status) missing.push('Status');
    if (!this.selectedProjectManagerId) missing.push('Project Manager');
    if (!this.selectedDeliveryUnitId) missing.push('Delivery Unit');
    return missing;
  }

  getInitials(): string {
    if (!this.projectName) {
      return 'PN';
    }
    const words = this.projectName.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 0) {
      return 'PN';
    }
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    // Safe access to avoid undefined character access
    const firstChar = words[0] && words[0][0] ? words[0][0] : 'P';
    const secondChar = words[1] && words[1][0] ? words[1][0] : 'N';
    return (firstChar + secondChar).toUpperCase();
  }

  // Check if project key is available
  checkProjectKey() {
    if (!this.projectKey || this.projectKey.trim() === '') {
      this.toastr.warning('Please enter a project key to check', 'Validation');
      return;
    }
    this.projectsService.checkProjectKeyAvailability(this.projectKey.trim(), this.projectId).subscribe({
      next: (response) => {
        if (response.data.available) {
          this.toastr.success(`Project key "${this.projectKey}" is available!`, 'Key Available');
        } else {
          this.toastr.error(`Project key "${this.projectKey}" is already in use. Please choose a different key.`, 'Key Unavailable');
        }
      },
      error: (error) => {
        this.toastr.info('Project key validation is not available. The key will be checked when saving.', 'Info');
      }
    });
  }

  // Test with exact format from API documentation
  testExactApiFormat() {
    if (!this.projectId) {
      this.toastr.error('Project ID is required for testing', 'Test Error');
      return;
    }
    // Use the exact structure from your successful API example
    // Generate a unique key to avoid conflicts
    const uniqueKey = `TEST-${Date.now()}`;
    const exactFormatRequest: UpdateProjectRequest = {
      id: this.projectId,
      name: "Project Updated Test",
      key: uniqueKey, 
      description: "Description for Project Updated Test",
      customerOrgName: "Customer Org 1 Updated",
      customerDomainUrl: "https://example.com",
      customerDescription: "Updated customer description",
      pocEmail: "customer1@example.com",
      pocPhone: "+1234567890",
      projectManagerId: 2,
      projectManagerRoleId: 2,
      statusId: 1,
      deliveryUnitId: 1,
      customFields: [
        {
          id: "00000000-0000-0000-0000-000000000049",
          name: "Budget",
          value: "$800,000"
        },
        {
          id: "00000000-0000-0000-0000-000000000050",
          name: "Client Priority", 
          value: "Medium"
        }
      ]
    };

    

    this.projectsService.updateProject(this.projectId, exactFormatRequest).subscribe({
      next: (response) => {
        this.toastr.success('Exact format test passed!', 'Test Success');
      },
      error: (error) => {
        this.toastr.error('Exact format test failed - check console for details', 'Test Failed');
      }
    });
  }
}
