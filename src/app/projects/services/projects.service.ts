
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { map, catchError, timeout, retryWhen, mergeMap } from 'rxjs/operators';

export interface Project {
  id: string;
  name: string;
  projectCode: string;
  status: 'Active' | 'Inactive' | 'Completed';
  deliveryUnit: string;
  projectManager: string;
  projectManagerId?: number;
  teamSize: number;
  template: 'Scrum' | 'Kanban';
  description?: string;
  additionalInformation?: Array<{name: string, value: string}>;
  isImportedFromJira?: boolean;
  // Customer details
  organisationName: string;
  organisationDescription?: string;
  organisationWebsite?: string;
  pocEmail?: string;
  pocPhone?: string;
  // Project dates
  startDate?: string;
  endDate?: string;
  // Stats
  totalSprintCount?: number;
  // Teams
  teams?: Team[];
  teamMembers?: TeamMember[];
  // Frontend-only properties
  selected?: boolean;
}

export interface Team {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  team: string;
}

// Backend DTOs
export interface ProjectTableDTO {
  id: string;
  name?: string;
  key?: string;
  status?: ProjectStatusDto;
  deliveryUnit?: DeliveryUnitDto;
  teamSize: number;
  projectManager?: ProjectManagerOption;
  isImportedFromJira?: boolean;
}

export interface ProjectStatusDto {
  id: number;
  name: string;
  description?: string;
}

export interface DeliveryUnitDto {
  id: number;
  name?: string;
  code?: string;
}

export interface ProjectManagerOption {
  id: number;
  name?: string;
}

export interface ProjectDTO {
  id: string;
  name: string;
  key: string;
  description: string;
  customerOrgName: string;
  customerDomainUrl: string;
  customerDescription: string;
  pocEmail: string;
  pocPhone: string;
  projectManagerId: number;
  projectManagerName: string;
  projectManagerRoleId: number;
  statusId: number;
  statusName: string;
  deliveryUnitId: number;
  deliveryUnitName: string;
  deliveryUnitCode: string;
  teamSize: number;
  sprintCount: number;
  additionalInformation: AdditionalInformationDTO[];
  teams: TeamResponseDTO[];
  isImportedFromJira?: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldDTO {
  name: string;
  value: string;
}

export interface AdditionalInformationDTO {
  id: string;
  name: string;
  value: string;
}

export interface TeamDTO {
  id: number;
  name: string;
}

export interface TeamResponseDTO {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  leadName: string | null;
  isActive: boolean;
}

export interface TeamMemberDTO {
  id: number;
  name: string;
  role: string;
  email: string;
  teamId: number;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Custom Field DTO for update requests
export interface CustomFieldDTO {
  id?: string; // GUID - Optional for new fields, required for updates
  name: string;
  value: string;
}

// Update Project Request DTO - based on backend UpdateProjectCommand structure
export interface UpdateProjectRequest {
  id: string; // Required - GUID format, backend expects ID in both URL and body
  name: string;
  key?: string; // Optional in backend
  description?: string; // Optional in backend
  customerOrgName?: string; // Optional in backend
  customerDomainUrl?: string;
  customerDescription?: string;
  pocEmail?: string; // Optional in backend
  pocPhone?: string;
  projectManagerId?: number; // Optional in backend
  projectManagerRoleId?: number;
  statusId?: number; // Optional in backend
  deliveryUnitId?: number; // Optional in backend
  createdBy?: number;
  metadata?: string; // JSON string - must be valid JSON
  templateId?: number;
  customFields?: CustomFieldDTO[]; // Custom fields collection
}

// Create Project Request DTO - based on API structure
export interface CreateProjectRequest {
  name: string;
  key: string;
  description: string;
  customerOrgName: string;
  customerDomainUrl?: string;
  customerDescription?: string;
  pocEmail: string;
  pocPhone?: string;
  projectManagerId: number;
  projectManagerRoleId?: number;
  statusId: number;
  deliveryUnitId: number;
  isImportedFromJira?: boolean;
}

export interface CustomField {
  id: string;
  name: string;
  value: string;
}

// User filter response for project manager dropdown
export interface UserFilterResponse {
  id: number;
  name: string;
  email?: string;
}

// Delivery unit response for dropdown
export interface DeliveryUnit {
  id: number;
  name: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private apiUrl = 'https://localhost:7178/api/Projects';
  private userApiUrl = 'https://localhost:7178/api/User';
  private deliveryUnitApiUrl = 'https://localhost:7178/api/delivery-unit';

  constructor(private http: HttpClient) {}

  getProjects(page: number = 1, pageSize: number = 10, searchTerm?: string, statusIds?: number[], deliveryUnitIds?: number[], projectManagerIds?: number[]): Observable<ApiResponse<PaginatedResponse<ProjectTableDTO>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    if (statusIds && statusIds.length > 0) {
      params = params.set('statusIds', statusIds.join(','));
    }

    if (deliveryUnitIds && deliveryUnitIds.length > 0) {
      params = params.set('deliveryUnitIds', deliveryUnitIds.join(','));
    }

    if (projectManagerIds && projectManagerIds.length > 0) {
      params = params.set('projectManagerIds', projectManagerIds.join(','));
    }

    return this.http.get<ApiResponse<PaginatedResponse<ProjectTableDTO>>>(this.apiUrl, { params }).pipe(
      timeout(30000), // Increased timeout to 30 seconds for initial loads
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            // Retry network errors (status 0) and timeouts up to 3 times
            if ((error instanceof HttpErrorResponse && error.status === 0) || error.name === 'TimeoutError') {
              if (index < 3) {
                console.log(`ProjectsService: Network/timeout error detected, retry attempt ${index + 1} after ${1000 * (index + 1)}ms`);
                // Exponential backoff: 1s, 2s, 3s
                return timer(1000 * (index + 1));
              }
            }
            // Don't retry other errors
            return throwError(() => error);
          })
        )
      )
    );
  }

  getProjectById(id: string): Observable<ApiResponse<ProjectDTO>> {
    return this.http.get<ApiResponse<ProjectDTO>>(`${this.apiUrl}/${id}`).pipe(
      timeout(10000), // 10 second timeout
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            // Only retry status 0 errors (CORS/network timing issues)
            if (error instanceof HttpErrorResponse && error.status === 0 && index < 3) {
              console.log(`ProjectsService: Status 0 detected, retry attempt ${index + 1} after ${index === 0 ? 0 : 500}ms`);
              // First retry immediately, subsequent retries with delay
              return timer(index === 0 ? 0 : 500);
            }
            // Don't retry other errors
            return throwError(() => error);
          })
        )
      )
    );
  }

  getUniqueProjectManagers(): Observable<ApiResponse<ProjectManagerOption[]>> {
    return this.http.get<ApiResponse<ProjectManagerOption[]>>(`${this.apiUrl}/managers`);
  }

  getTeamMembers(projectId: string, teamId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${projectId}/teams/${teamId}/members`
    ).pipe(
      timeout(10000), // 10 second timeout
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            // Only retry status 0 errors (CORS/network timing issues)
            if (error instanceof HttpErrorResponse && error.status === 0 && index < 3) {
              console.log(`ProjectsService: Status 0 detected, retry attempt ${index + 1} after ${index === 0 ? 0 : 500}ms`);
              // First retry immediately, subsequent retries with delay
              return timer(index === 0 ? 0 : 500);
            }
            // Don't retry other errors
            return throwError(() => error);
          })
        )
      )
    );
  }

  // Keep the old methods for backward compatibility, but they now call the API
  getProjectsOld(): Project[] {
    // This should not be used anymore, but kept for compatibility
    throw new Error('Use getProjects() method instead');
  }

  getProjectByIdOld(id: string): Project | undefined {
    // This should not be used anymore
    throw new Error('Use getProjectById() method instead');
  }

  /**
   * Create a new project
   * @param projectData Project data to create
   * @returns Observable with API response containing created project data
   */
  createProject(projectData: CreateProjectRequest): Observable<ApiResponse<ProjectDTO>> {
    console.log('ProjectsService: Creating new project');
    console.log('ProjectsService: Request payload:', JSON.stringify(projectData, null, 2));
    
    return this.http.post<ApiResponse<ProjectDTO>>(this.apiUrl, projectData).pipe(
      map(response => {
        console.log('ProjectsService: Create response received:', JSON.stringify(response, null, 2));
        return response;
      }),
      timeout(10000), // 10 second timeout
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            // Only retry status 0 errors (CORS/network timing issues)
            if (error instanceof HttpErrorResponse && error.status === 0 && index < 3) {
              console.log(`ProjectsService: Status 0 detected, retry attempt ${index + 1} after ${index === 0 ? 0 : 500}ms`);
              // First retry immediately, subsequent retries with delay
              return timer(index === 0 ? 0 : 500);
            }
            // Don't retry other errors
            return throwError(() => error);
          })
        )
      ),
      catchError(this.handleError)
    );
  }

  addProject(project: Project): void {
    // Deprecated: Use createProject() method instead
    throw new Error('Use createProject() method instead');
  }

  /**
   * Update an existing project
   * @param id Project ID to update (GUID format)
   * @param projectData Project data to update
   * @returns Observable with API response containing updated project data
   */
  updateProject(id: string, projectData: UpdateProjectRequest): Observable<ApiResponse<ProjectDTO>> {
    console.log('ProjectsService: Updating project with ID:', id);
    console.log('ProjectsService: Request payload:', JSON.stringify(projectData, null, 2));
    
    // Ensure ID consistency between URL and body
    if (projectData.id !== id) {
      console.warn('⚠️ ID mismatch detected:');
      console.warn('  - URL ID:', id);
      console.warn('  - Body ID:', projectData.id);
      console.warn('  - Correcting body ID to match URL');
      projectData.id = id;
    }
    
    return this.http.put<ApiResponse<ProjectDTO>>(`${this.apiUrl}/${id}`, projectData).pipe(
      map(response => {
        console.log('ProjectsService: Update response received:', JSON.stringify(response, null, 2));
        return response;
      }),
      timeout(10000), // 10 second timeout
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            // Only retry status 0 errors (CORS/network timing issues)
            if (error instanceof HttpErrorResponse && error.status === 0 && index < 3) {
              console.log(`ProjectsService: Status 0 detected, retry attempt ${index + 1} after ${index === 0 ? 0 : 500}ms`);
              // First retry immediately, subsequent retries with delay
              return timer(index === 0 ? 0 : 500);
            }
            // Don't retry other errors
            return throwError(() => error);
          })
        )
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Get filtered users for project manager dropdown
   * @param searchTerm Search term to filter users by name
   * @returns Observable with list of users
   */
  /**
   * Fetch all users for project manager dropdown (POST, empty body)
   */
  getAllUsers(): Observable<ApiResponse<UserFilterResponse[]>> {
    console.log('Making POST request to fetch all users:', `${this.userApiUrl}/filter`);
    return this.http.post<ApiResponse<UserFilterResponse[]>>(`${this.userApiUrl}/filter`, {}).pipe(
      timeout(10000),
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (error instanceof HttpErrorResponse && error.status === 0 && index < 3) {
              console.log(`ProjectsService: Status 0 detected, retry attempt ${index + 1} after ${index === 0 ? 0 : 500}ms`);
              return timer(index === 0 ? 0 : 500);
            }
            return throwError(() => error);
          })
        )
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Filter users by type and/or status (POST)
   * @param filters Object with optional type and status
   */
  getFilteredUsers(filters: { type?: string; status?: string } = {}): Observable<ApiResponse<UserFilterResponse[]>> {
    console.log('Making POST request to filter users:', `${this.userApiUrl}/filter`, filters);
    return this.http.post<ApiResponse<UserFilterResponse[]>>(`${this.userApiUrl}/filter`, filters).pipe(
      timeout(10000),
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (error instanceof HttpErrorResponse && error.status === 0 && index < 3) {
              console.log(`ProjectsService: Status 0 detected, retry attempt ${index + 1} after ${index === 0 ? 0 : 500}ms`);
              return timer(index === 0 ? 0 : 500);
            }
            return throwError(() => error);
          })
        )
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Test method to check if User filter endpoint exists
   * @returns Observable with API response
   */
  testUserFilterEndpoint(): Observable<any> {
    console.log('Testing user filter endpoint:', `${this.userApiUrl}/filter`);
    return this.http.get<any>(`${this.userApiUrl}/filter`).pipe(
      catchError(error => {
        console.error('User filter endpoint test failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if a project key is available (not used by other projects)
   * @param key Project key to check
   * @param currentProjectId Current project ID (excluded from check)
   * @returns Observable with availability status
   */
  checkProjectKeyAvailability(key: string, currentProjectId?: string): Observable<ApiResponse<{available: boolean}>> {
    let params = new HttpParams().set('key', key);
    if (currentProjectId) {
      params = params.set('excludeId', currentProjectId);
    }
    
    return this.http.get<ApiResponse<{available: boolean}>>(`${this.apiUrl}/check-key`, { params }).pipe(
      timeout(10000),
      catchError(error => {
        // If endpoint doesn't exist, assume key checking is not available
        console.warn('Project key checking not available:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all delivery units for dropdown
   * @returns Observable with list of delivery units (id, name, code only)
   */
  getDeliveryUnits(): Observable<ApiResponse<DeliveryUnit[]>> {
    return this.http.get<ApiResponse<DeliveryUnit[]>>(this.deliveryUnitApiUrl).pipe(
      map(response => ({
        ...response,
        data: response.data.map(du => ({
          id: du.id,
          name: du.name,
          code: du.code
        }))
      })),
      timeout(10000), // 10 second timeout
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            // Only retry status 0 errors (CORS/network timing issues)
            if (error instanceof HttpErrorResponse && error.status === 0 && index < 3) {
              console.log(`ProjectsService: Status 0 detected, retry attempt ${index + 1} after ${index === 0 ? 0 : 500}ms`);
              // First retry immediately, subsequent retries with delay
              return timer(index === 0 ? 0 : 500);
            }
            // Don't retry other errors
            return throwError(() => error);
          })
        )
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Create a new custom field for a project
   * @param projectId Project ID (GUID)
   * @param name Field name
   * @param value Field value
   * @returns Observable with the created custom field
   */
  createCustomField(projectId: string, name: string, value: string): Observable<ApiResponse<CustomFieldDTO>> {
    const request = {
      projectId: projectId,
      name: name,
      value: value
    };
    
    console.log('Creating custom field:', request);
    return this.http.post<ApiResponse<CustomFieldDTO>>('https://localhost:7178/api/customfields/create', request).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }

  /**
   * Delete a custom field
   * @param fieldId Custom field ID (GUID)
   * @returns Observable with deletion result
   */
  deleteCustomField(fieldId: string): Observable<ApiResponse<string>> {
    console.log('Deleting custom field:', fieldId);
    return this.http.delete<ApiResponse<string>>(`https://localhost:7178/api/customfields/delete/${fieldId}`).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }

  deleteProject(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`, {
      timeout: 10000 // 10 second timeout
    });
  }

  /**
   * Handle HTTP errors
   * @param error HTTP error response
   * @returns Observable error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
      
      // Log detailed error information for debugging
      console.error('=== HTTP ERROR DETAILS ===');
      console.error('Status:', error.status);
      console.error('Status Text:', error.statusText);
      console.error('URL:', error.url);
      console.error('Error Body:', error.error);
      console.error('Headers:', error.headers);
      console.error('=========================');
      
      if (error.error) {
        let serverResponse = '';
        if (typeof error.error === 'string') {
          serverResponse = error.error;
        } else if (error.error.message) {
          serverResponse = error.error.message;
        } else if (error.error.title) {
          serverResponse = error.error.title;
        } else if (error.error.errors) {
          serverResponse = `Validation Errors: ${JSON.stringify(error.error.errors)}`;
        } else {
          serverResponse = JSON.stringify(error.error);
        }
        
        // Check for specific database constraint violations
        if (serverResponse.includes('duplicate key value violates unique constraint') && 
            serverResponse.includes('IX_projects_key')) {
          errorMessage = `Project Key Conflict: The project key you're trying to use already exists. Please choose a different project key.`;
        } else if (serverResponse.includes('23505') && serverResponse.includes('unique constraint')) {
          errorMessage = `Data Conflict: The data you're trying to save conflicts with existing records. Please check for duplicate values.`;
        } else {
          errorMessage += `\nServer Response: ${serverResponse}`;
        }
      }
    }
    
    console.error('ProjectsService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}