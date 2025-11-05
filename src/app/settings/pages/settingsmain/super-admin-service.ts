import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuperAdminDTO {
  id?: number;
  isSuperAdmin?: boolean;
  name: string;
  email: string;
  isActive: boolean;
  createdAt?: string;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private apiUrl = 'https://localhost:7178/api/SuperAdmin';

  constructor(private http: HttpClient) {}

  /**
   * Get all super admins
   */
  getAllSuperAdmins(): Observable<SuperAdminDTO[]> {
    return this.http.get<ApiResponse<SuperAdminDTO[]>>(this.apiUrl, {
      headers: new HttpHeaders({
        'accept': 'text/plain'
      })
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get super admin by ID
   */
  getSuperAdminById(id: number): Observable<SuperAdminDTO> {
    return this.http.get<ApiResponse<SuperAdminDTO>>(`${this.apiUrl}/${id}`, {
      headers: new HttpHeaders({
        'accept': 'text/plain'
      })
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Add new super admin
   */
  addSuperAdmin(admin: SuperAdminDTO): Observable<SuperAdminDTO> {
    return this.http.post<ApiResponse<SuperAdminDTO>>(this.apiUrl, admin, {
      headers: new HttpHeaders({
        'accept': 'text/plain',
        'Content-Type': 'application/json'
      })
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update existing super admin
   */
  updateSuperAdmin(id: number, admin: SuperAdminDTO): Observable<SuperAdminDTO> {
    return this.http.put<ApiResponse<SuperAdminDTO>>(`${this.apiUrl}/${id}`, admin, {
      headers: new HttpHeaders({
        'accept': 'text/plain',
        'Content-Type': 'application/json'
      })
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete super admin
   */
  deleteSuperAdmin(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`, {
      headers: new HttpHeaders({
        'accept': 'text/plain'
      })
    }).pipe(
      map(response => response.data)
    );
  }
}