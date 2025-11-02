

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  userCount?: number;
  createdAt?: string;
  status?: 'Active' | 'Inactive';
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = 'https://localhost:7178/api/Roles';

  constructor(private http: HttpClient) {}

  /**
   * Fetch roles from backend API with pagination
   * Maps backend fields to Role interface for frontend
   */
  fetchRoles(page: number = 1, pageSize: number = 10): Observable<Role[]> {
    const url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        // If response is { data: Role[], ... } or just Role[]
        const rolesFromApi = Array.isArray(response) ? response : response.data || [];
        return rolesFromApi.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          permissions: r.permissions || [],
          userCount: r.userCount ?? 0,
          createdAt: r.createdAt,
          status: r.status
        }));
      })
    );
  }

  /**
   * Create a new role in the backend
   */
  createRole(role: Partial<Role>): Observable<any> {
    return this.http.post(this.apiUrl, role);
  }

  /**
   * Update a role in the backend
   */
  updateRole(id: string, role: Partial<Role>): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    console.log('🌐 RolesService.updateRole()');
    console.log('  URL:', url);
    console.log('  Request body:', JSON.stringify(role, null, 2));
    
    return this.http.put(url, role).pipe(
      map(response => {
        console.log('🌐 RolesService HTTP response:', JSON.stringify(response, null, 2));
        return response;
      })
    );
  }

  /**
   * Delete a role in the backend
   */
  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Fetch all permissions from backend API
   */
  fetchPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>('https://localhost:7178/api/Permissions');
  }
}
