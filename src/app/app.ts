import { Component, OnInit } from '@angular/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Authentication } from './shared/services/authenticationservice/authentication';
import { LoadingIndicator } from './shared/loading-indicator/loading-indicator';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgIf, AsyncPipe, LoadingIndicator],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = 'Project-Management-Tool-Admin';
  private isNavigatingSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private authService: Authentication,
    private router: Router
  ) {}

  protected get authState$() {
    return this.authService.authState$;
  }

  protected get isReady$() {
    return combineLatest([
      this.authService.authState$,
      this.isNavigatingSubject
    ]).pipe(
      map(([authState, isNavigating]) => {
        // Show loading if auth is still loading OR if we're navigating
        const isLoading = authState === 'loading' || isNavigating;
        return !isLoading;
      })
    );
  }

  ngOnInit(): void {
    // Track navigation state to prevent flash during redirects
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isNavigatingSubject.next(true);
      } else if (event instanceof NavigationEnd) {
        // Small delay to ensure DOM is updated
        setTimeout(() => this.isNavigatingSubject.next(false), 100);
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isNavigatingSubject.next(false);
      }
    });
  }
}
