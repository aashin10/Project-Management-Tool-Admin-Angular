import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableColumn } from '../../../../shared/table/table';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { Modal } from '../../../../shared/modal/modal';

interface TeamMember {
  id: string;
  name: string;
  status?: string;
  roles: string[];
  email: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  status: string;
}

@Component({
  selector: 'app-teams-and-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, Table, CustomButton, Modal],
  templateUrl: './teams-and-roles.html',
  styleUrls: ['./teams-and-roles.css']
})
export class TeamsAndRoles {
  searchQuery: string = '';
  selectedRole: string = 'all';
  selectedStatus: string = 'all';
  selectedRows: any[] = [];
  clearTableSelections: boolean = false;
  selectedMemberIds: string[] = [];

  // Delete modal properties
  showDeleteModal = false;
  memberToDelete: TeamMember | null = null;

  // Add member modal properties
  showAddModal: boolean = false;
  addMemberSearchQuery: string = '';
  selectedEmployee: Employee | null = null;
  addMemberSelectedRoles: string[] = [];
  showValidationModal: boolean = false;
  isEditMode: boolean = false;
  memberToEdit: TeamMember | null = null;
  
  roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Tech Lead', label: 'Tech Lead' },
    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
    { value: 'Senior Developer', label: 'Senior Developer' },
    { value: 'QA Engineer', label: 'QA Engineer' },
    { value: 'DevOps Engineer', label: 'DevOps Engineer' },
    { value: 'Business Analyst', label: 'Business Analyst' }
  ];

  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Suspended', label: 'Suspended' }
  ];

  // Employee list for add member modal
  employees: Employee[] = [
    { id: '101', name: 'Amit Sharma', email: 'amit.sharma@company.com', status: 'active' },
    { id: '102', name: 'Riya Das', email: 'riya.das@company.com', status: 'active' },
    { id: '103', name: 'Kevin Thomas', email: 'kevin.thomas@company.com', status: 'inactive' },
    { id: '104', name: 'Sofia Mehta', email: 'sofia.mehta@company.com', status: 'active' },
    { id: '105', name: 'John Paul', email: 'john.paul@company.com', status: 'active' },
  ];

  addMemberRoleOptions = [
    'Project Manager',
    'Tech Lead',
    'UI/UX Designer',
    'Senior Developer',
    'QA Engineer',
    'DevOps Engineer',
    'Business Analyst'
  ];

  teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Asha Varma',
      roles: ['Project Manager'],
      email: 'asha.varma@company.com',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Pranav Iyer',
      roles: ['Tech Lead'],
      email: 'pranav.iyer@company.com',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Sarah Chen',
      roles: ['UI/UX Designer'],
      email: 'sarah.chen@company.com',
      status: 'Inactive'
    },
    {
      id: '4',
      name: 'Mike Johnson',
      roles: ['Senior Developer'],
      email: 'mike.johnson@company.com',
      status: 'Active'
    },
    {
      id: '5',
      name: 'Lisa Wong',
      roles: ['QA Engineer'],
      email: 'lisa.wong@company.com',
      status: 'Active'
    },
    {
      id: '6',
      name: 'David Kumar',
      roles: ['DevOps Engineer'],
      email: 'david.kumar@company.com',
      status: 'Active'
    },
    {
      id: '7',
      name: 'Emma Thompson',
      roles: ['Business Analyst'],
      email: 'emma.thompson@company.com',
      status: 'Inactive'
    },
    {
      id: '8',
      name: 'James Wilson',
      roles: ['Senior Developer'],
      email: 'james.wilson@company.com',
      status: 'Suspended'
    },
    {
      id: '9',
      name: 'Olivia Martinez',
      roles: ['UI/UX Designer'],
      email: 'olivia.martinez@company.com',
      status: 'Inactive'
    },
    {
      id: '10',
      name: 'Ethan Brown',
      roles: ['QA Engineer','Senior Developer','Project Manager'],
      email: 'ethan.brown@company.com',
      status: 'Active'
    },
    {
      id: '11',
      name: 'Sophia Davis',
      roles: ['Business Analyst'],
      email: 'sophia.davis@company.com',
      status: 'Inactive'
    },
    {
      id: '12',
      name: 'Liam Smith',
      roles: ['Senior Developer'],
      email: 'liam.smith@company.com',
      status: 'Active'
    }
  ];

  tableColumns: TableColumn[] = [
    {
      header: 'Member Info',
      field: 'member',
      type: 'user',
      sortable: false,
      width: '25%'
    },
    {
      header: 'Roles',
      field: 'roles',
      type: 'badge',
      sortable: false,
      width: '20%',
      badgeColors: {
        'Project Manager': 'bg-purple-100 text-purple-800',
        'Tech Lead': 'bg-blue-100 text-blue-800',
        'UI/UX Designer': 'bg-pink-100 text-pink-800',
        'Senior Developer': 'bg-green-100 text-green-800',
        'QA Engineer': 'bg-orange-100 text-orange-800',
        'DevOps Engineer': 'bg-indigo-100 text-indigo-800',
        'Business Analyst': 'bg-yellow-100 text-yellow-800'
      }
    },
    {
      header: 'Email',
      field: 'email',
      type: 'text',
      sortable: false,
      width: '25%'
    },
    {
      header: 'Status',
      field: 'status',
      type: 'badge',
      sortable: false,
      width: '25%',
      badgeColors: {
        'Active': 'bg-green-100 text-green-800',
        'Inactive': 'bg-gray-100 text-gray-800',
        'Suspended': 'bg-red-100 text-red-800',
      }
    },
    {
      header: 'Actions',
      field: 'actions',
      type: 'actions',
      sortable: false,
      width: '10%',
      actions: [
        { label: 'Edit', icon: '/images/edit.svg', action: 'edit', class: 'primary' },
        { label: 'Delete', icon: '/images/delete-user.svg', action: 'remove', class: 'danger' }
      ]
    }
  ];

  get filteredMembers(): TeamMember[] {
    let filtered = [...this.teamMembers];

    // Filter by search query (name and email only)
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      );
    }

    // Filter by role
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(member => member.roles.includes(this.selectedRole));
    }

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(member => member.status === this.selectedStatus);
    }

    return filtered;
  }

  get tableData(): any[] {
    return this.filteredMembers.map(member => ({
      member: {
        name: member.name,
        avatar: member.name.slice(0,2).toUpperCase(),
      },
      roles: member.roles,
      email: member.email,
      status: member.status,
      actions: member.id,
      selected: this.selectedMemberIds.includes(member.id)
    }));
  }

  get selectedItems(): any[] {
    return this.tableData.filter(item => item.selected);
  }

  get selectedCount(): number {
    return this.selectedMemberIds.length;
  }

  onSelectionChange(selectedRows: any[]): void {
    this.selectedRows = selectedRows;
    // Store selected member IDs for persistence across filter changes
    this.selectedMemberIds = selectedRows.map(row => row.actions);
  }

  onSearchChange(): void {
    this.searchQuery = this.searchQuery.trim();
  }

  onRoleFilterChange(): void {
    // Filter happens automatically through getter
  }

  onStatusFilterChange(): void {
    // Filter happens automatically through getter
  }

  handleTableAction(event: { action: string; row: any }): void {
    const member = this.teamMembers.find(m => m.id === event.row.actions);

    if (event.action) {
      if (event.action === 'edit') {
        this.editMember(member || null);
      } else if (event.action === 'remove') {
        this.memberToDelete = member || null;
        this.showDeleteModal = true;
      }
    }
  }


  removeSelected(): void {
    if (this.selectedMemberIds.length === 0) return;
    this.showDeleteModal = true;
  }

  // Modal handlers
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.memberToDelete = null;
  }

  confirmDelete(): void {
    if (this.memberToDelete) {
      // Remove individual member
      this.teamMembers = this.teamMembers.filter(member => member.id !== this.memberToDelete!.id);
      console.log('Removed member:', this.memberToDelete.name);
      this.memberToDelete = null;
    } else {
      // Remove selected members (bulk removal)
      this.teamMembers = this.teamMembers.filter(member => !this.selectedMemberIds.includes(member.id));
      this.selectedMemberIds = [];
      console.log('Selected members removed');
    }
    this.showDeleteModal = false;

    // Clear table selections to prevent index shifting issues after deletion
    this.clearTableSelections = true;
    // Reset the flag after a short delay to allow the change detection to work
    setTimeout(() => {
      this.clearTableSelections = false;
    }, 0);
  }

  // Add member modal getters and methods
  get filteredEmployees(): Employee[] {
    const query = this.addMemberSearchQuery.trim().toLowerCase();
    return this.employees.filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query)
    );
  }

  selectEmployee(emp: Employee): void {
    this.selectedEmployee = emp;
  }

  isRoleSelected(role: string): boolean {
    return this.addMemberSelectedRoles.includes(role);
  }

  toggleRole(role: string): void {
    const index = this.addMemberSelectedRoles.indexOf(role);
    if (index > -1) {
      this.addMemberSelectedRoles.splice(index, 1);
    } else {
      this.addMemberSelectedRoles.push(role);
    }
  }

  addMember(): void {
    if (this.selectedEmployee && this.addMemberSelectedRoles.length > 0) {
      if (this.isEditMode && this.memberToEdit) {
        // Update existing member
        this.memberToEdit.roles = [...this.addMemberSelectedRoles];
        console.log('Updated member:', this.memberToEdit.name);
      } else {
        // Add new member
        const newMember = {
          ...this.selectedEmployee,
          roles: this.addMemberSelectedRoles,
          status: 'Active'
        };
        this.handleMemberAdded(newMember);
      }
      this.closeAddModal();
    } else {
      this.showValidationModal = true;
    }
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.addMemberSearchQuery = '';
    this.selectedEmployee = null;
    this.addMemberSelectedRoles = [];
    this.showValidationModal = false;
    this.isEditMode = false;
    this.memberToEdit = null;
  }

  addMemberModal(): void {
    this.showAddModal = true;
  }

  editMember(member: TeamMember | null): void {
    if (member) {
      this.isEditMode = true;
      this.memberToEdit = member;
      this.selectedEmployee = {
        id: member.id,
        name: member.name,
        email: member.email,
        status: member.status || 'active'
      };
      this.addMemberSelectedRoles = [...member.roles];
      this.showAddModal = true;
    }
  }

  handleMemberAdded(newMember: any): void {
    // Check if member already exists to prevent duplicates
    const existingMember = this.teamMembers.find(member =>
      member.email.toLowerCase() === newMember.email.toLowerCase() ||
      member.name.toLowerCase() === newMember.name.toLowerCase()
    );

    if (existingMember) {
      // Show validation error for duplicate member
      this.showValidationModal = true;
      return;
    }

    const newId = (this.teamMembers.length + 1).toString();
    this.teamMembers.push({
      id: newId,
      name: newMember.name,
      roles: newMember.roles,
      email: newMember.email,
      status: newMember.status || 'Active'
    });
    this.closeAddModal();
  }

}

