import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Authentication } from './authentication';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private injector: Injector) {}

  // Lazy get the authentication service to avoid circular dependency
  private get authService(): Authentication {
    return this.injector.get(Authentication);
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip auth endpoints to avoid circular calls and infinite loops
    const isLocalAuth =
      request.url.includes('/Auth/login') ||
      request.url.includes('/Auth/refresh') ||
      request.url.includes('/Auth/logout');

    const isJiraAuth =
      // Atlassian OAuth (3LO) flows
      request.url.includes('https://auth.atlassian.com/authorize') ||
      request.url.includes('https://auth.atlassian.com/oauth/token') ||
      // Accessible resources (returns list of sites/cloudids the token can access)
      request.url.includes('https://api.atlassian.com/oauth/token/accessible-resources') ||
      // Atlassian Cloud product APIs (you might want to bypass these if tokens handled elsewhere)
      request.url.includes('https://api.atlassian.com/') ||
      // Legacy / Server endpoints (cookie / session based)
      request.url.includes('/rest/auth/1/session') ||
      // Basic API-token routes (Atlassian account API tokens used with basic auth)
      request.url.includes('https://id.atlassian.com/manage-profile/security/api-tokens');

    // Skip auth logic for local auth endpoints and Jira OAuth/API calls to avoid accidental logouts
    if (isLocalAuth || isJiraAuth) {
      return next.handle(request);
    }

    // Add token to request if available (for non-auth requests)
    const token = this.authService.getAccessToken();

    if (token) {
      request = this.addTokenToRequest(request, token);
    } else {
    }


    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;

            // Fixed: Check response.status instead of response.succeeded
            if (response.status === 200 && response.data) {
              this.refreshTokenSubject.next(response.data.accessToken);
              return next.handle(this.addTokenToRequest(request, response.data.accessToken));
            }

            // If refresh failed, logout and return error
            this.refreshTokenSubject.next(null);
            this.authService.logout().subscribe();
            return throwError(() => new Error('Token refresh failed'));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(null);
            // Logout on refresh failure
            this.authService.logout().subscribe();
            return throwError(() => error);
          })
        );
      } else {
        // No refresh token, logout
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);
        this.authService.logout().subscribe();
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // Wait for token refresh to complete
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addTokenToRequest(request, token));
        }),
        catchError((error) => {
          // If refresh fails, this will error out
          return throwError(() => error);
        })
      );
    }
  }
}
