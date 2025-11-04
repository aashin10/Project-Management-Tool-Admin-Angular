import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { Authentication } from './authentication';

describe('Authentication', () => {
  let service: Authentication;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  const apiUrl = 'https://localhost:7178/api';

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        Authentication,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(Authentication);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and store tokens', (done) => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600
        }
      };

      service.login('test@example.com', 'password').subscribe(response => {
        expect(response.status).toBe(200);
        expect(response.data.accessToken).toBe('mock-access-token');
        expect(localStorage.getItem('access_token')).toBe('mock-access-token');
        expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/Auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.email).toBe('test@example.com');
      req.flush(mockResponse);
      
      httpMock.match(`${apiUrl}/Auth/me`);
    });

    it('should trim and lowercase email', () => {
      service.login('  Test@Example.COM  ', 'password').subscribe();
      
      const req = httpMock.expectOne(`${apiUrl}/Auth/login`);
      expect(req.request.body.email).toBe('test@example.com');
      req.flush({ status: 200, message: '', data: { accessToken: '', refreshToken: '' }});
      httpMock.match(`${apiUrl}/Auth/me`);
    });

    it('should handle login error', (done) => {
      service.login('test@example.com', 'wrong').subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/Auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should logout successfully', (done) => {
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh');

      service.logout().subscribe(() => {
        expect(localStorage.getItem('access_token')).toBeNull();
        expect(localStorage.getItem('refresh_token')).toBeNull();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/Auth/logout`);
      req.flush({ status: 200, message: 'Logged out' });
    });

    it('should clear tokens even on error', (done) => {
      localStorage.setItem('access_token', 'token');

      service.logout().subscribe({
        error: () => {
          expect(localStorage.getItem('access_token')).toBeNull();
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/Auth/logout`);
      req.flush({}, { status: 500, statusText: 'Error' });
    });
  });

  describe('token management', () => {
    it('should get access token', () => {
      localStorage.setItem('access_token', 'test-token');
      expect(service.getAccessToken()).toBe('test-token');
    });

    it('should get refresh token', () => {
      localStorage.setItem('refresh_token', 'refresh-token');
      expect(service.getRefreshToken()).toBe('refresh-token');
    });

    it('should validate token correctly', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.test';
      localStorage.setItem('access_token', validToken);
      expect(service.hasValidToken()).toBeTruthy();
    });

    it('should return false for expired token', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjF9.test';
      localStorage.setItem('access_token', expiredToken);
      expect(service.hasValidToken()).toBeFalsy();
    });
  });

  describe('refresh token', () => {
    it('should refresh token successfully', (done) => {
      localStorage.setItem('refresh_token', 'old-refresh');
      
      const mockResponse = {
        status: 200,
        message: 'Token refreshed',
        data: {
          accessToken: 'new-access',
          refreshToken: 'new-refresh'
        }
      };

      service.refreshToken().subscribe(response => {
        expect(response.status).toBe(200);
        expect(localStorage.getItem('access_token')).toBe('new-access');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/Auth/refresh`);
      req.flush(mockResponse);
    });

    it('should throw error when no refresh token', (done) => {
      service.refreshToken().subscribe({
        error: (error) => {
          expect(error.message).toContain('No refresh token');
          done();
        }
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user info', (done) => {
      const mockUser = {
        status: 200,
        message: 'Success',
        data: {
          userId: '123',
          email: 'user@test.com',
          name: 'Test User',
          isSuperAdmin: false,
          isActive: true,
          roles: ['User']
        }
      };

      service.getCurrentUser().subscribe(response => {
        expect(response.data.email).toBe('user@test.com');
        expect(response.data.name).toBe('Test User');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/Auth/me`);
      req.flush(mockUser);
    });
  });

  describe('auth state', () => {
    it('should emit authenticated state after login', (done) => {
      const mockResponse = {
        status: 200,
        message: '',
        data: { accessToken: 'token', refreshToken: 'refresh' }
      };

      service.authState$.subscribe(state => {
        if (state === 'authenticated') {
          done();
        }
      });

      service.login('test@test.com', 'pass').subscribe();
      const req = httpMock.expectOne(`${apiUrl}/Auth/login`);
      req.flush(mockResponse);
      httpMock.match(`${apiUrl}/Auth/me`);
    });

    it('should emit unauthenticated after logout', (done) => {
      const states: string[] = [];
      
      service.authState$.subscribe(state => {
        states.push(state);
        if (state === 'unauthenticated' && states.length > 1) {
          done();
        }
      });

      service.logout().subscribe();
      const req = httpMock.expectOne(`${apiUrl}/Auth/logout`);
      req.flush({ status: 200 });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('access_token', 'valid-token');
      expect(service.getAccessToken()).toBeTruthy();
    });

    it('should return false when no token', () => {
      expect(service.getAccessToken()).toBeFalsy();
    });
  });
});
