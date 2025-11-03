import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JiraApi {
  private apiUrl = 'https://localhost:7178/api';

  constructor(private http: HttpClient) {}

  importProjectsFromJira(jiraUrl: string, apiToken: string, projectIds: string[]): Observable<any> {
    const encodedUrl = encodeURIComponent(`https://api.atlassian.com/ex/jira/${jiraUrl}`);
    const query = `projectIds=${projectIds.join(',')}`; // 👈 Comma-separated

    const headers = {
      'Jira-Access-Token': apiToken,
    };

    const fullUrl = `${this.apiUrl}/Jira/import/${encodedUrl}?${query}`;
    return this.http.get<any>(fullUrl, { headers });
  }

  uploadUsersCsv(users: any): Observable<any> {
    const fullUrl = `${this.apiUrl}/User/jira-import`;
    return this.http.post<any>(fullUrl, { users });
  }
}
