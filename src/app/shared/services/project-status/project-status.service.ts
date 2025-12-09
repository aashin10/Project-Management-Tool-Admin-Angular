import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, shareReplay } from 'rxjs';

export interface ProjectStatus {
  id: number;
  code: string;
  name: string;
  description?: string;
}

interface ProjectStatusApiResponse {
  id: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectStatusService {
  // Use the same backend base URL as other services (e.g., ProjectsService)
  private apiUrl = 'https://localhost:7178/api/status/project-statuses';
  private cachedStatuses$?: Observable<ProjectStatus[]>;

  constructor(private http: HttpClient) {}

  getStatuses(): Observable<ProjectStatus[]> {
    if (!this.cachedStatuses$) {
      this.cachedStatuses$ = this.http
        .get<{ status: number; data: ProjectStatusApiResponse[]; message: string }>(this.apiUrl)
        .pipe(
          map(response => (response?.data || []).map(status => ({
            id: status.id,
            code: status.name,  // Map backend 'name' to frontend 'code'
            name: status.name,  // Map backend 'name' to frontend 'name'
            description: status.description
          }))),
          catchError(err => {
            return of<ProjectStatus[]>([]);
          }),
          shareReplay(1)
        );
    }
    return this.cachedStatuses$;
  }

  getStatusByCode(code: string): Observable<ProjectStatus | undefined> {
    return this.getStatuses().pipe(
      map(statuses => statuses.find(status => status.code === code))
    );
  }

  getStatusCodes(): Observable<string[]> {
    return this.getStatuses().pipe(
      map(statuses => statuses.map(status => status.code))
    );
  }

  getStatusIds(): Observable<number[]> {
    return this.getStatuses().pipe(
      map(statuses => statuses.map(status => status.id))
    );
  }

  getStatusById(id: number): Observable<ProjectStatus | undefined> {
    return this.getStatuses().pipe(
      map(statuses => statuses.find(status => status.id === id))
    );
  }
}