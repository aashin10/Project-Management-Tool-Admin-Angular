import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CustomButton } from '../../custom-button/custom-button';

@Component({
  selector: 'app-not-found',
  imports: [CustomButton],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound {

  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    window.history.back();
  }
}
