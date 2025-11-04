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
    console.log('UserMenu initialized');
    
    // Subscribe to current user observable to get real-time updates
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('User data received in subscription:', user);
      if (user) {
        this.user.name = user.name || 'User';
        this.user.email = user.email || 'user@company.com';
        console.log('User menu updated:', this.user);
        
        // Force change detection
        this.cdr.detectChanges();
      }
    });

    // Check if we already have user data
    const currentUser = this.authService.currentUserValue;
    console.log('Current user value:', currentUser);
    
    if (currentUser) {
      this.user.name = currentUser.name || 'User';
      this.user.email = currentUser.email || 'user@company.com';
      console.log('User loaded from cache:', this.user);
      this.cdr.detectChanges();
    } else {
      // Fetch user data if not already loaded
      console.log('Fetching user data from API...');
      
      // Add a timeout to prevent indefinite loading
      const timeout = setTimeout(() => {
        if (this.user.name === 'Loading...') {
          console.warn('User data fetch timeout');
          this.user.name = 'User';
          this.user.email = 'user@company.com';
          this.cdr.detectChanges();
        }
      }, 5000);
      
      this.authService.getCurrentUser().subscribe({
        next: (response) => {
          clearTimeout(timeout);
          console.log('User data fetched successfully:', response);
          if (response && response.status === 200 && response.data) {
            this.user.name = response.data.name || 'User';
            this.user.email = response.data.email || 'user@company.com';
            console.log('User menu updated from API:', this.user);
            this.cdr.detectChanges();
          } else {
            console.warn('Invalid response format:', response);
            this.user.name = 'User';
            this.user.email = 'user@company.com';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          clearTimeout(timeout);
          console.error('Failed to load user data:', error);
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
    console.log('🚪 Logout initiated from usermenu');
    
    // Clear all notifications on logout
    this.notificationService.clearAllNotifications();
    
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('✅ Logout successful, response:', response);
        // Navigation is handled in the authentication service's logout method
      },
      error: (error) => {
        console.error('❌ Logout error:', error);
        // Even if the API call fails, we should still be redirected by the service
        // But just in case, check if we need to manually redirect
        if (!this.authService.hasValidToken()) {
          console.log('📍 Token already cleared, navigating to login');
          this.router.navigate(['/login']);
        }
      }
    });
  }
}