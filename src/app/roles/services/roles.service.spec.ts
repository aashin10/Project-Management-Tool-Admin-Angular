import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RolesService, Role, Permission } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://localhost:7178/api/Roles';
  const permissionsUrl = 'https://localhost:7178/api/Permissions';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RolesService]
    });
    service = TestBed.inject(RolesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchRoles', () => {
    it('should fetch roles with default pagination', () => {
      const mockApiResponse = [
        {
          id: '1',
          name: 'Admin',
          description: 'Administrator role',
          permissions: ['READ_USERS', 'WRITE_USERS'],
          userCount: 5,
          createdAt: '2023-01-01T00:00:00Z',
          status: 'Active'
        },
        {
          id: '2',
          name: 'User',
          description: 'Regular user role',
          permissions: ['READ_USERS'],
          userCount: 10,
          createdAt: '2023-01-02T00:00:00Z',
          status: 'Active'
        }
      ];

      service.fetchRoles().subscribe((roles: Role[]) => {
        expect(roles.length).toBe(2);
        expect(roles[0].name).toBe('Admin');
        expect(roles[0].id).toBe('1');
        expect(roles[0].permissions).toEqual(['READ_USERS', 'WRITE_USERS']);
        expect(roles[1].name).toBe('User');
        expect(roles[1].id).toBe('2');
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('should fetch roles with custom pagination', () => {
      const mockApiResponse = {
        data: [
          {
            id: '1',
            name: 'Manager',
            description: 'Manager role',
            permissions: ['READ_PROJECTS'],
            userCount: 3,
            createdAt: '2023-01-01T00:00:00Z',
            status: 'Active'
          }
        ]
      };

      service.fetchRoles(2, 5).subscribe((roles: Role[]) => {
        expect(roles.length).toBe(1);
        expect(roles[0].name).toBe('Manager');
        expect(roles[0].userCount).toBe(3);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=2&pageSize=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });
  });

  describe('createRole', () => {

    it('should create a new role', () => {
      const newRole: Partial<Role> = {
        name: 'Manager',
        description: 'Manager role',
        permissions: ['READ_PROJECTS'],
        status: 'Active'
      };

      const mockResponse = {
        id: '3',
        name: 'Manager',
        description: 'Manager role',
        permissions: ['READ_PROJECTS'],
        status: 'Active',
        createdAt: '2023-01-03T00:00:00Z'
      };

      service.createRole(newRole).subscribe((response: any) => {
        expect(response.id).toBe('3');
        expect(response.name).toBe('Manager');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newRole);
      req.flush(mockResponse);
    });
  });

  describe('updateRole', () => {
    it('should update an existing role', () => {
      const roleUpdate = {
        name: 'Updated Admin',
        description: 'Updated administrator role'
      };

      const mockResponse = {
        status: 200,
        data: { id: 1, ...roleUpdate, isActive: true, updatedAt: '2023-01-03' },
        message: 'Role updated successfully'
      };

      service.updateRole('1', roleUpdate).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
        expect(response.data.name).toBe('Updated Admin');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(roleUpdate);
      req.flush(mockResponse);
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', () => {
      const mockResponse = {
        status: 200,
        data: null,
        message: 'Role deleted successfully'
      };

      service.deleteRole('1').subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getPermissions', () => {
    it('should retrieve all permissions', () => {
      const mockPermissions: Permission[] = [
        { id: '1', name: 'READ_USERS', description: 'Read user data' },
        { id: '2', name: 'WRITE_USERS', description: 'Write user data' }
      ];

      service.fetchPermissions().subscribe((permissions: Permission[]) => {
        expect(permissions).toEqual(mockPermissions);
        expect(permissions.length).toBe(2);
      });

      const req = httpMock.expectOne(permissionsUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPermissions);
    });
  });
});