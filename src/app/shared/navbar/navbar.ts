// navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBar } from '../components/search-bar/search-bar';
import { ActionButtons, ActionType } from '../components/action-buttons/action-buttons';
import { Usermenu } from '../components/usermenu/usermenu';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, SearchBar, ActionButtons, Usermenu],
  templateUrl: './navbar.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class Navbar {
  isUserMenuVisible = false;

  toggleUserMenu() {
    this.isUserMenuVisible = !this.isUserMenuVisible;
  }

  searchResults: {
    projects: any[];
    users: any[];
    reports: any[];
  } | null = null;

  onSearch(query: string) {
    // Replace with actual search logic
    this.searchResults = {
      projects: this.searchProjects(query),
      users: this.searchUsers(query),
      reports: this.searchReports(query),
    };
  }

  searchProjects(query: string) {
    // Mock search logic for projects
    return query ? [{ name: 'Project A' }, { name: 'Project B' }] : [];
  }

  searchUsers(query: string) {
    // Mock search logic for users
    return query ? [{ name: 'User A' }, { name: 'User B' }] : [];
  }

  searchReports(query: string) {
    // Mock search logic for reports
    return query ? [{ name: 'Report A' }, { name: 'Report B' }] : [];
  }

  onActionClick(action: string): void {
    switch (action) {
      case 'notification':
        break;
      case 'profile':
        this.isUserMenuVisible = !this.isUserMenuVisible;
        break;
    }
  }
}
