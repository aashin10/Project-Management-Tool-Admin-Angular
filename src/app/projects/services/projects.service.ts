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
  name?: string;
  key?: string;
  description?: string;
  customerOrgName?: string;
  customerDomainUrl?: string;
  customerDescription?: string;
  pocEmail?: string;
  pocPhone?: string;
  projectManagerId?: number;
  projectManagerName?: string;
  projectManagerRoleId?: number;
  statusId?: number;
  statusName?: string;
  deliveryUnitId?: number;
  deliveryUnitName?: string;
  deliveryUnitCode?: string;
  teamSize: number;
  sprintCount: number;
  additionalInformation: CustomFieldDTO[];
  teams: TeamDTO[];
  teamMembers: TeamMemberDTO[];
  isImportedFromJira?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomFieldDTO {
  name: string;
  value: string;
}

export interface TeamDTO {
  id: number;
  name: string;
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

// Update Project Request DTO
export interface UpdateProjectRequest {
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
  projectManagerRoleId: number;
  statusId: number;
  deliveryUnitId: number;
  createdBy: number;
  metadata: string;
  templateId: number;
  customFields: CustomField[];
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

  addProject(project: Project): void {
    // TODO: Implement API call
  }

  /**
   * Update an existing project
   * @param id Project ID to update
   * @param projectData Project data to update
   * @returns Observable with API response
   */
  updateProject(id: string, projectData: UpdateProjectRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, projectData).pipe(
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
  getFilteredUsers(searchTerm?: string): Observable<ApiResponse<UserFilterResponse[]>> {
    let params = new HttpParams();
    
    if (searchTerm && searchTerm.trim()) {
      // Try different parameter names in case backend expects something different
      params = params.set('searchTerm', searchTerm.trim());
      // Alternative parameter names to try if above doesn't work:
      // params = params.set('search', searchTerm.trim());
      // params = params.set('query', searchTerm.trim());
      // params = params.set('name', searchTerm.trim());
    }
    
    console.log('Making user search request to:', `${this.userApiUrl}/filter`, 'with params:', params.toString());

    return this.http.get<ApiResponse<UserFilterResponse[]>>(`${this.userApiUrl}/filter`, { params }).pipe(
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
      if (error.error?.message) {
        errorMessage += `\nServer Message: ${error.error.message}`;
      }
    }
    
    console.error('ProjectsService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}