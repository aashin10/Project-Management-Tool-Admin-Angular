// navbar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SearchBar } from '../components/search-bar/search-bar';
import { ActionButtons, ActionType } from '../components/action-buttons/action-buttons';
import { Usermenu } from '../components/usermenu/usermenu';
import { NotificationDropdown } from '../components/notification-dropdown/notification-dropdown';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, SearchBar, ActionButtons, Usermenu, NotificationDropdown],
  templateUrl: './navbar.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class Navbar implements OnInit, OnDestroy {
  isUserMenuVisible = false;
  isNotificationDropdownVisible = false;
  unreadNotificationCount = 0;
  private subscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(() => {
      this.unreadNotificationCount = this.notificationService.getUnreadCount();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleUserMenu() {
    this.isUserMenuVisible = !this.isUserMenuVisible;
    // Close notification dropdown when opening user menu
    if (this.isUserMenuVisible) {
      this.isNotificationDropdownVisible = false;
    }
  }

  toggleNotificationDropdown() {
    this.isNotificationDropdownVisible = !this.isNotificationDropdownVisible;
    // Close user menu when opening notification dropdown
    if (this.isNotificationDropdownVisible) {
      this.isUserMenuVisible = false;
    }
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
        this.toggleNotificationDropdown();
        break;
      case 'profile':
        this.toggleUserMenu();
        break;
    }
  }
}
