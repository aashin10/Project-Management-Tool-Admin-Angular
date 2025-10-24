import { Injectable } from '@angular/core';

export interface ProjectStatus {
  code: string;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectStatusService {
  private statuses: ProjectStatus[] = [
    { code: 'Active', name: 'Active', description: 'Project is currently in progress' },
    { code: 'Inactive', name: 'Inactive', description: 'Project is temporarily paused' },
    { code: 'Completed', name: 'Completed', description: 'Project has been finished' }
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

  getStatusNames(): string[] {
    return this.statuses.map(status => status.name);
  }
}