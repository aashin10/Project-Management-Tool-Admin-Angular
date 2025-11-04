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
import { Subscription, Subject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SearchBar } from '../components/search-bar/search-bar';
import { ActionButtons } from '../components/action-buttons/action-buttons';
import { Usermenu } from '../components/usermenu/usermenu';
import { NotificationDropdown } from '../components/notification-dropdown/notification-dropdown';
import { NotificationService } from '../services/notification.service';
import { RouterModule } from '@angular/router';
import { NavbarService } from './navbar-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
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

  searchResults: { projects: any[]; users: any[] } = {
    projects: [],
    users: [],
  };

  private subscription = new Subscription();
  private search$ = new Subject<string>();

  constructor(
    private notificationService: NotificationService,
    private elementRef: ElementRef,
    private navbarService: NavbarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(() => {
        this.unreadNotificationCount = this.notificationService.getUnreadCount();
      })
    );

    this.subscription.add(
      this.search$
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((query) => {
            if (!query.trim()) {
              return forkJoin({
                projects: [null],
                users: [null],
              });
            }
            return forkJoin({
              projects: this.navbarService.getProjects(1, 5, query),
              users: this.navbarService.getUsers(query),
            });
          })
        )
        .subscribe((res: any) => {
          if (!res.projects || !res.users) {
            this.searchResults = { projects: [], users: [] };
            this.isSearching = false;
            return;
          }

          this.searchResults = {
            projects: res.projects.data.items || [],
            users: res.users.data.users || [],
          };
          this.isSearching = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleUserMenu() {
    this.isUserMenuVisible = !this.isUserMenuVisible;
    if (this.isUserMenuVisible) {
      this.isNotificationDropdownVisible = false;
      this.isSearchBarVisible = false;
    }
  }

  toggleSearchBar() {
    this.isSearchBarVisible = !this.isSearchBarVisible;
    if (this.isSearchBarVisible) {
      this.isUserMenuVisible = false;
      this.isNotificationDropdownVisible = false;
    }
  }

  toggleNotificationDropdown() {
    this.isNotificationDropdownVisible = !this.isNotificationDropdownVisible;
    if (this.isNotificationDropdownVisible) {
      this.isUserMenuVisible = false;
      this.isSearchBarVisible = false;
    }
  }

  onSearch(query: string) {
    this.isSearching = true;
    this.isSearchBarVisible = true;
    this.search$.next(query);
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

    if (!notificationDropdown && !actionButtons && this.isNotificationDropdownVisible) {
      this.isNotificationDropdownVisible = false;
    }

    if (!userMenu && !actionButtons && this.isUserMenuVisible) {
      this.isUserMenuVisible = false;
    }

    if (!searchBar && !actionButtons && this.isSearchBarVisible) {
      this.isSearchBarVisible = false;
    }
  }
}
