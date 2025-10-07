import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Table, TableColumn } from '../../../shared/table/table';
import { Modal } from '../../../shared/modal/modal';
import { CustomButton } from '../../../shared/custom-button/custom-button';

interface Role {
  icon?: string;
  name: string;
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
    NgFor,
    NgIf,
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
    { icon: 'images/plus.svg', name: 'Admin', description: 'Full access to system', users: 10, created: '2024-01-05', permissions: [] },
    { icon: 'assets/roles-icon.svg', name: 'Manager', description: 'Manage teams and projects', users: 6, created: '2024-02-12', permissions: [] },
    { icon: 'assets/roles-icon.svg', name: 'Employee', description: 'Basic access', users: 20, created: '2024-03-21', permissions: [] },
    { icon: 'assets/roles-icon.svg', name: 'HR', description: 'Manages employee data', users: 5, created: '2024-04-10', permissions: [] },
    { icon: 'assets/roles-icon.svg', name: 'Finance', description: 'Handles financial records', users: 4, created: '2024-05-02', permissions: [] }
  ];

  filteredRoles: Role[] = [...this.roles];

  columns: TableColumn[] = [
    { header: 'Role Name', field: 'name', type: 'text' },
    { header: 'Description', field: 'description', type: 'text' },
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

  newRole: Role = { name: '', description: '', users: 0, created: '', cloneFrom: '', permissions: [] };

  permissionsList = ['Sprint Creation', 'Admin to Admin Creation', 'View Private Tickets'];

  // 🔍 Search filter
  onSearch(term: string) {
    this.filteredRoles = this.roles.filter(role =>
      role.name.toLowerCase().includes(term.toLowerCase()) ||
      role.description.toLowerCase().includes(term.toLowerCase())
    );
  }

  // ➕ Open modal for new role
  openModal() {
    this.isEditMode = false;
    this.newRole = { name: '', description: '', users: 0, created: '', cloneFrom: '', permissions: [] };
    this.isModalOpen = true;
  }

  // ✏️ Edit role (prefills modal)
  editRole(role: Role, index: number) {
    this.isEditMode = true;
    this.editingIndex = index;
    this.newRole = {
      name: role.name,
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
    const trimmedName = this.newRole.name.trim();

    if (!trimmedName) {
      alert('Role name is required.');
      return;
    }

    const duplicate = this.roles.some(
      (r, i) => r.name.toLowerCase() === trimmedName.toLowerCase() && i !== this.editingIndex
    );
    if (duplicate) {
      alert('A role with this name already exists.');
      return;
    }

    if (!this.newRole.permissions || this.newRole.permissions.length === 0) {
      alert('Please assign at least one permission.');
      return;
    }

    if (this.isEditMode && this.editingIndex > -1) {
      this.roles[this.editingIndex] = { ...this.newRole, name: trimmedName };
      alert('Role updated successfully!');
    } else {
      this.roles.push({
        ...this.newRole,
        name: trimmedName,
        users: 0,
        created: new Date().toISOString().split('T')[0],
      });
      alert('Role created successfully!');
    }

    this.filteredRoles = [...this.roles];
    this.closeModal();
  }

  // 🗑️ Delete role
  deleteRole(index: number) {
    if (confirm(`Delete role "${this.roles[index].name}"?`)) {
      this.roles.splice(index, 1);
      this.filteredRoles = [...this.roles];
      alert('Role deleted successfully!');
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  togglePermission(permission: string) {
    if (!this.newRole.permissions) this.newRole.permissions = [];
    if (this.newRole.permissions.includes(permission)) {
      this.newRole.permissions = this.newRole.permissions.filter(p => p !== permission);
    } else {
      this.newRole.permissions.push(permission);
    }
  }

  // ⚙️ Table actions (Edit/Delete)
  handleTableAction(event: { action: string; row: Role; rowIndex?: number }) {
    const { action, row, rowIndex } = event;
    const index = rowIndex ?? this.roles.findIndex(r => r.name === row.name && r.created === row.created);
    if (index === -1) return;

    if (action === 'edit') {
      this.editRole(row, index);
    } else if (action === 'delete') {
      this.deleteRole(index);
    }
  }
}
