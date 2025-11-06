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
    },
    {
      id: 3,
      name: 'Carol Williams',
      email: 'carol.williams@company.com',
      created_At: '2025-09-15T08:00:00Z',
      type: 'Internal',
      status: 'Inactive',
      last_Login: '2025-09-20T10:00:00Z'
    },
    {
      id: 4,
      name: 'David Brown',
      email: 'david.brown@company.com',
      created_At: '2025-09-10T07:30:00Z',
      type: 'Customer',
      status: 'Active',
      last_Login: '2025-09-23T12:00:00Z'
    },
    {
      id: 5,
      name: 'Emma Davis',
      email: 'emma.davis@company.com',
      created_At: '2025-09-05T06:00:00Z',
      type: 'Internal',
      status: 'Active',
      last_Login: '2025-09-22T14:00:00Z'
    }
  ];

  const mockApiResponse: ApiResponse = {
    status: 200,
    data: mockApiUsers,
    message: 'Success'
  };

  const expectedTransformedUsers: User[] = [
    {
      id: 1,
      user: 'Alice Johnson',
      email: 'alice.johnson@company.com',
      type: 'Internal',
      status: 'Active',
      created: '09/23/2025',
      lastActivity: '09/25/2025'
    },
    {
      id: 2,
      user: 'Bob Smith',
      email: 'bob.smith@company.com',
      type: 'External',
      status: 'Active',
      created: '09/20/2025',
      lastActivity: '09/24/2025'
    },
    {
      id: 3,
      user: 'Carol Williams',
      email: 'carol.williams@company.com',
      type: 'Internal',
      status: 'Inactive',
      created: '09/15/2025',
      lastActivity: '09/20/2025'
    },
    {
      id: 4,
      user: 'David Brown',
      email: 'david.brown@company.com',
      type: 'Customer',
      status: 'Active',
      created: '09/10/2025',
      lastActivity: '09/23/2025'
    },
    {
      id: 5,
      user: 'Emma Davis',
      email: 'emma.davis@company.com',
      type: 'Internal',
      status: 'Active',
      created: '09/05/2025',
      lastActivity: '09/22/2025'
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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should return cached users if available', fakeAsync(() => {
      // First call to populate cache
      service.getUsers().subscribe();
      const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
      req.flush(mockApiResponse);
      tick();

      // Second call should return cached data
      let result: User[] | undefined;
      service.getUsers().subscribe(users => result = users);

      // Should not make another HTTP call
      httpMock.expectNone('https://localhost:7178/api/User/filter');

      expect(result).toEqual(expectedTransformedUsers);
    }));

    it('should prevent multiple simultaneous API calls', fakeAsync(() => {
      let firstResult: User[] | undefined;
      let secondResult: User[] | undefined;

      // Start first call
      service.getUsers().subscribe(users => firstResult = users);
      const req1 = httpMock.expectOne('https://localhost:7178/api/User/filter');

      // Second call should return the same observable without making another request
      service.getUsers().subscribe(users => secondResult = users);

      // Should not make a second HTTP call
      httpMock.expectNone('https://localhost:7178/api/User/filter');

      // Complete first request
      req1.flush(mockApiResponse);
      tick();
      
      // Now both results should be populated
      expect(firstResult).toEqual(expectedTransformedUsers);
      expect(secondResult).toEqual(expectedTransformedUsers);

      httpMock.verify();
    }));

    it('should make HTTP call when no cache exists', fakeAsync(() => {
      service.getUsers().subscribe(users => {
        expect(users).toEqual(expectedTransformedUsers);
      });

  const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
  expect(req.request.method).toBe('POST');
  req.flush(mockApiResponse);

      tick();

      httpMock.verify();
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

  const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
  req.flush(mockApiResponse);
      tick();

      httpMock.verify();
    }));

    it('should handle API errors appropriately', fakeAsync(() => {
      let errorReceived = false;
      let actualError: Error | null = null;
      
      service.getUsers().subscribe({
        next: () => fail('should not succeed'),
        error: (err) => {
          errorReceived = true;
          actualError = err;
        }
      });

      const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
      req.error(new ErrorEvent('network error'));
      
      // Account for retryWhen delays
      tick(0);  // First retry
      const req2 = httpMock.expectOne('https://localhost:7178/api/User/filter');
      req2.error(new ErrorEvent('network error'));
      
      tick(500);  // Second retry with delay
      const req3 = httpMock.expectOne('https://localhost:7178/api/User/filter');
      req3.error(new ErrorEvent('network error'));
      
      tick(500);  // Third retry with delay
      const req4 = httpMock.expectOne('https://localhost:7178/api/User/filter');
      req4.error(new ErrorEvent('network error'));
      
      tick(500); // Final error should propagate

      expect(errorReceived).toBe(true);
      expect(actualError).toBeDefined();
    }));

    it('should handle invalid response format', fakeAsync(() => {
      const invalidResponse = { status: 200, data: null };
      let errorReceived = false;
      let errorMessage = '';
      
      service.getUsers().subscribe({
        next: () => fail('should not succeed'),
        error: (err: Error) => {
          errorReceived = true;
          errorMessage = err.message;
        }
      });

      const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
      req.flush(invalidResponse);
      tick();

      expect(errorReceived).toBe(true);
      expect(errorMessage).toBe('Invalid response from server.');
    }));

    it('should cache successful responses', fakeAsync(() => {
      // First call
      service.getUsers().subscribe();
      httpMock.expectOne('https://localhost:7178/api/User/filter').flush(mockApiResponse);
      tick();

      // Spy on http client to ensure no second call
      const httpSpy = spyOn(service['http'], 'post').and.callThrough();

      // Second call should use cache
      service.getUsers().subscribe(users => {
        expect(users).toEqual(expectedTransformedUsers);
      });

      expect(httpSpy).not.toHaveBeenCalled();
    }));
  });

  describe('refreshUsers', () => {
    it('should clear cache and fetch fresh data', fakeAsync(() => {
      // Populate cache first
      service.getUsers().subscribe();
      const req1 = httpMock.expectOne('https://localhost:7178/api/User/filter');
      expect(req1.request.method).toBe('POST');
      req1.flush(mockApiResponse);
      tick();

      // Call refresh
      service.refreshUsers().subscribe(users => {
        expect(users).toEqual(expectedTransformedUsers);
      });

      // Should make new HTTP call
  const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
  expect(req.request.method).toBe('POST');
  req.flush(mockApiResponse);
      tick();
    }));

    it('should handle refresh errors appropriately', fakeAsync(() => {
      let errorReceived = false;
      let actualError: Error | null = null;

      service.refreshUsers().subscribe({
        next: () => fail('should not succeed'),
        error: (err) => {
          errorReceived = true;
          actualError = err;
        }
      });

      // Initial request
      const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
      expect(req.request.method).toBe('POST');
      req.error(new ErrorEvent('network error'));
      
      // First retry (immediate)
      tick(0);
      const req2 = httpMock.expectOne('https://localhost:7178/api/User/filter');
      expect(req2.request.method).toBe('POST');
      req2.error(new ErrorEvent('network error'));
      
      // Second retry (500ms delay)
      tick(500);
      const req3 = httpMock.expectOne('https://localhost:7178/api/User/filter');
      expect(req3.request.method).toBe('POST');
      req3.error(new ErrorEvent('network error'));
      
      // Third retry (500ms delay)
      tick(500);
      const req4 = httpMock.expectOne('https://localhost:7178/api/User/filter');
      expect(req4.request.method).toBe('POST');
      req4.error(new ErrorEvent('network error'));
      
      // Final error propagation
      tick(500);

      expect(errorReceived).toBe(true);
      expect(actualError).toBeDefined();
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

  const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
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

  const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
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

  const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
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

      const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
      expect(req.request.method).toBe('POST');
      req.flush({ status: 200, data: [mockApiUser] });
      tick();
    }));
  });



  describe('Integration tests', () => {
    it('should handle multiple refresh calls correctly', fakeAsync(() => {
      // First refresh
      service.refreshUsers().subscribe();
  httpMock.expectOne('https://localhost:7178/api/User/filter').flush(mockApiResponse);
      tick();

      // Second refresh should make another API call
      service.refreshUsers().subscribe(users => {
        expect(users).toEqual(expectedTransformedUsers);
      });

  const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
  req.flush(mockApiResponse);
      tick();
    }));

    it('should maintain cache after successful API call', fakeAsync(() => {
      // Make API call
      service.getUsers().subscribe();
      const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
      expect(req.request.method).toBe('POST');
      req.flush(mockApiResponse);
      tick();

      // Verify cache is set
      expect((service as any).cachedUsers).toEqual(expectedTransformedUsers);

      // Subsequent calls should use cache
      service.getUsers().subscribe(users => {
        expect(users).toEqual(expectedTransformedUsers);
      });
      httpMock.expectNone('https://localhost:7178/api/User/filter');
    }));
  });
});
