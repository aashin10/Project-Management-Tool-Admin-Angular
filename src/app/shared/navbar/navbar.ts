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

  onSearch(query: string): void {
    console.log('Search query:', query);
    // Implement your search logic here
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
