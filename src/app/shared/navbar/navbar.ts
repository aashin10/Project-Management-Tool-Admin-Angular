// navbar.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SearchBar } from '../components/search-bar/search-bar';
import { ActionButtons, ActionType } from '../components/action-buttons/action-buttons';
import { Usermenu } from '../components/usermenu/usermenu';
import { NotificationDropdown } from '../components/notification-dropdown/notification-dropdown';
import { NotificationService } from '../services/notification.service';
import { RouterModule } from '@angular/router';
import { NavbarService } from './navbar-service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, SearchBar, ActionButtons, Usermenu, NotificationDropdown, RouterModule],
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
  isSearchBarVisible = false;
  unreadNotificationCount = 0;
  isSearching = false;
  private subscription!: Subscription;

  constructor(
    private notificationService: NotificationService,
    private elementRef: ElementRef,
    private navbarService: NavbarService,
    private cdr: ChangeDetectorRef
  ) {}

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
      this.isSearchBarVisible = false;
    }
  }

  toggleSearchBar() {
    this.isSearchBarVisible = !this.isSearchBarVisible;
    // Close user menu and notification dropdown when opening search bar
    if (this.isSearchBarVisible) {
      this.isUserMenuVisible = false;
      this.isNotificationDropdownVisible = false;
    }
  }

  toggleNotificationDropdown() {
    this.isNotificationDropdownVisible = !this.isNotificationDropdownVisible;
    // Close user menu when opening notification dropdown
    if (this.isNotificationDropdownVisible) {
      this.isUserMenuVisible = false;
      this.isSearchBarVisible = false;
    }
  }

  searchResults: { projects: any[]; users: any[] } = {
    projects: [],
    users: [],
  };
  onSearch(query: string) {
    this.isSearching = true;
    this.isSearchBarVisible = true;

    this.searchResults = { projects: [], users: [] };

    this.navbarService.getProjects(1, 5, query).subscribe((data) => {
      this.searchResults.projects = data.data.items || [];
      this.cdr.detectChanges(); // Trigger change detection after data is set
    });

    this.navbarService.getUsers(query).subscribe((data) => {
      this.searchResults.users = data.users || [];
      console.log(data.users);
      this.isSearching = false; // Set after both calls complete
      this.cdr.detectChanges();
    });

    console.log(this.searchResults);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const notificationDropdown = target.closest('.notification-dropdown');
    const userMenu = target.closest('.dropdown-menu');
    const actionButtons = target.closest('app-action-buttons');
    const searchBar = target.closest('app-search-bar');

    // Close notification dropdown if clicking outside
    if (!notificationDropdown && !actionButtons && this.isNotificationDropdownVisible) {
      this.isNotificationDropdownVisible = false;
    }

    // Close user menu if clicking outside
    if (!userMenu && !actionButtons && this.isUserMenuVisible) {
      this.isUserMenuVisible = false;
    }

    if (!searchBar && !actionButtons && this.isSearchBarVisible) {
      this.isSearchBarVisible = false;
    }
  }
}
