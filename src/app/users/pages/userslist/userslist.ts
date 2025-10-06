import { Component } from '@angular/core';
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
    // Validate required fields
    if (!this.newUser.fullName || !this.newUser.email || !this.newUser.type || !this.newUser.status) {
      alert('Please fill all required fields');
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
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        this.selectedFileName = file.name;
        console.log('File dropped:', file.name);
        // Add your CSV import logic here
      } else {
        alert('Please upload a CSV file');
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

  onTypeChange(event: any) {
    this.filterType = event.target.value;
  }
  onStatusChange(event: any) {
    this.filterStatus = event.target.value;
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
  { user: 'Alice Johnson', created:'23-09-2025' , type: 'Internal', status: 'Active', lastActivity: '25-09-2025' },
  { user: 'Bob Smith', created: '27-09-2025', type: 'External', status: 'Inactive', lastActivity: '30-09-2025' },
  { user: 'Charlie Brown', created: '30-09-2025', type: 'Customer', status: 'Suspended', lastActivity: '01-10-2025' },

  { user: 'David Miller', created: '01-09-2025', type: 'Internal', status: 'Active', lastActivity: '03-09-2025' },
  { user: 'Eva Williams', created: '02-09-2025', type: 'External', status: 'Inactive', lastActivity: '05-09-2025' },
  { user: 'Frank Harris', created: '05-09-2025', type: 'Customer', status: 'Active', lastActivity: '10-09-2025' },
  { user: 'Grace Taylor', created: '07-09-2025', type: 'Internal', status: 'Active', lastActivity: '09-09-2025' },
  { user: 'Henry White', created: '08-09-2025', type: 'External', status: 'Inactive', lastActivity: '12-09-2025' },
  { user: 'Ivy Martin', created: '10-09-2025', type: 'Customer', status: 'Suspended', lastActivity: '11-09-2025' },
  { user: 'Jack Thompson', created: '12-09-2025', type: 'Internal', status: 'Active', lastActivity: '15-09-2025' },
  
  { user: 'Karen Anderson', created: '13-09-2025', type: 'External', status: 'Active', lastActivity: '14-09-2025' },
  { user: 'Leo Martinez', created: '14-09-2025', type: 'Customer', status: 'Inactive', lastActivity: '18-09-2025' },
  { user: 'Mia Robinson', created: '15-09-2025', type: 'Internal', status: 'Active', lastActivity: '20-09-2025' },
  { user: 'Nathan Clark', created: '16-09-2025', type: 'External', status: 'Active', lastActivity: '19-09-2025' },
  { user: 'Olivia Lewis', created: '17-09-2025', type: 'Customer', status: 'Inactive', lastActivity: '21-09-2025' },
  { user: 'Paul Walker', created: '18-09-2025', type: 'Internal', status: 'Suspended', lastActivity: '19-09-2025' },
  { user: 'Quinn Hall', created: '19-09-2025', type: 'External', status: 'Active', lastActivity: '23-09-2025' },
  { user: 'Rachel Allen', created: '20-09-2025', type: 'Customer', status: 'Active', lastActivity: '22-09-2025' },
  { user: 'Samuel Young', created: '21-09-2025', type: 'Internal', status: 'Inactive', lastActivity: '24-09-2025' },
  { user: 'Tina King', created: '22-09-2025', type: 'External', status: 'Active', lastActivity: '26-09-2025' },

  { user: 'Uma Scott', created: '23-09-2025', type: 'Customer', status: 'Active', lastActivity: '27-09-2025' },
  { user: 'Victor Green', created: '24-09-2025', type: 'Internal', status: 'Inactive', lastActivity: '28-09-2025' },
  { user: 'Wendy Baker', created: '25-09-2025', type: 'External', status: 'Suspended', lastActivity: '29-09-2025' },
  { user: 'Xavier Adams', created: '26-09-2025', type: 'Customer', status: 'Active', lastActivity: '30-09-2025' },
  { user: 'Yara Nelson', created: '27-09-2025', type: 'Internal', status: 'Active', lastActivity: '01-10-2025' },
  { user: 'Zane Carter', created: '28-09-2025', type: 'External', status: 'Inactive', lastActivity: '02-10-2025' },
  { user: 'Aaron Torres', created: '29-09-2025', type: 'Customer', status: 'Active', lastActivity: '03-10-2025' },
  { user: 'Bella Perez', created: '30-09-2025', type: 'Internal', status: 'Suspended', lastActivity: '04-10-2025' },
  { user: 'Cody Ramirez', created: '01-10-2025', type: 'External', status: 'Active', lastActivity: '05-10-2025' },
  { user: 'Diana Flores', created: '02-10-2025', type: 'Customer', status: 'Inactive', lastActivity: '06-10-2025' },

  { user: 'Ethan Rivera', created: '03-10-2025', type: 'Internal', status: 'Active', lastActivity: '07-10-2025' },
  { user: 'Fiona Cooper', created: '04-10-2025', type: 'External', status: 'Active', lastActivity: '08-10-2025' },
  { user: 'George Morgan', created: '05-10-2025', type: 'Customer', status: 'Inactive', lastActivity: '09-10-2025' },
  { user: 'Hannah Reed', created: '06-10-2025', type: 'Internal', status: 'Suspended', lastActivity: '10-10-2025' },
  { user: 'Ian Bailey', created: '07-10-2025', type: 'External', status: 'Active', lastActivity: '11-10-2025' },
  { user: 'Julia Murphy', created: '08-10-2025', type: 'Customer', status: 'Active', lastActivity: '12-10-2025' },
  { user: 'Kevin Bell', created: '09-10-2025', type: 'Internal', status: 'Inactive', lastActivity: '13-10-2025' },
  { user: 'Laura Rivera', created: '10-10-2025', type: 'External', status: 'Active', lastActivity: '14-10-2025' },
  { user: 'Mike Foster', created: '11-10-2025', type: 'Customer', status: 'Suspended', lastActivity: '15-10-2025' },
  { user: 'Nora Gray', created: '12-10-2025', type: 'Internal', status: 'Active', lastActivity: '16-10-2025' },

  { user: 'Oscar Price', created: '13-10-2025', type: 'External', status: 'Inactive', lastActivity: '17-10-2025' },
  { user: 'Pamela Hughes', created: '14-10-2025', type: 'Customer', status: 'Active', lastActivity: '18-10-2025' },
  { user: 'Quincy Bryant', created: '15-10-2025', type: 'Internal', status: 'Active', lastActivity: '19-10-2025' },
  { user: 'Rita Diaz', created: '16-10-2025', type: 'External', status: 'Inactive', lastActivity: '20-10-2025' },
  { user: 'Steven Myers', created: '17-10-2025', type: 'Customer', status: 'Active', lastActivity: '21-10-2025' },
  { user: 'Teresa Howard', created: '18-10-2025', type: 'Internal', status: 'Suspended', lastActivity: '22-10-2025' },
  { user: 'Umar Chavez', created: '19-10-2025', type: 'External', status: 'Active', lastActivity: '23-10-2025' },
  { user: 'Vanessa Brooks', created: '20-10-2025', type: 'Customer', status: 'Inactive', lastActivity: '24-10-2025' },
  { user: 'William Sanders', created: '21-10-2025', type: 'Internal', status: 'Active', lastActivity: '25-10-2025' },
  { user: 'Ximena Ward', created: '22-10-2025', type: 'External', status: 'Active', lastActivity: '26-10-2025' }
];

  // Table columns configuration
  tableColumns = [
    { header: 'User', field: 'user', type: 'text' as const },
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
        { label: 'Edit', icon: '', action: 'edit' },
        { label: 'Delete', icon: '', action: 'delete', class: 'danger' },
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
    // Return all filtered users - let table component handle its own pagination
    return this.filteredUsers;
  }
  
  totalPages() {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }
}
