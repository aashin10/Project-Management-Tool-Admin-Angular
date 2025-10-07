import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Jiraservice } from './jiraservice';

describe('JiraService', () => {
  let service: Jiraservice;
  let httpMock: HttpTestingController;

  const token = 'test-token';
  const cloudId = 'cloud-id-1';
  const authCode = 'auth-code-123';
  const apiUrl = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`;
  const tokenUrl = 'https://auth.atlassian.com/oauth/token';
  const resourcesUrl = 'https://api.atlassian.com/oauth/token/accessible-resources';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Jiraservice],
    });

    service = TestBed.inject(Jiraservice);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('exchangeToken', () => {
    it('should exchange auth code for access token successfully', async () => {
      const mockResponse = { access_token: 'new-token', token_type: 'Bearer' };

      const promise = service.exchangeToken(authCode);

      const req = httpMock.expectOne(tokenUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
      expect(req.request.body).toContain('grant_type=authorization_code');
      expect(req.request.body).toContain(`code=${authCode}`);

      req.flush(mockResponse);

      const response = await promise;
      expect(response).toEqual(mockResponse);
    });

    it('should handle token exchange failure', async () => {
      const errorMessage = 'Invalid grant';

      const promise = service.exchangeToken(authCode).catch((error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      });

      const req = httpMock.expectOne(tokenUrl);
      req.flush({ error: errorMessage }, { status: 400, statusText: 'Bad Request' });

      await promise;
    });
  });

  describe('getAccessibleResources', () => {
    it('should fetch accessible resources successfully', async () => {
      const mockResources = [{ id: 'cloud-1', name: 'Cloud Instance 1' }];

      const promise = service.getAccessibleResources(token);

      const req = httpMock.expectOne(resourcesUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

      req.flush(mockResources);

      const response = await promise;
      expect(response).toEqual(mockResources);
    });

    it('should handle 403 Forbidden error for getAccessibleResources', async () => {
      const errorMessage = 'Forbidden';

      const promise = service.getAccessibleResources(token).catch((error) => {
        expect(error.status).toBe(403);
        expect(error.statusText).toBe(errorMessage);
      });

      const req = httpMock.expectOne(resourcesUrl);
      req.flush({ message: errorMessage }, { status: 403, statusText: errorMessage });

      await promise;
    });

    it('should handle empty resources list', async () => {
      const mockResources: any[] = [];

      const promise = service.getAccessibleResources(token);

      const req = httpMock.expectOne(resourcesUrl);
      req.flush(mockResources);

      const response = await promise;
      expect(response).toEqual([]);
    });
  });

  describe('fetchJiraProjects', () => {
    it('should fetch Jira projects successfully', async () => {
      const mockProjects = [{ id: '1', name: 'Project A' }];

      const promise = service.fetchJiraProjects(token, cloudId);

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

      req.flush(mockProjects);

      const response = await promise;
      expect(response).toEqual(mockProjects);
    });

    it('should handle 401 Unauthorized error', async () => {
      const errorMessage = 'Unauthorized';

      const promise = service.fetchJiraProjects(token, cloudId).catch((error) => {
        console.log(error);
        expect(error.status).toBe(401);
        expect(error.statusText).toBe(errorMessage);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: errorMessage }, { status: 401, statusText: errorMessage });

      await promise;
    });

    it('should handle 500 Internal Server Error', async () => {
      const errorMessage = 'Internal Server Error';

      const promise = service.fetchJiraProjects(token, cloudId).catch((error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe(errorMessage);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: errorMessage }, { status: 500, statusText: errorMessage });

      await promise;
    });

    it('should handle empty project list', async () => {
      const mockProjects: any[] = [];

      const promise = service.fetchJiraProjects(token, cloudId);

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockProjects);

      const response = await promise;
      expect(response).toEqual([]);
    });
  });
});
