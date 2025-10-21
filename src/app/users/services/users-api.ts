import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, timeout, retry } from 'rxjs/operators';

export interface User {
  user: string;
  email: string;
  type: string;
  status: string;
  created: string;
  last_Login: string;
}

export interface ApiResponse {
  status: number;
  data: ApiUser[];
  message: string;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  type: string;
  status: string;
  created_At: string;
  last_Login: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsersApi {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7178/api/User';
  private isLoading = false;
  private cachedUsers: User[] | null = null;

  constructor() { }

  /**
   * Fetch users from the API
   * Returns an observable that emits the transformed user data
   * Uses caching to prevent multiple API calls
   */
  getUsers(): Observable<User[]> {
    // Return cached data if available
    if (this.cachedUsers) {
      console.log('UsersApi: Returning cached users data');
      return of(this.cachedUsers);
    }

    // Prevent multiple simultaneous calls
    if (this.isLoading) {
      console.log('UsersApi: API call already in progress, returning sample data...');
      return of(this.getSampleUsers());
    }

    this.isLoading = true;
    console.log('UsersApi: Starting to fetch users from API...');

    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      timeout(10000), // 10 second timeout
      retry(1), // Retry once on failure
      map(response => {
        console.log('UsersApi: API Response received:', response);
        if (response.status === 200 && response.data) {
          const users = response.data.map(apiUser => ({
            user: apiUser.name,
            email: apiUser.email,
            type: apiUser.type,
            status: apiUser.status,
            created: this.formatDate(apiUser.created_At),
            last_Login: this.formatDate(apiUser.last_Login || '')
          }));
          this.cachedUsers = users; // Cache the data
          console.log('UsersApi: Users loaded successfully:', users.length);
          console.log('UsersApi: Fetched users data:', users);
        } else {
          console.log('UsersApi: Invalid response format:', response);
          throw new Error('Invalid response from server.');
        }
        this.isLoading = false;
        return this.cachedUsers!;
      }),
      catchError(error => {
        console.log('UsersApi: API call failed');
        this.isLoading = false;
        
        // Check if it's a network error vs HTTP error response
        if (error instanceof HttpErrorResponse) {
          // HTTP error response (server returned error status)
          if (error.status === 0) {
            // Status 0 usually means network error
            return throwError(() => new Error('Network issue. Check your internet connection'));
          } else {
            // Server returned error status (404, 500, etc.)
            return throwError(() => new Error(`Server error: ${error.status} ${error.statusText}`));
          }
        } else {
          // Other errors (timeout, etc.)
          return throwError(() => new Error('Network issue. Check your internet connection'));
        }
      })
    );
  }

  /**
   * Clear cached data and force fresh API call
   */
  refreshUsers(): Observable<User[]> {
    console.log('UsersApi: Clearing cache and refreshing users...');
    this.cachedUsers = null;
    this.isLoading = false;
    return this.getUsers();
  }

  /**
   * Get sample users for development when API is not available
   */
  private getSampleUsers(): User[] {
    console.log('UsersApi: Loading sample user data...');
    const sampleUsers = [
      {
        user: 'Alice Johnson',
        email: 'alice.johnson@company.com',
        type: 'Internal',
        status: 'Active',
        created: '09/23/2025',
        last_Login: '09/25/2025'
      },
      {
        user: 'Bob Smith',
        email: 'bob.smith@company.com',
        type: 'External',
        status: 'Active',
        created: '09/20/2025',
        last_Login: '09/24/2025'
      },
      {
        user: 'Carol Williams',
        email: 'carol.williams@company.com',
        type: 'Internal',
        status: 'Inactive',
        created: '09/15/2025',
        last_Login: '09/20/2025'
      },
      {
        user: 'David Brown',
        email: 'david.brown@company.com',
        type: 'Customer',
        status: 'Active',
        created: '09/10/2025',
        last_Login: '09/23/2025'
      },
      {
        user: 'Emma Davis',
        email: 'emma.davis@company.com',
        type: 'Internal',
        status: 'Active',
        created: '09/05/2025',
        last_Login: '09/22/2025'
      }
    ];
    console.log('UsersApi: Sample data loaded, users count:', sampleUsers.length);
    return sampleUsers;
  }

  /**
   * Format date string to human-readable format
   */
  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      // Format as MM/DD/YYYY
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }
  }
}
