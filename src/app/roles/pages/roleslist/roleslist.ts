import { Component } from '@angular/core';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { NgFor } from '@angular/common';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Table,TableColumn} from '../../../shared/table/table';
import { RolesModal } from '../roles-modal/roles-modal';

// interface Role {
//   name: string;
//   description: string;
//   users: number;
//   created: string;
// }

@Component({
  selector: 'app-roleslist',
  imports: [Sectiontitle,NgFor,SearchBar,Table,RolesModal],
  templateUrl: './roleslist.html',
  styleUrl: './roleslist.css'
})
export class Roleslist {
  isModalOpen: boolean = false;
   roles = [
    { name: 'Admin', description: 'Full access to system', users: 10, created: '2024-01-05' },
    { name: 'Manager', description: 'Manage teams and projects', users: 6, created: '2024-02-12' },
    { name: 'Employee', description: 'Basic access', users: 20, created: '2024-03-21' }
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