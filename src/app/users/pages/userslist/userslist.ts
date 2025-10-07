import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Table } from '../../../shared/table/table';
import { Modal } from '../../../shared/modal/modal';


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
  imports: [CommonModule, FormsModule, Sectiontitle, CustomButton, SearchBar, Table, Modal],
  templateUrl: './userslist.html',
  styleUrl: './userslist.css'
})
export class Userslist {
  onActionClick(event: { action: string; row: any }) {
    console.log('Action clicked:', event.action, 'Row:', event.row);
    
    switch(event.action) {
      case 'edit':
        console.log('Edit user:', event.row);
        // Add your edit logic here
        break;
      case 'delete':
        this.userToDelete = event.row;
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
  isDragging: boolean = false;
  selectedUsers: any[] = [];
  validationErrors: string[] = [];
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
    { label: 'Internal', value: 'internal' },
    { label: 'External', value: 'external' },
    { label: 'Customer', value: 'customer' }
  ];
  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
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
  }
  
  submitNewUser() {
    // Reset validation errors
    this.validationErrors = [];
    
    // Validate required fields
    if (!this.newUser.fullName?.trim()) {
      this.validationErrors.push('Full Name is required');
    }
    if (!this.newUser.email?.trim()) {
      this.validationErrors.push('Email is required');
    }
    if (!this.newUser.type) {
      this.validationErrors.push('Type is required');
    }
    if (!this.newUser.status) {
      this.validationErrors.push('Status is required');
    }
    
    // If there are validation errors, don't submit
    if (this.validationErrors.length > 0) {
      return;
    }
    
    // Add user logic here
    console.log('New user:', this.newUser);
    
    // Close modal and reset form
    this.closeAddUserModal();
  }
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
      console.log('File selected:', file.name);
      // Add your CSV import logic here
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
        console.log('File dropped:', file.name);
        // Add your CSV import logic here
      } else {
        alert('Please upload a CSV file');
        this.selectedFileName = '';
      }
    }
  }

  closeImportModal() {
    this.showImportModal = false;
    this.selectedFileName = '';
    this.isDragging = false;
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.currentPage = 1; // Reset to first page when search changes
  }

  exportToCSV() {
    // Determine which users to export
    const usersToExport = this.selectedUsers.length > 0 ? this.selectedUsers : this.filteredUsers;
    
    // Prepare CSV headers
    const headers = ['User', 'Type', 'Status', 'Created On', 'Last Activity'];
    
    // Prepare CSV rows
    const rows = usersToExport.map(user => [
      user.user,
      user.type,
      user.status,
      user.created,
      user.lastActivity
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
    const exportType = this.selectedUsers.length > 0 ? 'selected' : 'all';
    link.setAttribute('download', `users_export_${exportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onAdvancedFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  selectType(value: string) {
    this.filterType = value;
    this.showTypeDropdown = false;
    this.currentPage = 1; // Reset to first page when filter changes
  }
  selectStatus(value: string) {
    this.filterStatus = value;
    this.showStatusDropdown = false;
    this.currentPage = 1; // Reset to first page when filter changes
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
  // Sample user data
  users = [
  { user: 'Alice Johnson', email: 'alice.johnson@company.com', created:'23-09-2025' , type: 'Internal', status: 'Active', lastActivity: '25-09-2025'},
  { user: 'Bob Smith', email: 'bob.smith@external.com', created: '27-09-2025', type: 'External', status: 'Inactive', lastActivity: '30-09-2025' },
  { user: 'Charlie Brown', email: 'charlie.brown@customer.com', created: '30-09-2025', type: 'Customer', status: 'Suspended', lastActivity: '01-10-2025' },

  { user: 'David Miller', email: 'david.miller@company.com', created: '01-09-2025', type: 'Internal', status: 'Active', lastActivity: '03-09-2025' },
  { user: 'Eva Williams', email: 'eva.williams@external.com', created: '02-09-2025', type: 'External', status: 'Inactive', lastActivity: '05-09-2025' },
  { user: 'Frank Harris', email: 'frank.harris@customer.com', created: '05-09-2025', type: 'Customer', status: 'Active', lastActivity: '10-09-2025' },
  { user: 'Grace Taylor', email: 'grace.taylor@company.com', created: '07-09-2025', type: 'Internal', status: 'Active', lastActivity: '09-09-2025' },
  { user: 'Henry White', email: 'henry.white@external.com', created: '08-09-2025', type: 'External', status: 'Inactive', lastActivity: '12-09-2025' },
  { user: 'Ivy Martin', email: 'ivy.martin@customer.com', created: '10-09-2025', type: 'Customer', status: 'Suspended', lastActivity: '11-09-2025' },
  { user: 'Jack Thompson', email: 'jack.thompson@company.com', created: '12-09-2025', type: 'Internal', status: 'Active', lastActivity: '15-09-2025' },
  
  { user: 'Karen Anderson', email: 'karen.anderson@external.com', created: '13-09-2025', type: 'External', status: 'Active', lastActivity: '14-09-2025' },
  { user: 'Leo Martinez', email: 'leo.martinez@customer.com', created: '14-09-2025', type: 'Customer', status: 'Inactive', lastActivity: '18-09-2025' },
  { user: 'Mia Robinson', email: 'mia.robinson@company.com', created: '15-09-2025', type: 'Internal', status: 'Active', lastActivity: '20-09-2025' },
  { user: 'Nathan Clark', email: 'nathan.clark@external.com', created: '16-09-2025', type: 'External', status: 'Active', lastActivity: '19-09-2025' },
  { user: 'Olivia Lewis', email: 'olivia.lewis@customer.com', created: '17-09-2025', type: 'Customer', status: 'Inactive', lastActivity: '21-09-2025' },
  { user: 'Paul Walker', email: 'paul.walker@company.com', created: '18-09-2025', type: 'Internal', status: 'Suspended', lastActivity: '19-09-2025' },
  { user: 'Quinn Hall', email: 'quinn.hall@external.com', created: '19-09-2025', type: 'External', status: 'Active', lastActivity: '23-09-2025' },
  { user: 'Rachel Allen', email: 'rachel.allen@customer.com', created: '20-09-2025', type: 'Customer', status: 'Active', lastActivity: '22-09-2025' },
  { user: 'Samuel Young', email: 'samuel.young@company.com', created: '21-09-2025', type: 'Internal', status: 'Inactive', lastActivity: '24-09-2025' },
  { user: 'Tina King', email: 'tina.king@external.com', created: '22-09-2025', type: 'External', status: 'Active', lastActivity: '26-09-2025' },

  { user: 'Uma Scott', email: 'uma.scott@customer.com', created: '23-09-2025', type: 'Customer', status: 'Active', lastActivity: '27-09-2025' },
  { user: 'Victor Green', email: 'victor.green@company.com', created: '24-09-2025', type: 'Internal', status: 'Inactive', lastActivity: '28-09-2025' },
  { user: 'Wendy Baker', email: 'wendy.baker@external.com', created: '25-09-2025', type: 'External', status: 'Suspended', lastActivity: '29-09-2025' },
  { user: 'Xavier Adams', email: 'xavier.adams@customer.com', created: '26-09-2025', type: 'Customer', status: 'Active', lastActivity: '30-09-2025' },
  { user: 'Yara Nelson', email: 'yara.nelson@company.com', created: '27-09-2025', type: 'Internal', status: 'Active', lastActivity: '01-10-2025' },
  { user: 'Zane Carter', email: 'zane.carter@external.com', created: '28-09-2025', type: 'External', status: 'Inactive', lastActivity: '02-10-2025' },
  { user: 'Aaron Torres', email: 'aaron.torres@customer.com', created: '29-09-2025', type: 'Customer', status: 'Active', lastActivity: '03-10-2025' },
  { user: 'Bella Perez', email: 'bella.perez@company.com', created: '30-09-2025', type: 'Internal', status: 'Suspended', lastActivity: '04-10-2025' },
  { user: 'Cody Ramirez', email: 'cody.ramirez@external.com', created: '01-10-2025', type: 'External', status: 'Active', lastActivity: '05-10-2025' },
  { user: 'Diana Flores', email: 'diana.flores@customer.com', created: '02-10-2025', type: 'Customer', status: 'Inactive', lastActivity: '06-10-2025' },

  { user: 'Ethan Rivera', email: 'ethan.rivera@company.com', created: '03-10-2025', type: 'Internal', status: 'Active', lastActivity: '07-10-2025' },
  { user: 'Fiona Cooper', email: 'fiona.cooper@external.com', created: '04-10-2025', type: 'External', status: 'Active', lastActivity: '08-10-2025' },
  { user: 'George Morgan', email: 'george.morgan@customer.com', created: '05-10-2025', type: 'Customer', status: 'Inactive', lastActivity: '09-10-2025' },
  { user: 'Hannah Reed', email: 'hannah.reed@company.com', created: '06-10-2025', type: 'Internal', status: 'Suspended', lastActivity: '10-10-2025' },
  { user: 'Ian Bailey', email: 'ian.bailey@external.com', created: '07-10-2025', type: 'External', status: 'Active', lastActivity: '11-10-2025' },
  { user: 'Julia Murphy', email: 'julia.murphy@customer.com', created: '08-10-2025', type: 'Customer', status: 'Active', lastActivity: '12-10-2025' },
  { user: 'Kevin Bell', email: 'kevin.bell@company.com', created: '09-10-2025', type: 'Internal', status: 'Inactive', lastActivity: '13-10-2025' },
  { user: 'Laura Rivera', email: 'laura.rivera@external.com', created: '10-10-2025', type: 'External', status: 'Active', lastActivity: '14-10-2025' },
  { user: 'Mike Foster', email: 'mike.foster@customer.com', created: '11-10-2025', type: 'Customer', status: 'Suspended', lastActivity: '15-10-2025' },
  { user: 'Nora Gray', email: 'nora.gray@company.com', created: '12-10-2025', type: 'Internal', status: 'Active', lastActivity: '16-10-2025' },

  { user: 'Oscar Price', email: 'oscar.price@external.com', created: '13-10-2025', type: 'External', status: 'Inactive', lastActivity: '17-10-2025' },
  { user: 'Pamela Hughes', email: 'pamela.hughes@customer.com', created: '14-10-2025', type: 'Customer', status: 'Active', lastActivity: '18-10-2025' },
  { user: 'Quincy Bryant', email: 'quincy.bryant@company.com', created: '15-10-2025', type: 'Internal', status: 'Active', lastActivity: '19-10-2025' },
  { user: 'Rita Diaz', email: 'rita.diaz@external.com', created: '16-10-2025', type: 'External', status: 'Inactive', lastActivity: '20-10-2025' },
  { user: 'Steven Myers', email: 'steven.myers@customer.com', created: '17-10-2025', type: 'Customer', status: 'Active', lastActivity: '21-10-2025' },
  { user: 'Teresa Howard', email: 'teresa.howard@company.com', created: '18-10-2025', type: 'Internal', status: 'Suspended', lastActivity: '22-10-2025' },
  { user: 'Umar Chavez', email: 'umar.chavez@external.com', created: '19-10-2025', type: 'External', status: 'Active', lastActivity: '23-10-2025' },
  { user: 'Vanessa Brooks', email: 'vanessa.brooks@customer.com', created: '20-10-2025', type: 'Customer', status: 'Inactive', lastActivity: '24-10-2025' },
  { user: 'William Sanders', email: 'william.sanders@company.com', created: '21-10-2025', type: 'Internal', status: 'Active', lastActivity: '25-10-2025' },
  { user: 'Ximena Ward', email: 'ximena.ward@external.com', created: '22-10-2025', type: 'External', status: 'Active', lastActivity: '26-10-2025' }
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


  // Table columns configuration
  tableColumns = [
    { 
      header: 'User', 
      field: 'user', 
      type: 'user' as const
    },
    { 
      header: 'Type', 
      field: 'type', 
      type: 'badge' as const,
      badgeColors: {
        'Internal': 'bg-blue-200 text-blue-900',
        'External': 'bg-orange-200 text-orange-900',
        'Customer': 'bg-purple-200 text-purple-900'
      } as { [key: string]: string }
    },
    { 
      header: 'Status', 
      field: 'status', 
      type: 'badge' as const,
      badgeColors: {
        'Active': 'bg-green-200 text-green-900',
        'Inactive': 'bg-gray-300 text-gray-900',
        'Suspended': 'bg-red-200 text-red-900'
      } as { [key: string]: string }
    },
    { header: 'Created On', field: 'created', type: 'text' as const },
    { header: 'Last Activity', field: 'lastActivity', type: 'text' as const },
    { 
      header: 'Actions', 
      field: 'actions',
      type: 'actions' as const,
      actions: [
        { label: 'Edit', icon: 'images/edit.svg', action: 'edit' },
        { label: 'Delete', icon: 'images/deleteUser.svg', action: 'delete', class: 'danger' },
      ]
    }
  ];
  // Filtered users based on selected filters
  get filteredUsers() {
    return this.users.filter(user => {
      // Normalize comparison by converting to lowercase
      const userType = (user.type || '').toLowerCase().trim();
      const userStatus = (user.status || '').toLowerCase().trim();
      const selectedType = (this.filterType || '').toLowerCase().trim();
      const selectedStatus = (this.filterStatus || '').toLowerCase().trim();
      
      // Search functionality
      const searchLower = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower || 
        user.user.toLowerCase().includes(searchLower) ||
        user.type.toLowerCase().includes(searchLower) ||
        user.status.toLowerCase().includes(searchLower) ||
        user.created.toLowerCase().includes(searchLower) ||
        user.lastActivity.toLowerCase().includes(searchLower);
      
      // If filter is empty string, it means "All" is selected, so match all
      const matchesType = !selectedType || userType === selectedType;
      const matchesStatus = !selectedStatus || userStatus === selectedStatus;
      
      // All conditions must be true
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  // Pagination state
  currentPage = 1;
  pageSize = 10;
  
  get paginatedUsers() {
    // Transform data for table component - let table component handle its own pagination
    return this.filteredUsers.map(user => ({
      user: {
        name: user.user,
        email: user.email,
        avatar: this.getInitials(user.user)
      },
      type: user.type,
      status: user.status,
      created: user.created,
      lastActivity: user.lastActivity,
      actions: user // Pass the full user object for actions
    }));
  }
  
  totalPages() {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
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
    
    if (!typeDropdown) {
      this.showTypeDropdown = false;
      this.showStatusDropdown = false;
    }
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
    console.log('Suspended users:', this.selectedUsers);
    // Clear selection after action
    this.selectedUsers = [];
  }

  onBulkDelete() {
    this.pendingDeleteAction = 'bulk';
    this.showDeleteConfirmModal = true;
  }

  confirmDelete() {
    if (this.pendingDeleteAction === 'bulk') {
      // Delete selected users
      this.selectedUsers.forEach(selectedUser => {
        const index = this.users.findIndex(u => 
          u.user === selectedUser.user.name && u.email === selectedUser.user.email
        );
        if (index !== -1) {
          this.users.splice(index, 1);
        }
      });
      console.log('Deleted users:', this.selectedUsers);
      this.selectedUsers = [];
    } else if (this.pendingDeleteAction === 'single' && this.userToDelete) {
      // Delete single user
      const index = this.users.findIndex(u => 
        u.user === this.userToDelete.user.name && u.email === this.userToDelete.user.email
      );
      if (index !== -1) {
        this.users.splice(index, 1);
      }
      console.log('Deleted user:', this.userToDelete);
      this.userToDelete = null;
    }
    this.closeDeleteConfirmModal();
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal = false;
    this.userToDelete = null;
  }
}
