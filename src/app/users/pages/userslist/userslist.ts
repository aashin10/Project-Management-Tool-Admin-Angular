import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Table } from '../../../shared/table/table';

@Component({
  selector: 'app-userslist',
  imports: [CommonModule, FormsModule, Sectiontitle, CustomButton, SearchBar, Table],
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
  showTypeDropdown = false;
  showStatusDropdown = false;
  showAdvancedFilter = false;
  filterType: string = '';
  filterStatus: string = '';

  typeOptions = [
    { label: 'Internal', value: 'internal' },
    { label: 'External', value: 'external' },
    { label: 'Customer', value: 'customer' }
  ];
  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Suspended', value: 'suspended' }
  ];

  onAddUser() {
    // Logic to add a new user
    console.log('Add User button clicked');
  }
  onImport() {
    // Logic to import user data
    console.log('Import button clicked');
  }
  onExport() {
    // Logic to export user data
    console.log('Export button clicked');
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
  }
  selectStatus(value: string) {
    this.filterStatus = value;
    this.showStatusDropdown = false;
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
    { user: 'Alice Johnson',created:'23-09-2025' , type: 'Internal', status: 'Active', lastActivity: '25-09-2025' },
    { user: 'Bob Smith', created: '27-09-2025', type: 'External', status: 'Inactive', lastActivity: '30-09-2025' },
    { user: 'Charlie Brown', created: '30-10-2025', type: 'Customer', status: 'Suspended', lastActivity: '1-10-2025' }
    
  ];
  // Table columns configuration
  tableColumns = [
    { header: 'User', field: 'user', type: 'text' as const },
    { header: 'Type', field: 'type', type: 'badge' as const },
    { header: 'Status', field: 'status', type: 'badge' as const },
    { header: 'Created On', field: 'created', type: 'text' as const },
    { header: 'Last Activity', field: 'lastActivity', type: 'text' as const },
    { 
      header: 'Actions', 
      field: 'actions',
      type: 'actions' as const,
      actions: [
        { label: 'Edit', icon: '✏️', action: 'edit' },
        { label: 'Delete', icon: '🗑️', action: 'delete', class: 'danger' },
        { label: 'View Details', icon: '👁️', action: 'view' }
      ]
    }
  ];
  // Filtered users based on selected filters
  get filteredUsers() {
    return this.users.filter(user => {
      const matchesType = this.filterType ? user.type === this.filterType : true;
      const matchesStatus = this.filterStatus ? user.status === this.filterStatus : true;
      return matchesType && matchesStatus;
    });
  }
  // Pagination state
  currentPage = 1;
  pageSize = 10;
  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }
  totalPages() {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }
}
