import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { Authentication, type AuthState } from './authentication';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: Authentication,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Return an Observable that waits for auth state to be ready
    return this.authService.authState$.pipe(
      filter((authState) => authState !== 'loading'),
      take(1), // Take the first non-loading emission to ensure auth is initialized
      map((authState: AuthState) => {
        const isAuthenticated = authState === 'authenticated';
        // Allow the login route regardless of auth state
        if (state.url === '/login') {
          return true;
        }

        // Handle root path navigation (Layout component)
        if (state.url === '/' || route.component?.name === 'Layout') {
          if (isAuthenticated) {
            return true;
          }
          return this.router.createUrlTree(['/login']);
        }

        // Guarded child routes require authentication
        if (!isAuthenticated) {
          const extras = state.url !== '/login'
            ? { queryParams: { returnUrl: state.url } }
            : undefined;
          return this.router.createUrlTree(['/login'], extras);
        }

        // Check for role-based access if specified in route data
        const requiredRoles = route.data['roles'] as string[] | undefined;
        if (requiredRoles?.length) {
          const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));

          if (!hasRequiredRole) {
            return this.router.createUrlTree(['/unauthorized']);
          }
        }

        // Check if super admin access is required
        const requiresSuperAdmin = route.data['requiresSuperAdmin'] as boolean | undefined;
        if (requiresSuperAdmin && !this.authService.isSuperAdmin()) {
          return this.router.createUrlTree(['/unauthorized']);
        }
        return true;
      })
    );
  }
}