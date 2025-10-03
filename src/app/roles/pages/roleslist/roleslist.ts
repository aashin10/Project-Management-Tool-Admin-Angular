import { Component } from '@angular/core';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { NgFor } from '@angular/common';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';

interface Role {
  name: string;
  description: string;
  users: number;
  created: string;
}

@Component({
  selector: 'app-roleslist',
  imports: [Sectiontitle,NgFor,SearchBar],
  templateUrl: './roleslist.html',
  styleUrl: './roleslist.css'
})
export class Roleslist {
  roles: Role[] = [
    { name: 'Administrator', description: 'Full system access and control', users: 2, created: 'Jan 15, 2024' },
    { name: 'Customer Support', description: 'Support team with customer management access', users: 6, created: 'Jan 15, 2024' },
    { name: 'Developer', description: 'Development team member with project access', users: 8, created: 'Jan 15, 2024' },
    { name: 'Project Manager', description: 'Manage projects and team members', users: 5, created: 'Jan 15, 2024' },
    { name: 'Viewer', description: 'Read-only access to most system areas', users: 12, created: 'Jan 15, 2024' },
  ];

  onSearch(query: string): void {
  this.roles = this.roles.filter(role =>
    role.name.toLowerCase().includes(query.toLowerCase()) ||
    role.description.toLowerCase().includes(query.toLowerCase())
  );
}
}
