import { Component, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { Modal } from '../../../shared/modal/modal';
import { Table, TableColumn } from '../../../shared/table/table';
import { AdvancedFilters } from './advanced-filters/advanced-filters';
import { ProjectTemplateModal } from './project-template-modal/project-template-modal';
import { CreateProjectModal } from './create-project-modal/create-project-modal';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProjectsService, Project } from '../../../shared/services/projects.service';
import { DeliveryUnitsService } from '../../../shared/services/delivery-units.service';
import { ProjectStatusService } from '../../../shared/services/project-status.service';

interface TableHeader {
  field: string | null;
  label: string;
  sortable: boolean;
  minWidth: string;
}

@Component({
  selector: 'app-projectslist',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomButton, Sectiontitle, Modal, Table, AdvancedFilters, ProjectTemplateModal, CreateProjectModal],
  templateUrl: './projectslist.html',
  styleUrl: './projectslist.css'
})
export class Projectslist implements AfterViewChecked, OnInit {
  @ViewChild('selectAllCheckbox') selectAllCheckbox!: ElementRef<HTMLInputElement>;

  showFilters = false;
  private _searchQuery = '';
  sidebarCollapsed = false;
  showTemplateModal = false;
  showCreateProjectModal = false;
  selectedTemplate: string = '';

  get searchQuery(): string {
    return this._searchQuery;
  }

  set searchQuery(value: string) {
    if (this._searchQuery !== value) {
      this._searchQuery = value;
      this.resetPagination = true;
    }
  }

  // Delete modal properties
  showDeleteModal = false;
  projectToDelete: Project | null = null;

  // Loading / error states for project listing
  isLoading: boolean = false;
  loadingError: string | null = null;

  // Multi-select filter options
  selectedStatuses: string[] = [];
  selectedDeliveryUnits: string[] = [];
  selectedManagers: string[] = [];
  private _resetPagination: boolean = false;

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
    private deliveryUnitsService: DeliveryUnitsService,
    private projectStatusService: ProjectStatusService
  ) {}

  ngOnInit(): void {
    // Subscribe to query parameters
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        // Apply filter based on query param
        this.selectedStatuses = [params['status']];
        this.showFilters = true; // Automatically show filters
        this.resetPagination = true;
        
        // Force change detection
        this.cdr.detectChanges();
      }
      // If navigation includes a deleted project id, remove it from the list
      if (params['deleted']) {
        const deletedId = params['deleted'];
        this.projects = this.projects.filter(p => p.id !== deletedId);
        // Remove the query param from the URL without reloading
        this.router.navigate([], { relativeTo: this.route, queryParams: { deleted: null }, queryParamsHandling: 'merge' });
        this.cdr.detectChanges();
      }
    });

    // Initial fetch (simulate or call service)
    this.fetchProjects();
  }

  /**
   * Fetch projects from API or service. Currently simulates async load.
   */
  fetchProjects(): void {
    // If we already have projects locally, skip showing the spinner to avoid flicker
    if (this.projects && this.projects.length > 0) {
      this.isLoading = false;
      this.loadingError = null;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.loadingError = null;

    // Load projects from service
    try {
      this.projects = this.projectsService.getProjects();
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 1000);
    } catch (err: any) {
      setTimeout(() => {
        this.isLoading = false;
        this.loadingError = err?.message || 'Failed to load projects. Please try again.';
        this.cdr.detectChanges();
      }, 1000);
    }
  }

  loadSampleDataManually(): void {
    // Helpful debug action: populate with a small sample set when error occurs
    this.projects = [
      { id: '1', name: 'Atlas App', projectCode: 'PROJ-001', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Asha Varma', teamSize: 12, template: 'Scrum', organisationName: 'TechCorp Solutions', selected: false }
    ];
    this.loadingError = null;
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  // Available filter options - now using services
  get statusOptions(): string[] {
    return this.projectStatusService.getStatusCodes();
  }

  get deliveryUnitOptions(): string[] {
    return this.deliveryUnitsService.getDeliveryUnitCodes();
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
    return this.selectedStatuses.length > 0 ||
           this.selectedDeliveryUnits.length > 0 ||
           this.selectedManagers.length > 0;
  }

  get filteredProjects(): Project[] {
    let filtered = [...this.projects];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.projectCode.toLowerCase().includes(query) ||
        project.projectManager.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatuses.length > 0) {
      filtered = filtered.filter(project => 
        this.selectedStatuses.includes(project.status)
      );
    }

    if (this.selectedDeliveryUnits.length > 0) {
      filtered = filtered.filter(project =>
        this.selectedDeliveryUnits.includes(project.deliveryUnit)
      );
    }

    if (this.selectedManagers.length > 0) {
      filtered = filtered.filter(project => 
        this.selectedManagers.includes(project.projectManager)
      );
    }

    return filtered;
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
    const colors: { [key: string]: string } = {};
    this.projectStatusService.getStatuses().forEach(status => {
      if (status.code === 'Active') {
        colors[status.code] = 'bg-green-100 text-green-800';
      } else if (status.code === 'Inactive') {
        colors[status.code] = 'bg-gray-100 text-gray-800';
      } else if (status.code === 'Completed') {
        colors[status.code] = 'bg-blue-100 text-blue-800';
      } else {
        colors[status.code] = 'bg-gray-100 text-gray-800';
      }
    });
    return colors;
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
    this.deliveryUnitsService.getDeliveryUnits().forEach((du, index) => {
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

  onFiltersChanged(filters: { selectedStatuses: string[]; selectedDeliveryUnits: string[]; selectedManagers: string[] }): void {
    this.selectedStatuses = filters.selectedStatuses;
    this.selectedDeliveryUnits = filters.selectedDeliveryUnits;
    this.selectedManagers = filters.selectedManagers;
    this.resetPagination = true;
    this.cdr.detectChanges();
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
    this.exportToCSV();
  }

  exportToCSV(): void {
    const projectsToExport = this.selectedProjects.length > 0 ? this.selectedProjects : this.filteredProjects;
    const headers = ['Project Name', 'Project Code', 'Status', 'Delivery Unit', 'Project Manager', 'Team Size'];
    const rows = projectsToExport.map(project => [
      project.name,
      project.projectCode,
      project.status,
      project.deliveryUnit,
      project.projectManager,
      project.teamSize.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    const exportType = this.selectedProjects.length > 0 ? 'selected' : 'filtered';
    const filterInfo = this.hasActiveFilters ? '_filtered' : '_all';
    link.setAttribute('download', `projects_export_${exportType}${filterInfo}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      
      const deleted = this.projectsService.deleteProject(deletedId);
      
      if (deleted) {
        // Remove from local array as well
        this.projects = this.projects.filter(project => project.id !== deletedId);
        this.notificationService.addNotification('error', `Project "${deletedName}" was deleted successfully.`, 'Project Deleted');
      } else {
        this.notificationService.addNotification('error', `Failed to delete project "${deletedName}".`, 'Delete Failed');
      }
      
      this.projectToDelete = null;
    } else {
      // Bulk deletion of selected projects
      const count = this.selectedProjects.length;
      let successCount = 0;
      
      this.selectedProjects.forEach(project => {
        const deleted = this.projectsService.deleteProject(project.id);
        if (deleted) {
          successCount++;
        }
      });
      
      if (successCount > 0) {
        // Remove deleted projects from local array
        this.projects = this.projects.filter(project => 
          !this.selectedProjects.some(selected => selected.id === project.id)
        );
        this.notificationService.addNotification(
          'error', 
          `${successCount} project${successCount > 1 ? 's' : ''} ${successCount > 1 ? 'were' : 'was'} deleted successfully.`, 
          'Projects Deleted'
        );
      }
      
      if (successCount < count) {
        this.notificationService.addNotification(
          'error', 
          `${count - successCount} project${count - successCount > 1 ? 's' : ''} could not be deleted.`, 
          'Partial Deletion'
        );
      }
    }

    this.showDeleteModal = false;
    this.cdr.detectChanges();
  }
}