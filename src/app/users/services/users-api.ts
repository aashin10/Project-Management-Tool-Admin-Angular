import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { map, catchError, timeout, retry, retryWhen, mergeMap, finalize } from 'rxjs/operators';

export interface User {
  id: number;
  user: string;
  email: string;
  type: string;
  status: string;
  created: string;
  lastActivity: string;
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
  jiraId?: string;
  type: string;
  status: string;
  avatarUrl?: string;
  created_At: string;
  last_Login: string | null;
}

export interface CreateUserDto {
  email: string;
  name: string;
  jiraId?: string;
  type?: string;
  status?: string;
  createdBy?: number;
}

export interface CreateUserCommand {
  users: CreateUserDto[];
}

export interface CreateUserResponse {
  status: number;
  data: ApiUser[];
  message: string;
}

export interface BulkImportRequest {
  users: CreateUserDto[];
  createdBy?: number;
}

export interface BulkImportResponse {
  data: {
    successCount: number;
    duplicateCount: number;
    skippedCount: number;
    errorCount: number;
    totalProcessed: number;
    errors: string[];
    duplicates: string[];
    skipped: string[];
    createdUsers: ApiUser[];
  };
  message: string;
  statusCode: number;
  succeeded: boolean;
}

export interface GetAllUsersQuery {
  type?: string | null;
  status?: string | null;
}

export interface PaginatedUsersRequest {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
  type?: string | null;
  status?: string | null;
  searchTerm?: string | null;
}

export interface PaginatedUsersResponse {
  status: number;
  data: {
    users: ApiUser[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
  message: string;
}

export interface DeleteUserRequest {
  ids: number[];
}

export interface DeleteUserResponse {
  status: number;
  message: string;
}

export interface GetUserByIdResponse {
  status: number;
  data: ApiUser;
  message: string;
  statusCode: number;
  succeeded: boolean;
}

export interface UpdateUserDto {
  jiraId?: string;
  type?: string;
  isActive?: boolean;
  updatedBy?: number;
}

export interface UpdateUserResponse {
  status: number;
  data: ApiUser;
  message: string;
  statusCode: number;
  succeeded: boolean;
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
   * Fetch users from the API with optional filtering
   * Returns an observable that emits the transformed user data
   * Uses caching to prevent multiple API calls
   */
  getUsers(filters?: GetAllUsersQuery): Observable<User[]> {
    // Return cached data if available and no filters are applied
    if (this.cachedUsers && !filters) {
      console.log('UsersApi: Returning cached users data');
      return of(this.cachedUsers);
    }

    // Prevent multiple simultaneous calls
    if (this.isLoading) {
      console.log('UsersApi: API call already in progress, returning sample data...');
      return of(this.getSampleUsers());
    }

    this.isLoading = true;
    console.log('UsersApi: Starting to fetch users from API with filters:', filters);

    const filterBody: GetAllUsersQuery = {
      type: filters?.type || null,
      status: filters?.status || null
    };

    return this.http.post<ApiResponse>(`${this.apiUrl}/filter`, filterBody).pipe(
      timeout(10000), // 10 second timeout
      retryWhen(errors => 
        errors.pipe(
          mergeMap((error, index) => {
            // Only retry status 0 errors (CORS/network timing issues)
            if (error instanceof HttpErrorResponse && error.status === 0 && index < 3) {
              console.log(`UsersApi: Status 0 detected, retry attempt ${index + 1} after ${index === 0 ? 0 : 500}ms`);
              // First retry immediately, subsequent retries with delay
              return timer(index === 0 ? 0 : 500);
            }
            // Don't retry other errors
            return throwError(() => error);
          })
        )
      ),
      map(response => {
        console.log('UsersApi: API Response received:', response);
        this.isLoading = false; // Reset loading flag on success
        
        if (response.status === 200 && response.data) {
          const users = response.data.map(apiUser => ({
            id: apiUser.id,
            user: apiUser.name,
            email: apiUser.email,
            type: apiUser.type,
            status: apiUser.status,
            created: this.formatDate(apiUser.created_At),
            lastActivity: this.formatDate(apiUser.last_Login || '')
          }));
          
          // Only cache if no filters are applied
          if (!filters) {
            this.cachedUsers = users;
          }
          
          console.log('UsersApi: Users loaded successfully:', users.length);
          console.log('UsersApi: Fetched users data:', users);
          return users;
        } else {
          console.log('UsersApi: Invalid response format:', response);
          this.isLoading = false;
          throw new Error('Invalid response from server.');
        }
      }),
      catchError(error => {
        console.log('UsersApi: API call failed after retries', error);
        this.isLoading = false; // Ensure loading flag is always reset
        
        // Check if it's a network error vs HTTP error response
        if (error instanceof HttpErrorResponse) {
          console.log('UsersApi: HttpErrorResponse - status:', error.status);
          // HTTP error response (server returned error status)
          if (error.status === 0) {
            // Status 0 after retries means persistent network issue
            console.log('UsersApi: Persistent network error detected after retries');
            return throwError(() => new Error('Network issue. Check your internet connection'));
          } else {
            // Server returned error status (404, 500, etc.)
            console.log('UsersApi: Server error detected');
            return throwError(() => new Error(`Server error: ${error.status} ${error.statusText}`));
          }
        } else if (error.name === 'TimeoutError') {
          // Timeout error
          console.log('UsersApi: Timeout error detected');
          return throwError(() => new Error('Request timeout. Please try again'));
        } else {
          // Other errors (parsing errors, etc.)
          console.log('UsersApi: Other error detected:', error);
          return throwError(() => new Error(error.message || 'Failed to fetch users'));
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
   * Fetch paginated users from the API with filtering, sorting, and search
   * Returns paginated user data with total count
   */
  getPaginatedUsers(request: PaginatedUsersRequest): Observable<{ users: User[], totalCount: number, page: number, pageSize: number }> {
    console.log('UsersApi: Fetching paginated users with request:', request);

    // Ensure default values for sort
    const paginatedRequest: PaginatedUsersRequest = {
      page: request.page,
      pageSize: request.pageSize,
      sortBy: request.sortBy || 'name',
      sortOrder: request.sortOrder || 'asc',
      type: request.type || null,
      status: request.status || null,
      searchTerm: request.searchTerm || null
    };

    return this.http.post<PaginatedUsersResponse>(`${this.apiUrl}/paginated`, paginatedRequest).pipe(
      timeout(10000),
      retryWhen(errors => 
        errors.pipe(
          mergeMap((error, index) => {
            if (error instanceof HttpErrorResponse && error.status === 0 && index < 3) {
              console.log(`UsersApi: Status 0 detected, retry attempt ${index + 1}`);
              return timer(index === 0 ? 0 : 500);
            }
            return throwError(() => error);
          })
        )
      ),
      map(response => {
        console.log('UsersApi: Paginated response received:', response);
        
        if (response.status === 200 && response.data) {
          const users = response.data.users.map(apiUser => ({
            id: apiUser.id,
            user: apiUser.name,
            email: apiUser.email,
            type: apiUser.type,
            status: apiUser.status,
            created: this.formatDate(apiUser.created_At),
            lastActivity: this.formatDate(apiUser.last_Login || '')
          }));
          
          console.log('UsersApi: Paginated users loaded:', users.length, 'Total:', response.data.totalCount);
          
          return {
            users: users,
            totalCount: response.data.totalCount,
            page: response.data.page,
            pageSize: response.data.pageSize
          };
        } else {
          console.log('UsersApi: Invalid paginated response format:', response);
          throw new Error('Invalid response from server.');
        }
      }),
      catchError(error => {
        console.log('UsersApi: Paginated API call failed', error);
        
        if (error instanceof HttpErrorResponse) {
          console.log('UsersApi: HttpErrorResponse - status:', error.status);
          if (error.status === 0) {
            return throwError(() => new Error('Network issue. Check your internet connection'));
          } else {
            return throwError(() => new Error(`Server error: ${error.status} ${error.statusText}`));
          }
        } else if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timeout. Please try again'));
        } else {
          return throwError(() => new Error(error.message || 'Failed to fetch paginated users'));
        }
      })
    );
  }

  /**
   * Fetch all users matching filters for export (no pagination)
   */
  getUsersForExport(filters?: { type?: string | null, status?: string | null, searchTerm?: string | null }): Observable<User[]> {
    console.log('UsersApi: Fetching users for export with filters:', filters);

    const filterBody: GetAllUsersQuery = {
      type: filters?.type || null,
      status: filters?.status || null
    };

    return this.http.post<ApiResponse>(`${this.apiUrl}/filter`, filterBody).pipe(
      timeout(30000), // Longer timeout for potentially large exports
      map(response => {
        console.log('UsersApi: Export data received:', response);
        
        if (response.status === 200 && response.data) {
          const users = response.data.map(apiUser => ({
            id: apiUser.id,
            user: apiUser.name,
            email: apiUser.email,
            type: apiUser.type,
            status: apiUser.status,
            created: this.formatDate(apiUser.created_At),
            lastActivity: this.formatDate(apiUser.last_Login || '')
          }));
          
          console.log('UsersApi: Users for export loaded:', users.length);
          return users;
        } else {
          throw new Error('Invalid response from server.');
        }
      }),
      catchError(error => {
        console.log('UsersApi: Export API call failed', error);
        
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            return throwError(() => new Error('Network issue. Check your internet connection'));
          } else {
            return throwError(() => new Error(`Server error: ${error.status} ${error.statusText}`));
          }
        } else {
          return throwError(() => new Error(error.message || 'Failed to fetch users for export'));
        }
      })
    );
  }

  /**
   * Create a new user (wrapped in array for backend compatibility)
   */
  createUser(userData: CreateUserDto): Observable<CreateUserResponse> {
    console.log('UsersApi: Creating new user...', userData);
    
    const command: CreateUserCommand = {
      users: [userData] // Wrap single user in array
    };
    
    return this.http.post<CreateUserResponse>(this.apiUrl, command).pipe(
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
   * Create multiple users (bulk creation)
   */
  createUsers(users: CreateUserDto[]): Observable<CreateUserResponse> {
    console.log('UsersApi: Creating multiple users...', users.length);
    
    const command: CreateUserCommand = {
      users: users
    };
    
    return this.http.post<CreateUserResponse>(this.apiUrl, command).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('UsersApi: Bulk create users failed', error);
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            return throwError(() => new Error('Network issue. Check your internet connection'));
          } else {
            let errorMessage = 'Failed to create users';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error && error.error.Message) {
              errorMessage = error.error.Message;
            }
            return throwError(() => new Error(errorMessage));
          }
        } else {
          return throwError(() => new Error('Failed to create users'));
        }
      })
    );
  }

  /**
   * Import users from CSV (Bulk Import)
   */
  bulkImportUsers(users: CreateUserDto[], createdBy?: number): Observable<BulkImportResponse> {
    console.log('UsersApi: Bulk importing users...', users.length);
    
    const request: BulkImportRequest = {
      users: users,
      createdBy: createdBy
    };
    
    return this.http.post<BulkImportResponse>(`${this.apiUrl}/bulk-import`, request).pipe(
      timeout(30000), // 30 second timeout for bulk import
      catchError(error => {
        console.error('UsersApi: Bulk import failed', error);
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            return throwError(() => new Error('Network issue. Check your internet connection'));
          } else {
            let errorMessage = 'Failed to import users';
            
            // Try to extract error message from response
            if (error.error) {
              if (typeof error.error === 'string') {
                try {
                  const parsed = JSON.parse(error.error);
                  errorMessage = parsed.message || parsed.Message || parsed.error || error.error;
                } catch {
                  errorMessage = error.error;
                }
              } else if (error.error.message) {
                errorMessage = error.error.message;
              } else if (error.error.Message) {
                errorMessage = error.error.Message;
              }
            }
            
            return throwError(() => new Error(errorMessage));
          }
        } else {
          return throwError(() => new Error('Failed to import users'));
        }
      })
    );
  }

  /**
   * Import users from CSV (Legacy - deprecated)
   * @deprecated Use bulkImportUsers instead
   */
  importCSV(users: CreateUserDto[]): Observable<CreateUserResponse> {
    console.log('UsersApi: Importing users from CSV...', users.length);
    
    const command: CreateUserCommand = {
      users: users
    };
    
    return this.http.post<CreateUserResponse>(`${this.apiUrl}/import-csv`, command).pipe(
      timeout(30000), // 30 second timeout for bulk import
      catchError(error => {
        console.error('UsersApi: CSV import failed', error);
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            return throwError(() => new Error('Network issue. Check your internet connection'));
          } else {
            let errorMessage = 'Failed to import users from CSV';
            
            // Try to extract error message from response
            if (error.error) {
              if (typeof error.error === 'string') {
                try {
                  const parsed = JSON.parse(error.error);
                  errorMessage = parsed.message || parsed.Message || parsed.error || error.error;
                } catch {
                  errorMessage = error.error;
                }
              } else if (error.error.message) {
                errorMessage = error.error.message;
              } else if (error.error.Message) {
                errorMessage = error.error.Message;
              }
            }
            
            return throwError(() => new Error(errorMessage));
          }
        } else {
          return throwError(() => new Error('Failed to import users from CSV'));
        }
      })
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<GetUserByIdResponse> {
    console.log('UsersApi: Fetching user by ID...', id);
    const url = `${this.apiUrl}/${id}`;
    
    return this.http.get<GetUserByIdResponse>(url).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('UsersApi: Get user by ID failed', error);
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            return throwError(() => new Error('Network issue. Check your internet connection'));
          } else if (error.status === 404) {
            return throwError(() => new Error('User not found or has been deleted'));
          } else {
            return throwError(() => new Error(`Server error: ${error.status} ${error.statusText}`));
          }
        } else {
          return throwError(() => new Error('Failed to fetch user details'));
        }
      })
    );
  }

  /**
   * Update an existing user
   */
  updateUser(id: number, dto: UpdateUserDto): Observable<UpdateUserResponse> {
    console.log('UsersApi: Updating user...', id, dto);
    const url = `${this.apiUrl}/${id}`;
    
    return this.http.put<UpdateUserResponse>(url, dto).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('UsersApi: Update user failed', error);
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            return throwError(() => new Error('Network issue. Check your internet connection'));
          } else if (error.status === 400) {
            const errorMessage = error.error?.message || 'Validation failed. Please check your inputs.';
            return throwError(() => new Error(errorMessage));
          } else if (error.status === 404) {
            return throwError(() => new Error('User not found or has been deleted'));
          } else if (error.status === 409) {
            return throwError(() => new Error('Jira ID already exists for another user'));
          } else {
            return throwError(() => new Error(`Server error: ${error.status} ${error.statusText}`));
          }
        } else {
          return throwError(() => new Error('Failed to update user'));
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
        lastActivity: '09/25/2025'
      },
      {
        id: 2,
        user: 'Bob Smith',
        email: 'bob.smith@company.com',
        type: 'External',
        status: 'Active',
        created: '09/20/2025',
        lastActivity: '09/24/2025'
      },
      {
        id: 3,
        user: 'Carol Williams',
        email: 'carol.williams@company.com',
        type: 'Internal',
        status: 'Inactive',
        created: '09/15/2025',
        lastActivity: '09/20/2025'
      },
      {
        id: 4,
        user: 'David Brown',
        email: 'david.brown@company.com',
        type: 'Customer',
        status: 'Active',
        created: '09/10/2025',
        lastActivity: '09/23/2025'
      },
      {
        id: 5,
        user: 'Emma Davis',
        email: 'emma.davis@company.com',
        type: 'Internal',
        status: 'Active',
        created: '09/05/2025',
        lastActivity: '09/22/2025'
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
