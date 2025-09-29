import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  // Track which menu items are expanded
  expandedItems: { [key: string]: boolean } = {
    projects: true,
    teamManagement: true,
    userManagement: true,
    rolesPermissions: true,
    settings: false
  };

  // Track active menu item
  activeItem: string = 'allProjects';

  toggleDropdown(itemKey: string): void {
    this.expandedItems[itemKey] = !this.expandedItems[itemKey];
  }

  setActiveItem(itemKey: string): void {
    this.activeItem = itemKey;
  }

  isExpanded(itemKey: string): boolean {
    return this.expandedItems[itemKey] || false;
  }

  isActive(itemKey: string): boolean {
    return this.activeItem === itemKey;
  }
}
