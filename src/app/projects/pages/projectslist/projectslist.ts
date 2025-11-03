import { Component, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { Modal } from '../../../shared/modal/modal';
import { PaginatedTable, TableColumn } from '../../../shared/paginated-table/paginated-table';
import { AdvancedFilters } from './advanced-filters/advanced-filters';
import { ProjectTemplateModal } from './project-template-modal/project-template-modal';
import { CreateProjectModal } from './create-project-modal/create-project-modal';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProjectsService, Project, ProjectTableDTO } from '../../../projects/services/projects.service';
import { DeliveryUnitService } from '../../../duservice/deliveryunits.service';
import { ProjectStatusService } from '../../../shared/services/project-status/project-status.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, finalize, Observable, map } from 'rxjs';

interface TableHeader {
  field: string | null;
  label: string;
  sortable: boolean;
  minWidth: string;
}

@Component({
  selector: 'app-projectslist',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomButton, Sectiontitle, Modal, PaginatedTable, AdvancedFilters, ProjectTemplateModal, CreateProjectModal],
  templateUrl: './projectslist.html',
  styleUrl: './projectslist.css'
})
export class Projectslist implements AfterViewChecked, OnInit, OnDestroy {
  @ViewChild('selectAllCheckbox') selectAllCheckbox!: ElementRef<HTMLInputElement>;

  showFilters = false;
  private _searchQuery = '';
  sidebarCollapsed = false;
  showTemplateModal = false;
  showCreateProjectModal = false;
  selectedTemplate: string = '';
  loadingError: string | null = null;
  deliveryUnits: any[] = [];

  get searchQuery(): string {
    return this._searchQuery;
  }

  set searchQuery(value: string) {
    if (this._searchQuery !== value) {
      this._searchQuery = value;
      this.isLoading = true;
      this.loadingError = null;
      this.cdr.markForCheck();
      this.searchSubject.next({query: value, isSearch: true});
    }
  }

  // Delete modal properties
  showDeleteModal = false;
  projectToDelete: Project | null = null;

  // Loading / error states for project listing
  isLoading: boolean = true;
  isInitialLoad: boolean = true;

  // Multi-select filter options - now storing IDs instead of codes
  selectedStatusIds: number[] = [];
  selectedDeliveryUnitIds: number[] = [];
  selectedManagerIds: number[] = [];
  managerOptions: {id: number, name: string}[] = [];
  private _resetPagination: boolean = false;
  private searchSubject = new Subject<{query: string, isSearch: boolean}>();
  private searchSubscription: any;
  private queryParamsSubscription: any;
  private destroy$ = new Subject<void>();
  private lastRequestState: any = null;

  // Pagination state
  pagination = {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    sortBy: '',
    sortOrder: 'asc' as 'asc' | 'desc'
  };

  get resetPagination(): boolean {
    return this._resetPagination;
  }

  set resetPagination(value: boolean) {
    this._resetPagination = value;
    if (value) {
      setTimeout(() => this._resetPagination = false, 0);
    }
  }

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private projectsService: ProjectsService,
    private deliveryUnitsService: DeliveryUnitService,
    private projectStatusService: ProjectStatusService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Load delivery units and manager options first, then fetch projects
    Promise.all([
      this.loadDeliveryUnits(),
      this.loadManagerOptions()
    ]).then(() => {
      // Set up debounced search with switchMap to cancel previous requests
      this.searchSubscription = this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => {
          // Check if search query OR other state has changed
          const currentState = {
            query: curr.query,
            statusIds: JSON.stringify(this.selectedStatusIds),
            duIds: JSON.stringify(this.selectedDeliveryUnitIds),
            managerIds: JSON.stringify(this.selectedManagerIds),
            page: this.pagination.currentPage,
            pageSize: this.pagination.pageSize,
            sortBy: this.pagination.sortBy,
            sortOrder: this.pagination.sortOrder
          };
          
          const isSame = this.lastRequestState && 
            currentState.query === this.lastRequestState.query &&
            currentState.statusIds === this.lastRequestState.statusIds &&
            currentState.duIds === this.lastRequestState.duIds &&
            currentState.managerIds === this.lastRequestState.managerIds &&
            currentState.page === this.lastRequestState.page &&
            currentState.pageSize === this.lastRequestState.pageSize &&
            currentState.sortBy === this.lastRequestState.sortBy &&
            currentState.sortOrder === this.lastRequestState.sortOrder;
          
          this.lastRequestState = currentState;
          return isSame;
        }),
        switchMap(({query, isSearch}) => {
          if (isSearch) {
            this.pagination.currentPage = 1;
          }
          this.isLoading = true;
          this.loadingError = null;
          this.cdr.markForCheck();
          return this.fetchProjectsObservable();
        }),
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      ).subscribe({
        next: (response) => {
          this.handleFetchResponse(response);
        },
        error: (err) => {
          this.handleFetchError(err);
        }
      });

      // Subscribe to query parameters
      this.queryParamsSubscription = this.route.queryParams
        .pipe(takeUntil(this.destroy$))
        .subscribe(params => {
        if (params['status']) {
          this.selectedStatusIds = [parseInt(params['status'])];
          this.showFilters = true;
          this.resetPagination = true;
          this.cdr.markForCheck();
        }
        if (params['deleted']) {
          const deletedId = params['deleted'];
          this.projects = this.projects.filter(p => p.id !== deletedId);
          this.router.navigate([], { relativeTo: this.route, queryParams: { deleted: null }, queryParamsHandling: 'merge' });
          this.cdr.markForCheck();
        }
      });

      // Initial fetch after manager options are loaded
      this.fetchProjects();
    });
  }

  /**
   * Load unique project managers from API
   */
  loadManagerOptions(): Promise<void> {
    return new Promise((resolve) => {
      this.projectsService.getUniqueProjectManagers()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.status === 200) {
              this.managerOptions = response.data.map(manager => ({
                id: manager.id,
                name: manager.name || 'Unknown'
              }));
            }
            resolve();
          },
          error: (err) => {
            console.error('Failed to load project managers:', err);
            this.managerOptions = [];
            resolve();
          }
        });
    });
  }

  /**
   * Load delivery units from API
   */
  loadDeliveryUnits(): Promise<void> {
    return new Promise((resolve) => {
      this.deliveryUnitsService.getAllDeliveryUnits().subscribe({
        next: (deliveryUnits) => {
          this.deliveryUnits = deliveryUnits;
          resolve();
        },
        error: (err) => {
          console.error('Failed to load delivery units:', err);
          this.deliveryUnits = [];
          resolve();
        }
      });
    });
  }

  /**
   * Fetch projects from API with current pagination and filters
   * Returns an Observable for use with switchMap
   */
  private fetchProjectsObservable() {
    const statusIds = this.selectedStatusIds.length > 0 ? this.selectedStatusIds : undefined;
    const deliveryUnitIds = this.selectedDeliveryUnitIds.length > 0 ? this.selectedDeliveryUnitIds : undefined;
    const projectManagerIds = this.selectedManagerIds.length > 0 ? this.selectedManagerIds : undefined;

    return this.projectsService.getProjects(
      this.pagination.currentPage,
      this.pagination.pageSize,
      this.searchQuery,
      statusIds,
      deliveryUnitIds,
      projectManagerIds
    );
  }

  /**
   * Subscribe to the fetch projects observable and handle the response
   */
  private handleFetchResponse(response: any) {
    try {
      if (response.status === 200) {
        this.projects = response.data.items.map((item: any) => this.mapProjectTableDTOToProject(item));
        this.pagination.totalCount = response.data.totalCount;
        this.pagination.currentPage = response.data.page;
        this.pagination.pageSize = response.data.pageSize;
        
        const totalPages = Math.ceil(this.pagination.totalCount / this.pagination.pageSize);
        if (this.pagination.currentPage > totalPages && totalPages > 0) {
          this.pagination.currentPage = totalPages;
        }
        this.loadingError = null;

        // Mark initial load as complete (no success toaster)
        if (this.isInitialLoad) {
          this.isInitialLoad = false;
        }
      } else {
        this.loadingError = response.message || 'Failed to load projects';
        this.toastr.error(this.loadingError!, 'Load Failed', {
          timeOut: 5000,
          progressBar: true
        });
      }
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Handle fetch error
   */
  private handleFetchError(err: any) {
    console.error('Projects API call failed:', err);
    
    // Provide specific messages for different error types
    let errorMessage = 'Failed to load projects. Please try again.';
    if (err?.name === 'TimeoutError' || err?.message?.includes('Timeout')) {
      errorMessage = 'Loading projects is taking longer than expected. Please wait or try refreshing the page.';
    } else if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.status >= 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (err.status === 404) {
        errorMessage = 'Projects data not found.';
      }
    }
    
    this.loadingError = errorMessage;
    this.toastr.error(this.loadingError, 'Load Failed', {
      timeOut: 5000,
      progressBar: true
    });
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  /**
   * Fetch projects from API with current pagination and filters
   * This method triggers the search subject to ensure all requests go through the same debounced pipeline
   */
  fetchProjects(): void {
    this.searchSubject.next({query: this.searchQuery, isSearch: false});
  }

  /**
   * Retry fetching projects - bypasses debounce for immediate retry
   */
  retryFetchProjects(): void {
    this.isLoading = true;
    this.loadingError = null;
    this.cdr.markForCheck();
    
    this.fetchProjectsObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.handleFetchResponse(response);
        },
        error: (err) => {
          this.handleFetchError(err);
        }
      });
  }

  private mapProjectTableDTOToProject(dto: ProjectTableDTO): Project {
    return {
      id: dto.id,
      name: dto.name || '',
      projectCode: dto.key || '',
      status: dto.status?.name as 'Active' | 'Inactive' | 'Completed' || 'Active',
      deliveryUnit: dto.deliveryUnit?.code || '',
      projectManager: dto.projectManager?.name || '',
      projectManagerId: dto.projectManager?.id,
      teamSize: dto.teamSize,
      template: 'Scrum', // Default
      organisationName: '', // Not in DTO
      selected: false
    };
  }

  loadSampleDataManually(): void {
    // Helpful debug action: populate with a small sample set when error occurs
    this.projects = [
      { id: '1', name: 'Atlas App', projectCode: 'PROJ-001', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Asha Varma', teamSize: 12, template: 'Scrum', organisationName: 'TechCorp Solutions', selected: false }
    ];
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  // Available filter options - now using services
  get statusOptions(): Observable<{id: number, code: string}[]> {
    return this.projectStatusService.getStatuses().pipe(
      map(statuses => statuses.map(status => ({ id: status.id, code: status.code })))
    );
  }

  get deliveryUnitOptions(): {id: number, code: string}[] {
    // Return cached delivery units or empty array if not loaded yet
    const options = this.deliveryUnits?.map(du => ({ id: du.id, code: du.code })) || [];
    console.log('Delivery unit options:', options);
    return options;
  }

  // Table columns configuration - now using services for colors
  get tableColumns(): TableColumn[] {
    return [
      {
        header: 'Project Info',
        field: 'projectInfo',
        type: 'avatar',
        width: '25%'
      },
      {
        header: 'Status',
        field: 'status',
        type: 'badge',
        badgeColors: this.getStatusBadgeColors(),
        width: '15%'
      },
      {
        header: 'Delivery Unit',
        field: 'deliveryUnit',
        type: 'badge',
        badgeColors: this.getDeliveryUnitBadgeColors(),
        width: '20%'
      },
      {
        header: 'Project Manager',
        field: 'projectManager',
        type: 'user',
        width: '25%'
      },
      {
        header: 'Team Size',
        field: 'teamSize',
        type: 'text',
        icon: 'images/team-size.svg',
        width: '15%'
      },
      {
        header: 'Actions',
        field: 'actions',
        type: 'actions',
        actions: [
          { label: 'Edit', icon: '/images/edit-black.svg', action: 'edit' },
          { label: 'Delete', icon: '/images/delete-black.svg', action: 'delete', class: 'danger' }
        ]
      }
    ];
  }

  projects: Project[] = [];

  // Getters
  get hasActiveFilters(): boolean {
    return this.selectedStatusIds.length > 0 ||
           this.selectedDeliveryUnitIds.length > 0 ||
           this.selectedManagerIds.length > 0;
  }

  get filteredProjects(): Project[] {
    // Since filtering is now handled server-side, just return the projects array
    return this.projects;
  }

  get tableData(): any[] {
    return this.filteredProjects.map(project => ({
      projectInfo: {
        name: project.name,
        subtitle: project.projectCode,
        initials: project.name.substring(0, 2).toUpperCase(),
        // Use a fixed blue Tailwind class for all projects
        bgColor: 'bg-blue-600',
        // expose whether this project was imported from Jira so the table can show a badge
        isImportedFromJira: !!project.isImportedFromJira
      },
      status: project.status,
      deliveryUnit: project.deliveryUnit,
      projectManager: {
        name: project.projectManager,
        avatar: this.getInitials(project.projectManager)
      },
      teamSize: project.teamSize.toString(),
      actions: project.id,
      selected: project.selected
    }));
  }

  // Simple deterministic avatar background selector based on project id
  getAvatarBgColor(projectId: string): string {
    const classes = [
      'bg-blue-600',
      'bg-green-600',
      'bg-purple-600',
      'bg-pink-600',
      'bg-yellow-600',
      'bg-indigo-600',
      'bg-red-600',
      'bg-teal-600'
    ];
    const num = parseInt(projectId, 10) || 0;
    return classes[num % classes.length];
  }

  get selectedProjects(): Project[] {
    return this.filteredProjects.filter(p => p.selected);
  }

  // Helper methods for badge colors
  private getStatusBadgeColors(): { [key: string]: string } {
    // Default colors - could be updated when status data loads
    return {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Completed': 'bg-blue-100 text-blue-800'
    };
  }

  private getDeliveryUnitBadgeColors(): { [key: string]: string } {
    const colors: { [key: string]: string } = {
      '--': 'bg-gray-100 text-gray-800'
    };
    // Map DU1..DU8 to distinct badge color classes
    const duColors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-yellow-100 text-yellow-800',
      'bg-indigo-100 text-indigo-800',
      'bg-red-100 text-red-800',
      'bg-teal-100 text-teal-800'
    ];
    this.deliveryUnits.forEach((du, index) => {
      colors[du.code] = duColors[index % duColors.length];
    });
    return colors;
  }

  get allSelectedProjects(): Project[] {
    return this.projects.filter(p => p.selected);
  }

  get deleteCount(): number {
    return this.allSelectedProjects.length;
  }

  get allSelected(): boolean {
    const filteredProjects = this.filteredProjects;
    return filteredProjects.length > 0 &&
           filteredProjects.every(p => p.selected);
  }

  ngAfterViewChecked(): void {
    this.updateCheckboxState();
  }

  private updateCheckboxState(): void {
    if (this.selectAllCheckbox) {
      const checkbox = this.selectAllCheckbox.nativeElement;
      const isIndeterminate = this.isIndeterminateSelection();
      const allSelected = this.allSelected;

      checkbox.indeterminate = isIndeterminate || allSelected;
      checkbox.checked = false;
    }
  }

  isIndeterminateSelection(): boolean {
    const filteredProjects = this.filteredProjects;
    const selectedCount = filteredProjects.filter(p => p.selected).length;
    return selectedCount > 0 && selectedCount < filteredProjects.length;
  }

  getInitials(managerName: string): string {
    const parts = managerName.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    } else if (parts.length === 1) {
      return parts[0][0] + parts[0][1];
    }
    return '';
  }

  onFiltersChanged(filters: { selectedStatusIds: number[]; selectedDeliveryUnitIds: number[]; selectedManagerIds: number[] }): void {
    this.selectedStatusIds = filters.selectedStatusIds;
    this.selectedDeliveryUnitIds = filters.selectedDeliveryUnitIds;
    this.selectedManagerIds = filters.selectedManagerIds;
    this.pagination.currentPage = 1; // Reset to first page when filters change
    this.fetchProjects();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleSelectAll(): void {
    const allSelected = this.allSelected;
    const someSelected = this.isIndeterminateSelection();
    let newSelectionState: boolean;

    if (allSelected || someSelected) {
      newSelectionState = false;
    } else {
      newSelectionState = true;
    }

    this.filteredProjects.forEach(project => {
      project.selected = newSelectionState;
    });

    this.updateCheckboxState();
    this.cdr.detectChanges();
  }

  onRowClick(project: Project): void {
    if (this.allSelectedProjects.length > 0) {
      project.selected = !project.selected;
      this.cdr.detectChanges();
    } else {
      // Navigate directly to project details when row clicked
      this.router.navigate(['/projects', project.id]);
    }
  }

  onSelectionChange(): void {
    this.cdr.detectChanges();
  }

  // Note: preview/view logic removed. Navigation happens directly where needed.

  handleTableAction(event: { action: string; row: any }): void {
    const projectId = event.row.actions;
    const project = this.projects.find(p => p.id === projectId);

    switch (event.action) {
      case 'edit':
        this.editProject(projectId);
        break;
      case 'delete':
        this.projectToDelete = project || null;
        this.showDeleteModal = true;
        break;
    }
  }

  handleRowClick(event: { row: any; index: number }): void {
    const projectId = event.row.actions;
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      this.onRowClick(project);
    }
  }

  handleSelectionChange(selectedRows: any[]): void {
    this.projects.forEach(project => {
      project.selected = false;
    });

    selectedRows.forEach(selectedRow => {
      const projectId = selectedRow.actions;
      const project = this.projects.find(p => p.id === projectId);
      if (project) {
        project.selected = true;
      }
    });

    this.cdr.detectChanges();
  }

  editProject(projectId: string): void {
    console.log('Edit project:', projectId);
    this.router.navigate(['/projects', projectId, 'edit']);
  }

  deleteProject(projectId: string): void {
    const project = this.projects.find(p => p.id === projectId);
    this.projectToDelete = project || null;
    this.showDeleteModal = true;
  }

  deleteSelected(): void {
    if (this.selectedProjects.length === 0) return;
    this.showDeleteModal = true;
  }

  exportAll(): void {
    // Show loading state
    this.notificationService.addNotification('info', 'Preparing export...', 'Export');
    this.isLoading = true;
    this.cdr.markForCheck();

    // Get filters but NO search query (as requested)
    const statusIds = this.selectedStatusIds.length > 0 ? this.selectedStatusIds : undefined;
    const deliveryUnitIds = this.selectedDeliveryUnitIds.length > 0 ? this.selectedDeliveryUnitIds : undefined;
    const projectManagerIds = this.selectedManagerIds.length > 0 ? this.selectedManagerIds : undefined;

    // Fetch all projects with current filters but set pageSize to total count to get all data
    // First, we need to get the total count, then fetch all records
    this.projectsService.getProjects(
      1,
      10000, // Request a large page size to get all records
      undefined, // No search query
      statusIds,
      deliveryUnitIds,
      projectManagerIds
    ).subscribe({
      next: (response) => {
        try {
          if (response.status === 200 && response.data.items) {
            const allProjects = response.data.items.map((item: any) => this.mapProjectTableDTOToProject(item));
            this.exportToCSV(allProjects);
            this.notificationService.addNotification('success', `Exported ${allProjects.length} projects`, 'Export Success');
          } else {
            this.notificationService.addNotification('error', 'Failed to fetch projects for export', 'Export Failed');
          }
        } finally {
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Export failed:', err);
        this.notificationService.addNotification('error', 'Failed to export projects', 'Export Error');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  exportToCSV(projectsToExport?: Project[]): void {
    // If no projects provided, use current filtered/selected projects
    if (!projectsToExport) {
      projectsToExport = this.selectedProjects.length > 0 ? this.selectedProjects : this.filteredProjects;
    }

    // CSV headers
    const headers = ['Project Name', 'Project Code', 'Status', 'Delivery Unit', 'Project Manager', 'Team Size'];
    
    // Escape CSV values to handle commas and quotes
    const escapeCsvValue = (value: string | number): string => {
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows = projectsToExport.map(project => [
      escapeCsvValue(project.name),
      escapeCsvValue(project.projectCode),
      escapeCsvValue(project.status),
      escapeCsvValue(project.deliveryUnit),
      escapeCsvValue(project.projectManager),
      escapeCsvValue(project.teamSize.toString())
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    const filterInfo = this.hasActiveFilters ? '_filtered' : '_all';
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `projects_export${filterInfo}_${projectsToExport.length}_${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  importFromJira(): void {
    this.router.navigate(['/projects/importfromjira']);
  }

  createProject(): void {
    this.showTemplateModal = true;
  }


  // Template modal handlers
  onTemplateSelected(template: string): void {
    this.selectedTemplate = template;
    this.showTemplateModal = false;
    this.showCreateProjectModal = true;
  }

  closeTemplateModal(): void {
    this.showTemplateModal = false;
  }

  // Create project modal handlers
  onCreateProject(projectData: { name: string; projectKey: string; shareWithExisting: boolean; selectedProject?: string }): void {
    // Ensure projectKey exists: derive from first 3 alphanumeric chars of name if not provided
    let projectKey = projectData.projectKey && projectData.projectKey.trim()
      ? projectData.projectKey.trim()
      : (projectData.name || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 3);

    if (!projectKey) projectKey = 'PRJ';

    this.router.navigate(['/projects/create'], {
      queryParams: {
        template: this.selectedTemplate,
        name: projectData.name,
        projectKey,
        shareWithExisting: projectData.shareWithExisting,
        selectedProject: projectData.selectedProject
      }
    });
  }

  closeCreateProjectModal(): void {
    this.showCreateProjectModal = false;
    this.selectedTemplate = '';
  }

  onBackToTemplateSelection(): void {
    this.showCreateProjectModal = false;
    this.showTemplateModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.projectToDelete = null;
  }

  confirmDelete(): void {
    if (this.projectToDelete) {
      // Single project deletion
      const deletedName = this.projectToDelete.name;
      const deletedId = this.projectToDelete.id;
      
      this.isLoading = true;
      this.cdr.markForCheck();

      this.projectsService.deleteProject(deletedId).subscribe({
        next: (response) => {
          try {
            if (response.status === 200) {
              // Remove from local array
              this.projects = this.projects.filter(project => project.id !== deletedId);
              // Show toaster for successful deletion
              this.toastr.success(`Project "${deletedName}" was deleted successfully.`, 'Project Deleted');
              // Refresh the projects list
              this.fetchProjects();
            } else {
              // Show toaster for error
              this.toastr.error(response.message || `Failed to delete project "${deletedName}".`, 'Delete Failed');
            }
          } finally {
            this.showDeleteModal = false;
            this.projectToDelete = null;
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('Delete failed:', err);
          // Show toaster for error
          this.toastr.error(`Failed to delete project "${deletedName}".`, 'Delete Failed');
          this.showDeleteModal = false;
          this.projectToDelete = null;
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      // Bulk deletion of selected projects
      const projectsToDelete = [...this.selectedProjects];
      const count = projectsToDelete.length;
      let successCount = 0;
      let failedCount = 0;

      this.isLoading = true;
      this.cdr.markForCheck();

      // Delete projects sequentially
      const deleteNext = (index: number) => {
        if (index >= projectsToDelete.length) {
          // All deletions complete
          if (successCount > 0) {
            // Remove deleted projects from local array
            this.projects = this.projects.filter(project => 
              !projectsToDelete.some(deleted => deleted.id === project.id)
            );
            const successMsg = `${successCount} project${successCount > 1 ? 's' : ''} ${successCount > 1 ? 'were' : 'was'} deleted successfully.`;
            // Show toaster for successful deletions
            this.toastr.success(successMsg, 'Projects Deleted');
            this.fetchProjects();
          }

          if (failedCount > 0) {
            const failMsg = `${failedCount} project${failedCount > 1 ? 's' : ''} could not be deleted.`;
            // Show toaster for errors
            this.toastr.error(failMsg, 'Deletion Failed');
          }

          this.showDeleteModal = false;
          this.isLoading = false;
          this.cdr.markForCheck();
          return;
        }

        const project = projectsToDelete[index];
        this.projectsService.deleteProject(project.id).subscribe({
          next: (response) => {
            if (response.status === 200) {
              successCount++;
            } else {
              failedCount++;
            }
            deleteNext(index + 1);
          },
          error: (err) => {
            console.error(`Failed to delete project ${project.id}:`, err);
            failedCount++;
            deleteNext(index + 1);
          }
        });
      };

      deleteNext(0);
    }
  }

  onPageChange(page: number): void {
    this.pagination.currentPage = page;
    this.fetchProjects();
  }

  onPageSizeChange(pageSize: number): void {
    this.pagination.pageSize = pageSize;
    this.pagination.currentPage = 1; // Reset to first page
    this.fetchProjects();
  }

  onSortChange(sort: {sortBy: string, sortOrder: 'asc' | 'desc'}): void {
    this.pagination.sortBy = sort.sortBy;
    this.pagination.sortOrder = sort.sortOrder;
    this.fetchProjects();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
    this.destroy$.next();
    this.destroy$.complete();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }
}