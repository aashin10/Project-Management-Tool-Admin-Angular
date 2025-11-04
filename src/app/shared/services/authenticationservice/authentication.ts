import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

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

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

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
  private isLoggingOut = false; // Flag to prevent multiple logout calls

  private currentUserSubject: BehaviorSubject<UserInfo | null>;
  public currentUser$: Observable<UserInfo | null>;

  private isAuthenticatedSubject: BehaviorSubject<boolean | null>;
  public isAuthenticated$: Observable<boolean | null>;

  private authStateSubject: BehaviorSubject<AuthState>;
  public authState$: Observable<AuthState>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.isAuthenticatedSubject = new BehaviorSubject<boolean | null>(null);
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    this.authStateSubject = new BehaviorSubject<AuthState>('loading');
    this.authState$ = this.authStateSubject.asObservable();

    this.currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();

    this.initializeAuthState();

    // Listen to storage events to sync across tabs
    if (this.isBrowser()) {
      window.addEventListener('storage', (event) => {
        if (event.key === this.tokenKey || event.key === this.refreshTokenKey) {
          const isValid = this.hasValidToken();
          this.updateAuthenticatedState(isValid);
          if (isValid) {
            this.loadCurrentUser();
          }
        }
      });
    }
  }

  // =======================
  // 🔐 Utility — check if running in browser
  // =======================
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private initializeAuthState(): void {
    if (!this.isBrowser()) {
      this.updateAuthenticatedState(false);
      return;
    }

    this.setAuthLoading();

    setTimeout(() => {
      // Defer token validation to the next macrotask so consumers can subscribe before the first emission.
      const isValid = this.hasValidToken();
      this.updateAuthenticatedState(isValid);

      if (isValid) {
        this.loadCurrentUser();
      }
    }, 0);
  }

  private setAuthLoading(): void {
    this.isAuthenticatedSubject.next(null);
    this.authStateSubject.next('loading');
  }

  private updateAuthenticatedState(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
    this.authStateSubject.next(isAuthenticated ? 'authenticated' : 'unauthenticated');

    if (!isAuthenticated) {
      this.currentUserSubject.next(null);
    }
  }

  // =======================
  // 🚪 Login
  // =======================
  login(email: string, password: string): Observable<ApiResponse<LoginResponse>> {
    const loginRequest: LoginRequest = {
      email: email.trim().toLowerCase(),
      password: password
    };

    console.log('🔐 Attempting login for:', email);

    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiUrl}/Auth/login`,
      loginRequest
    ).pipe(
      tap(response => {
        console.log('📥 Login response received:', response);
        if (response.status === 200 && response.data) {
          console.log('✅ Login successful, storing tokens');
          this.setTokens(response.data.accessToken, response.data.refreshToken);
          this.updateAuthenticatedState(true);
          this.loadCurrentUser();
          
        }
      }),
      catchError(error => {
        console.error('❌ Login API error:', error);
        // Return the error as a response so login component can handle it
        // This allows the component to show proper error messages
        return throwError(() => error);
      })
    );
  }

  // =======================
  // 🔄 Refresh Token
  // =======================
  refreshToken(): Observable<ApiResponse<LoginResponse>> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      console.error('❌ No refresh token available');
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshRequest: RefreshTokenRequest = { refreshToken };

    console.log('🔄 Sending refresh token request to backend...');
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiUrl}/Auth/refresh`,
      refreshRequest
    ).pipe(
      tap(response => {
        if (response.status === 200 && response.data) {
          console.log('✅ Token successfully refreshed');
          this.setTokens(response.data.accessToken, response.data.refreshToken);
          this.updateAuthenticatedState(true);
        } else {
          console.warn('⚠️ Refresh response status not 200:', response.status);
        }
      }),
      catchError(error => {
        console.error('❌ Token refresh failed:', error);
        // Don't logout here - let the interceptor handle it
        return throwError(() => error);
      })
    );
  }

  // =======================
  // 🚪 Logout
  // =======================
  logout(): Observable<ApiResponse<any>> {
    // If already logging out, return early to prevent duplicate navigation
    if (this.isLoggingOut) {
      console.log('⚠️ Logout already in progress, skipping duplicate logout call');
      return throwError(() => new Error('Logout already in progress'));
    }

    this.isLoggingOut = true;
    console.log('🔴 Starting logout process...');

    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/Auth/logout`,
      {}
    ).pipe(
      tap(() => {
        console.log('🔴 Logout successful from API');
        this.clearAuthDataSilent();
      }),
      catchError(error => {
        console.error('⚠️ Logout API error, clearing auth data anyway');
        this.clearAuthDataSilent();
        return throwError(() => error);
      }),
      finalize(() => {
        // Cleanup always happens - whether success or error
        console.log('🔴 Finalizing logout - resetting flag and navigating');
        this.isLoggingOut = false;
        this.router.navigate(['/login']);
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
    if (!token) {
      console.log('⚠️ No token in localStorage');
      return false;
    }

    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const isValid = payload.exp > currentTime;
      
      if (!isValid) {
        console.log('⚠️ Token expired. Expires at:', new Date(payload.exp * 1000), 'Current time:', new Date());
      } else {
        console.log('✅ Token is valid. Expires at:', new Date(payload.exp * 1000));
      }
      
      return isValid;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
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
    this.updateAuthenticatedState(false);
    this.router.navigate(['/login']);
  }

  private clearAuthDataSilent(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    }
    this.updateAuthenticatedState(false);
    // Don't navigate here - let the caller handle navigation
  }

  // =======================
  // 👥 Helpers
  // =======================
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value === true;
  }

  isLoggingOutInProgress(): boolean {
    return this.isLoggingOut;
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
