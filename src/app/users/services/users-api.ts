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
      return of(this.cachedUsers);
    }

    // Prevent multiple simultaneous calls
    if (this.isLoading) {
      return of(this.getSampleUsers());
    }

    this.isLoading = true;
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
              // First retry immediately, subsequent retries with delay
              return timer(index === 0 ? 0 : 500);
            }
            // Don't retry other errors
            return throwError(() => error);
          })
        )
      ),
      map(response => {
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
          return users;
        } else {
          this.isLoading = false;
          throw new Error('Invalid response from server.');
        }
      }),
      catchError(error => {
        this.isLoading = false; // Ensure loading flag is always reset
        
        // Handle error normally
        return throwError(() => error);
      })
    );
  }

  /**
   * Clear cached data and force fresh API call
   */
  refreshUsers(): Observable<User[]> {
    this.cachedUsers = null;
    this.isLoading = false;
    return this.getUsers();
  }

  /**
   * Fetch paginated users from the API with filtering, sorting, and search
   * Returns paginated user data with total count
   */
  getPaginatedUsers(request: PaginatedUsersRequest): Observable<{ users: User[], totalCount: number, page: number, pageSize: number }> {
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
              return timer(index === 0 ? 0 : 500);
            }
            return throwError(() => error);
          })
        )
      ),
      map(response => {
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
          return {
            users: users,
            totalCount: response.data.totalCount,
            page: response.data.page,
            pageSize: response.data.pageSize
          };
        } else {
          throw new Error('Invalid response from server.');
        }
      }),
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
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
    const filterBody: GetAllUsersQuery = {
      type: filters?.type || null,
      status: filters?.status || null
    };

    return this.http.post<ApiResponse>(`${this.apiUrl}/filter`, filterBody).pipe(
      timeout(30000), // Longer timeout for potentially large exports
      map(response => {
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
          return users;
        } else {
          throw new Error('Invalid response from server.');
        }
      }),
      catchError(error => {
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
    const command: CreateUserCommand = {
      users: [userData] // Wrap single user in array
    };
    
    return this.http.post<CreateUserResponse>(this.apiUrl, command).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
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
                } catch {
                  // Not JSON, use as-is
                  errorMessage = error.error;
                }
              } 
              // Check for lowercase 'message' property
              else if (error.error.message) {
                errorMessage = error.error.message;
              } 
              // Check for Pascal case 'Message' property (common in .NET APIs)
              else if (error.error.Message) {
                errorMessage = error.error.Message;
              }
              // Check for 'error' property
              else if (error.error.error) {
                errorMessage = error.error.error;
              }
              // Check for 'errors' array (validation errors)
              else if (error.error.errors && Array.isArray(error.error.errors) && error.error.errors.length > 0) {
                errorMessage = typeof error.error.errors[0] === 'string' 
                  ? error.error.errors[0] 
                  : error.error.errors[0].message || JSON.stringify(error.error.errors[0]);
              }
              // Check for 'title' property (ASP.NET Core validation problem details)
              else if (error.error.title) {
                errorMessage = error.error.title;
              }
              // Last resort: stringify the error object if it has content
              else if (Object.keys(error.error).length > 0) {
                errorMessage = JSON.stringify(error.error);
              }
              else {
                errorMessage = `Server error: ${error.status} ${error.statusText}`;
              }
            } else {
              errorMessage = `Server error: ${error.status} ${error.statusText}`;
            }
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
    const command: CreateUserCommand = {
      users: users
    };
    
    return this.http.post<CreateUserResponse>(this.apiUrl, command).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
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
    const request: BulkImportRequest = {
      users: users,
      createdBy: createdBy
    };
    
    return this.http.post<BulkImportResponse>(`${this.apiUrl}/bulk-import`, request).pipe(
      timeout(30000), // 30 second timeout for bulk import
      catchError(error => {
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
    const command: CreateUserCommand = {
      users: users
    };
    
    return this.http.post<CreateUserResponse>(`${this.apiUrl}/import-csv`, command).pipe(
      timeout(30000), // 30 second timeout for bulk import
      catchError(error => {
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
    const url = `${this.apiUrl}/${id}`;
    
    return this.http.get<GetUserByIdResponse>(url).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
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
    const url = `${this.apiUrl}/${id}`;
    
    return this.http.put<UpdateUserResponse>(url, dto).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
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
    const deleteRequest: DeleteUserRequest = { ids: userIds };
    
    return this.http.request<DeleteUserResponse>('DELETE', this.apiUrl, {
      body: deleteRequest
    }).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
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
