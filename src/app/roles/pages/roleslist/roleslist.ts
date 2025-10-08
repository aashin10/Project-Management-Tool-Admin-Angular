import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Table, TableColumn } from '../../../shared/table/table';
import { Modal } from '../../../shared/modal/modal';
import { CustomButton } from '../../../shared/custom-button/custom-button';
 
interface RoleInfo {
  icon: string;
  name: string;
}
 
interface Role {
  roleInfo: RoleInfo;
  description: string;
  users: number;
  created: string;
  cloneFrom?: string;
  permissions?: string[];
}
 
@Component({
  selector: 'app-roleslist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Sectiontitle,
    SearchBar,
    Table,
    Modal,
    CustomButton
  ],
  templateUrl: './roleslist.html',
  styleUrls: ['./roleslist.css']
})
export class Roleslist {
  isModalOpen = false;
  isEditMode = false;
  editingIndex: number = -1;
 
  roles: Role[] = [
    { 
      roleInfo: { icon: 'shield', name: 'Admin' }, 
      description: 'Full access to system', 
      users: 10, 
      created: '2024-01-05', 
      permissions: ['Sprint Creation', 'Admin to Admin Creation'] 
    },
    { 
      roleInfo: { icon: 'shield', name: 'Manager' }, 
      description: 'Manage teams and projects', 
      users: 6, 
      created: '2024-02-12', 
      permissions: ['Sprint Creation'] 
    },
    { 
      roleInfo: { icon: 'shield', name: 'Employee' }, 
      description: 'Basic access', 
      users: 20, 
      created: '2024-03-21', 
      permissions: ['View Private Tickets'] 
    },
    { 
      roleInfo: { icon: 'shield', name: 'HR' }, 
      description: 'Manages employee data', 
      users: 5, 
      created: '2024-04-10', 
      permissions: ['Sprint Creation'] 
    },
    { 
      roleInfo: { icon: 'shield', name: 'Finance' }, 
      description: 'Handles financial records', 
      users: 4, 
      created: '2024-05-02', 
      permissions: ['View Private Tickets'] 
    }
  ];
 
  filteredRoles: Role[] = [...this.roles];
 
  columns: TableColumn[] = [
    { header: 'Role Name', field: 'roleInfo', type: 'roleIcon', width: '25%' },
    { header: 'Description', field: 'description', type: 'text', width: '35%' },
    { header: 'Users', field: 'users', type: 'text' },
    { header: 'Created', field: 'created', type: 'text' },
    {
      header: 'Actions',
      field: 'actions',
      type: 'actions',
      actions: [
        { label: 'Edit', action: 'edit', icon: 'images/edit.svg' },
        { label: 'Delete', action: 'delete', icon: 'images/delete.svg', class: 'danger' }
      ]
    }
  ];
 
  newRole: Partial<Role> = {
    roleInfo: { icon: 'shield', name: '' },
    description: '',
    users: 0,
    created: '',
    cloneFrom: '',
    permissions: []
  };
 
  permissionsList = ['Sprint Creation', 'Admin to Admin Creation', 'View Private Tickets'];
 
  // 🔍 Search filter
  onSearch(term: string) {
    const searchTerm = term.toLowerCase();
    this.filteredRoles = this.roles.filter(role =>
      role.roleInfo.name.toLowerCase().includes(searchTerm) ||
      role.description.toLowerCase().includes(searchTerm)
    );
  }
 
  // ➕ Open modal for new role
  openModal() {
    this.isEditMode = false;
    this.editingIndex = -1;
    this.newRole = {
      roleInfo: { icon: 'shield', name: '' },
      description: '',
      users: 0,
      created: '',
      cloneFrom: '',
      permissions: []
    };
    this.isModalOpen = true;
  }
 
  // 🔄 Handle clone from selection
  onCloneFromChange() {
    if (!this.newRole.cloneFrom) return;
    
    const roleToClone = this.roles.find(r => r.roleInfo.name === this.newRole.cloneFrom);
    if (roleToClone && roleToClone.permissions) {
      this.newRole.permissions = [...roleToClone.permissions];
    }
  }
 
  // ✏️ Edit role (prefills modal)
  editRole(role: Role, index: number) {
    this.isEditMode = true;
    this.editingIndex = index;
    this.newRole = {
      roleInfo: { ...role.roleInfo },
      description: role.description,
      users: role.users,
      created: role.created,
      cloneFrom: role.cloneFrom || '',
      permissions: role.permissions ? [...role.permissions] : []
    };
    this.isModalOpen = true;
  }
 
  // 💾 Save role (create or update)
  saveRole() {
    // Validate role name
    if (!this.newRole.roleInfo?.name) {
      alert('Role name is required.');
      return;
    }
 
    const trimmedName = this.newRole.roleInfo.name.trim();
 
    if (!trimmedName) {
      alert('Role name is required.');
      return;
    }
 
    // Validate description
    if (!this.newRole.description || !this.newRole.description.trim()) {
      alert('Description is required.');
      return;
    }
 
    // Check for duplicates (skip current role when editing)
    const duplicate = this.roles.some(
      (r, i) => r.roleInfo.name.toLowerCase() === trimmedName.toLowerCase() && i !== this.editingIndex
    );
    if (duplicate) {
      alert('A role with this name already exists.');
      return;
    }
 
    // Validate permissions
    if (!this.newRole.permissions || this.newRole.permissions.length === 0) {
      alert('Please assign at least one permission.');
      return;
    }
 
    const roleToSave: Role = {
      roleInfo: {
        icon: 'shield',
        name: trimmedName
      },
      description: this.newRole.description.trim(),
      users: this.newRole.users || 0,
      created: this.newRole.created || new Date().toISOString().split('T')[0],
      cloneFrom: this.newRole.cloneFrom,
      permissions: [...this.newRole.permissions]
    };
 
    if (this.isEditMode && this.editingIndex > -1) {
      // Update existing role
      this.roles[this.editingIndex] = {
        ...roleToSave,
        users: this.roles[this.editingIndex].users, // Keep existing user count
        created: this.roles[this.editingIndex].created // Keep original creation date
      };
      alert('Role updated successfully!');
    } else {
      // Create new role
      this.roles.push({
        ...roleToSave,
        users: 0,
        created: new Date().toISOString().split('T')[0]
      });
      alert('Role created successfully!');
    }
 
    this.filteredRoles = [...this.roles];
    this.closeModal();
  }
 
  // 🗑️ Delete role
  deleteRole(index: number) {
    if (confirm(`Delete role "${this.roles[index].roleInfo.name}"?`)) {
      this.roles.splice(index, 1);
      this.filteredRoles = [...this.roles];
      alert('Role deleted successfully!');
    }
  }
 
  closeModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.editingIndex = -1;
  }
 
  togglePermission(permission: string) {
    if (!this.newRole.permissions) {
      this.newRole.permissions = [];
    }
    
    const index = this.newRole.permissions.indexOf(permission);
    if (index > -1) {
      this.newRole.permissions.splice(index, 1);
    } else {
      this.newRole.permissions.push(permission);
    }
  }
 
  // ⚙️ Table actions (Edit/Delete)
  handleTableAction(event: { action: string; row: Role; rowIndex?: number }) {
    const { action, row } = event;
    const index = this.roles.findIndex(r => 
      r.roleInfo.name === row.roleInfo.name && r.created === row.created
    );
    
    if (index === -1) {
      console.error('Role not found:', row);
      return;
    }
 
    if (action === 'edit') {
      this.editRole(row, index);
    } else if (action === 'delete') {
      this.deleteRole(index);
    }
  }
}