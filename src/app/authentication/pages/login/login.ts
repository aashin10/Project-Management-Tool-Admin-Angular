import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  validateEmail(): void {
    const emailValue = this.email.trim().toLowerCase();
    
    if (!emailValue) {
      this.emailError = 'Email is required';
    } else if (!emailValue.endsWith('@gmail.com')) {
      this.emailError = 'Please use a valid Gmail address (@gmail.com)';
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(emailValue)) {
      this.emailError = 'Invalid Gmail format';
    } else {
      this.emailError = '';
    }
  }

  validatePassword(): void {
    if (!this.password.trim()) {
      this.passwordError = 'Password is required';
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
    } else {
      this.passwordError = '';
    }
  }

  isFormValid(): boolean {
    return (
      this.email.trim() !== '' &&
      this.password.trim() !== '' &&
      this.emailError === '' &&
      this.passwordError === '' &&
      this.email.toLowerCase().endsWith('@gmail.com') &&
      this.password.length >= 6
    );
  }

  onSubmit(): void {
    // Validate all fields before submission
    this.validateEmail();
    this.validatePassword();

    if (!this.isFormValid()) {
      if (this.emailError) {
        alert(this.emailError);
      } else if (this.passwordError) {
        alert(this.passwordError);
      }
      return;
    }

    console.log('Login attempt:', { 
      email: this.email, 
      password: this.password 
    });
    
    // Redirect to dashboard
    this.router.navigate(['/dashboard']);
  }
}