import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { Authentication, type AuthState } from './authentication';

@Injectable({
  providedIn: 'root',
})
export class LoginRedirectGuard implements CanActivate {
  constructor(
    private authService: Authentication,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const targetUrl = route.queryParamMap.get('returnUrl');
    return this.authService.authState$.pipe(
      filter((status: AuthState) => status !== 'loading'),
      take(1),
      map((status: AuthState) => {
        if (status === 'authenticated') {
          if (targetUrl) {
            try {
              return this.router.parseUrl(targetUrl);
            } catch (error) {
            }
          }
          return this.router.createUrlTree(['/dashboard']);
        }
        return true;
      })
    );
  }
}