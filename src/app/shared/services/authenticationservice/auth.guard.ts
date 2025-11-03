import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Authentication } from './authentication';

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
    
    if (this.authService.isAuthenticated() && this.authService.hasValidToken()) {
      // Check for role-based access if specified in route data
      const requiredRoles = route.data['roles'] as string[];
      
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));
        
        if (!hasRequiredRole) {
          // User doesn't have required role, redirect to unauthorized page
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }

      // Check if super admin access is required
      const requiresSuperAdmin = route.data['requiresSuperAdmin'] as boolean;
      if (requiresSuperAdmin && !this.authService.isSuperAdmin()) {
        this.router.navigate(['/unauthorized']);
        return false;
      }

      return true;
    }

    // Not authenticated, redirect to login with return URL
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}