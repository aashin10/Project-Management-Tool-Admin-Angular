import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Project {
  id: string;
  name: string;
  projectCode: string;
  status: 'Ongoing' | 'On Hold' | 'Completed' | 'Planning' | 'Archived';
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  projectManager: string;
  managerInitials: string;
  teamSize: number;
  progress: number;
  selected?: boolean;
}

@Component({
  selector: 'app-projectslist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projectslist.html',
  styleUrl: './projectslist.css'
})
export class Projectslist {
  showFilters = false;
  searchQuery = '';
  showActionsMenu = false;
  activeProjectId: string | null = null;
  sidebarCollapsed = false; // Add this property to track sidebar state
  
  // Filter options
  selectedStatus = 'all';
  selectedPriority = 'all';
  selectedManager = 'all';
  selectedProgress = 'all';
  
  rowsPerPage = 10;
  currentPage = 1;

  get paginatedProjects(): Project[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredProjects.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProjects.length / this.rowsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.rowsPerPage;
  }

  get endIndex(): number {
    const end = this.startIndex + this.rowsPerPage;
    return Math.min(end, this.filteredProjects.length);
  }

  onRowsPerPageChange(): void {
    this.currentPage = 1; // Reset to first page when changing rows per page
  }

  goToFirstPage(): void {
    this.currentPage = 1;
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
  }

  projects: Project[] = [
    {
      id: '1',
      name: 'Atlas App',
      projectCode: 'PROJ-001',
      status: 'Ongoing',
      priority: 'High',
      projectManager: 'Asha Varma',
      managerInitials: 'AV',
      teamSize: 12,
      progress: 68,
      selected: false
    },
    {
      id: '2',
      name: 'RoadSim',
      projectCode: 'PROJ-002',
      status: 'On Hold',
      priority: 'Medium',
      projectManager: 'Pranav Iyer',
      managerInitials: 'PI',
      teamSize: 8,
      progress: 22,
      selected: false
    },
    {
      id: '3',
      name: 'CloudSync Pro',
      projectCode: 'PROJ-003',
      status: 'Completed',
      priority: 'High',
      projectManager: 'Sarah Chen',
      managerInitials: 'SC',
      teamSize: 15,
      progress: 100,
      selected: false
    },
    {
      id: '4',
      name: 'DataViz Dashboard',
      projectCode: 'PROJ-004',
      status: 'Ongoing',
      priority: 'Medium',
      projectManager: 'Michael Rodriguez',
      managerInitials: 'MR',
      teamSize: 6,
      progress: 45,
      selected: false
    },
    {
      id: '5',
      name: 'SecureAuth API',
      projectCode: 'PROJ-005',
      status: 'Ongoing',
      priority: 'Critical',
      projectManager: 'Emma Thompson',
      managerInitials: 'ET',
      teamSize: 9,
      progress: 78,
      selected: false
    },
    {
      id: '6',
      name: 'E-Learning Hub',
      projectCode: 'PROJ-006',
      status: 'Planning',
      priority: 'Low',
      projectManager: 'James Wilson',
      managerInitials: 'JW',
      teamSize: 11,
      progress: 15,
      selected: false
    },
    {
      id: '7',
      name: 'MarketPlace Connect',
      projectCode: 'PROJ-007',
      status: 'Archived',
      priority: 'Medium',
      projectManager: 'Lisa Anderson',
      managerInitials: 'LA',
      teamSize: 18,
      progress: 95,
      selected: false
    },
    {
      id: '8',
      name: 'Mobile Banking App',
      projectCode: 'PROJ-008',
      status: 'Ongoing',
      priority: 'Critical',
      projectManager: 'David Kumar',
      managerInitials: 'DK',
      teamSize: 20,
      progress: 55,
      selected: false
    },
    {
      id: '9',
      name: 'Healthcare Portal',
      projectCode: 'PROJ-009',
      status: 'Planning',
      priority: 'High',
      projectManager: 'Rachel Green',
      managerInitials: 'RG',
      teamSize: 14,
      progress: 10,
      selected: false
    },
    {
      id: '10',
      name: 'Inventory Management',
      projectCode: 'PROJ-010',
      status: 'On Hold',
      priority: 'Medium',
      projectManager: 'Tom Harris',
      managerInitials: 'TH',
      teamSize: 7,
      progress: 35,
      selected: false
    },
    {
      id: '11',
      name: 'Social Media Platform',
      projectCode: 'PROJ-011',
      status: 'Ongoing',
      priority: 'High',
      projectManager: 'Nina Patel',
      managerInitials: 'NP',
      teamSize: 25,
      progress: 72,
      selected: false
    },
    {
      id: '12',
      name: 'CRM System',
      projectCode: 'PROJ-012',
      status: 'Completed',
      priority: 'Medium',
      projectManager: 'Alex Johnson',
      managerInitials: 'AJ',
      teamSize: 10,
      progress: 100,
      selected: false
    },
    {
      id: '13',
      name: 'Analytics Dashboard',
      projectCode: 'PROJ-013',
      status: 'Ongoing',
      priority: 'High',
      projectManager: 'Sophie Turner',
      managerInitials: 'ST',
      teamSize: 8,
      progress: 60,
      selected: false
    },
    {
      id: '14',
      name: 'Payment Gateway',
      projectCode: 'PROJ-014',
      status: 'Planning',
      priority: 'Critical',
      projectManager: 'Robert Chen',
      managerInitials: 'RC',
      teamSize: 12,
      progress: 20,
      selected: false
    },
    {
      id: '15',
      name: 'Logistics Tracker',
      projectCode: 'PROJ-015',
      status: 'Ongoing',
      priority: 'Medium',
      projectManager: 'Maria Garcia',
      managerInitials: 'MG',
      teamSize: 9,
      progress: 48,
      selected: false
    },
    {
      id: '16',
      name: 'Video Streaming Service',
      projectCode: 'PROJ-016',
      status: 'On Hold',
      priority: 'Low',
      projectManager: 'Kevin Lee',
      managerInitials: 'KL',
      teamSize: 16,
      progress: 30,
      selected: false
    },
    {
      id: '17',
      name: 'Smart Home App',
      projectCode: 'PROJ-017',
      status: 'Ongoing',
      priority: 'High',
      projectManager: 'Laura Martinez',
      managerInitials: 'LM',
      teamSize: 11,
      progress: 65,
      selected: false
    },
    {
      id: '18',
      name: 'Restaurant Management',
      projectCode: 'PROJ-018',
      status: 'Completed',
      priority: 'Medium',
      projectManager: 'Chris Brown',
      managerInitials: 'CB',
      teamSize: 6,
      progress: 100,
      selected: false
    },
    {
      id: '19',
      name: 'Fitness Tracking App',
      projectCode: 'PROJ-019',
      status: 'Ongoing',
      priority: 'Low',
      projectManager: 'Amanda White',
      managerInitials: 'AW',
      teamSize: 8,
      progress: 42,
      selected: false
    },
    {
      id: '20',
      name: 'Real Estate Platform',
      projectCode: 'PROJ-020',
      status: 'Planning',
      priority: 'High',
      projectManager: 'Daniel Kim',
      managerInitials: 'DK',
      teamSize: 13,
      progress: 18,
      selected: false
    },
    {
      id: '21',
      name: 'Travel Booking System',
      projectCode: 'PROJ-021',
      status: 'Ongoing',
      priority: 'Medium',
      projectManager: 'Jessica Wang',
      managerInitials: 'JW',
      teamSize: 15,
      progress: 58,
      selected: false
    },
    {
      id: '22',
      name: 'HR Management Portal',
      projectCode: 'PROJ-022',
      status: 'On Hold',
      priority: 'Low',
      projectManager: 'Michael Smith',
      managerInitials: 'MS',
      teamSize: 7,
      progress: 25,
      selected: false
    },
    {
      id: '23',
      name: 'Customer Support Chat',
      projectCode: 'PROJ-023',
      status: 'Ongoing',
      priority: 'Critical',
      projectManager: 'Olivia Davis',
      managerInitials: 'OD',
      teamSize: 10,
      progress: 75,
      selected: false
    },
    {
      id: '24',
      name: 'Weather Forecast App',
      projectCode: 'PROJ-024',
      status: 'Completed',
      priority: 'Low',
      projectManager: 'Ryan Taylor',
      managerInitials: 'RT',
      teamSize: 5,
      progress: 100,
      selected: false
    },
    {
      id: '25',
      name: 'Task Management Tool',
      projectCode: 'PROJ-025',
      status: 'Ongoing',
      priority: 'High',
      projectManager: 'Emily Wilson',
      managerInitials: 'EW',
      teamSize: 12,
      progress: 62,
      selected: false
    },
    {
      id: '26',
      name: 'Email Marketing Platform',
      projectCode: 'PROJ-026',
      status: 'Planning',
      priority: 'Medium',
      projectManager: 'Brandon Lee',
      managerInitials: 'BL',
      teamSize: 9,
      progress: 12,
      selected: false
    },
    {
      id: '27',
      name: 'Online Learning Platform',
      projectCode: 'PROJ-027',
      status: 'Ongoing',
      priority: 'High',
      projectManager: 'Sophia Anderson',
      managerInitials: 'SA',
      teamSize: 18,
      progress: 70,
      selected: false
    },
    {
      id: '28',
      name: 'Music Streaming App',
      projectCode: 'PROJ-028',
      status: 'On Hold',
      priority: 'Medium',
      projectManager: 'Jacob Martinez',
      managerInitials: 'JM',
      teamSize: 14,
      progress: 38,
      selected: false
    },
    {
      id: '29',
      name: 'News Aggregator',
      projectCode: 'PROJ-029',
      status: 'Ongoing',
      priority: 'Low',
      projectManager: 'Mia Robinson',
      managerInitials: 'MR',
      teamSize: 6,
      progress: 52,
      selected: false
    },
    {
      id: '30',
      name: 'Appointment Scheduler',
      projectCode: 'PROJ-030',
      status: 'Completed',
      priority: 'Medium',
      projectManager: 'Ethan Clark',
      managerInitials: 'EC',
      teamSize: 8,
      progress: 100,
      selected: false
    },
    {
      id: '31',
      name: 'Budget Tracking App',
      projectCode: 'PROJ-031',
      status: 'Ongoing',
      priority: 'High',
      projectManager: 'Ava Lewis',
      managerInitials: 'AL',
      teamSize: 7,
      progress: 56,
      selected: false
    },
    {
      id: '32',
      name: 'Recipe Sharing Platform',
      projectCode: 'PROJ-032',
      status: 'Planning',
      priority: 'Low',
      projectManager: 'Noah Walker',
      managerInitials: 'NW',
      teamSize: 5,
      progress: 8,
      selected: false
    },
    {
      id: '33',
      name: 'Freelance Marketplace',
      projectCode: 'PROJ-033',
      status: 'Ongoing',
      priority: 'Critical',
      projectManager: 'Isabella Hall',
      managerInitials: 'IH',
      teamSize: 20,
      progress: 68,
      selected: false
    },
    {
      id: '34',
      name: 'Event Management System',
      projectCode: 'PROJ-034',
      status: 'On Hold',
      priority: 'Medium',
      projectManager: 'Liam Young',
      managerInitials: 'LY',
      teamSize: 11,
      progress: 32,
      selected: false
    },
    {
      id: '35',
      name: 'Survey Tool',
      projectCode: 'PROJ-035',
      status: 'Ongoing',
      priority: 'Low',
      projectManager: 'Charlotte King',
      managerInitials: 'CK',
      teamSize: 6,
      progress: 44,
      selected: false
    },
    {
      id: '36',
      name: 'Document Collaboration',
      projectCode: 'PROJ-036',
      status: 'Completed',
      priority: 'High',
      projectManager: 'Mason Wright',
      managerInitials: 'MW',
      teamSize: 13,
      progress: 100,
      selected: false
    },
    {
      id: '37',
      name: 'Photo Gallery App',
      projectCode: 'PROJ-037',
      status: 'Ongoing',
      priority: 'Medium',
      projectManager: 'Amelia Scott',
      managerInitials: 'AS',
      teamSize: 8,
      progress: 50,
      selected: false
    },
    {
      id: '38',
      name: 'Password Manager',
      projectCode: 'PROJ-038',
      status: 'Planning',
      priority: 'Critical',
      projectManager: 'Lucas Green',
      managerInitials: 'LG',
      teamSize: 10,
      progress: 15,
      selected: false
    },
    {
      id: '39',
      name: 'Podcast Platform',
      projectCode: 'PROJ-039',
      status: 'Ongoing',
      priority: 'Medium',
      projectManager: 'Harper Adams',
      managerInitials: 'HA',
      teamSize: 12,
      progress: 60,
      selected: false
    },
    {
      id: '40',
      name: 'Delivery Tracking',
      projectCode: 'PROJ-040',
      status: 'On Hold',
      priority: 'Low',
      projectManager: 'Elijah Baker',
      managerInitials: 'EB',
      teamSize: 9,
      progress: 28,
      selected: false
    },
    {
      id: '41',
      name: 'Auction Platform',
      projectCode: 'PROJ-041',
      status: 'Ongoing',
      priority: 'High',
      projectManager: 'Evelyn Nelson',
      managerInitials: 'EN',
      teamSize: 16,
      progress: 64,
      selected: false
    },
    {
      id: '42',
      name: 'Language Learning App',
      projectCode: 'PROJ-042',
      status: 'Completed',
      priority: 'Medium',
      projectManager: 'Alexander Carter',
      managerInitials: 'AC',
      teamSize: 11,
      progress: 100,
      selected: false
    },
    {
      id: '43',
      name: 'Virtual Meeting Tool',
      projectCode: 'PROJ-043',
      status: 'Ongoing',
      priority: 'Critical',
      projectManager: 'Abigail Mitchell',
      managerInitials: 'AM',
      teamSize: 15,
      progress: 73,
      selected: false
    },
    {
      id: '44',
      name: 'Pet Care App',
      projectCode: 'PROJ-044',
      status: 'Planning',
      priority: 'Low',
      projectManager: 'James Perez',
      managerInitials: 'JP',
      teamSize: 6,
      progress: 10,
      selected: false
    },
    {
      id: '45',
      name: 'Charity Donation Platform',
      projectCode: 'PROJ-045',
      status: 'Ongoing',
      priority: 'Medium',
      projectManager: 'Emily Roberts',
      managerInitials: 'ER',
      teamSize: 10,
      progress: 54,
      selected: false
    },
    {
      id: '46',
      name: 'Car Rental System',
      projectCode: 'PROJ-046',
      status: 'On Hold',
      priority: 'High',
      projectManager: 'Benjamin Turner',
      managerInitials: 'BT',
      teamSize: 12,
      progress: 36,
      selected: false
    },
    {
      id: '47',
      name: 'Meditation App',
      projectCode: 'PROJ-047',
      status: 'Ongoing',
      priority: 'Low',
      projectManager: 'Madison Phillips',
      managerInitials: 'MP',
      teamSize: 7,
      progress: 48,
      selected: false
    },
    {
      id: '48',
      name: 'Job Board Platform',
      projectCode: 'PROJ-048',
      status: 'Completed',
      priority: 'High',
      projectManager: 'Samuel Campbell',
      managerInitials: 'SC',
      teamSize: 14,
      progress: 100,
      selected: false
    },
    {
      id: '49',
      name: 'Parking Management',
      projectCode: 'PROJ-049',
      status: 'Ongoing',
      priority: 'Medium',
      projectManager: 'Victoria Parker',
      managerInitials: 'VP',
      teamSize: 8,
      progress: 58,
      selected: false
    },
    {
      id: '50',
      name: 'Bike Sharing System',
      projectCode: 'PROJ-050',
      status: 'Planning',
      priority: 'Low',
      projectManager: 'Henry Evans',
      managerInitials: 'HE',
      teamSize: 9,
      progress: 12,
      selected: false
    }
  ];

  get filteredProjects(): Project[] {
    return this.projects.filter(project => {
      const matchesSearch = !this.searchQuery || 
        project.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        project.projectCode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        project.projectManager.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesStatus = this.selectedStatus === 'all' || project.status === this.selectedStatus;
      const matchesPriority = this.selectedPriority === 'all' || project.priority === this.selectedPriority;
      const matchesManager = this.selectedManager === 'all' || project.projectManager === this.selectedManager;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesManager;
    });
  }

  get selectedProjects(): Project[] {
    return this.projects.filter(p => p.selected);
  }

  get allSelected(): boolean {
    return this.filteredProjects.length > 0 && 
           this.filteredProjects.every(p => p.selected);
  }

  get uniqueManagers(): string[] {
    return [...new Set(this.projects.map(p => p.projectManager))];
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleSelectAll(): void {
    const allSelected = this.allSelected;
    this.filteredProjects.forEach(project => {
      project.selected = !allSelected;
    });
  }

  toggleProject(project: Project): void {
    project.selected = !project.selected;
  }

  toggleActionsMenu(projectId: string, event: Event): void {
    event.stopPropagation();
    if (this.activeProjectId === projectId) {
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
  }

  editProject(projectId: string): void {
    console.log('Edit project:', projectId);
    this.closeActionsMenu();
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
    if (confirm('Are you sure you want to delete this project?')) {
      this.projects = this.projects.filter(p => p.id !== projectId);
      console.log('Project deleted:', projectId);
    }
    this.closeActionsMenu();
  }

  exportAll(): void {
    console.log('Exporting all projects...');
  }

  importFromJira(): void {
    console.log('Importing from Jira...');
  }

  createProject(): void {
    console.log('Creating new project...');
  }

  deleteSelected(): void {
    if (this.selectedProjects.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedProjects.length} project(s)?`)) {
      this.projects = this.projects.filter(p => !p.selected);
      console.log('Projects deleted');
    }
  }

  archiveSelected(): void {
    if (this.selectedProjects.length === 0) return;
    
    this.selectedProjects.forEach(project => {
      project.status = 'Archived';
      project.selected = false;
    });
    console.log('Projects archived');
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Ongoing': 'status-ongoing',
      'On Hold': 'status-onhold',
      'Completed': 'status-completed',
      'Planning': 'status-planning',
      'Archived': 'status-archived'
    };
    return statusMap[status] || '';
  }

  getPriorityClass(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'High': 'priority-high',
      'Medium': 'priority-medium',
      'Low': 'priority-low',
      'Critical': 'priority-critical'
    };
    return priorityMap[priority] || '';
  }

  getInitialsClass(initials: string): string {
    return 'avatar-blue';
  }
}