import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { CustomButton } from '../../custom-button/custom-button';
import { Authentication } from '../../services/authenticationservice/authentication';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, CustomButton],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound implements OnInit {
  isAuthenticated: boolean = false;

  constructor(
    private router: Router,
    private location: Location,
    private authService: Authentication
  ) {}

  ngOnInit(): void {
    this.authService.authState$.subscribe(state => {
      this.isAuthenticated = state === 'authenticated';
    });
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }

  goBack(): void {
    this.location.back();
  }
}
