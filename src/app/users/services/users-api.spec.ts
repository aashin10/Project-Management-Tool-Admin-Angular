import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { UsersApi, User, ApiResponse, ApiUser } from './users-api.js';

describe('UsersApi', () => {
  let service: UsersApi;
  let httpMock: HttpTestingController;

  // Sample test data
  const mockApiUsers: ApiUser[] = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice.johnson@company.com',
      created_At: '2025-09-23T10:00:00Z',
      type: 'Internal',
      status: 'Active',
      last_Login: '2025-09-25T15:30:00Z'
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob.smith@company.com',
      created_At: '2025-09-20T09:15:00Z',
      type: 'External',
      status: 'Active',
      last_Login: '2025-09-24T11:45:00Z'
    }
  ];

  const mockApiResponse: ApiResponse = {
    status: 200,
    data: mockApiUsers,
    message: 'Success'
  };

  const expectedTransformedUsers: User[] = [
    {
      user: 'Alice Johnson',
      email: 'alice.johnson@company.com',
      type: 'Internal',
      status: 'Active',
      created: '09/23/2025',
      lastActivity: '09/25/2025'
    },
    {
      user: 'Bob Smith',
      email: 'bob.smith@company.com',
      type: 'External',
      status: 'Active',
      created: '09/20/2025',
      lastActivity: '09/24/2025'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersApi]
    });
    service = TestBed.inject(UsersApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should return cached users if available', fakeAsync(() => {
      // First call to populate cache
      service.getUsers().subscribe();
      const req = httpMock.expectOne('https://localhost:7048/api/User');
      req.flush(mockApiResponse);
      tick();

      // Second call should return cached data
      let result: User[] | undefined;
      service.getUsers().subscribe(users => result = users);

      // Should not make another HTTP call
      httpMock.expectNone('https://localhost:7048/api/User');

      expect(result).toEqual(expectedTransformedUsers);
    }));

    it('should prevent multiple simultaneous API calls', fakeAsync(() => {
      // Start first call
      service.getUsers().subscribe();
      const req1 = httpMock.expectOne('https://localhost:7048/api/User');

      // Second call should return sample data without making another request
      let result: User[] | undefined;
      service.getUsers().subscribe(users => result = users);

      // Should not make a second HTTP call
      httpMock.expectNone('https://localhost:7048/api/User');

      expect(result).toBeDefined();
      expect(result!.length).toBeGreaterThan(0);

      // Complete first request
      req1.flush(mockApiResponse);
      tick();
    }));

    it('should make HTTP call when no cache exists', fakeAsync(() => {
      service.getUsers().subscribe(users => {
        expect(users).toEqual(expectedTransformedUsers);
      });

      const req = httpMock.expectOne('https://localhost:7048/api/User');
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);

      tick();
    }));

    it('should transform API response correctly', fakeAsync(() => {
      service.getUsers().subscribe(users => {
        expect(users).toEqual(expectedTransformedUsers);
        expect(users[0]).toEqual(jasmine.objectContaining({
          user: 'Alice Johnson',
          email: 'alice.johnson@company.com',
          type: 'Internal',
          status: 'Active'
        }));
      });

      const req = httpMock.expectOne('https://localhost:7048/api/User');
      req.flush(mockApiResponse);
      tick();
    }));

    it('should handle API errors and fall back to sample data', fakeAsync(() => {
      service.getUsers().subscribe(users => {
        expect(users).toBeDefined();
        expect(users.length).toBeGreaterThan(0);
        // Should have sample data structure
        expect(users[0]).toEqual(jasmine.objectContaining({
          user: jasmine.any(String),
          email: jasmine.any(String),
          type: jasmine.any(String),
          status: jasmine.any(String),
          created: jasmine.any(String),
          lastActivity: jasmine.any(String)
        }));
      });

      const req = httpMock.expectOne('https://localhost:7048/api/User');
      req.error(new ErrorEvent('network error'));
      tick();
    }));

    it('should handle invalid response format', fakeAsync(() => {
      const invalidResponse = { status: 200, data: null };

      service.getUsers().subscribe(users => {
        expect(users).toBeDefined();
        expect(users.length).toBeGreaterThan(0);
        // Should fall back to sample data
      });

      const req = httpMock.expectOne('https://localhost:7048/api/User');
      req.flush(invalidResponse);
      tick();
    }));

    it('should cache successful responses', fakeAsync(() => {
      // First call
      service.getUsers().subscribe();
      httpMock.expectOne('https://localhost:7048/api/User').flush(mockApiResponse);
      tick();

      // Spy on http client to ensure no second call
      spyOn(service['http'], 'get');

      // Second call should use cache
      service.getUsers().subscribe(users => {
        expect(users).toEqual(expectedTransformedUsers);
      });

      expect(service['http'].get).not.toHaveBeenCalled();
    }));
  });

  describe('refreshUsers', () => {
    it('should clear cache and fetch fresh data', fakeAsync(() => {
      // Populate cache first
      service.getUsers().subscribe();
      httpMock.expectOne('https://localhost:7048/api/User').flush(mockApiResponse);
      tick();

      // Call refresh
      service.refreshUsers().subscribe(users => {
        expect(users).toEqual(expectedTransformedUsers);
      });

      // Should make new HTTP call
      const req = httpMock.expectOne('https://localhost:7048/api/User');
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
      tick();
    }));

    it('should handle refresh errors gracefully', fakeAsync(() => {
      service.refreshUsers().subscribe(users => {
        expect(users).toBeDefined();
        expect(users.length).toBeGreaterThan(0);
        // Should fall back to sample data
      });

      const req = httpMock.expectOne('https://localhost:7048/api/User');
      req.error(new ErrorEvent('network error'));
      tick();
    }));
  });

  describe('formatDate', () => {
    it('should format dates and return strings', fakeAsync(() => {
      // Create a date that is definitely in the past (older format)
      const pastDate = new Date('2023-01-15T10:00:00Z');
      const mockApiUser: ApiUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        created_At: pastDate.toISOString(),
        type: 'Internal',
        status: 'Active',
        last_Login: pastDate.toISOString()
      };

      service.getUsers().subscribe(users => {
        // Should format as MM/DD/YYYY for older dates
        expect(users[0].created).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
        expect(users[0].lastActivity).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
        expect(typeof users[0].created).toBe('string');
        expect(typeof users[0].lastActivity).toBe('string');
      });

      const req = httpMock.expectOne('https://localhost:7048/api/User');
      req.flush({ status: 200, data: [mockApiUser] });
      tick();
    }));

    it('should format older dates as MM/DD/YYYY', fakeAsync(() => {
      const date = new Date('2025-09-23T10:00:00Z');
      const mockApiUser: ApiUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        created_At: date.toISOString(),
        type: 'Internal',
        status: 'Active',
        last_Login: date.toISOString()
      };

      service.getUsers().subscribe(users => {
        expect(users[0].created).toBe('09/23/2025');
        expect(users[0].lastActivity).toBe('09/23/2025');
      });

      const req = httpMock.expectOne('https://localhost:7048/api/User');
      req.flush({ status: 200, data: [mockApiUser] });
      tick();
    }));

    it('should handle empty date string', fakeAsync(() => {
      const mockApiUser: ApiUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        created_At: '',
        type: 'Internal',
        status: 'Active',
        last_Login: ''
      };

      service.getUsers().subscribe(users => {
        expect(users[0].created).toBe('');
        expect(users[0].lastActivity).toBe('');
      });

      const req = httpMock.expectOne('https://localhost:7048/api/User');
      req.flush({ status: 200, data: [mockApiUser] });
      tick();
    }));

    it('should format current dates appropriately', fakeAsync(() => {
      const currentDate = new Date();
      const mockApiUser: ApiUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        created_At: currentDate.toISOString(),
        type: 'Internal',
        status: 'Active',
        last_Login: currentDate.toISOString()
      };

      service.getUsers().subscribe(users => {
        // Should return some string format (Today, Yesterday, X days ago, or MM/DD/YYYY)
        expect(users[0].created).toBeDefined();
        expect(users[0].lastActivity).toBeDefined();
        expect(typeof users[0].created).toBe('string');
        expect(typeof users[0].lastActivity).toBe('string');
        // Should not be empty
        expect(users[0].created.length).toBeGreaterThan(0);
        expect(users[0].lastActivity.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne('https://localhost:7048/api/User');
      req.flush({ status: 200, data: [mockApiUser] });
      tick();
    }));
  });

  describe('getSampleUsers', () => {
    it('should return sample users when API fails', fakeAsync(() => {
      service.getUsers().subscribe(users => {
        expect(users).toBeDefined();
        expect(users.length).toBeGreaterThan(0);
        // Should have sample data structure
        expect(users[0]).toEqual(jasmine.objectContaining({
          user: jasmine.any(String),
          email: jasmine.any(String),
          type: jasmine.any(String),
          status: jasmine.any(String),
          created: jasmine.any(String),
          lastActivity: jasmine.any(String)
        }));
        // Check specific sample data
        expect(users.length).toBe(5);
        expect(users[0].user).toBe('Alice Johnson');
        expect(users[1].user).toBe('Bob Smith');
      });

      const req = httpMock.expectOne('https://localhost:7048/api/User');
      req.error(new ErrorEvent('network error'));
      tick();
    }));

    it('should cache sample data when API fails', fakeAsync(() => {
      // First call - should get sample data
      service.getUsers().subscribe();
      httpMock.expectOne('https://localhost:7048/api/User').error(new ErrorEvent('network error'));
      tick();

      // Second call should return cached sample data
      service.getUsers().subscribe(users => {
        expect(users.length).toBe(5);
        expect(users[0].user).toBe('Alice Johnson');
      });

      // Should not make another HTTP call
      httpMock.expectNone('https://localhost:7048/api/User');
    }));
  });

  describe('Integration tests', () => {
    it('should handle multiple refresh calls correctly', fakeAsync(() => {
      // First refresh
      service.refreshUsers().subscribe();
      httpMock.expectOne('https://localhost:7048/api/User').flush(mockApiResponse);
      tick();

      // Second refresh should make another API call
      service.refreshUsers().subscribe(users => {
        expect(users).toEqual(expectedTransformedUsers);
      });

      const req = httpMock.expectOne('https://localhost:7048/api/User');
      req.flush(mockApiResponse);
      tick();
    }));

    it('should maintain cache after successful API call', fakeAsync(() => {
      // Make API call
      service.getUsers().subscribe();
      httpMock.expectOne('https://localhost:7048/api/User').flush(mockApiResponse);
      tick();

      // Verify cache is set
      expect((service as any).cachedUsers).toEqual(expectedTransformedUsers);

      // Subsequent calls should use cache
      service.getUsers().subscribe(users => {
        expect(users).toEqual(expectedTransformedUsers);
      });
      httpMock.expectNone('https://localhost:7048/api/User');
    }));
  });
});
