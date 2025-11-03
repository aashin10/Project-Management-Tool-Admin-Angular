import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Authentication } from '../../services/authenticationservice/authentication';

@Component({
  selector: 'app-user-menu',
  templateUrl: './usermenu.html',
  styleUrls: ['./usermenu.css'],
  imports: [CommonModule],
})
export class Usermenu {
  user = {
    name: 'Geo John',
    email: 'geo.john@experionglobal.com',
  };

  menuItems = [
    { label: 'Logout', action: 'logout', destructive: true, icon: '/images/logout.svg' },
  ];

  constructor(
    private authService: Authentication,
    private router: Router
  ) {}

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