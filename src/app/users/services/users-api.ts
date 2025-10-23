import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, timeout, retry } from 'rxjs/operators';

export interface User {
  id: number;
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

export interface CreateUserRequest {
  name: string;
  email: string;
  jira_id?: string;
  type: string;
  status: string;
  is_active: boolean;
  avatar_url: string;
  is_super_admin: boolean;
  password_hash: string;
  created_by: number;
}

export interface CreateUserResponse {
  status: number;
  data: ApiUser;
  message: string;
}

export interface DeleteUserRequest {
  ids: number[];
}

export interface DeleteUserResponse {
  status: number;
  message: string;
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
            id: apiUser.id,
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
   * Create a new user
   */
  createUser(userData: CreateUserRequest): Observable<CreateUserResponse> {
    console.log('UsersApi: Creating new user...', userData);
    return this.http.post<CreateUserResponse>(this.apiUrl, userData).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('UsersApi: Create user failed', error);
        console.log('UsersApi: Error type:', error.constructor.name);
        console.log('UsersApi: Error status:', error.status);
        console.log('UsersApi: Error.error:', error.error);
        console.log('UsersApi: Error.error type:', typeof error.error);
        
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            return throwError(() => new Error('Network issue. Check your internet connection'));
          } else {
            // Extract error message from API response - try multiple formats
            let errorMessage = 'Failed to create user';
            
            if (error.error) {
              // Check if it's a plain string
              if (typeof error.error === 'string') {
                try {
                  // Try to parse it as JSON in case it's a JSON string
                  const parsed = JSON.parse(error.error);
                  errorMessage = parsed.message || parsed.Message || parsed.error || error.error;
                  console.log('UsersApi: Parsed JSON string, extracted:', errorMessage);
                } catch {
                  // Not JSON, use as-is
                  console.log('UsersApi: Using error.error as plain string:', error.error);
                  errorMessage = error.error;
                }
              } 
              // Check for lowercase 'message' property
              else if (error.error.message) {
                console.log('UsersApi: Using error.error.message:', error.error.message);
                errorMessage = error.error.message;
              } 
              // Check for Pascal case 'Message' property (common in .NET APIs)
              else if (error.error.Message) {
                console.log('UsersApi: Using error.error.Message:', error.error.Message);
                errorMessage = error.error.Message;
              }
              // Check for 'error' property
              else if (error.error.error) {
                console.log('UsersApi: Using error.error.error:', error.error.error);
                errorMessage = error.error.error;
              }
              // Check for 'errors' array (validation errors)
              else if (error.error.errors && Array.isArray(error.error.errors) && error.error.errors.length > 0) {
                console.log('UsersApi: Using first error from errors array:', error.error.errors[0]);
                errorMessage = typeof error.error.errors[0] === 'string' 
                  ? error.error.errors[0] 
                  : error.error.errors[0].message || JSON.stringify(error.error.errors[0]);
              }
              // Check for 'title' property (ASP.NET Core validation problem details)
              else if (error.error.title) {
                console.log('UsersApi: Using error.error.title:', error.error.title);
                errorMessage = error.error.title;
              }
              // Last resort: stringify the error object if it has content
              else if (Object.keys(error.error).length > 0) {
                console.log('UsersApi: Stringifying error.error object');
                errorMessage = JSON.stringify(error.error);
              }
              else {
                console.log('UsersApi: No message found, using status text');
                errorMessage = `Server error: ${error.status} ${error.statusText}`;
              }
            } else {
              console.log('UsersApi: error.error is null/undefined');
              errorMessage = `Server error: ${error.status} ${error.statusText}`;
            }
            
            console.log('UsersApi: Final error message:', errorMessage);
            return throwError(() => new Error(errorMessage));
          }
        } else {
          return throwError(() => new Error('Failed to create user'));
        }
      })
    );
  }

  /**
   * Delete users by IDs
   */
  deleteUsers(userIds: number[]): Observable<DeleteUserResponse> {
    console.log('UsersApi: Deleting users...', userIds);
    const deleteRequest: DeleteUserRequest = { ids: userIds };
    
    return this.http.request<DeleteUserResponse>('DELETE', this.apiUrl, {
      body: deleteRequest
    }).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('UsersApi: Delete users failed', error);
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            return throwError(() => new Error('Network issue. Check your internet connection'));
          } else {
            return throwError(() => new Error(`Server error: ${error.status} ${error.statusText}`));
          }
        } else {
          return throwError(() => new Error('Failed to delete users'));
        }
      })
    );
  }

  /**
   * Get sample users for development when API is not available
   */
  private getSampleUsers(): User[] {
    console.log('UsersApi: Loading sample user data...');
    const sampleUsers = [
      {
        id: 1,
        user: 'Alice Johnson',
        email: 'alice.johnson@company.com',
        type: 'Internal',
        status: 'Active',
        created: '09/23/2025',
        last_Login: '09/25/2025'
      },
      {
        id: 2,
        user: 'Bob Smith',
        email: 'bob.smith@company.com',
        type: 'External',
        status: 'Active',
        created: '09/20/2025',
        last_Login: '09/24/2025'
      },
      {
        id: 3,
        user: 'Carol Williams',
        email: 'carol.williams@company.com',
        type: 'Internal',
        status: 'Inactive',
        created: '09/15/2025',
        last_Login: '09/20/2025'
      },
      {
        id: 4,
        user: 'David Brown',
        email: 'david.brown@company.com',
        type: 'Customer',
        status: 'Active',
        created: '09/10/2025',
        last_Login: '09/23/2025'
      },
      {
        id: 5,
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
