import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JiraApi {
  private apiUrl = 'https://localhost:7178/api/Jira';

  constructor(private http: HttpClient) {}

  importProjectsFromJira(jiraUrl: string, apiToken: string, projectIds: string[]): Observable<any> {
    const encodedUrl = encodeURIComponent('https://api.atlassian.com/ex/jira/' + jiraUrl);
    const query = projectIds.map((id) => `projectIds=${encodeURIComponent(id)}`).join('&');

    const headers = {
      'Jira-Access-Token': apiToken,
    };

    return this.http.get<any>(`${this.apiUrl}/import/${encodedUrl}?${query}`, { headers });
  }
}
