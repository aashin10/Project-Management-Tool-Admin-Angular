import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../../shared/sectiontitle/sectiontitle';
import { BasicInformationComponent } from '../../../pages/createproject/basicinfo/basicinfo';
import { TeamOrganizationComponent } from '../../../pages/createproject/teaminfo/teaminfo';
import { Additionalinfo } from '../../../pages/createproject/additionalinfo/additionalinfo';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { ProjectsService, Project, UpdateProjectRequest, UserFilterResponse, DeliveryUnit } from '../../../services/projects.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';

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
  description: string = '';
  
  // Customer info
  organisationName: string = '';
  pocEmail: string = '';
  phoneNumber: string = '';
  
  // Team info
  manager: string = '';
  deliveryUnit: string = '';
  selectedProjectManagerId: number = 0;
  selectedDeliveryUnitId: number = 0;
  
  // Additional fields
  additionalFields: Array<{name: string, value: string}> = [];

  // Dropdown data
  filteredUsers$: Observable<UserFilterResponse[]> = of([]);
  deliveryUnits: DeliveryUnit[] = [];
  
  // Loading states
  isLoadingUsers = false;
  isUpdatingProject = false;

  showSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Get project ID from route
    this.projectId = this.route.snapshot.params['id'];
    console.log('Edit Project - Project ID from route:', this.projectId);
    
    // Load data immediately
    this.loadDeliveryUnits();
    this.loadProjectData();
    this.setupProjectManagerSearch();
    
    // Fallback: Force change detection after a short delay to ensure everything is rendered
    setTimeout(() => {
      console.log('Fallback change detection triggered');
      this.cdr.detectChanges();
    }, 100);
  }

  loadProjectData() {
    console.log('Loading project data for ID:', this.projectId);
    
    if (!this.projectId) {
      console.error('No project ID provided');
      this.toastr.error('Invalid project ID', 'Error');
      return;
    }

    this.projectsService.getProjectById(this.projectId).subscribe({
      next: (response) => {
        console.log('Project data received:', response);
        
        if (response.status === 200 && response.data) {
          const project = response.data;
          
          // Populate form fields
          this.projectName = project.name || '';
          this.projectKey = project.key || '';
          this.description = project.description || '';
          this.organisationName = project.customerOrgName || '';
          this.pocEmail = project.pocEmail || '';
          this.phoneNumber = project.pocPhone || '';
          this.manager = project.projectManagerName || '';
          this.deliveryUnit = project.deliveryUnitCode || '';
          this.selectedProjectManagerId = project.projectManagerId || 0;
          this.selectedDeliveryUnitId = project.deliveryUnitId || 0;
          this.additionalFields = project.additionalInformation || [];
          
          console.log('Form populated with:', {
            projectName: this.projectName,
            deliveryUnit: this.deliveryUnit,
            selectedDeliveryUnitId: this.selectedDeliveryUnitId
          });

          // Force change detection to update child components immediately
          this.cdr.detectChanges();
        } else {
          console.error('Invalid response format:', response);
          this.toastr.error('Invalid project data received', 'Error');
        }
      },
      error: (err) => {
        console.error('Failed to load project for editing:', err);
        this.toastr.error('Failed to load project data. Please try refreshing the page.', 'Error');
      }
    });
  }

  private loadDeliveryUnits() {
    console.log('Loading delivery units...');
    
    this.projectsService.getDeliveryUnits().subscribe({
      next: (response) => {
        console.log('Delivery units received:', response);
        this.deliveryUnits = response.data || [];
        console.log('Delivery units set to:', this.deliveryUnits);
        
        // Force change detection to update child components
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load delivery units:', error);
        this.toastr.error('Failed to load delivery units', 'Error');
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
      console.warn('Invalid characters removed from search term:', searchTerm, '->', cleanSearchTerm);
    }
    
    if (cleanSearchTerm.length < 3) {
      this.filteredUsers$ = of([]);
      this.isLoadingUsers = false;
      return;
    }
    
    this.isLoadingUsers = true;
    console.log('Searching for users with term:', cleanSearchTerm);
    
    this.filteredUsers$ = this.projectsService.getFilteredUsers(cleanSearchTerm).pipe(
      map(response => {
        this.isLoadingUsers = false;
        console.log('User search results:', response);
        return response.data || [];
      }),
      catchError((error) => {
        this.isLoadingUsers = false;
        console.error('Failed to search for users:', error);
        
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

  onManagerChange(manager: string) {
    this.manager = manager;
  }

  onDeliveryUnitChange(unit: string) {
    console.log('Delivery unit changed to:', unit);
    this.deliveryUnit = unit;
    
    // Find the corresponding delivery unit ID
    const selectedDU = this.deliveryUnits.find(du => du.code === unit);
    if (selectedDU) {
      this.selectedDeliveryUnitId = selectedDU.id;
      console.log('Selected delivery unit ID:', this.selectedDeliveryUnitId);
    }
  }

  onAdditionalFieldsChange(fields: Array<{name: string, value: string}>) {
    this.additionalFields = fields;
  }

  onUpdateProject() {
    console.log('=== Starting Project Update ===');
    console.log('Project ID:', this.projectId);
    console.log('Form Data:', {
      projectName: this.projectName,
      projectKey: this.projectKey,
      manager: this.manager,
      deliveryUnit: this.deliveryUnit,
      organisationName: this.organisationName,
      pocEmail: this.pocEmail,
      phoneNumber: this.phoneNumber,
      selectedProjectManagerId: this.selectedProjectManagerId,
      selectedDeliveryUnitId: this.selectedDeliveryUnitId
    });

    // Validate required fields before sending
    if (!this.projectId) {
      this.toastr.error('Project ID is missing', 'Validation Error');
      return;
    }

    if (this.selectedDeliveryUnitId === 0) {
      this.toastr.error('Please select a delivery unit', 'Validation Error');
      return;
    }

    // Create the update request with the correct structure
    const updateRequest: UpdateProjectRequest = {
      id: this.projectId,
      name: this.projectName,
      key: this.projectKey, // Changed from projectCode to key
      description: this.description,
      customerOrgName: this.organisationName,
      customerDomainUrl: '', // Default or add form field
      customerDescription: '', // Default or add form field  
      pocEmail: this.pocEmail,
      pocPhone: this.phoneNumber || '', // Make sure it's not undefined
      projectManagerId: this.selectedProjectManagerId,
      projectManagerRoleId: 0, // TODO: Get actual role ID
      statusId: 1, // Default active status
      deliveryUnitId: this.selectedDeliveryUnitId,
      createdBy: 1, // TODO: Get from auth service
      metadata: '', // Default or add form field
      templateId: 0, // Default or add form field
      customFields: this.additionalFields.map(field => ({
        id: '', // Generate or get from backend
        name: field.name,
        value: field.value
      }))
    };

    console.log('Update Request Payload:', updateRequest);

    // Update the project using the service (now returns Observable)
    this.isUpdatingProject = true;
    
    console.log('Calling projectsService.updateProject...');
    this.projectsService.updateProject(this.projectId, updateRequest).subscribe({
      next: (response) => {
        this.isUpdatingProject = false;
        console.log('=== Project Update SUCCESS ===');
        console.log('API Response:', response);
        
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
        
        console.log('Success notification shown');
        
        setTimeout(() => {
          this.showSuccess = false;
          console.log('Navigating to projects list...');
          this.router.navigate(['/projects']);
        }, 1800);
      },
      error: (error) => {
        this.isUpdatingProject = false;
        console.error('=== Project Update FAILED ===');
        console.error('Error Details:', error);
        console.error('Error Status:', error.status);
        console.error('Error Message:', error.message);
        
        let errorMessage = 'Failed to update project. Please try again.';
        
        if (error.status === 400) {
          errorMessage = 'Invalid project data. Please check all required fields.';
        } else if (error.status === 401) {
          errorMessage = 'You are not authorized to update this project.';
        } else if (error.status === 404) {
          errorMessage = 'Project not found. It may have been deleted.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.toastr.error(
          errorMessage,
          'Update Failed',
          {
            timeOut: 5000,
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
    console.log('=== DEBUG DATA STATUS ===');
    console.log('Project ID:', this.projectId);
    console.log('Project Name:', this.projectName);
    console.log('Project Key:', this.projectKey);
    console.log('Manager:', this.manager);
    console.log('Delivery Unit:', this.deliveryUnit);
    console.log('Selected Delivery Unit ID:', this.selectedDeliveryUnitId);
    console.log('Available Delivery Units:', this.deliveryUnits);
    console.log('Delivery Units Length:', this.deliveryUnits?.length);
    console.log('Organisation Name:', this.organisationName);
    console.log('POC Email:', this.pocEmail);
    console.log('Phone Number:', this.phoneNumber);
    console.log('========================');
  }

  // Force refresh method - remove after fixing
  forceRefresh() {
    console.log('Force refreshing data and change detection...');
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
    console.log('=== DEBUG UPDATE DATA ===');
    console.log('Can Update:', this.canCreate);
    console.log('Missing Fields:', this.missingFields);
    console.log('Project ID:', this.projectId);
    console.log('Is Updating:', this.isUpdatingProject);
    
    // Test if the button is actually calling the method
    console.log('Update Project button was clicked');
    
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
    
    console.log('=========================');
  }

  // Test user filter endpoint - remove after fixing
  testUserEndpoint() {
    console.log('Testing user filter endpoint...');
    this.projectsService.testUserFilterEndpoint().subscribe({
      next: (response) => {
        console.log('User filter endpoint test success:', response);
        this.toastr.success('User endpoint is working!', 'Test Result');
      },
      error: (error) => {
        console.error('User filter endpoint test failed:', error);
        this.toastr.error(`User endpoint failed: ${error.status} - ${error.message}`, 'Test Result');
      }
    });
  }

  get canCreate(): boolean {
    const basic = !!(this.projectName && this.projectName.trim() && this.projectKey && this.projectKey.trim());
    const team = !!(this.manager && this.manager.trim() && this.deliveryUnit && this.deliveryUnit.trim());
    const customer = !!(this.organisationName && this.organisationName.trim() && this.pocEmail && this.pocEmail.trim());
    return basic && team && customer;
  }

  get missingFields(): string[] {
    const missing: string[] = [];
    if (!this.projectName || !this.projectName.trim()) missing.push('Project Name');
    if (!this.projectKey || !this.projectKey.trim()) missing.push('Project Key');
    if (!this.manager || !this.manager.trim()) missing.push('Project Manager');
    if (!this.deliveryUnit || !this.deliveryUnit.trim()) missing.push('Delivery Unit');
    if (!this.organisationName || !this.organisationName.trim()) missing.push('Organisation Name');
    if (!this.pocEmail || !this.pocEmail.trim()) missing.push('POC Email');
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
}
