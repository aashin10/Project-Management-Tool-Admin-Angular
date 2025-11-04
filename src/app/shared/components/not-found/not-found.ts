import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CustomButton } from '../../custom-button/custom-button';
import { Authentication } from '../../services/authenticationservice/authentication';

@Component({
  selector: 'app-not-found',
  imports: [CustomButton],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound {

  isAuthenticated: boolean = false;

  constructor(
    private router: Router,
    private authService: Authentication
  ) {
    this.isAuthenticated = this.authService.isAuthenticated() && this.authService.hasValidToken();
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }

  goBack(): void {
    window.history.back();
  }
}
