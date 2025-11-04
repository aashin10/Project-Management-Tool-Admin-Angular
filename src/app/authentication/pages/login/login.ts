import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomButton } from "../../../shared/custom-button/custom-button";
import { Authentication } from '../../../shared/services/authenticationservice/authentication';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomButton],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  
  // Validation states
  emailError: string = '';
  passwordError: string = '';
  
  // Loading and error states
  isLoading: boolean = false;
  loginError: string = '';
  
  // Return URL for redirect after login
  returnUrl: string = '/dashboard';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: Authentication,
    private toastr: ToastrService
  ) {
    // Get return URL from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  validateEmail(): void {
    const emailValue = this.email.trim();
    
    if (!emailValue) {
      this.emailError = 'Email is required';
      return;
    }

    // Comprehensive email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(emailValue)) {
      this.emailError = 'Please enter a valid email address';
      return;
    }

    // Check for common issues
    if (emailValue.startsWith('.') || emailValue.includes('..')) {
      this.emailError = 'Email cannot start with a dot or contain consecutive dots';
      return;
    }

    const [localPart, domain] = emailValue.split('@');
    
    // Validate local part (before @)
    if (localPart.length === 0) {
      this.emailError = 'Email must have characters before @';
      return;
    }

    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      this.emailError = 'Email cannot start or end with a dot before @';
      return;
    }

    // Validate domain part (after @)
    if (!domain || domain.length === 0) {
      this.emailError = 'Email must have a domain after @';
      return;
    }

    if (!domain.includes('.')) {
      this.emailError = 'Email domain must contain a dot (e.g., .com, .org)';
      return;
    }

    const domainParts = domain.split('.');
    if (domainParts.some(part => part.length === 0)) {
      this.emailError = 'Email domain is invalid';
      return;
    }

    // Check if domain extension is at least 2 characters
    const extension = domainParts[domainParts.length - 1];
    if (extension.length < 2) {
      this.emailError = 'Email domain extension must be at least 2 characters';
      return;
    }

    this.emailError = '';
  }

  validatePassword(): void {
    if (!this.password.trim()) {
      this.passwordError = 'Password is required';
      return;
    }
    
    if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return;
    }

    this.passwordError = '';
  }

  isFormValid(): boolean {
    return (
      this.email.trim() !== '' &&
      this.password.trim() !== '' &&
      this.emailError === '' &&
      this.passwordError === ''
    );
  }

  onSubmit(): void {
    // Clear previous login error
    this.loginError = '';
    
    // Validate all fields before submission
    this.validateEmail();
    this.validatePassword();

    if (!this.isFormValid()) {
      if (this.emailError) {
        this.loginError = this.emailError;
        this.toastr.error(this.emailError, 'Validation Error');
      } else if (this.passwordError) {
        this.loginError = this.passwordError;
        this.toastr.error(this.passwordError, 'Validation Error');
      }
      return;
    }

    // Prevent multiple submissions
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    // Call authentication service
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log(response);
        if (response.status === 200) {
          console.log('Login successful');
          this.toastr.success('Welcome back!', 'Login Successful');
          // Navigate to return URL or dashboard
          this.router.navigate([this.returnUrl]);
        } else {
          // Login failed - show error toaster
          this.loginError = 'Invalid Login Credentials';
          this.toastr.error('Invalid Login Credentials', 'Login Failed');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        // Show toaster for invalid credentials or any login error
        this.toastr.error('Invalid Login Credentials', 'Login Failed');
        this.loginError = 'Invalid Login Credentials';
      }
    });
  }
}