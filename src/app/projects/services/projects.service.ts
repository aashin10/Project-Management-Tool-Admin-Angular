import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private apiUrl = 'http://localhost:5291/api/Projects';

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

    return this.http.get<ApiResponse<PaginatedResponse<ProjectTableDTO>>>(this.apiUrl, { params, timeout: 10000 });
  }

  getProjectById(id: string): Observable<ApiResponse<ProjectDTO>> {
    return this.http.get<ApiResponse<ProjectDTO>>(`${this.apiUrl}/${id}`, {
      timeout: 10000 // 10 second timeout
    });
  }

  getUniqueProjectManagers(): Observable<ApiResponse<ProjectManagerOption[]>> {
    return this.http.get<ApiResponse<ProjectManagerOption[]>>(`${this.apiUrl}/managers`);
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

  updateProject(id: string, updatedProject: Partial<Project>): boolean {
    // TODO: Implement API call
    return false;
  }

  deleteProject(id: string): boolean {
    // TODO: Implement API call
    return false;
  }
}