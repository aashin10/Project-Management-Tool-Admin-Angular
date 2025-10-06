import { Component } from '@angular/core';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { NgFor } from '@angular/common';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Table, TableColumn } from '../../../shared/table/table';
import { RolesModal } from '../roles-modal/roles-modal';

@Component({
  selector: 'app-roleslist',
  imports: [Sectiontitle, NgFor, SearchBar, Table, RolesModal],
  templateUrl: './roleslist.html',
  styleUrl: './roleslist.css'
})
export class Roleslist {
  isModalOpen: boolean = false;

  roles = [
    { name: 'Admin', description: 'Full access to system', users: 10, created: '2024-01-05' },
    { name: 'Manager', description: 'Manage teams and projects', users: 6, created: '2024-02-12' },
    { name: 'Employee', description: 'Basic access', users: 20, created: '2024-03-21' },
    { name: 'HR', description: 'Manages employee data', users: 5, created: '2024-04-10' },
    { name: 'Finance', description: 'Handles financial records', users: 4, created: '2024-05-02' },
    { name: 'Sales', description: 'Responsible for sales operations', users: 8, created: '2024-06-15' },
    { name: 'Support', description: 'Provides customer support', users: 12, created: '2024-07-20' },
    { name: 'Intern', description: 'Limited temporary access', users: 3, created: '2024-08-01' },
    { name: 'IT Technician', description: 'Maintains IT infrastructure', users: 7, created: '2024-08-19' },
    { name: 'QA Engineer', description: 'Ensures software quality', users: 5, created: '2024-09-05' },
    { name: 'Project Lead', description: 'Oversees project progress', users: 2, created: '2024-09-22' },
    { name: 'Consultant', description: 'Advises on technical decisions', users: 1, created: '2024-10-03' }
  ];

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
        { label: 'Edit', action: 'edit', icon: '✏️' },
        { label: 'Delete', action: 'delete', icon: '🗑️', class: 'danger' }
      ]
    }
  ];

  onSearch(term: string) {
    console.log('Search:', term);
  }

  handleTableAction(event: { action: string; row: any }) {
    console.log('Action clicked:', event);
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  createRole(newRole: any) {
    this.roles.push({
      ...newRole,
      users: 0,
      created: new Date().toISOString().split('T')[0]
    });
    this.closeModal();
  }
}
