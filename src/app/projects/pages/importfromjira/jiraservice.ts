import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Jiraservice {
  constructor(private http: HttpClient) {}

  async exchangeToken(authCode: string): Promise<any> {
    const url = 'https://auth.atlassian.com/oauth/token';

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', 'LlEIudxhc8hSon7CNwnNblzfGamJVvu2')
      .set(
        'client_secret',
        'ATOAtHqkou0PXZwlWeOCJXNq9oWDhAvZqY2aai98hLSFoWfWkBeJerdfHT95OCyRUh4P19C29ADE'
      )
      .set('code', authCode)
      .set('redirect_uri', 'http://localhost:4200/projects/importfromjira');
    console.log('Token exchange running in:', typeof window !== 'undefined' ? 'browser' : 'server');
    try {
      const response = await this.http
        .post(url, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        .toPromise();

      console.log('Access token from HttpClient:', response);
      return response;
    } catch (error) {
      console.error('Token exchange failed:', error);
      throw error;
    }
  }

  async getAccessibleResources(token: string) {
    return this.http
      .get<any[]>('https://api.atlassian.com/oauth/token/accessible-resources', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .toPromise();
  }

  async fetchJiraProjects(accessToken: string, cloudId: string) {
    const response = await this.http
      .get<any[]>(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .toPromise();

    return response;
  }
}
