import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Authentication } from '../../services/authenticationservice/authentication';
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
    private router: Router,
    private cdr: ChangeDetectorRef  // 👈 Add this
  ) {}

  ngOnInit(): void {
    console.log('UserMenu initialized');
    
    // Subscribe to current user observable to get real-time updates
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('User data received in subscription:', user);
      if (user) {
        this.user.name = user.name;
        this.user.email = user.email;
        console.log('User menu updated:', this.user);
        
        // Force change detection
        this.cdr.detectChanges();  // 👈 Add this
      }
    });

    // Check if we already have user data
    const currentUser = this.authService.currentUserValue;
    console.log('Current user value:', currentUser);
    
    if (currentUser) {
      this.user.name = currentUser.name;
      this.user.email = currentUser.email;
      this.cdr.detectChanges();  // 👈 Add this
    } else {
      // Fetch user data if not already loaded
      console.log('Fetching user data...');
      this.authService.getCurrentUser().subscribe({
        next: (response) => {
          console.log('User data fetched successfully:', response);
          if (response.status === 200 && response.data) {
            this.user.name = response.data.name;
            this.user.email = response.data.email;
            this.cdr.detectChanges();  // 👈 Add this
          }
        },
        error: (error) => {
          console.error('Failed to load user data:', error);
          this.user.name = 'Error loading';
          this.user.email = 'Error loading';
          this.cdr.detectChanges();  // 👈 Add this
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
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        // Navigation is handled in the authentication service
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if the API call fails, clear local tokens and redirect
        this.router.navigate(['/login']);
      }
    });
  }
}