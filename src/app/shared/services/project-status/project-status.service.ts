import { Injectable } from '@angular/core';

export interface ProjectStatus {
  id: number;
  code: string;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectStatusService {
  private statuses: ProjectStatus[] = [
    { id: 1, code: 'Active', name: 'Active', description: 'Project is currently in progress' },
    { id: 2, code: 'Inactive', name: 'Inactive', description: 'Project is temporarily paused' },
    { id: 3, code: 'Completed', name: 'Completed', description: 'Project has been finished' }
  ];

  getStatuses(): ProjectStatus[] {
    return this.statuses;
  }

  getStatusByCode(code: string): ProjectStatus | undefined {
    return this.statuses.find(status => status.code === code);
  }

  getStatusCodes(): string[] {
    return this.statuses.map(status => status.code);
  }

  getStatusIds(): number[] {
    return this.statuses.map(status => status.id);
  }

  getStatusById(id: number): ProjectStatus | undefined {
    return this.statuses.find(status => status.id === id);
  }
}