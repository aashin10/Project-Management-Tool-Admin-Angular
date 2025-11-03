import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// =======================
// DTOs matching your backend
// =======================
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  errors?: string[];
}

interface UserInfo {
  userId: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  roles: string[];
}

// =======================
// Authentication Service
// =======================
@Injectable({
  providedIn: 'root'
})
export class Authentication {
  private apiUrl = 'https://localhost:7178/api'; // change to your backend URL
  private tokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';

  private currentUserSubject: BehaviorSubject<UserInfo | null>;
  public currentUser$: Observable<UserInfo | null>;

  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    this.currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();

    if (this.hasValidToken()) {
      this.loadCurrentUser();
    }
  }

  // =======================
  // 🔐 Utility — check if running in browser
  // =======================
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  // =======================
  // 🚪 Login
  // =======================
  login(email: string, password: string): Observable<ApiResponse<LoginResponse>> {
    const loginRequest: LoginRequest = {
      email: email.trim().toLowerCase(),
      password: password
    };

    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiUrl}/Auth/login`,
      loginRequest
    ).pipe(
      tap(response => {
        if (response.status==200 && response.data) {
          this.setTokens(response.data.accessToken, response.data.refreshToken);
          this.isAuthenticatedSubject.next(true);
          //this.loadCurrentUser();
          
        }
      }),
      catchError(this.handleError)
    );
  }

  // =======================
  // 🔄 Refresh Token
  // =======================
  refreshToken(): Observable<ApiResponse<LoginResponse>> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshRequest: RefreshTokenRequest = { refreshToken };

    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiUrl}/Auth/refresh`,
      refreshRequest
    ).pipe(
      tap(response => {
        if (response.status==200 && response.data) {
          this.setTokens(response.data.accessToken, response.data.refreshToken);
          this.isAuthenticatedSubject.next(true);
          console.log('%c✅ Token successfully refreshed', 'color: green; font-weight: bold;');
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // =======================
  // 🚪 Logout
  // =======================
  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/Auth/logout`,
      {}
    ).pipe(
      tap(() => this.clearAuthData()),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  // =======================
  // 👤 Get Current User Info
  // =======================
  getCurrentUser(): Observable<ApiResponse<UserInfo>> {
    return this.http.get<ApiResponse<UserInfo>>(
      `${this.apiUrl}/Auth/me`
    ).pipe(
      tap(response => {
        if (response.status==200 && response.data) {
          this.currentUserSubject.next(response.data);
          console.log('Current user loaded:', response.data);          
        }
      }),
      catchError(this.handleError)
    );
  }

  // =======================
  // 🧠 Load Current User
  // =======================
  private loadCurrentUser(): void {
    this.getCurrentUser().subscribe({
      next: (response) => {
        if (response.status==200) {
          this.currentUserSubject.next(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load user info:', error);
        //this.clearAuthData();
      }
    });
  }

  // =======================
  // 💾 Token Management
  // =======================
  private setTokens(accessToken: string, refreshToken: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, accessToken);
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  getAccessToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.tokenKey) : null;
  }

  getRefreshToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.refreshTokenKey) : null;
  }

  // =======================
  // 🔎 Validate Token
  // =======================
  hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      throw new Error('Invalid token');
    }
  }

  private clearAuthData(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    }
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // =======================
  // 👥 Helpers
  // =======================
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get currentUserValue(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user?.roles?.includes(role) ?? false;
  }

  isSuperAdmin(): boolean {
    return this.currentUserValue?.isSuperAdmin ?? false;
  }

  // =======================
  // ⚠️ Error Handling
  // =======================
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (Array.isArray(error.error?.errors)) {
        errorMessage = error.error.errors.join(', ');
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
