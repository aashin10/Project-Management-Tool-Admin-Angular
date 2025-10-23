// projectslist.component.ts
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
 
interface Project {
  id: string;
  name: string;
  projectCode: string;
  status: 'Active' | 'Inactive' | 'Completed';
  deliveryUnit: string;
  projectManager: string;
  teamSize: number;
  selected?: boolean;
  isImportedFromJira?: boolean;
}

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
    private cdr: ChangeDetectorRef
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
    });
  }

  // Available filter options
  statusOptions = ['Active', 'Inactive', 'Completed'];
  // Updated Delivery Unit options as requested
  deliveryUnitOptions = ['DU1', 'DU2', 'DU3', 'DU4', 'DU5', 'DU6', 'DU7', 'DU8'];

  // Table columns configuration
  tableColumns: TableColumn[] = [
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
      badgeColors: {
        'Active': 'bg-green-100 text-green-800',
        'Inactive': 'bg-gray-100 text-gray-800',
        'Completed': 'bg-blue-100 text-blue-800'
      },
      width: '15%'
    },
    {
      header: 'Delivery Unit',
      field: 'deliveryUnit',
      type: 'badge',
      // Map DU1..DU8 to distinct badge color classes
      badgeColors: {
        'DU1': 'bg-blue-100 text-blue-800',
        'DU2': 'bg-green-100 text-green-800',
        'DU3': 'bg-purple-100 text-purple-800',
        'DU4': 'bg-pink-100 text-pink-800',
        'DU5': 'bg-yellow-100 text-yellow-800',
        'DU6': 'bg-indigo-100 text-indigo-800',
        'DU7': 'bg-red-100 text-red-800',
        'DU8': 'bg-teal-100 text-teal-800',
        '--': 'bg-gray-100 text-gray-800'
      },
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

  projects: Project[] = [
  // Some projects updated to use the new DU values (randomized sample)
  { id: '1', name: 'Atlas App', projectCode: 'PROJ-001', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Asha Varma', teamSize: 12, selected: false, isImportedFromJira: false },
  { id: '2', name: 'RoadSim', projectCode: 'PROJ-002', status: 'Inactive', deliveryUnit: 'DU3', projectManager: 'Pranav Iyer', teamSize: 8, selected: false, isImportedFromJira: true },
  { id: '3', name: 'CloudSync Pro', projectCode: 'PROJ-003', status: 'Completed', deliveryUnit: 'DU2', projectManager: 'Sarah Chen', teamSize: 15, selected: false, isImportedFromJira: false },
  { id: '4', name: 'DataViz Dashboard', projectCode: 'PROJ-004', status: 'Active', deliveryUnit: 'DU4', projectManager: 'Michael Rodriguez', teamSize: 6, selected: false, isImportedFromJira: false },
  { id: '5', name: 'SecureAuth API', projectCode: 'PROJ-005', status: 'Active', deliveryUnit: 'DU8', projectManager: 'Emma Thompson', teamSize: 9, selected: false, isImportedFromJira: true },
  { id: '6', name: 'E-Learning Hub', projectCode: 'PROJ-006', status: 'Active', deliveryUnit: 'DU1', projectManager: 'James Wilson', teamSize: 11, selected: false, isImportedFromJira: false },
  { id: '7', name: 'MarketPlace Connect', projectCode: 'PROJ-007', status: 'Completed', deliveryUnit: 'DU3', projectManager: 'Lisa Anderson', teamSize: 18, selected: false, isImportedFromJira: true },
  { id: '8', name: 'Mobile Banking App', projectCode: 'PROJ-008', status: 'Active', deliveryUnit: 'DU2', projectManager: 'David Kumar', teamSize: 20, selected: false, isImportedFromJira: false },
  { id: '9', name: 'Healthcare Portal', projectCode: 'PROJ-009', status: 'Active', deliveryUnit: 'DU5', projectManager: 'Rachel Green', teamSize: 14, selected: false, isImportedFromJira: true },
  { id: '10', name: 'Inventory Management', projectCode: 'PROJ-010', status: 'Inactive', deliveryUnit: 'DU8', projectManager: 'Tom Harris', teamSize: 7, selected: false, isImportedFromJira: false },
    { id: '11', name: 'Social Media Platform', projectCode: 'PROJ-011', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Nina Patel', teamSize: 25, selected: false, isImportedFromJira: true },
    { id: '12', name: 'CRM System', projectCode: 'PROJ-012', status: 'Completed', deliveryUnit: 'DU3', projectManager: 'Alex Johnson', teamSize: 10, selected: false, isImportedFromJira: false },
    { id: '13', name: 'Analytics Dashboard', projectCode: 'PROJ-013', status: 'Active', deliveryUnit: 'DU5', projectManager: 'Sophie Turner', teamSize: 8, selected: false, isImportedFromJira: false },
    { id: '14', name: 'Payment Gateway', projectCode: 'PROJ-014', status: 'Active', deliveryUnit: 'DU6', projectManager: 'Robert Chen', teamSize: 12, selected: false, isImportedFromJira: true },
    { id: '15', name: 'Logistics Tracker', projectCode: 'PROJ-015', status: 'Active', deliveryUnit: 'DU7', projectManager: 'Maria Garcia', teamSize: 9, selected: false, isImportedFromJira: false },
    { id: '16', name: 'Video Streaming Service', projectCode: 'PROJ-016', status: 'Inactive', deliveryUnit: 'DU8', projectManager: 'Kevin Lee', teamSize: 16, selected: false, isImportedFromJira: true },
    { id: '17', name: 'Smart Home App', projectCode: 'PROJ-017', status: 'Active', deliveryUnit: 'DU4', projectManager: 'Laura Martinez', teamSize: 11, selected: false, isImportedFromJira: false },
    { id: '18', name: 'Restaurant Management', projectCode: 'PROJ-018', status: 'Completed', deliveryUnit: 'DU5', projectManager: 'Chris Brown', teamSize: 6, selected: false, isImportedFromJira: false },
    { id: '19', name: 'Fitness Tracking App', projectCode: 'PROJ-019', status: 'Active', deliveryUnit: 'DU6', projectManager: 'Amanda White', teamSize: 8, selected: false, isImportedFromJira: true },
    { id: '20', name: 'Real Estate Platform', projectCode: 'PROJ-020', status: 'Active', deliveryUnit: 'DU7', projectManager: 'Daniel Kim', teamSize: 13, selected: false, isImportedFromJira: false },
    { id: '21', name: 'Travel Booking System', projectCode: 'PROJ-021', status: 'Active', deliveryUnit: 'DU8', projectManager: 'Jessica Wang', teamSize: 15, selected: false, isImportedFromJira: true },
    { id: '22', name: 'HR Management Portal', projectCode: 'PROJ-022', status: 'Inactive', deliveryUnit: 'DU4', projectManager: 'Michael Smith', teamSize: 7, selected: false, isImportedFromJira: false },
    { id: '23', name: 'Customer Support Chat', projectCode: 'PROJ-023', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Olivia Davis', teamSize: 10, selected: false, isImportedFromJira: true },
    { id: '24', name: 'Weather Forecast App', projectCode: 'PROJ-024', status: 'Completed', deliveryUnit: 'DU2', projectManager: 'Ryan Taylor', teamSize: 5, selected: false, isImportedFromJira: false },
    { id: '25', name: 'Task Management Tool', projectCode: 'PROJ-025', status: 'Active', deliveryUnit: 'DU3', projectManager: 'Emily Wilson', teamSize: 12, selected: false, isImportedFromJira: false },
    { id: '26', name: 'AI Chatbot Platform', projectCode: 'PROJ-026', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Benjamin Clarke', teamSize: 18, selected: false, isImportedFromJira: true },
    { id: '27', name: 'Blockchain Wallet', projectCode: 'PROJ-027', status: 'Active', deliveryUnit: 'DU2', projectManager: 'Sophia Williams', teamSize: 14, selected: false, isImportedFromJira: false },
    { id: '28', name: 'Supply Chain Management', projectCode: 'PROJ-028', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Lucas Brown', teamSize: 22, selected: false, isImportedFromJira: false },
    { id: '29', name: 'Virtual Event Platform', projectCode: 'PROJ-029', status: 'Completed', deliveryUnit: 'DU3', projectManager: 'Isabella Martinez', teamSize: 9, selected: false, isImportedFromJira: true },
    { id: '30', name: 'Code Review Automation', projectCode: 'PROJ-030', status: 'Inactive', deliveryUnit: 'DU1', projectManager: 'Ethan Anderson', teamSize: 7, selected: false, isImportedFromJira: false },
    { id: '31', name: 'Document Management System', projectCode: 'PROJ-031', status: 'Active', deliveryUnit: 'DU2', projectManager: 'Mia Thompson', teamSize: 11, selected: false, isImportedFromJira: false },
    { id: '32', name: 'Fleet Management App', projectCode: 'PROJ-032', status: 'Active', deliveryUnit: 'DU3', projectManager: 'Noah Garcia', teamSize: 13, selected: false, isImportedFromJira: false },
    { id: '33', name: 'Expense Tracking Tool', projectCode: 'PROJ-033', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Ava Rodriguez', teamSize: 6, selected: false, isImportedFromJira: false },
    { id: '34', name: 'Network Monitoring System', projectCode: 'PROJ-034', status: 'Active', deliveryUnit: 'DU1', projectManager: 'William Lee', teamSize: 16, selected: false, isImportedFromJira: true },
    { id: '35', name: 'Content Management CMS', projectCode: 'PROJ-035', status: 'Completed', deliveryUnit: 'DU2', projectManager: 'Charlotte Davis', teamSize: 10, selected: false, isImportedFromJira: false },
    { id: '36', name: 'Recruitment Portal', projectCode: 'PROJ-036', status: 'Active', deliveryUnit: 'DU3', projectManager: 'James Miller', teamSize: 12, selected: false, isImportedFromJira: false },
    { id: '37', name: 'IoT Device Manager', projectCode: 'PROJ-037', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Amelia Wilson', teamSize: 19, selected: false, isImportedFromJira: true },
    { id: '38', name: 'Email Marketing Suite', projectCode: 'PROJ-038', status: 'Completed', deliveryUnit: 'DU2', projectManager: 'Oliver Moore', teamSize: 8, selected: false, isImportedFromJira: false },
    { id: '39', name: 'Bug Tracking System', projectCode: 'PROJ-039', status: 'Active', deliveryUnit: 'DU3', projectManager: 'Emma Taylor', teamSize: 14, selected: false, isImportedFromJira: false },
    { id: '40', name: 'Appointment Scheduler', projectCode: 'PROJ-040', status: 'Inactive', deliveryUnit: 'DU1', projectManager: 'Liam Anderson', teamSize: 5, selected: false, isImportedFromJira: false },
    { id: '41', name: 'Digital Asset Management', projectCode: 'PROJ-041', status: 'Active', deliveryUnit: 'DU2', projectManager: 'Harper Thomas', teamSize: 11, selected: false, isImportedFromJira: false },
    { id: '42', name: 'Knowledge Base System', projectCode: 'PROJ-042', status: 'Active', deliveryUnit: 'DU3', projectManager: 'Elijah Jackson', teamSize: 9, selected: false, isImportedFromJira: false },
    { id: '43', name: 'Invoice Generator', projectCode: 'PROJ-043', status: 'Completed', deliveryUnit: 'DU1', projectManager: 'Abigail White', teamSize: 4, selected: false, isImportedFromJira: false },
    { id: '44', name: 'Video Conference App', projectCode: 'PROJ-044', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Alexander Harris', teamSize: 21, selected: false, isImportedFromJira: true },
    { id: '45', name: 'Sales Forecasting Tool', projectCode: 'PROJ-045', status: 'Active', deliveryUnit: 'DU2', projectManager: 'Emily Martin', teamSize: 15, selected: false, isImportedFromJira: false },
    { id: '46', name: 'Warehouse Management', projectCode: 'PROJ-046', status: 'Inactive', deliveryUnit: 'DU3', projectManager: 'Daniel Thompson', teamSize: 17, selected: false, isImportedFromJira: true },
    { id: '47', name: 'Learning Management System', projectCode: 'PROJ-047', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Sofia Garcia', teamSize: 20, selected: false, isImportedFromJira: false },
    { id: '48', name: 'API Gateway Service', projectCode: 'PROJ-048', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Matthew Martinez', teamSize: 13, selected: false, isImportedFromJira: false },
    { id: '49', name: 'Performance Analytics', projectCode: 'PROJ-049', status: 'Active', deliveryUnit: 'DU2', projectManager: 'Chloe Robinson', teamSize: 10, selected: false, isImportedFromJira: false },
    { id: '50', name: 'Notification Service', projectCode: 'PROJ-050', status: 'Completed', deliveryUnit: 'DU3', projectManager: 'Jacob Clark', teamSize: 6, selected: false, isImportedFromJira: false }
  ];

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
        // bgColor should match CSS utility classes used in table template
        bgColor: this.getAvatarBgColor(project.id),
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
    this.router.navigate(['/projects/create'], {
      queryParams: {
        template: this.selectedTemplate,
        name: projectData.name,
        projectKey: projectData.projectKey,
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
      this.projects = this.projects.filter(project => project.id !== this.projectToDelete!.id);
      console.log('Project deleted:', this.projectToDelete.name);
      this.projectToDelete = null;
    } else {
      this.projects = this.projects.filter(project => !this.selectedProjects.some(selected => selected.id === project.id));
      console.log('Selected projects removed');
    }

    this.showDeleteModal = false;
    this.cdr.detectChanges();
  }
}