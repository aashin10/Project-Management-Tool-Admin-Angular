// navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbItem } from '../components/breadcrumb-item/breadcrumb-item';
import { SearchBar } from '../components/search-bar/search-bar';
import { ActionButtons, ActionType } from '../components/action-buttons/action-buttons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, BreadcrumbItem, SearchBar, ActionButtons],
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
  breadcrumbItems: any[] = [
    { label: 'Docs', url: '#' },
    { label: 'Components', url: '#' },
    { label: 'Breadcrumbs', url: '#', active: true },
  ];

  onSearch(query: string): void {
    console.log('Search query:', query);
    // Implement your search logic here
  }

  onActionClick(action: ActionType): void {
    console.log('Action clicked:', action);
    // Implement your action handlers here
    switch (action) {
      case 'notification':
        // Handle notification click
        break;
      case 'profile':
        // Handle add click
        break;
      case 'setting':
        // Handle menu click
        break;
    }
  }
}
