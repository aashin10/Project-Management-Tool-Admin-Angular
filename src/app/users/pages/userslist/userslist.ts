import { Component, HostListener, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { PaginatedTable, PaginationState } from '../../../shared/paginated-table/paginated-table';
import { Modal } from '../../../shared/modal/modal';
import { UsersApi, User, CreateUserDto, BulkImportResponse, UpdateUserDto, ApiUser } from '../../services/users-api';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../shared/services/notification.service';
import { Subscription, interval, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


interface Project {
  id: string;
  name: string;
  projectCode: string;
  status: 'Ongoing' | 'On Hold' | 'Completed' | 'Planning' | 'Archived';
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  projectManager: string;
  managerInitials: string;
  teamSize: number;
  selected?: boolean;
}

@Component({
  selector: 'app-userslist',
  imports: [CommonModule, FormsModule, Sectiontitle, CustomButton, SearchBar, PaginatedTable, Modal],
  templateUrl: './userslist.html',
  styleUrl: './userslist.css'
})
export class Userslist implements OnInit, OnDestroy {
  private usersApi = inject(UsersApi);
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);
  private notificationService = inject(NotificationService);
  private retrySubscription?: Subscription;
  private networkErrorRetryTimer?: any;
  private searchSubject = new Subject<string>();
  
  isLoading = false;
  loadingError: string | null = null;
  
  // Pagination state
  paginationState: PaginationState = {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    sortBy: 'name',
    sortOrder: 'asc'
  };
  onActionClick(event: { action: string; row: any }) {
    console.log('Action clicked:', event.action, 'Row:', event.row);
    
    switch(event.action) {
      case 'edit':
        this.onEditUser(event.row.actions);
        break;
      case 'delete':
        this.userToDelete = event.row.actions;
        this.pendingDeleteAction = 'single';
        this.showDeleteConfirmModal = true;
        break;
      case 'view':
        console.log('View user details:', event.row);
        // Add your view logic here
        break;
    }
  }
  
  onSelectionChange(selectedRows: any[]) {
    this.selectedUsers = selectedRows;
    console.log('Selected users:', selectedRows);
  }
  showTypeDropdown = false;
  showStatusDropdown = false;
  showAdvancedFilter = false;
  showImportModal = false;
  showAddUserModal = false;
  showDeleteConfirmModal = false;
  filterType: string = '';
  filterStatus: string = '';
  searchQuery: string = '';
  selectedFileName: string = '';
  selectedFile: File | null = null;
  isDragging: boolean = false;
  selectedUsers: any[] = [];
  private _resetPagination: boolean = false;
  validationErrors: string[] = [];

  // Custom dropdown states for Add User modal
  showAddUserTypeDropdown = false;
  showAddUserStatusDropdown = false;

  // Edit User modal states
  showEditUserModal = false;
  showEditUserTypeDropdown = false;
  showEditUserStatusDropdown = false;
  showConfirmUpdateModal = false;
  isLoadingUserDetails = false;
  
  // Edit User form fields
  editUser = {
    id: 0,
    name: '',
    email: '',
    jiraId: '',
    type: '',
    status: ''
  };

  // Track original values for change detection
  originalEditUser = {
    id: 0,
    name: '',
    email: '',
    jiraId: '',
    type: '',
    status: ''
  };

  // Character limits
  maxJiraIdLength = 1024;

  get resetPagination(): boolean {
    return this._resetPagination;
  }

  set resetPagination(value: boolean) {
    this._resetPagination = value;
    // Reset back to false after change detection
    if (value) {
      setTimeout(() => this._resetPagination = false, 0);
    }
  }
  pendingDeleteAction: 'single' | 'bulk' = 'bulk';
  userToDelete: any = null;
  
  // Add User form fields
  newUser = {
    fullName: '',
    email: '',
    jiraId: '',
    type: '',
    status: ''
  };

  typeOptions = [
    { label: 'Internal', value: 'Internal' },
    { label: 'External', value: 'External' }
  ];
  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  onAddUser() {
    // Show add user modal
    this.showAddUserModal = true;
  }
  
  closeAddUserModal() {
    this.showAddUserModal = false;
    this.validationErrors = [];
    // Reset form
    this.newUser = {
      fullName: '',
      email: '',
      jiraId: '',
      type: '',
      status: ''
    };
    // Close dropdowns
    this.showAddUserTypeDropdown = false;
    this.showAddUserStatusDropdown = false;
  }
  
  submitNewUser() {
    // Reset validation errors
    this.validationErrors = [];
    
    // Validate required fields
    if (!this.newUser.fullName?.trim()) {
      this.validationErrors.push('Full Name is required');
    } else {
      // Validate name format: only letters, spaces, hyphens, and apostrophes
      const namePattern = /^[a-zA-Z\s'-]+$/;
      if (!namePattern.test(this.newUser.fullName.trim())) {
        this.validationErrors.push('Name should only contain letters, spaces, hyphens, and apostrophes (no numbers or special characters)');
      }
    }
    
    if (!this.newUser.email?.trim()) {
      this.validationErrors.push('Email is required');
    } else {
      // Validate email format
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.newUser.email.trim())) {
        this.validationErrors.push('Please enter a valid email address');
      }
    }
    
    // If there are validation errors, don't submit
    if (this.validationErrors.length > 0) {
      return;
    }
    
    // Prepare user data for API (backend handles password, avatar, defaults)
    const createUserData: CreateUserDto = {
      email: this.newUser.email.trim(),
      name: this.newUser.fullName.trim(),
      jiraId: this.newUser.jiraId?.trim() || undefined,
      type: this.newUser.type || undefined,
      status: this.newUser.status || undefined,
      createdBy: 1 // ID of the user creating this user
    };
    
    console.log('Creating new user:', createUserData);
    
    // Show loading state first
    this.isLoading = true;
    
    // Close modal immediately
    this.closeAddUserModal();
    
    // Call API to create user
    this.usersApi.createUser(createUserData).subscribe({
      next: (response) => {
        console.log('User created successfully:', response);
        
        // Backend returns array, get first user
        const createdUser = response.data && response.data.length > 0 ? response.data[0] : null;
        
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          
          if (createdUser) {
            // Show success toaster notification
            this.toastr.success('User Added Successfully', '', {
              timeOut: 3000,
              progressBar: true,
              closeButton: true,
            });
            
            // Add notification to notification service (stored in localStorage)
            this.notificationService.addNotification(
              'success',
              `User "${createdUser.name}" has been added successfully.`,
              'User Added'
            );
          }
          
          // Clear cache and refresh the users list to show the new user
          this.usersApi.refreshUsers().subscribe({
            next: (users) => {
              this.users = users;
              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Failed to refresh users after creation:', error);
              this.isLoading = false;
            }
          });
        }, 0);
      },
      error: (error) => {
        console.error('Failed to create user:', error);
        console.log('Component: Error object:', error);
        console.log('Component: Error.message:', error.message);
        console.log('Component: Error type:', typeof error);
        
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          
          // Extract the error message
          const errorMessage = error?.message || 'Failed to create user';
          console.log('Component: Final error message to display:', errorMessage);
          
          // Show error toaster notification
          this.toastr.error(errorMessage, 'Error', {
            timeOut: 5000,
            progressBar: true,
            closeButton: true,
          });
        }, 0);
      }
    });
  }

  // ============ EDIT USER METHODS ============

  /**
   * Opens edit modal and fetches user details
   */
  onEditUser(user: any) {
    console.log('Opening edit modal for user:', user);
    
    if (!user.id) {
      console.error('User ID is missing!', user);
      this.toastr.error('Cannot edit user: ID is missing', 'Error');
      return;
    }
    
    // Show loading state
    this.isLoadingUserDetails = true;
    this.showEditUserModal = true;
    
    // Fetch user details by ID
    this.usersApi.getUserById(user.id).subscribe({
      next: (response) => {
        console.log('User details fetched:', response);
        
        const userData = response.data;
        
        // Populate edit form
        this.editUser = {
          id: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          jiraId: userData.jiraId || '',
          type: userData.type || '',
          status: userData.status || ''
        };

        // Store original values for change detection
        this.originalEditUser = { ...this.editUser };
        
        this.isLoadingUserDetails = false;
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => this.cdr.detectChanges());
      },
      error: (error) => {
        console.error('Failed to fetch user details:', error);
        
        this.isLoadingUserDetails = false;
        this.showEditUserModal = false;
        
        this.toastr.error(error?.message || 'Failed to load user details', 'Error', {
          timeOut: 5000,
          progressBar: true,
          closeButton: true,
        });
      }
    });
  }

  /**
   * Closes the edit modal and resets form
   */
  closeEditUserModal() {
    this.showEditUserModal = false;
    this.validationErrors = [];
    this.isLoadingUserDetails = false;
    
    // Reset form
    this.editUser = {
      id: 0,
      name: '',
      email: '',
      jiraId: '',
      type: '',
      status: ''
    };

    // Reset original values
    this.originalEditUser = { ...this.editUser };

    // Close dropdowns
    this.showEditUserTypeDropdown = false;
    this.showEditUserStatusDropdown = false;
  }

  /**
   * Validates the edit form
   */
  validateEditForm(): boolean {
    this.validationErrors = [];

    // Validate Type (required)
    if (!this.editUser.type) {
      this.validationErrors.push('Type is required');
    } else if (this.editUser.type !== 'Internal' && this.editUser.type !== 'External') {
      this.validationErrors.push('Type must be either Internal or External');
    }

    // Validate Status (required)
    if (!this.editUser.status) {
      this.validationErrors.push('Status is required');
    } else if (this.editUser.status !== 'Active' && this.editUser.status !== 'Inactive') {
      this.validationErrors.push('Status must be either Active or Inactive');
    }

    // Validate Jira ID length
    if (this.editUser.jiraId && this.editUser.jiraId.length > this.maxJiraIdLength) {
      this.validationErrors.push(`Jira ID cannot exceed ${this.maxJiraIdLength} characters`);
    }

    return this.validationErrors.length === 0;
  }

  /**
   * Detects which fields have changed
   */
  getChangedFields(): string[] {
    const changes: string[] = [];

    if (this.editUser.jiraId !== this.originalEditUser.jiraId) {
      changes.push(`Jira ID: "${this.originalEditUser.jiraId || '(empty)'}" → "${this.editUser.jiraId || '(empty)'}"`);
    }
    if (this.editUser.type !== this.originalEditUser.type) {
      changes.push(`Type: "${this.originalEditUser.type}" → "${this.editUser.type}"`);
    }
    if (this.editUser.status !== this.originalEditUser.status) {
      changes.push(`Status: "${this.originalEditUser.status}" → "${this.editUser.status}"`);
    }

    return changes;
  }

  /**
   * Opens confirmation dialog before updating
   */
  onUpdateUserClick() {
    // Validate first
    if (!this.validateEditForm()) {
      return;
    }

    // Check if any changes were made
    const changes = this.getChangedFields();
    if (changes.length === 0) {
      this.toastr.info('No changes detected', 'Info', {
        timeOut: 3000,
        progressBar: true,
        closeButton: true,
      });
      return;
    }

    // Show confirmation modal
    this.showConfirmUpdateModal = true;
  }

  /**
   * Closes the confirmation dialog
   */
  closeConfirmUpdateModal() {
    this.showConfirmUpdateModal = false;
  }

  /**
   * Confirms and submits the user update
   */
  confirmUpdateUser() {
    // Close confirmation modal
    this.closeConfirmUpdateModal();

    // Prepare update DTO with only changed fields
    const updateDto: UpdateUserDto = {
      updatedBy: 1 // TODO: Replace with actual logged-in user ID
    };

    // Only include changed fields
    if (this.editUser.jiraId !== this.originalEditUser.jiraId) {
      updateDto.jiraId = this.editUser.jiraId || '';
    }
    if (this.editUser.type !== this.originalEditUser.type) {
      updateDto.type = this.editUser.type;
    }
    if (this.editUser.status !== this.originalEditUser.status) {
      // Convert status string to isActive boolean
      updateDto.isActive = this.editUser.status === 'Active';
    }

    console.log('Updating user with DTO:', updateDto);

    // Show loading state
    this.isLoading = true;

    // Close edit modal immediately
    this.closeEditUserModal();

    // Call API to update user
    this.usersApi.updateUser(this.editUser.id, updateDto).subscribe({
      next: (response) => {
        console.log('User updated successfully:', response);

        setTimeout(() => {
          this.isLoading = false;

          // Show success toaster
          this.toastr.success('User updated successfully', 'Success', {
            timeOut: 3000,
            progressBar: true,
            closeButton: true,
          });

          // Add notification
          this.notificationService.addNotification(
            'success',
            `User "${this.editUser.name}" has been updated successfully.`,
            'User Updated'
          );

          // Refresh the users list
          this.fetchUsers();
        }, 0);
      },
      error: (error) => {
        console.error('Failed to update user:', error);

        setTimeout(() => {
          this.isLoading = false;

          const errorMessage = error?.message || 'Failed to update user';

          this.toastr.error(errorMessage, 'Error', {
            timeOut: 5000,
            progressBar: true,
            closeButton: true,
          });
        }, 0);
      }
    });
  }

  /**
   * Handles type dropdown selection in edit modal
   */
  selectEditUserType(type: string) {
    this.editUser.type = type;
    this.showEditUserTypeDropdown = false;
  }

  /**
   * Gets the label for the selected type in edit modal
   */
  getEditUserTypeLabel(): string {
    return this.editUser.type || 'Select Type';
  }

  /**
   * Handles status dropdown selection in edit modal
   */
  selectEditUserStatus(status: string) {
    this.editUser.status = status;
    this.showEditUserStatusDropdown = false;
  }

  /**
   * Gets the label for the selected status in edit modal
   */
  getEditUserStatusLabel(): string {
    return this.editUser.status || 'Select Status';
  }

  // ============ END EDIT USER METHODS ============

  onImport() {
    // Show import modal
    this.showImportModal = true;
  }
  onExport() {
    // Export user data as CSV
    this.exportToCSV();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.selectedFile = file;
      console.log('File selected:', file.name);
    }
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }
  
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if it's a CSV file
      if (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.name.toLowerCase().endsWith('.csv')) {
        this.selectedFileName = file.name;
        this.selectedFile = file;
        console.log('File dropped:', file.name);
      } else {
        this.toastr.error('Please upload a CSV file', 'Invalid File Type', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true,
        });
        this.selectedFileName = '';
        this.selectedFile = null;
      }
    }
  }

  closeImportModal() {
    this.showImportModal = false;
    this.selectedFileName = '';
    this.selectedFile = null;
    this.isDragging = false;
  }

  /**
   * Format notification message to show only first 3 items, then count the rest
   * @param items Array of message strings
   * @param totalCount Total count of items
   * @returns Formatted message string
   */
  formatNotificationMessage(items: string[], totalCount: number): string {
    if (items.length === 0) return '';
    
    const maxItemsToShow = 3;
    if (items.length <= maxItemsToShow) {
      return items.join('; ');
    }
    
    const firstThree = items.slice(0, maxItemsToShow);
    const remaining = totalCount - maxItemsToShow;
    return `${firstThree.join('; ')}; and ${remaining} more...`;
  }

  onSearchChange(query: string) {
    console.log('Search input changed:', query);
    this.searchQuery = query;
    
    // Immediately show loading state for better UX
    // This ensures the table shows loading feedback even during debounce
    if (!this.isLoading) {
      this.isLoading = true;
      this.cdr.detectChanges();
    }
    
    // Emit to search subject for debouncing (backend pagination)
    this.searchSubject.next(query);
    
    // Update selections to only include users that are still visible after filtering
    this.updateSelectionsForFilteredUsers();
  }

  onTypeFilterChange(type: string) {
    this.filterType = type;
    // Reset pagination and fetch users with new filter
    this.onFilterChange();
    // Update selections to only include users that are still visible after filtering
    this.updateSelectionsForFilteredUsers();
  }

  onStatusFilterChange(status: string) {
    this.filterStatus = status;
    // Reset pagination and fetch users with new filter
    this.onFilterChange();
    // Update selections to only include users that are still visible after filtering
    this.updateSelectionsForFilteredUsers();
  }

  updateSelectionsForFilteredUsers() {
    // Filter selected users to only include those that are still visible after filtering
    const filteredUserKeys = new Set(this.filteredUsers.map(user => user.user + '|' + user.email));
    this.selectedUsers = this.selectedUsers.filter(selectedUser => {
      const userKey = selectedUser.user?.name + '|' + selectedUser.user?.email;
      return filteredUserKeys.has(userKey);
    });
  }

  exportToCSV() {
    console.log('Starting CSV export...');
    
    // Show loading state
    this.isLoading = true;
    this.cdr.detectChanges();
    
    // Call API to get all users matching current filters
    this.usersApi.getUsersForExport({
      type: this.filterType || undefined,
      status: this.filterStatus || undefined,
      searchTerm: this.searchQuery?.trim() || undefined
    }).subscribe({
      next: (users) => {
        console.log('Export: Received', users.length, 'users from API');
        
        // Determine which users to export (selected or all filtered)
        const usersToExport = this.selectedUsers.length > 0 
          ? this.selectedUsers.map(su => {
              // Find full user data from the exported users by matching email
              return users.find(u => u.email === su.user?.email) || su.actions;
            })
          : users;
        
        console.log('Export: Exporting', usersToExport.length, 'users');
        
        // Prepare CSV headers
        const headers = ['Name', 'Email', 'Type', 'Status', 'Created On', 'Last Activity'];
        
        // Prepare CSV rows
        const rows = usersToExport.map(user => [
          `"${user.user || user.name || ''}"`,
          `"${user.email || ''}"`,
          user.type || '',
          user.status || '',
          user.created || user.createdAt || '',
          user.lastActivity || user.lastLogin || '-'
        ]);
        
        // Combine headers and rows
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        // Format: users_exported_YYYY-MM-DD.csv
        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `users_exported_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Hide loading state
        this.isLoading = false;
        this.cdr.detectChanges();
        
        // Show success message
        this.toastr.success(
          `Exported ${usersToExport.length} user${usersToExport.length !== 1 ? 's' : ''} to CSV`,
          'Export Successful',
          { timeOut: 3000, progressBar: true, closeButton: true }
        );
      },
      error: (error) => {
        console.error('Export error:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
        
        this.toastr.error(
          error.message || 'Failed to export users',
          'Export Failed',
          { timeOut: 5000, progressBar: true, closeButton: true }
        );
      }
    });
  }

  onAdvancedFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  selectType(value: string) {
    this.filterType = value;
    this.showTypeDropdown = false;
    // Trigger filter change to fetch filtered data
    this.onFilterChange();
  }
  
  selectStatus(value: string) {
    this.filterStatus = value;
    this.showStatusDropdown = false;
    // Trigger filter change to fetch filtered data
    this.onFilterChange();
  }
  getTypeLabel(): string {
    if (!this.filterType) return 'All Types';
    const found = this.typeOptions.find(opt => opt.value === this.filterType);
    return found ? found.label : 'All Types';
  }
  getStatusLabel(): string {
    if (!this.filterStatus) return 'All Status';
    const found = this.statusOptions.find(opt => opt.value === this.filterStatus);
    return found ? found.label : 'All Status';
  }

  // Custom dropdown methods for Add User modal
  selectAddUserType(value: string) {
    this.newUser.type = value;
    this.showAddUserTypeDropdown = false;
  }

  selectAddUserStatus(value: string) {
    this.newUser.status = value;
    this.showAddUserStatusDropdown = false;
  }

  getAddUserTypeLabel(): string {
    if (!this.newUser.type) return 'Select Type';
    const found = this.typeOptions.find(opt => opt.value === this.newUser.type);
    return found ? found.label : 'Select Type';
  }

  getAddUserStatusLabel(): string {
    if (!this.newUser.status) return 'Select Status';
    const found = this.statusOptions.find(opt => opt.value === this.newUser.status);
    return found ? found.label : 'Select Status';
  }
  
  // Sample user data
  users: User[] = [];

  // Table columns configuration
  tableColumns = [
    { header: 'User', field: 'user', type: 'user' as const },
    { header: 'Type', field: 'type', type: 'badge' as const },
    { header: 'Status', field: 'status', type: 'badge' as const },
    { header: 'Created', field: 'created', type: 'text' as const },
    { header: 'Last Login', field: 'lastLogin', type: 'badge' as const },
    { header: 'Actions', field: 'actions', type: 'actions' as const, actions: [
      { label: 'Edit', action: 'edit', icon: 'images/edit.svg' },
      { label: 'Delete', action: 'delete', icon: 'images/delete.svg', class: 'danger' }
    ] }
  ];

  ngOnInit() {
    console.log('Userslist component initialized');
    console.log('Component: ngOnInit - isLoading:', this.isLoading, 'loadingError:', this.loadingError);
    
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(400), // Wait 400ms after user stops typing
      distinctUntilChanged() // Only emit if value has changed
    ).subscribe(searchTerm => {
      console.log('Search term changed:', searchTerm);
      // Reset to page 1 when search changes
      this.paginationState.currentPage = 1;
      this.fetchUsers();
    });
    
    this.fetchUsers();
  }

  ngOnDestroy() {
    // Clean up retry timer when component is destroyed
    this.stopNetworkErrorRetry();
    if (this.retrySubscription) {
      this.retrySubscription.unsubscribe();
    }
    // Complete the search subject
    this.searchSubject.complete();
  }

  private stopNetworkErrorRetry() {
    if (this.networkErrorRetryTimer) {
      clearInterval(this.networkErrorRetryTimer);
      this.networkErrorRetryTimer = undefined;
      console.log('Component: Stopped network error retry timer');
    }
  }

  private startNetworkErrorRetry() {
    // Clear any existing timer first
    this.stopNetworkErrorRetry();
    
    console.log('Component: Starting network error retry - will retry every 5 seconds');
    this.networkErrorRetryTimer = setInterval(() => {
      console.log('Component: Auto-retry attempt due to network error');
      this.fetchUsers();
    }, 5000); // Retry every 5 seconds
  }

  // Method to manually refresh data (can be called from UI)
  refreshData() {
    console.log('Component: Manual refresh requested');
    console.log('Component: Initial state - isLoading:', this.isLoading, 'loadingError:', this.loadingError);
    
    // Reset states explicitly
    this.isLoading = true;
    this.loadingError = null;
    this.cdr.detectChanges(); // Force update to show loading state
    
    // Show network error only after 2 seconds if still loading
    const networkErrorTimeout = setTimeout(() => {
      if (this.isLoading && !this.loadingError) {
        console.log('Component: 2 seconds elapsed during refresh, still loading - showing network error message');
        this.loadingError = 'Network issue. Check your internet connection';
        this.cdr.detectChanges();
      }
    }, 2000);
    
    this.retrySubscription = this.usersApi.refreshUsers().subscribe({
      next: (users) => {
        clearTimeout(networkErrorTimeout); // Clear the timeout if data arrives
        console.log('Component: Data refreshed successfully, count:', users.length);
        this.users = users;
        this.isLoading = false;
        this.loadingError = null; // Clear any error message immediately
        this.stopNetworkErrorRetry(); // Stop retry timer on success
        console.log('Component: After refresh - isLoading:', this.isLoading, 'loadingError:', this.loadingError);
        this.cdr.detectChanges();
      },
      error: (error) => {
        clearTimeout(networkErrorTimeout); // Clear the timeout on error
        console.error('Component: Error refreshing users:', error);
        this.isLoading = false;
        this.loadingError = error.message || 'Failed to refresh users. Please try again.';
        
        // Start auto-retry if it's a network error
        if (error.message && error.message.includes('Network issue')) {
          console.log('Component: Network error detected during refresh, starting auto-retry every 5 seconds');
          this.startNetworkErrorRetry();
        }
        
        console.log('Component: After refresh error - isLoading:', this.isLoading, 'loadingError:', this.loadingError);
        this.cdr.detectChanges();
      }
    });
  }

  // Method to manually show error message (for development)
  loadSampleDataManually() {
    console.log('Showing error message instead of loading sample data');
    this.loadingError = 'Network issue. Check your internet connection';
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  fetchUsers() {
    console.log('Component: Starting to fetch paginated users...');
    console.log('Component: Pagination state:', this.paginationState);
    console.log('Component: Filters - Type:', this.filterType, 'Status:', this.filterStatus, 'Search:', this.searchQuery);
    
    // Cancel any pending API request to prevent race conditions
    // This ensures only the latest search result updates the table
    if (this.retrySubscription) {
      this.retrySubscription.unsubscribe();
      console.log('Component: Cancelled previous API request');
    }
    
    // Set loading state
    this.isLoading = true;
    this.loadingError = null;
    this.cdr.detectChanges();

    // Show network error only after 2 seconds if still loading
    const networkErrorTimeout = setTimeout(() => {
      if (this.isLoading && !this.loadingError) {
        console.log('Component: 2 seconds elapsed, still loading - showing network error message');
        this.loadingError = 'Network issue. Check your internet connection';
        this.cdr.detectChanges();
      }
    }, 2000);

    // Call paginated API
    this.retrySubscription = this.usersApi.getPaginatedUsers({
      page: this.paginationState.currentPage,
      pageSize: this.paginationState.pageSize,
      sortBy: this.paginationState.sortBy || 'name',
      sortOrder: this.paginationState.sortOrder || 'asc',
      type: this.filterType || undefined,
      status: this.filterStatus || undefined,
      searchTerm: this.searchQuery?.trim() || undefined
    }).subscribe({
      next: (response) => {
        clearTimeout(networkErrorTimeout);
        console.log('Component: Paginated users loaded successfully');
        console.log('Component: Total count:', response.totalCount, 'Current page:', response.page);
        
        this.users = response.users;
        this.paginationState.totalCount = response.totalCount;
        this.paginationState.currentPage = response.page;
        this.paginationState.pageSize = response.pageSize;
        
        this.isLoading = false;
        this.loadingError = null;
        this.stopNetworkErrorRetry();
        
        console.log('Component: After success - isLoading:', this.isLoading, 'users count:', this.users.length);
        this.cdr.detectChanges();
      },
      error: (error) => {
        clearTimeout(networkErrorTimeout);
        console.error('Component: Error fetching paginated users:', error);
        
        this.isLoading = false;
        this.loadingError = error.message || 'Failed to load users. Please try again.';
        
        // Start auto-retry if it's a network error
        if (error.message && error.message.includes('Network issue')) {
          console.log('Component: Network error detected, starting auto-retry every 5 seconds');
          this.startNetworkErrorRetry();
        }
        
        console.log('Component: After error - isLoading:', this.isLoading, 'loadingError:', this.loadingError);
        this.cdr.detectChanges();
      }
    });
  }




projects: Project[] = [
    { id: '1', name: 'Atlas App', projectCode: 'PROJ-001', status: 'Ongoing', priority: 'High', projectManager: 'Asha Varma', managerInitials: 'AV', teamSize: 12, selected: false },
    { id: '2', name: 'RoadSim', projectCode: 'PROJ-002', status: 'On Hold', priority: 'Medium', projectManager: 'Pranav Iyer', managerInitials: 'PI', teamSize: 8, selected: false },
    { id: '3', name: 'CloudSync Pro', projectCode: 'PROJ-003', status: 'Completed', priority: 'High', projectManager: 'Sarah Chen', managerInitials: 'SC', teamSize: 15, selected: false },
    { id: '4', name: 'DataViz Dashboard', projectCode: 'PROJ-004', status: 'Ongoing', priority: 'Medium', projectManager: 'Michael Rodriguez', managerInitials: 'MR', teamSize: 6, selected: false },
    { id: '5', name: 'SecureAuth API', projectCode: 'PROJ-005', status: 'Ongoing', priority: 'Critical', projectManager: 'Emma Thompson', managerInitials: 'ET', teamSize: 9, selected: false },
    { id: '6', name: 'E-Learning Hub', projectCode: 'PROJ-006', status: 'Planning', priority: 'Low', projectManager: 'James Wilson', managerInitials: 'JW', teamSize: 11, selected: false },
    { id: '7', name: 'MarketPlace Connect', projectCode: 'PROJ-007', status: 'Archived', priority: 'Medium', projectManager: 'Lisa Anderson', managerInitials: 'LA', teamSize: 18, selected: false },
    { id: '8', name: 'Mobile Banking App', projectCode: 'PROJ-008', status: 'Ongoing', priority: 'Critical', projectManager: 'David Kumar', managerInitials: 'DK', teamSize: 20, selected: false },
    { id: '9', name: 'Healthcare Portal', projectCode: 'PROJ-009', status: 'Planning', priority: 'High', projectManager: 'Rachel Green', managerInitials: 'RG', teamSize: 14, selected: false },
    { id: '10', name: 'Inventory Management', projectCode: 'PROJ-010', status: 'On Hold', priority: 'Medium', projectManager: 'Tom Harris', managerInitials: 'TH', teamSize: 7, selected: false },
    { id: '11', name: 'Social Media Platform', projectCode: 'PROJ-011', status: 'Ongoing', priority: 'High', projectManager: 'Nina Patel', managerInitials: 'NP', teamSize: 25, selected: false },
    { id: '12', name: 'CRM System', projectCode: 'PROJ-012', status: 'Completed', priority: 'Medium', projectManager: 'Alex Johnson', managerInitials: 'AJ', teamSize: 10, selected: false },
    { id: '13', name: 'Analytics Dashboard', projectCode: 'PROJ-013', status: 'Ongoing', priority: 'High', projectManager: 'Sophie Turner', managerInitials: 'ST', teamSize: 8, selected: false },
    { id: '14', name: 'Payment Gateway', projectCode: 'PROJ-014', status: 'Planning', priority: 'Critical', projectManager: 'Robert Chen', managerInitials: 'RC', teamSize: 12, selected: false },
    { id: '15', name: 'Logistics Tracker', projectCode: 'PROJ-015', status: 'Ongoing', priority: 'Medium', projectManager: 'Maria Garcia', managerInitials: 'MG', teamSize: 9, selected: false },
    { id: '16', name: 'Video Streaming Service', projectCode: 'PROJ-016', status: 'On Hold', priority: 'Low', projectManager: 'Kevin Lee', managerInitials: 'KL', teamSize: 16, selected: false },
    { id: '17', name: 'Smart Home App', projectCode: 'PROJ-017', status: 'Ongoing', priority: 'High', projectManager: 'Laura Martinez', managerInitials: 'LM', teamSize: 11, selected: false },
    { id: '18', name: 'Restaurant Management', projectCode: 'PROJ-018', status: 'Completed', priority: 'Medium', projectManager: 'Chris Brown', managerInitials: 'CB', teamSize: 6, selected: false },
    { id: '19', name: 'Fitness Tracking App', projectCode: 'PROJ-019', status: 'Ongoing', priority: 'Low', projectManager: 'Amanda White', managerInitials: 'AW', teamSize: 8, selected: false },
    { id: '20', name: 'Real Estate Platform', projectCode: 'PROJ-020', status: 'Planning', priority: 'High', projectManager: 'Daniel Kim', managerInitials: 'DK', teamSize: 13, selected: false },
    { id: '21', name: 'Travel Booking System', projectCode: 'PROJ-021', status: 'Ongoing', priority: 'Medium', projectManager: 'Jessica Wang', managerInitials: 'JW', teamSize: 15, selected: false },
    { id: '22', name: 'HR Management Portal', projectCode: 'PROJ-022', status: 'On Hold', priority: 'Low', projectManager: 'Michael Smith', managerInitials: 'MS', teamSize: 7, selected: false },
    { id: '23', name: 'Customer Support Chat', projectCode: 'PROJ-023', status: 'Ongoing', priority: 'Critical', projectManager: 'Olivia Davis', managerInitials: 'OD', teamSize: 10, selected: false },
    { id: '24', name: 'Weather Forecast App', projectCode: 'PROJ-024', status: 'Completed', priority: 'Low', projectManager: 'Ryan Taylor', managerInitials: 'RT', teamSize: 5, selected: false },
    { id: '25', name: 'Task Management Tool', projectCode: 'PROJ-025', status: 'Ongoing', priority: 'High', projectManager: 'Emily Wilson', managerInitials: 'EW', teamSize: 12, selected: false },
    { id: '26', name: 'AI Chatbot Platform', projectCode: 'PROJ-026', status: 'Ongoing', priority: 'Critical', projectManager: 'Benjamin Clarke', managerInitials: 'BC', teamSize: 18, selected: false },
    { id: '27', name: 'Blockchain Wallet', projectCode: 'PROJ-027', status: 'Planning', priority: 'High', projectManager: 'Sophia Williams', managerInitials: 'SW', teamSize: 14, selected: false },
    { id: '28', name: 'Supply Chain Management', projectCode: 'PROJ-028', status: 'Ongoing', priority: 'Medium', projectManager: 'Lucas Brown', managerInitials: 'LB', teamSize: 22, selected: false },
    { id: '29', name: 'Virtual Event Platform', projectCode: 'PROJ-029', status: 'Completed', priority: 'Low', projectManager: 'Isabella Martinez', managerInitials: 'IM', teamSize: 9, selected: false },
    { id: '30', name: 'Code Review Automation', projectCode: 'PROJ-030', status: 'On Hold', priority: 'Medium', projectManager: 'Ethan Anderson', managerInitials: 'EA', teamSize: 7, selected: false },
    { id: '31', name: 'Document Management System', projectCode: 'PROJ-031', status: 'Ongoing', priority: 'High', projectManager: 'Mia Thompson', managerInitials: 'MT', teamSize: 11, selected: false },
    { id: '32', name: 'Fleet Management App', projectCode: 'PROJ-032', status: 'Planning', priority: 'Medium', projectManager: 'Noah Garcia', managerInitials: 'NG', teamSize: 13, selected: false },
    { id: '33', name: 'Expense Tracking Tool', projectCode: 'PROJ-033', status: 'Ongoing', priority: 'Low', projectManager: 'Ava Rodriguez', managerInitials: 'AR', teamSize: 6, selected: false },
    { id: '34', name: 'Network Monitoring System', projectCode: 'PROJ-034', status: 'Ongoing', priority: 'Critical', projectManager: 'William Lee', managerInitials: 'WL', teamSize: 16, selected: false },
    { id: '35', name: 'Content Management CMS', projectCode: 'PROJ-035', status: 'Archived', priority: 'Medium', projectManager: 'Charlotte Davis', managerInitials: 'CD', teamSize: 10, selected: false },
    { id: '36', name: 'Recruitment Portal', projectCode: 'PROJ-036', status: 'Ongoing', priority: 'High', projectManager: 'James Miller', managerInitials: 'JM', teamSize: 12, selected: false },
    { id: '37', name: 'IoT Device Manager', projectCode: 'PROJ-037', status: 'Planning', priority: 'Critical', projectManager: 'Amelia Wilson', managerInitials: 'AW', teamSize: 19, selected: false },
    { id: '38', name: 'Email Marketing Suite', projectCode: 'PROJ-038', status: 'Completed', priority: 'Medium', projectManager: 'Oliver Moore', managerInitials: 'OM', teamSize: 8, selected: false },
    { id: '39', name: 'Bug Tracking System', projectCode: 'PROJ-039', status: 'Ongoing', priority: 'High', projectManager: 'Emma Taylor', managerInitials: 'ET', teamSize: 14, selected: false },
    { id: '40', name: 'Appointment Scheduler', projectCode: 'PROJ-040', status: 'On Hold', priority: 'Low', projectManager: 'Liam Anderson', managerInitials: 'LA', teamSize: 5, selected: false },
    { id: '41', name: 'Digital Asset Management', projectCode: 'PROJ-041', status: 'Ongoing', priority: 'Medium', projectManager: 'Harper Thomas', managerInitials: 'HT', teamSize: 11, selected: false },
    { id: '42', name: 'Knowledge Base System', projectCode: 'PROJ-042', status: 'Planning', priority: 'High', projectManager: 'Elijah Jackson', managerInitials: 'EJ', teamSize: 9, selected: false },
    { id: '43', name: 'Invoice Generator', projectCode: 'PROJ-043', status: 'Completed', priority: 'Low', projectManager: 'Abigail White', managerInitials: 'AW', teamSize: 4, selected: false },
    { id: '44', name: 'Video Conference App', projectCode: 'PROJ-044', status: 'Ongoing', priority: 'Critical', projectManager: 'Alexander Harris', managerInitials: 'AH', teamSize: 21, selected: false },
    { id: '45', name: 'Sales Forecasting Tool', projectCode: 'PROJ-045', status: 'Ongoing', priority: 'High', projectManager: 'Emily Martin', managerInitials: 'EM', teamSize: 15, selected: false },
    { id: '46', name: 'Warehouse Management', projectCode: 'PROJ-046', status: 'On Hold', priority: 'Medium', projectManager: 'Daniel Thompson', managerInitials: 'DT', teamSize: 17, selected: false },
    { id: '47', name: 'Learning Management System', projectCode: 'PROJ-047', status: 'Ongoing', priority: 'High', projectManager: 'Sofia Garcia', managerInitials: 'SG', teamSize: 20, selected: false },
    { id: '48', name: 'API Gateway Service', projectCode: 'PROJ-048', status: 'Planning', priority: 'Critical', projectManager: 'Matthew Martinez', managerInitials: 'MM', teamSize: 13, selected: false },
    { id: '49', name: 'Performance Analytics', projectCode: 'PROJ-049', status: 'Ongoing', priority: 'Medium', projectManager: 'Chloe Robinson', managerInitials: 'CR', teamSize: 10, selected: false },
    { id: '50', name: 'Notification Service', projectCode: 'PROJ-050', status: 'Completed', priority: 'Low', projectManager: 'Jacob Clark', managerInitials: 'JC', teamSize: 6, selected: false }
  ];

  // Filtered users based on selected filters
  get filteredUsers() {
    return this.users.filter(user => {
      // Normalize comparison by converting to lowercase
      const userType = (user.type || '').toLowerCase().trim();
      const userStatus = (user.status || '').toLowerCase().trim();
      const selectedType = (this.filterType || '').toLowerCase().trim();
      const selectedStatus = (this.filterStatus || '').toLowerCase().trim();
      
      // Search functionality - handle null/undefined values safely
      const searchLower = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower || 
        (user.user || '').toLowerCase().includes(searchLower) ||
        (user.email || '').toLowerCase().includes(searchLower) ||
        (user.type || '').toLowerCase().includes(searchLower) ||
        (user.status || '').toLowerCase().includes(searchLower) ||
        (user.created || '').toLowerCase().includes(searchLower) ||
        (user.lastActivity || '').toLowerCase().includes(searchLower);
      
      // If filter is empty string, it means "All" is selected, so match all
      const matchesType = !selectedType || userType === selectedType;
      const matchesStatus = !selectedStatus || userStatus === selectedStatus;
      
      // All conditions must be true
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  // Pagination state - now handled by table component
  // currentPage = 1;
  // pageSize = 10;
  
  // Data transformation for table
  getTableData() {
    // With backend pagination, users array is already filtered by the API
    // No need to use filteredUsers getter (which does frontend filtering)
    return this.users.map(user => ({
      user: {
        name: user.user,
        email: user.email,
        avatar: this.getInitials(user.user)
      },
      type: user.type,
      status: user.status,
      created: user.created,
      lastLogin: user.lastActivity,
      actions: user, // Pass the full user object for actions
      selected: this.selectedUsers.some(selectedUser => selectedUser.actions === user) // Check if user is selected
    }));
  }
  
  totalPages() {
    // Table component now handles pagination
    return 1;
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/).filter(p => p.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close dropdowns when clicking outside
    const target = event.target as HTMLElement;
    const typeDropdown = target.closest('.relative.w-48');
    const addUserTypeDropdown = target.closest('.relative');
    
    if (!typeDropdown) {
      this.showTypeDropdown = false;
      this.showStatusDropdown = false;
    }
    
    // Close Add User modal dropdowns if clicking outside
    if (this.showAddUserModal && !addUserTypeDropdown) {
      this.showAddUserTypeDropdown = false;
      this.showAddUserStatusDropdown = false;
    }
    
    // Close Edit User modal dropdowns if clicking outside
    if (this.showEditUserModal && !addUserTypeDropdown) {
      this.showEditUserTypeDropdown = false;
      this.showEditUserStatusDropdown = false;
    }
  }

  // Pagination event handlers
  onPageChange(page: number) {
    console.log('Page changed to:', page);
    this.paginationState.currentPage = page;
    
    // Clear selected users when changing pages
    this.selectedUsers = [];
    
    this.fetchUsers();
  }

  onPageSizeChange(pageSize: number) {
    console.log('Page size changed to:', pageSize);
    this.paginationState.pageSize = pageSize;
    this.paginationState.currentPage = 1; // Reset to first page
    
    // Clear selected users when changing page size
    this.selectedUsers = [];
    
    this.fetchUsers();
  }

  onFilterChange() {
    console.log('Filters changed - Type:', this.filterType, 'Status:', this.filterStatus);
    // Reset to page 1 when filters change
    this.paginationState.currentPage = 1;
    
    // Clear selected users when filters change
    this.selectedUsers = [];
    
    this.fetchUsers();
  }

  // Bulk Actions
  onAssignProjects() {
    console.log('Assign projects to selected users:', this.selectedUsers);
    // Add your assign projects logic here
  }

  onSuspendUsers() {
    // Suspend selected users
    this.selectedUsers.forEach(selectedUser => {
      const user = this.users.find(u => 
        u.user === selectedUser.user.name && u.email === selectedUser.user.email
      );
      if (user) {
        user.status = 'Suspended';
      }
    });
    // Clear selection after action
    this.selectedUsers = [];
    console.log('Suspended users:', this.selectedUsers);
  }

  onBulkDelete() {
    this.pendingDeleteAction = 'bulk';
    this.showDeleteConfirmModal = true;
  }

  confirmDelete() {
    // Collect user IDs to delete
    let userIdsToDelete: number[] = [];
    let userNamesToDelete: string[] = [];
    
    if (this.pendingDeleteAction === 'bulk') {
      // Collect IDs from selected users
      userIdsToDelete = this.selectedUsers.map(selectedUser => {
        // Find the actual user object to get the ID
        const user = this.users.find(u => 
          u.user === selectedUser.user.name && u.email === selectedUser.user.email
        );
        if (user) {
          userNamesToDelete.push(user.user);
          return user.id;
        }
        return null;
      }).filter(id => id !== null) as number[];
    } else if (this.pendingDeleteAction === 'single' && this.userToDelete) {
      // Find the user to get the ID
      const user = this.users.find(u => 
        u.user === this.userToDelete.user.name && u.email === this.userToDelete.user.email
      );
      if (user) {
        userIdsToDelete = [user.id];
        userNamesToDelete = [user.user];
      }
    }
    
    // Close modal immediately
    this.closeDeleteConfirmModal();
    
    if (userIdsToDelete.length === 0) {
      this.toastr.error('No users selected for deletion', 'Error');
      return;
    }
    
    // Show loading state
    this.isLoading = true;
    
    // Call delete API
    this.usersApi.deleteUsers(userIdsToDelete).subscribe({
      next: (response) => {
        console.log('Users deleted successfully:', response);
        this.isLoading = false;
        
        const userCount = userIdsToDelete.length;
        const successMessage = userCount === 1 
          ? `User "${userNamesToDelete[0]}" has been deleted successfully.`
          : `${userCount} users have been deleted successfully.`;
        
        // Show success toaster notification
        this.toastr.success('User(s) Deleted Successfully', '', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true,
        });
        
        // Add notification to notification service
        this.notificationService.addNotification(
          'success',
          successMessage,
          'User Deleted'
        );
        
        // Clear selections
        this.selectedUsers = [];
        this.userToDelete = null;
        
        // Clear cache and refresh the users list
        this.usersApi.refreshUsers().subscribe({
          next: (users) => {
            this.users = users;
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Failed to refresh users after deletion:', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Failed to delete users:', error);
        this.isLoading = false;
        
        // Show error toaster notification
        this.toastr.error(error.message || 'Failed to delete users', 'Error', {
          timeOut: 5000,
          progressBar: true,
          closeButton: true,
        });
      }
    });
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal = false;
    this.userToDelete = null;
  }

  submitImport() {
    if (!this.selectedFile) {
      this.toastr.error('Please select a CSV file to import', 'No File Selected', {
        timeOut: 3000,
        progressBar: true,
        closeButton: true,
      });
      return;
    }

    // Store reference to file before closing modal (modal close clears selectedFile)
    const fileToImport = this.selectedFile;
    const fileName = this.selectedFileName;

    // Close modal immediately when import starts
    this.closeImportModal();
    this.isLoading = true;

    // Read and parse CSV file
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const csvContent = e.target.result;
        const lines = csvContent.split('\n').filter((line: string) => line.trim() !== '');
        
        if (lines.length < 2) {
          this.toastr.error('CSV file is empty or has no data rows', 'Invalid CSV', {
            timeOut: 3000,
            progressBar: true,
            closeButton: true,
          });
          return;
        }

        // Parse header row (case-insensitive)
        const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
        console.log('CSV Headers:', headers);

        // Validation: Check for required columns
        const hasUserName = headers.some((h: string) => h === 'user name' || h === 'username' || h === 'name');
        const hasEmail = headers.some((h: string) => h === 'email');

        if (!hasUserName || !hasEmail) {
          this.toastr.error(
            "The CSV must contain columns 'User name' and 'email' columns",
            'Missing Required Columns',
            {
              timeOut: 5000,
              progressBar: true,
              closeButton: true,
            }
          );
          return;
        }

        // Warning: Check for Jira ID column
        const hasJiraId = headers.some((h: string) => 
          h === 'user id' || 
          h === 'userid' || 
          h === 'jiraid' || 
          h === 'jira_id' || 
          h === 'jira id'
        );

        if (!hasJiraId) {
          this.toastr.warning(
            "The CSV doesn't contain Jira User Id, add column 'User id' with Jira id's to link users to Jira accounts",
            'Jira ID Column Missing',
            {
              timeOut: 7000,
              progressBar: true,
              closeButton: true,
            }
          );
        }

        // Map column names to their indices
        const getColumnIndex = (possibleNames: string[]): number => {
          for (const name of possibleNames) {
            const index = headers.indexOf(name.toLowerCase());
            if (index !== -1) return index;
          }
          return -1;
        };

        // Expected CSV format: jiraId, name, email, status
        const jiraIdIndex = getColumnIndex(['jiraid', 'jira_id', 'jira id', 'user id', 'userid']);
        const nameIndex = getColumnIndex(['name', 'user name', 'username']);
        const emailIndex = getColumnIndex(['email', 'email address']);
        const statusIndex = getColumnIndex(['status', 'user status', 'userstatus']);

        // Validate required columns
        if (emailIndex === -1) {
          this.toastr.error('CSV must contain an "email" column', 'Invalid CSV Format', {
            timeOut: 5000,
            progressBar: true,
            closeButton: true,
          });
          return;
        }

        if (nameIndex === -1) {
          this.toastr.error('CSV must contain a "name" column', 'Invalid CSV Format', {
            timeOut: 5000,
            progressBar: true,
            closeButton: true,
          });
          return;
        }

        // Parse data rows
        const users: CreateUserDto[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v: string) => v.trim());
          
          // Skip empty rows
          if (values.every((v: string) => !v)) continue;

          const user: CreateUserDto = {
            email: emailIndex !== -1 ? values[emailIndex] : '',
            name: nameIndex !== -1 ? values[nameIndex] : '',
            jiraId: jiraIdIndex !== -1 && values[jiraIdIndex] ? values[jiraIdIndex] : undefined,
            status: statusIndex !== -1 && values[statusIndex] ? values[statusIndex] : undefined
          };

          // Basic validation for required fields
          if (!user.email || !user.name) {
            console.warn(`Skipping row ${i + 1}: missing required fields (email or name)`, values);
            continue;
          }

          // Basic email format validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(user.email)) {
            console.warn(`Skipping row ${i + 1}: invalid email format: ${user.email}`);
            continue;
          }

          users.push(user);
        }

        if (users.length === 0) {
          this.toastr.error('No valid user data found in CSV file', 'Import Failed', {
            timeOut: 3000,
            progressBar: true,
            closeButton: true,
          });
          return;
        }

        console.log('Parsed users from CSV:', users);

        // Show info notification that import is in progress
        this.toastr.info(
          `Importing ${users.length} user(s) from "${fileName}"...`,
          'Import Started',
          {
            timeOut: 5000,
            progressBar: true,
            closeButton: true,
          }
        );

        // Call the new bulk import API
        this.usersApi.bulkImportUsers(users, 1).subscribe({
          next: (response) => {
            console.log('Bulk import response:', response);
            
            setTimeout(() => {
              this.isLoading = false;

              const data = response.data;

              // Show success notification if any users were created
              if (data.successCount > 0) {
                this.toastr.success(
                  `Successfully imported ${data.successCount} user(s)`,
                  'Import Successful',
                  {
                    timeOut: 5000,
                    progressBar: true,
                    closeButton: true,
                  }
                );

                this.notificationService.addNotification(
                  'success',
                  `Successfully imported ${data.successCount} user(s) from "${fileName}"`,
                  'Users Imported'
                );
              }

              // Show warning for skipped suspended users
              if (data.skippedCount > 0) {
                this.toastr.warning(
                  `Suspended users skipped: ${data.skippedCount}`,
                  'Users Skipped',
                  {
                    timeOut: 7000,
                    progressBar: true,
                    closeButton: true,
                  }
                );

                // Show details of skipped users (max 3, then count)
                if (data.skipped.length > 0) {
                  console.log('Skipped users:', data.skipped);
                  const skippedMessage = this.formatNotificationMessage(data.skipped, data.skippedCount);
                  this.notificationService.addNotification(
                    'warning',
                    skippedMessage,
                    'Suspended Users Skipped'
                  );
                }
              }

              // Show warning for duplicate users
              if (data.duplicateCount > 0) {
                this.toastr.warning(
                  `Duplicates skipped: ${data.duplicateCount}`,
                  'Duplicate Users',
                  {
                    timeOut: 7000,
                    progressBar: true,
                    closeButton: true,
                  }
                );

                // Show details of duplicate users (max 3, then count)
                if (data.duplicates.length > 0) {
                  console.log('Duplicate users:', data.duplicates);
                  const duplicatesMessage = this.formatNotificationMessage(data.duplicates, data.duplicateCount);
                  this.notificationService.addNotification(
                    'warning',
                    duplicatesMessage,
                    'Duplicate Users Skipped'
                  );
                }
              }

              // Show error notifications
              if (data.errorCount > 0) {
                this.toastr.error(
                  `Errors: ${data.errorCount}`,
                  'Import Errors',
                  {
                    timeOut: 8000,
                    progressBar: true,
                    closeButton: true,
                  }
                );

                // Show details of errors (max 3, then count)
                if (data.errors.length > 0) {
                  console.error('Import errors:', data.errors);
                  const errorsMessage = this.formatNotificationMessage(data.errors, data.errorCount);
                  this.notificationService.addNotification(
                    'error',
                    errorsMessage,
                    'Import Errors'
                  );
                }
              }

              // Show summary message
              console.log('Import summary:', response.message);

              // Refresh the users list if any users were successfully created
              if (data.successCount > 0) {
                this.fetchUsers();
              }
            }, 0);
          },
          error: (error) => {
            console.error('Bulk import failed:', error);
            
            setTimeout(() => {
              this.isLoading = false;

              const errorMessage = error?.message || 'Failed to import users';
              
              // Show error toaster notification
              this.toastr.error(errorMessage, 'Import Failed', {
                timeOut: 5000,
                progressBar: true,
                closeButton: true,
              });

              // Add error notification to notification service
              this.notificationService.addNotification(
                'error',
                errorMessage,
                'Import Failed'
              );
            }, 0);
          }
        });

      } catch (error) {
        console.error('Error parsing CSV:', error);
        this.toastr.error('Failed to parse CSV file. Please check the file format.', 'Parse Error', {
          timeOut: 5000,
          progressBar: true,
          closeButton: true,
        });
      }
    };

    reader.onerror = () => {
      this.toastr.error('Failed to read CSV file', 'File Read Error', {
        timeOut: 3000,
        progressBar: true,
        closeButton: true,
      });
    };

    reader.readAsText(fileToImport);
  }
}
