import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Table } from '../../../shared/table/table';
import { Modal } from '../../../shared/modal/modal';

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
        console.log('Delete user:', event.row);
        // Add your delete logic here
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
  filterType: string = '';
  filterStatus: string = '';
  searchQuery: string = '';
  selectedFileName: string = '';
  isDragging: boolean = false;
  selectedUsers: any[] = [];
  validationErrors: string[] = [];
  
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
}
