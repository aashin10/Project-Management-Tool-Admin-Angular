import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JiraService {
  constructor(private http: HttpClient) {}

  async exchangeToken(authCode: string): Promise<any> {
    const url = environment.jiraTokenExchangeUrl;

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', environment.jiraClientId)
      .set('client_secret', environment.jiraClientSecret)
      .set('code', authCode)
      .set('redirect_uri', environment.jiraRedirectUri);
    try {
      const response = await this.http
        .post(url, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        .toPromise();
      return response;
    } catch (error) {
      throw new Error('Token exchange failed');
    }
  }

  async getAccessibleResources(token: string): Promise<AccessibleResource[]> {
    try {
      const response = await this.http
        .get<AccessibleResource[]>(environment.jiraGetAccessibleResourcesUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .toPromise();
      return response ?? [];
    } catch (error) {
      throw new Error('Failed to fetch accessible resources');
    }
  }

  async fetchJiraProjects(accessToken: string, cloudId: string): Promise<ImportProjectMinimal[]> {
    try {
      const response = await this.http
        .get<ImportProjectMinimal[]>(
          `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .toPromise();
      console.log('Fetched Projects:', response);
      return response ?? [];
    } catch (error) {
      throw new Error('Failed to fetch Jira projects');
    }
  }
}
