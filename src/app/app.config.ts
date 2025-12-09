import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { filter, take } from 'rxjs/operators';

import { routes } from './app.routes';
import { AuthInterceptor } from './shared/services/authenticationservice/auth.interceptor';
import { Authentication, type AuthState } from './shared/services/authenticationservice/authentication';

export const appConfig: ApplicationConfig = {
  providers: [
    // APP_INITIALIZER to ensure auth is ready before app starts
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: Authentication) => () => {
        return new Promise((resolve) => {
          // Add timeout to prevent blocking hydration indefinitely
          const timeout = setTimeout(() => {
            resolve(true);
          }, 2000); // Resolve after 2 seconds max
          
          // Wait for authentication service to initialize
          authService.authState$.pipe(
            filter((status: AuthState) => status !== 'loading'),
            take(1) // Take the first resolved emission
          ).subscribe((status) => {
            clearTimeout(timeout);
            resolve(true);
          });
        });
      },
      deps: [Authentication],
      multi: true
    },
    
    // HTTP Client with interceptors enabled
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()  // ← Enable class-based interceptors
    ),
    
    // Register the AuthInterceptorz
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true  // ← CRITICAL: must be true!
    },
    
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
      tapToDismiss: true,
    }),
  ],
};