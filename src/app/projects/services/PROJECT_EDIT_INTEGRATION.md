# Project Edit Integration Guide

This guide shows how to integrate the project editing functionality with dropdowns for Project Manager and Delivery Unit selection.

## Service Methods Added

### 1. Update Project
```typescript
updateProject(id: string, projectData: UpdateProjectRequest): Observable<ApiResponse<any>>
```

### 2. Get Filtered Users (Project Manager Dropdown)
```typescript
getFilteredUsers(searchTerm?: string): Observable<ApiResponse<UserFilterResponse[]>>
```

### 3. Get Delivery Units (Delivery Unit Dropdown)
```typescript
getDeliveryUnits(): Observable<ApiResponse<DeliveryUnit[]>>
```

## API Endpoints Used

- **PUT** `https://localhost:7178/api/Projects/{id}` - Update project
- **GET** `https://localhost:7178/api/User/filter?searchTerm=` - Get filtered users
- **GET** `https://localhost:7178/api/delivery-unit` - Get all delivery units

## Component Integration Example

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectsService, UpdateProjectRequest, UserFilterResponse, DeliveryUnit } from '../services/projects.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html'
})
export class EditProjectComponent implements OnInit {
  editProjectForm: FormGroup;
  projectId: string = '11111111-1111-1111-1111-111111111111'; // Get from route params
  
  // Dropdown data
  filteredUsers$: Observable<UserFilterResponse[]> = of([]);
  deliveryUnits: DeliveryUnit[] = [];
  
  // Loading states
  isLoadingUsers = false;
  isUpdatingProject = false;

  constructor(
    private fb: FormBuilder,
    private projectsService: ProjectsService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.loadDeliveryUnits();
    this.setupProjectManagerSearch();
  }

  private createForm() {
    this.editProjectForm = this.fb.group({
      name: ['', [Validators.required]],
      key: ['', [Validators.required]],
      description: [''],
      customerOrgName: [''],
      customerDomainUrl: [''],
      customerDescription: [''],
      pocEmail: ['', [Validators.email]],
      pocPhone: [''],
      projectManagerId: [0, [Validators.required]],
      projectManagerRoleId: [0],
      statusId: [1],
      deliveryUnitId: [0, [Validators.required]],
      createdBy: [1], // Get from auth service
      metadata: [''],
      templateId: [0],
      customFields: [[]]
    });
  }

  private setupProjectManagerSearch() {
    // Set up real-time search for project manager dropdown
    this.filteredUsers$ = this.editProjectForm.get('projectManagerSearch')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        if (!searchTerm || searchTerm.length < 2) {
          return of([]);
        }
        this.isLoadingUsers = true;
        return this.projectsService.getFilteredUsers(searchTerm).pipe(
          map(response => {
            this.isLoadingUsers = false;
            return response.data;
          }),
          catchError(() => {
            this.isLoadingUsers = false;
            return of([]);
          })
        );
      })
    ) || of([]);
  }

  private loadDeliveryUnits() {
    this.projectsService.getDeliveryUnits().subscribe({
      next: (response) => {
        this.deliveryUnits = response.data;
      },
      error: (error) => {
        console.error('Failed to load delivery units:', error);
      }
    });
  }

  onProjectManagerSelect(user: UserFilterResponse) {
    this.editProjectForm.patchValue({
      projectManagerId: user.id
    });
  }

  onUpdateProject() {
    if (this.editProjectForm.valid) {
      this.isUpdatingProject = true;
      
      const updateData: UpdateProjectRequest = {
        id: this.projectId,
        ...this.editProjectForm.value
      };

      this.projectsService.updateProject(this.projectId, updateData).subscribe({
        next: (response) => {
          this.isUpdatingProject = false;
          console.log('Project updated successfully:', response);
          // Show success message, navigate back, etc.
        },
        error: (error) => {
          this.isUpdatingProject = false;
          console.error('Failed to update project:', error);
          // Show error message
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.editProjectForm.markAllAsTouched();
    }
  }
}
```

## HTML Template Example

```html
<form [formGroup]="editProjectForm" (ngSubmit)="onUpdateProject()">
  
  <!-- Basic Project Information -->
  <div class="form-group">
    <label for="name">Project Name *</label>
    <input 
      type="text" 
      id="name" 
      formControlName="name" 
      class="form-control"
      [class.is-invalid]="editProjectForm.get('name')?.invalid && editProjectForm.get('name')?.touched">
  </div>

  <div class="form-group">
    <label for="key">Project Key *</label>
    <input 
      type="text" 
      id="key" 
      formControlName="key" 
      class="form-control"
      [class.is-invalid]="editProjectForm.get('key')?.invalid && editProjectForm.get('key')?.touched">
  </div>

  <!-- Project Manager Dropdown with Search -->
  <div class="form-group">
    <label for="projectManager">Project Manager *</label>
    <input 
      type="text" 
      id="projectManagerSearch" 
      formControlName="projectManagerSearch"
      placeholder="Type to search project managers..."
      class="form-control"
      autocomplete="off">
    
    <div class="dropdown-menu" [class.show]="(filteredUsers$ | async)?.length > 0">
      <div class="dropdown-item" 
           *ngFor="let user of filteredUsers$ | async" 
           (click)="onProjectManagerSelect(user)">
        {{ user.name }} <small class="text-muted">{{ user.email }}</small>
      </div>
      <div class="dropdown-item text-center" *ngIf="isLoadingUsers">
        <div class="spinner-border spinner-border-sm"></div> Loading...
      </div>
    </div>
  </div>

  <!-- Delivery Unit Dropdown -->
  <div class="form-group">
    <label for="deliveryUnit">Delivery Unit *</label>
    <select 
      id="deliveryUnit" 
      formControlName="deliveryUnitId" 
      class="form-control"
      [class.is-invalid]="editProjectForm.get('deliveryUnitId')?.invalid && editProjectForm.get('deliveryUnitId')?.touched">
      <option value="0">Select Delivery Unit</option>
      <option *ngFor="let du of deliveryUnits" [value]="du.id">
        {{ du.code }} - {{ du.name }}
      </option>
    </select>
  </div>

  <!-- Customer Information -->
  <div class="form-group">
    <label for="customerOrgName">Customer Organization Name</label>
    <input type="text" id="customerOrgName" formControlName="customerOrgName" class="form-control">
  </div>

  <div class="form-group">
    <label for="customerDomainUrl">Customer Domain URL</label>
    <input type="url" id="customerDomainUrl" formControlName="customerDomainUrl" class="form-control">
  </div>

  <div class="form-group">
    <label for="pocEmail">POC Email</label>
    <input type="email" id="pocEmail" formControlName="pocEmail" class="form-control">
  </div>

  <div class="form-group">
    <label for="pocPhone">POC Phone</label>
    <input type="tel" id="pocPhone" formControlName="pocPhone" class="form-control">
  </div>

  <!-- Submit Button -->
  <div class="form-actions">
    <button 
      type="submit" 
      class="btn btn-primary"
      [disabled]="editProjectForm.invalid || isUpdatingProject">
      <span *ngIf="isUpdatingProject" class="spinner-border spinner-border-sm me-2"></span>
      {{ isUpdatingProject ? 'Updating...' : 'Update Project' }}
    </button>
    <button type="button" class="btn btn-secondary ms-2" (click)="onCancel()">
      Cancel
    </button>
  </div>
</form>
```

## Key Features Implemented

1. **Project Update**: Uses PUT API to update project with all fields from your response body structure
2. **Project Manager Dropdown**: Real-time search with debouncing, calls User filter API as you type
3. **Delivery Unit Dropdown**: Shows only code and name as requested
4. **Error Handling**: Comprehensive error handling with retry logic for network issues
5. **Loading States**: Proper loading indicators for better UX
6. **Form Validation**: Required field validation for critical fields

## Usage Notes

- The search for project managers starts after typing 2+ characters
- Search is debounced by 300ms to avoid excessive API calls
- All HTTP requests have 10-second timeout with retry logic for network errors
- The delivery unit dropdown shows format: "DU_CODE - DU_NAME"
- Custom fields array can be extended as needed
- All APIs use HTTPS localhost:7178 as specified