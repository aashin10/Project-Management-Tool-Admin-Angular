import { Component, OnInit } from '@angular/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Authentication } from './shared/services/authenticationservice/authentication';
import { LoadingIndicator } from './shared/loading-indicator/loading-indicator';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgIf, AsyncPipe, LoadingIndicator],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = 'Project-Management-Tool-Admin';

  constructor(
    private authService: Authentication,
    private router: Router
  ) {}

  protected get authState$() {
    return this.authService.authState$;
  }

  ngOnInit(): void {
    console.log('🚀 App component initialized');
    
    // Log router navigation events for debugging
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('🔄 Navigation started to:', event.url);
      } else if (event instanceof NavigationEnd) {
        console.log('✅ Navigation completed to:', event.url);
      }
    });
  }
}

