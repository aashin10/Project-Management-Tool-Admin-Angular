import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Authentication } from '../../services/authenticationservice/authentication';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-menu',
  standalone: true,  // Add this if not present
  templateUrl: './usermenu.html',
  styleUrls: ['./usermenu.css'],
  imports: [CommonModule],
})
export class Usermenu implements OnInit, OnDestroy {
  user = {
    name: 'Loading...',
    email: 'Loading...',
  };

  menuItems = [
    { label: 'Logout', action: 'logout', destructive: true, icon: '/images/logout.svg' },
  ];

  private userSubscription?: Subscription;

  constructor(
    private authService: Authentication,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to current user observable to get real-time updates
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user.name = user.name || 'User';
        this.user.email = user.email || 'user@company.com';
        // Force change detection
        this.cdr.detectChanges();
      }
    });

    // Check if we already have user data
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.user.name = currentUser.name || 'User';
      this.user.email = currentUser.email || 'user@company.com';
      this.cdr.detectChanges();
    } else {
      // Fetch user data if not already loaded
      // Add a timeout to prevent indefinite loading
      const timeout = setTimeout(() => {
        if (this.user.name === 'Loading...') {
          this.user.name = 'User';
          this.user.email = 'user@company.com';
          this.cdr.detectChanges();
        }
      }, 5000);
      
      this.authService.getCurrentUser().subscribe({
        next: (response) => {
          clearTimeout(timeout);
          if (response && response.status === 200 && response.data) {
            this.user.name = response.data.name || 'User';
            this.user.email = response.data.email || 'user@company.com';
            this.cdr.detectChanges();
          } else {
            this.user.name = 'User';
            this.user.email = 'user@company.com';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          clearTimeout(timeout);
          // Set default values instead of error message
          this.user.name = 'User';
          this.user.email = 'user@company.com';
          this.cdr.detectChanges();
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  onMenuItemClick(item: any): void {
    if (item.action === 'logout') {
      this.handleLogout();
    }
  }

  private handleLogout(): void {
    // Clear all notifications on logout
    this.notificationService.clearAllNotifications();
    
    this.authService.logout().subscribe({
      next: (response) => {
        // Navigation is handled in the authentication service's logout method
      },
      error: (error) => {
        // Even if the API call fails, we should still be redirected by the service
        // But just in case, check if we need to manually redirect
        if (!this.authService.hasValidToken()) {
          this.router.navigate(['/login']);
        }
      }
    });
  }
}