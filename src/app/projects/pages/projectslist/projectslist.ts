// projectslist.component.ts
import { Component, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { Modal } from '../../../shared/modal/modal';
import { AdvancedFilters } from './advanced-filters/advanced-filters';
import { BulkActions } from './bulk-actions/bulk-actions';
import { ActionsMenu } from './actions-menu/actions-menu';

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

interface TableHeader {
  field: SortField | null;
  label: string;
  sortable: boolean;
  minWidth: string;
}

type SortField = 'name' | 'status' | 'priority' | 'projectManager' | 'teamSize';
type SortDirection = 'asc' | 'desc';

interface SortCriteria {
  field: SortField;
  direction: SortDirection;
}

@Component({
  selector: 'app-projectslist',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomButton, Sectiontitle, Modal, AdvancedFilters, BulkActions, ActionsMenu],
  templateUrl: './projectslist.html',
  styleUrl: './projectslist.css'
})
export class Projectslist implements AfterViewChecked {
  @ViewChild('selectAllCheckbox') selectAllCheckbox!: ElementRef<HTMLInputElement>;

  showFilters = false;
  searchQuery = '';
  showActionsMenu = false;
  activeProjectId: string | null = null;
  sidebarCollapsed = false;

  // Delete modal properties
  showDeleteModal = false;
  projectToDelete: string | null = null;
  deleteMode: 'single' | 'bulk' = 'single';
  projectsToDelete: Project[] = [];

  // Multi-select filter options
  selectedStatuses: string[] = [];
  selectedPriorities: string[] = [];
  selectedManagers: string[] = [];

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}
  
  // Sorting - single criteria at a time
  sortCriteria: SortCriteria | null = null;
  
  rowsPerPage = 10;
  currentPage = 1;
  rowsPerPageOptions = [10, 20, 30, 50, 100];

  // Available filter options
  statusOptions = ['Ongoing', 'On Hold', 'Completed', 'Planning', 'Archived'];
  priorityOptions = ['Critical', 'High', 'Medium', 'Low'];

  // Table headers configuration
  tableHeaders: TableHeader[] = [
    { field: 'name' as SortField, label: 'Project Info', sortable: true, minWidth: '200px' },
    { field: 'status' as SortField, label: 'Status', sortable: true, minWidth: '100px' },
    { field: 'priority' as SortField, label: 'Priority', sortable: true, minWidth: '90px' },
    { field: 'projectManager' as SortField, label: 'Project Manager', sortable: true, minWidth: '160px' },
    { field: 'teamSize' as SortField, label: 'Team Size', sortable: true, minWidth: '100px' },
    { field: null, label: 'Actions', sortable: false, minWidth: '80px' }
  ];

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

  // Getters
  get paginatedProjects(): Project[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredProjects.slice(start, end);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProjects.length / this.rowsPerPage));
  }

  get startIndex(): number {
    if (this.filteredProjects.length === 0) return 0;
    return (this.currentPage - 1) * this.rowsPerPage;
  }

  get endIndex(): number {
    const end = this.startIndex + this.rowsPerPage;
    return Math.min(end, this.filteredProjects.length);
  }

  get hasActiveFilters(): boolean {
    return this.selectedStatuses.length > 0 ||
           this.selectedPriorities.length > 0 ||
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

    if (this.selectedPriorities.length > 0) {
      filtered = filtered.filter(project => 
        this.selectedPriorities.includes(project.priority)
      );
    }

    if (this.selectedManagers.length > 0) {
      filtered = filtered.filter(project => 
        this.selectedManagers.includes(project.projectManager)
      );
    }

    // Apply single sorting criteria
    if (this.sortCriteria) {
      filtered.sort((a, b) => {
        let comparison = 0;
        const field = this.sortCriteria!.field;

        if (field === 'teamSize') {
          comparison = a[field] - b[field];
        } else if (field === 'priority') {
          // Higher priority values should come first in ascending order
          const priorityOrder: Record<string, number> = {
            'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4
          };
          comparison = priorityOrder[a[field]] - priorityOrder[b[field]];
        } else if (field === 'status') {
          // Logical workflow order: Planning -> Ongoing -> On Hold -> Completed -> Archived
          const statusOrder: Record<string, number> = {
            'Planning': 1, 'Ongoing': 2, 'On Hold': 3, 'Completed': 4, 'Archived': 5
          };
          comparison = statusOrder[a[field]] - statusOrder[b[field]];
        } else {
          comparison = String(a[field]).localeCompare(String(b[field]));
        }

        // Apply direction
        comparison = this.sortCriteria!.direction === 'asc' ? comparison : -comparison;

        return comparison;
      });
    }

    return filtered;
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
    // Return the count for delete operations (use stored projects for bulk delete)
    return this.deleteMode === 'bulk' ? this.projectsToDelete.length : this.allSelectedProjects.length;
  }

  get allSelected(): boolean {
    const filteredProjects = this.filteredProjects;
    return filteredProjects.length > 0 &&
           filteredProjects.every(p => p.selected);
  }

  get allOnCurrentPageSelected(): boolean {
    return this.paginatedProjects.length > 0 &&
           this.paginatedProjects.every(p => p.selected);
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

  // Filter change handler
  onFiltersChanged(filters: { selectedStatuses: string[]; selectedPriorities: string[]; selectedManagers: string[] }): void {
    this.selectedStatuses = filters.selectedStatuses;
    this.selectedPriorities = filters.selectedPriorities;
    this.selectedManagers = filters.selectedManagers;
    this.currentPage = 1;

    // Force change detection to update checkbox state
    this.cdr.detectChanges();
  }

  // Pagination Handlers
  handleRowsPerPageChange(newRowsPerPage: number): void {
    this.rowsPerPage = newRowsPerPage;
    this.currentPage = 1;
    this.scrollToTop();
  }

  handleFirstPage(): void {
    this.currentPage = 1;
    this.scrollToTop();
  }

  handlePreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.scrollToTop();
    }
  }

  handleNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.scrollToTop();
    }
  }

  handleLastPage(): void {
    this.currentPage = this.totalPages;
    this.scrollToTop();
  }

  handleTwoPagesBack(): void {
    if (this.currentPage > 2) {
      this.currentPage -= 2;
    } else {
      this.currentPage = 1;
    }
    this.scrollToTop();
  }

  handleTwoPagesForward(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage += 2;
    } else {
      this.currentPage = this.totalPages;
    }
    this.scrollToTop();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Other Methods
  onSearchChange(): void {
    this.currentPage = 1;
    // Force change detection to update checkbox state when search changes
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

  sortBy(field: SortField): void {
    if (this.sortCriteria && this.sortCriteria.field === field) {
      // Field is currently being sorted
      if (this.sortCriteria.direction === 'asc') {
        // Change from asc to desc
        this.sortCriteria.direction = 'desc';
      } else {
        // Remove sorting (was desc, now removing)
        this.sortCriteria = null;
      }
    } else {
      // Set new field as sort criteria with ascending order
      this.sortCriteria = { field, direction: 'asc' };
    }
  }

  // Helper method to get sort direction for a field (for UI display)
  getSortDirection(field: SortField): SortDirection | null {
    return this.sortCriteria && this.sortCriteria.field === field ? this.sortCriteria.direction : null;
  }

  // Check if any sorting is active
  get hasActiveSorting(): boolean {
    return this.sortCriteria !== null;
  }

  // Get human-readable field label
  getFieldLabel(field: SortField): string {
    const fieldLabels: Record<SortField, string> = {
      'name': 'Project Name',
      'status': 'Status',
      'priority': 'Priority',
      'projectManager': 'Manager',
      'teamSize': 'Team Size'
    };
    return fieldLabels[field] || field;
  }

  toggleActionsMenu(projectId: string, event: Event): void {
    event.stopPropagation();
    if (this.activeProjectId === projectId && this.showActionsMenu) {
      this.showActionsMenu = false;
      this.activeProjectId = null;
    } else {
      this.showActionsMenu = true;
      this.activeProjectId = projectId;
    }
  }

  closeActionsMenu(): void {
    this.showActionsMenu = false;
    this.activeProjectId = null;
  }

  viewDetails(projectId: string): void {
    console.log('View details:', projectId);
    this.closeActionsMenu();
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

  editProject(projectId: string): void {
    console.log('Edit project:', projectId);
    this.closeActionsMenu();
    this.router.navigate(['/projects', projectId, 'edit']);
  }

  archiveProject(projectId: string): void {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      project.status = 'Archived';
      console.log('Project archived:', projectId);
    }
    this.closeActionsMenu();
  }

  deleteProject(projectId: string): void {
    this.projectToDelete = projectId;
    this.deleteMode = 'single';
    this.showDeleteModal = true;
    this.closeActionsMenu();
  }

  exportAll(): void {
    console.log('Exporting all projects...');
  }

  importFromJira(): void {
    this.router.navigate(['/projects/importfromjira']);
  }

  createProject(): void {
    this.router.navigate(['/projects/create']);
  }

  deleteSelected(): void {
    if (this.allSelectedProjects.length === 0) return;

    // Store the selected projects for deletion
    this.projectsToDelete = [...this.allSelectedProjects];

    // Clear all selections to hide bulk actions
    this.projects.forEach(project => {
      project.selected = false;
    });

    this.deleteMode = 'bulk';
    this.showDeleteModal = true;
  }

  // Modal handlers
  cancelDelete(): void {
    this.closeActionsMenu();
    this.showDeleteModal = false;
    this.projectToDelete = null;
    this.deleteMode = 'single';
    // Clear stored projects for bulk delete
    this.projectsToDelete = [];
  }

  confirmDelete(): void {
    // Close actions menu immediately before any other operations
    this.closeActionsMenu();

    if (this.deleteMode === 'single' && this.projectToDelete) {
      this.projects = this.projects.filter(p => p.id !== this.projectToDelete);
      console.log('Project deleted:', this.projectToDelete);
      if (this.paginatedProjects.length === 0 && this.currentPage > 1) {
        this.currentPage--;
      }
    } else if (this.deleteMode === 'bulk') {
      // Use stored projects to delete instead of current selections
      const projectIdsToDelete = this.projectsToDelete.map(p => p.id);
      this.projects = this.projects.filter(p => !projectIdsToDelete.includes(p.id));
      console.log('Projects deleted:', projectIdsToDelete.length);
      if (this.paginatedProjects.length === 0 && this.currentPage > 1) {
        this.currentPage--;
      }
      // Clear the stored projects after deletion
      this.projectsToDelete = [];
    }

    this.showDeleteModal = false;
    this.projectToDelete = null;
    this.deleteMode = 'single';

    // Force change detection to ensure all UI updates properly
    this.cdr.detectChanges();
  }

  // Helper method to get project name for modal display
  getProjectName(projectId: string | null): string {
    if (!projectId) return '';
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : '';
  }
}