import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
  private apiUrl = 'api/status/project-statuses';

  constructor(private http: HttpClient) {}

  getStatuses(): Observable<ProjectStatus[]> {
    return this.http.get<{ status: number; data: ProjectStatusApiResponse[]; message: string }>(this.apiUrl)
      .pipe(
        map(response => response.data.map(status => ({
          id: status.id,
          code: status.name,  // Map backend 'name' to frontend 'code'
          name: status.name,  // Map backend 'name' to frontend 'name'
          description: status.description
        })))
      );
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