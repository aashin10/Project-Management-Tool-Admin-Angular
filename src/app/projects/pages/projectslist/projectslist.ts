// projectslist.component.ts
import { Component, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { Modal } from '../../../shared/modal/modal';
import { Table, TableColumn } from '../../../shared/table/table';
import { AdvancedFilters } from './advanced-filters/advanced-filters';
 
interface Project {
  id: string;
  name: string;
  projectCode: string;
  status: 'Active' | 'Inactive' | 'Completed';
  deliveryUnit: string;
  projectManager: string;
  teamSize: number;
  selected?: boolean;
}

interface TableHeader {
  field: string | null;
  label: string;
  sortable: boolean;
  minWidth: string;
}

// Removed sorting functionality

@Component({
  selector: 'app-projectslist',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomButton, Sectiontitle, Modal, Table, AdvancedFilters],
  templateUrl: './projectslist.html',
  styleUrl: './projectslist.css'
})
export class Projectslist implements AfterViewChecked {
  @ViewChild('selectAllCheckbox') selectAllCheckbox!: ElementRef<HTMLInputElement>;

  showFilters = false;
  private _searchQuery = '';
  sidebarCollapsed = false;

  get searchQuery(): string {
    return this._searchQuery;
  }

  set searchQuery(value: string) {
    if (this._searchQuery !== value) {
      this._searchQuery = value;
      // Reset pagination when search changes
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
    // Reset back to false after change detection
    if (value) {
      setTimeout(() => this._resetPagination = false, 0);
    }
  }

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  // Available filter options
  statusOptions = ['Active', 'Inactive', 'Completed'];
  deliveryUnitOptions = ['Engineering', 'Product Management', 'Design'];

  // Table columns configuration for shared table
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
      badgeColors: {
        'Engineering': 'bg-blue-100 text-blue-800',
        'Product Management': 'bg-purple-100 text-purple-800',
        'Design': 'bg-pink-100 text-pink-800'
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
        { label: 'View Details', icon: 'images/eye.svg', action: 'view' },
        { label: 'Edit', icon: 'images/edit.svg', action: 'edit' },
        { label: 'Archive', icon: 'images/archive.svg', action: 'archive' },
        { label: 'Delete', icon: 'images/trash-white.svg', action: 'delete', class: 'danger' }
      ]
    }
  ];

  projects: Project[] = [
    { id: '1', name: 'Atlas App', projectCode: 'PROJ-001', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Asha Varma', teamSize: 12, selected: false },
    { id: '2', name: 'RoadSim', projectCode: 'PROJ-002', status: 'Inactive', deliveryUnit: 'Engineering', projectManager: 'Pranav Iyer', teamSize: 8, selected: false },
    { id: '3', name: 'CloudSync Pro', projectCode: 'PROJ-003', status: 'Completed', deliveryUnit: 'Engineering', projectManager: 'Sarah Chen', teamSize: 15, selected: false },
    { id: '4', name: 'DataViz Dashboard', projectCode: 'PROJ-004', status: 'Active', deliveryUnit: 'Product Management', projectManager: 'Michael Rodriguez', teamSize: 6, selected: false },
    { id: '5', name: 'SecureAuth API', projectCode: 'PROJ-005', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Emma Thompson', teamSize: 9, selected: false },
    { id: '6', name: 'E-Learning Hub', projectCode: 'PROJ-006', status: 'Active', deliveryUnit: 'Design', projectManager: 'James Wilson', teamSize: 11, selected: false },
    { id: '7', name: 'MarketPlace Connect', projectCode: 'PROJ-007', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'Lisa Anderson', teamSize: 18, selected: false },
    { id: '8', name: 'Mobile Banking App', projectCode: 'PROJ-008', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'David Kumar', teamSize: 20, selected: false },
    { id: '9', name: 'Healthcare Portal', projectCode: 'PROJ-009', status: 'Active', deliveryUnit: 'Product Management', projectManager: 'Rachel Green', teamSize: 14, selected: false },
    { id: '10', name: 'Inventory Management', projectCode: 'PROJ-010', status: 'Inactive', deliveryUnit: 'Engineering', projectManager: 'Tom Harris', teamSize: 7, selected: false },
    { id: '11', name: 'Social Media Platform', projectCode: 'PROJ-011', status: 'Active', deliveryUnit: 'Design', projectManager: 'Nina Patel', teamSize: 25, selected: false },
    { id: '12', name: 'CRM System', projectCode: 'PROJ-012', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'Alex Johnson', teamSize: 10, selected: false },
    { id: '13', name: 'Analytics Dashboard', projectCode: 'PROJ-013', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Sophie Turner', teamSize: 8, selected: false },
    { id: '14', name: 'Payment Gateway', projectCode: 'PROJ-014', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Robert Chen', teamSize: 12, selected: false },
    { id: '15', name: 'Logistics Tracker', projectCode: 'PROJ-015', status: 'Active', deliveryUnit: 'Product Management', projectManager: 'Maria Garcia', teamSize: 9, selected: false },
    { id: '16', name: 'Video Streaming Service', projectCode: 'PROJ-016', status: 'Inactive', deliveryUnit: 'Design', projectManager: 'Kevin Lee', teamSize: 16, selected: false },
    { id: '17', name: 'Smart Home App', projectCode: 'PROJ-017', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Laura Martinez', teamSize: 11, selected: false },
    { id: '18', name: 'Restaurant Management', projectCode: 'PROJ-018', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'Chris Brown', teamSize: 6, selected: false },
    { id: '19', name: 'Fitness Tracking App', projectCode: 'PROJ-019', status: 'Active', deliveryUnit: 'Design', projectManager: 'Amanda White', teamSize: 8, selected: false },
    { id: '20', name: 'Real Estate Platform', projectCode: 'PROJ-020', status: 'Active', deliveryUnit: 'Product Management', projectManager: 'Daniel Kim', teamSize: 13, selected: false },
    { id: '21', name: 'Travel Booking System', projectCode: 'PROJ-021', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Jessica Wang', teamSize: 15, selected: false },
    { id: '22', name: 'HR Management Portal', projectCode: 'PROJ-022', status: 'Inactive', deliveryUnit: 'Design', projectManager: 'Michael Smith', teamSize: 7, selected: false },
    { id: '23', name: 'Customer Support Chat', projectCode: 'PROJ-023', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Olivia Davis', teamSize: 10, selected: false },
    { id: '24', name: 'Weather Forecast App', projectCode: 'PROJ-024', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'Ryan Taylor', teamSize: 5, selected: false },
    { id: '25', name: 'Task Management Tool', projectCode: 'PROJ-025', status: 'Active', deliveryUnit: 'Design', projectManager: 'Emily Wilson', teamSize: 12, selected: false },
    { id: '26', name: 'AI Chatbot Platform', projectCode: 'PROJ-026', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Benjamin Clarke', teamSize: 18, selected: false },
    { id: '27', name: 'Blockchain Wallet', projectCode: 'PROJ-027', status: 'Active', deliveryUnit: 'Product Management', projectManager: 'Sophia Williams', teamSize: 14, selected: false },
    { id: '28', name: 'Supply Chain Management', projectCode: 'PROJ-028', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Lucas Brown', teamSize: 22, selected: false },
    { id: '29', name: 'Virtual Event Platform', projectCode: 'PROJ-029', status: 'Completed', deliveryUnit: 'Design', projectManager: 'Isabella Martinez', teamSize: 9, selected: false },
    { id: '30', name: 'Code Review Automation', projectCode: 'PROJ-030', status: 'Inactive', deliveryUnit: 'Engineering', projectManager: 'Ethan Anderson', teamSize: 7, selected: false },
    { id: '31', name: 'Document Management System', projectCode: 'PROJ-031', status: 'Active', deliveryUnit: 'Product Management', projectManager: 'Mia Thompson', teamSize: 11, selected: false },
    { id: '32', name: 'Fleet Management App', projectCode: 'PROJ-032', status: 'Active', deliveryUnit: 'Design', projectManager: 'Noah Garcia', teamSize: 13, selected: false },
    { id: '33', name: 'Expense Tracking Tool', projectCode: 'PROJ-033', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Ava Rodriguez', teamSize: 6, selected: false },
    { id: '34', name: 'Network Monitoring System', projectCode: 'PROJ-034', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'William Lee', teamSize: 16, selected: false },
    { id: '35', name: 'Content Management CMS', projectCode: 'PROJ-035', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'Charlotte Davis', teamSize: 10, selected: false },
    { id: '36', name: 'Recruitment Portal', projectCode: 'PROJ-036', status: 'Active', deliveryUnit: 'Design', projectManager: 'James Miller', teamSize: 12, selected: false },
    { id: '37', name: 'IoT Device Manager', projectCode: 'PROJ-037', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Amelia Wilson', teamSize: 19, selected: false },
    { id: '38', name: 'Email Marketing Suite', projectCode: 'PROJ-038', status: 'Completed', deliveryUnit: 'Product Management', projectManager: 'Oliver Moore', teamSize: 8, selected: false },
    { id: '39', name: 'Bug Tracking System', projectCode: 'PROJ-039', status: 'Active', deliveryUnit: 'Design', projectManager: 'Emma Taylor', teamSize: 14, selected: false },
    { id: '40', name: 'Appointment Scheduler', projectCode: 'PROJ-040', status: 'Inactive', deliveryUnit: 'Engineering', projectManager: 'Liam Anderson', teamSize: 5, selected: false },
    { id: '41', name: 'Digital Asset Management', projectCode: 'PROJ-041', status: 'Active', deliveryUnit: 'Product Management', projectManager: 'Harper Thomas', teamSize: 11, selected: false },
    { id: '42', name: 'Knowledge Base System', projectCode: 'PROJ-042', status: 'Active', deliveryUnit: 'Design', projectManager: 'Elijah Jackson', teamSize: 9, selected: false },
    { id: '43', name: 'Invoice Generator', projectCode: 'PROJ-043', status: 'Completed', deliveryUnit: 'Engineering', projectManager: 'Abigail White', teamSize: 4, selected: false },
    { id: '44', name: 'Video Conference App', projectCode: 'PROJ-044', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Alexander Harris', teamSize: 21, selected: false },
    { id: '45', name: 'Sales Forecasting Tool', projectCode: 'PROJ-045', status: 'Active', deliveryUnit: 'Product Management', projectManager: 'Emily Martin', teamSize: 15, selected: false },
    { id: '46', name: 'Warehouse Management', projectCode: 'PROJ-046', status: 'Inactive', deliveryUnit: 'Design', projectManager: 'Daniel Thompson', teamSize: 17, selected: false },
    { id: '47', name: 'Learning Management System', projectCode: 'PROJ-047', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Sofia Garcia', teamSize: 20, selected: false },
    { id: '48', name: 'API Gateway Service', projectCode: 'PROJ-048', status: 'Active', deliveryUnit: 'Engineering', projectManager: 'Matthew Martinez', teamSize: 13, selected: false },
    { id: '49', name: 'Performance Analytics', projectCode: 'PROJ-049', status: 'Active', deliveryUnit: 'Product Management', projectManager: 'Chloe Robinson', teamSize: 10, selected: false },
    { id: '50', name: 'Notification Service', projectCode: 'PROJ-050', status: 'Completed', deliveryUnit: 'Design', projectManager: 'Jacob Clark', teamSize: 6, selected: false }
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

    // Sorting functionality removed

    return filtered;
  }

  get tableData(): any[] {
    return this.filteredProjects.map(project => ({
      projectInfo: {
        name: project.name,
        subtitle: project.projectCode,
        initials: project.name.substring(0, 2).toUpperCase()
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

  get selectedProjects(): Project[] {
    // Return only selected projects that are currently visible in filtered results
    return this.filteredProjects.filter(p => p.selected);
  }

  get allSelectedProjects(): Project[] {
    // Return all selected projects from the entire dataset
    return this.projects.filter(p => p.selected);
  }

  get deleteCount(): number {
    // Return the count for delete operations
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

      // Show indeterminate state for both partial selection and full selection
      checkbox.indeterminate = isIndeterminate || allSelected;
      checkbox.checked = false;
    }
  }

  isIndeterminateSelection(): boolean {
    const filteredProjects = this.filteredProjects;
    const selectedCount = filteredProjects.filter(p => p.selected).length;
    return selectedCount > 0 && selectedCount < filteredProjects.length;
  }

  // Get initials from project manager name
  getInitials(managerName: string): string {
    const parts = managerName.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    } else if (parts.length === 1) {
      return parts[0][0] + parts[0][1];
    }
    return '';
  }

  // Filter change handler
  onFiltersChanged(filters: { selectedStatuses: string[]; selectedDeliveryUnits: string[]; selectedManagers: string[] }): void {
    this.selectedStatuses = filters.selectedStatuses;
    this.selectedDeliveryUnits = filters.selectedDeliveryUnits;
    this.selectedManagers = filters.selectedManagers;

    // Reset pagination to first page when filters change
    this.resetPagination = true;

    // Force change detection to update checkbox state
    this.cdr.detectChanges();
  }


  // Other Methods

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleSelectAll(): void {
    const allSelected = this.allSelected;
    const someSelected = this.isIndeterminateSelection();

    let newSelectionState: boolean;

    if (allSelected || someSelected) {
      // All or some selected (showing dash) - deselect all
      newSelectionState = false;
    } else {
      // None selected (empty) - select all
      newSelectionState = true;
    }

    // Apply the new selection state to all filtered projects (across all pages)
    this.filteredProjects.forEach(project => {
      project.selected = newSelectionState;
    });

    // Explicitly update checkbox state immediately after selection changes
    this.updateCheckboxState();

    // Force change detection
    this.cdr.detectChanges();
  }

  // Sorting functionality removed


  viewDetails(projectId: string): void {
    console.log('View details:', projectId);
    this.router.navigate(['/projects', projectId]);
  }

  // Smart row click handler: toggle selection if projects selected, navigate if none selected
  onRowClick(project: Project): void {
    if (this.allSelectedProjects.length > 0) {
      // If any projects are selected globally, toggle this project's selection
      project.selected = !project.selected;
      // Force change detection to update checkbox and bulk actions popup
      this.cdr.detectChanges();
    } else {
      // If no projects are selected, navigate to project details
      this.viewProjectDetails(project.id);
    }
  }

  // Handle individual checkbox changes to ensure UI updates
  onSelectionChange(): void {
    // Force change detection when individual selections change
    this.cdr.detectChanges();
  }

  viewProjectDetails(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }

  handleTableAction(event: { action: string; row: any }): void {
    const projectId = event.row.actions; // The actions field contains the project ID
    const project = this.projects.find(p => p.id === projectId);

    switch (event.action) {
      case 'view':
        this.viewProjectDetails(projectId);
        break;
      case 'edit':
        this.editProject(projectId);
        break;
      case 'archive':
        this.archiveProject(projectId);
        break;
      case 'delete':
        this.projectToDelete = project || null;
        this.showDeleteModal = true;
        break;
    }
  }

  handleRowClick(event: { row: any; index: number }): void {
    const projectId = event.row.actions; // The actions field contains the project ID
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      this.onRowClick(project);
    }
  }

  handleSelectionChange(selectedRows: any[]): void {
    // Clear all selections first
    this.projects.forEach(project => {
      project.selected = false;
    });

    // Set selected state for the selected rows
    selectedRows.forEach(selectedRow => {
      const projectId = selectedRow.actions; // The actions field contains the project ID
      const project = this.projects.find(p => p.id === projectId);
      if (project) {
        project.selected = true;
      }
    });

    // Force change detection to update the UI
    this.cdr.detectChanges();
  }

  editProject(projectId: string): void {
    console.log('Edit project:', projectId);
    this.router.navigate(['/projects', projectId, 'edit']);
  }

  archiveProject(projectId: string): void {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      project.status = 'Inactive';
      console.log('Project archived:', projectId);
    }
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
    // Determine which projects to export
    const projectsToExport = this.selectedProjects.length > 0 ? this.selectedProjects : this.filteredProjects;

    // Prepare CSV headers
    const headers = ['Project Name', 'Project Code', 'Status', 'Delivery Unit', 'Project Manager', 'Team Size'];

    // Prepare CSV rows
    const rows = projectsToExport.map(project => [
      project.name,
      project.projectCode,
      project.status,
      project.deliveryUnit,
      project.projectManager,
      project.teamSize.toString()
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
    this.router.navigate(['/projects/create']);
  }


  // Modal handlers
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.projectToDelete = null;
  }

  confirmDelete(): void {
    if (this.projectToDelete) {
      // Remove individual project
      this.projects = this.projects.filter(project => project.id !== this.projectToDelete!.id);
      console.log('Project deleted:', this.projectToDelete.name);
      this.projectToDelete = null;
    } else {
      // Remove selected projects (bulk removal)
      this.projects = this.projects.filter(project => !this.selectedProjects.some(selected => selected.id === project.id));
      console.log('Selected projects removed');
    }

    this.showDeleteModal = false;

    // Force change detection to ensure all UI updates properly
    this.cdr.detectChanges();
  }

}