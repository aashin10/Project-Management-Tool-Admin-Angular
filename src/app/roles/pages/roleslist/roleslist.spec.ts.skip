import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { Roleslist } from './roleslist';
import { RolesService, Permission } from '../../services/roles.service';

// Component's local interfaces
interface RoleInfo {
  icon: string;
  name: string;
}

interface Role {
  id: string;
  roleInfo: RoleInfo;
  description: string;
  users: number;
  created: string;
  cloneFrom?: string;
  permissionIds?: number[];
  isDefault?: boolean;
}

describe('Roleslist', () => {
  let component: Roleslist;
  let fixture: ComponentFixture<Roleslist>;
  let rolesService: jasmine.SpyObj<RolesService>;
  let toastrService: jasmine.SpyObj<ToastrService>;

  // Service-level mock data
  const mockServiceRoles: import('../../services/roles.service').Role[] = [
    {
      id: '1',
      name: 'Admin',
      description: 'Administrator role',
      userCount: 5,
      createdAt: '2023-01-01T00:00:00Z',
      permissions: ['READ_USERS', 'WRITE_USERS'],
      status: 'Active'
    },
    {
      id: '2',
      name: 'User',
      description: 'Regular user role',
      userCount: 10,
      createdAt: '2023-01-02T00:00:00Z',
      permissions: ['READ_USERS'],
      status: 'Active'
    }
  ];

  // Component-level mock data
  const mockRoles: Role[] = [
    {
      id: '1',
      roleInfo: { icon: 'shield', name: 'Admin' },
      description: 'Administrator role',
      users: 5,
      created: '2023-01-01',
      permissionIds: [1, 2],
      isDefault: false
    },
    {
      id: '2',
      roleInfo: { icon: 'shield', name: 'User' },
      description: 'Regular user role',
      users: 10,
      created: '2023-01-02',
      permissionIds: [1],
      isDefault: false
    }
  ];

  const mockServicePermissions: Permission[] = [
    { id: '1', name: 'READ_USERS', description: 'Read user data' },
    { id: '2', name: 'WRITE_USERS', description: 'Write user data' },
    { id: '3', name: 'DELETE_USERS', description: 'Delete user data' }
  ];

  const mockPermissions: Array<{ id: number; name: string; description?: string }> = [
    { id: 1, name: 'READ_USERS', description: 'Read user data' },
    { id: 2, name: 'WRITE_USERS', description: 'Write user data' },
    { id: 3, name: 'DELETE_USERS', description: 'Delete user data' }
  ];

  beforeEach(async () => {
    const rolesServiceSpy = jasmine.createSpyObj('RolesService', [
      'fetchRoles',
      'fetchPermissions',
      'createRole',
      'updateRole',
      'deleteRole'
    ]);
    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [
        Roleslist,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
        FormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: RolesService, useValue: rolesServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Roleslist);
    component = fixture.componentInstance;
    rolesService = TestBed.inject(RolesService) as jasmine.SpyObj<RolesService>;
    toastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;

    // Setup default spy returns
    rolesService.fetchRoles.and.returnValue(of(mockServiceRoles));
    rolesService.fetchPermissions.and.returnValue(of(mockServicePermissions));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isModalOpen).toBe(false);
    expect(component.showDeleteModal).toBe(false);
    expect(component.isEditMode).toBe(false);
    expect(component.roles).toEqual([]);
    expect(component.filteredRoles).toEqual([]);
    expect(component.isLoading).toBe(false);
  });

  describe('ngOnInit', () => {
    it('should load roles and permissions on init', () => {
      component.ngOnInit();

      expect(rolesService.fetchRoles).toHaveBeenCalled();
      expect(rolesService.fetchPermissions).toHaveBeenCalled();
      expect(component.isLoading).toBe(true);
    });
  });

  describe('fetchRoles', () => {
    it('should fetch and transform roles successfully', () => {
      component.fetchRoles();

      expect(rolesService.fetchRoles).toHaveBeenCalled();
      expect(component.roles.length).toBe(2);
      expect(component.roles[0].roleInfo.name).toBe('Admin');
      expect(component.roles[0].permissionIds).toEqual([1, 2]);
      expect(component.filteredRoles).toEqual(component.roles);
      expect(component.isLoading).toBe(false);
    });

    it('should handle fetch roles error', () => {
      rolesService.fetchRoles.and.returnValue(throwError(() => new Error('API Error')));

      component.fetchRoles();

      expect(component.isLoading).toBe(false);
      expect(toastrService.error).toHaveBeenCalledWith(
        'Failed to fetch roles from server',
        '',
        jasmine.any(Object)
      );
    });
  });

  describe('fetchPermissions', () => {
    it('should fetch permissions successfully', () => {
      component.fetchPermissions();

      expect(rolesService.fetchPermissions).toHaveBeenCalled();
      expect(component.permissionsList).toEqual(mockPermissions);
    });

    it('should handle fetch permissions error', () => {
      rolesService.fetchPermissions.and.returnValue(throwError(() => new Error('API Error')));

      component.fetchPermissions();

      expect(toastrService.error).toHaveBeenCalledWith(
        'Failed to fetch permissions from server',
        '',
        jasmine.any(Object)
      );
    });

    it('should handle permissions response with data wrapper', () => {
      const wrappedResponse = { data: mockServicePermissions };
      rolesService.fetchPermissions.and.returnValue(of(wrappedResponse as any));

      component.fetchPermissions();

      expect(component.permissionsList).toEqual(mockPermissions);
    });
  });

  describe('search functionality', () => {
    beforeEach(() => {
      component.roles = [
        {
          id: '1',
          roleInfo: { icon: 'shield', name: 'Admin' },
          description: 'Administrator role',
          users: 5,
          created: '2023-01-01',
          permissionIds: [1, 2],
          isDefault: false
        },
        {
          id: '2',
          roleInfo: { icon: 'shield', name: 'User' },
          description: 'Regular user role',
          users: 10,
          created: '2023-01-02',
          permissionIds: [1],
          isDefault: false
        }
      ];
      component.filteredRoles = [...component.roles];
    });

    it('should filter roles by name', () => {
      component.onSearch('Admin');

      expect(component.filteredRoles.length).toBe(1);
      expect(component.filteredRoles[0].roleInfo.name).toBe('Admin');
    });

    it('should filter roles by description', () => {
      component.onSearch('Regular');

      expect(component.filteredRoles.length).toBe(1);
      expect(component.filteredRoles[0].roleInfo.name).toBe('User');
    });

    it('should return all roles for empty search', () => {
      component.onSearch('');

      expect(component.filteredRoles.length).toBe(2);
    });
  });

  describe('modal operations', () => {
    it('should open modal for new role', () => {
      component.openModal();

      expect(component.isModalOpen).toBe(true);
      expect(component.isEditMode).toBe(false);
      expect(component.newRole.roleInfo?.name).toBe('');
    });

    it('should close modal and reset form', () => {
      component.isModalOpen = true;
      component.newRole.roleInfo!.name = 'Test Role';

      component.closeModal();

      expect(component.isModalOpen).toBe(false);
      expect(component.isEditMode).toBe(false);
      expect(component.newRole.roleInfo?.name).toBe('');
    });
  });

  describe('permission operations', () => {
    beforeEach(() => {
      component.permissionsList = mockPermissions;
      component.newRole.permissionIds = [1];
    });

    it('should check if permission is selected', () => {
      expect(component.isPermissionSelected(1)).toBe(true);
      expect(component.isPermissionSelected(2)).toBe(false);
    });

    it('should toggle permission on', () => {
      component.togglePermission(2);

      expect(component.newRole.permissionIds).toContain(2);
    });

    it('should toggle permission off', () => {
      component.togglePermission(1);

      expect(component.newRole.permissionIds).not.toContain(1);
    });

    it('should get permission name by id', () => {
      expect(component.getPermissionNameById(1)).toBe('READ_USERS');
      expect(component.getPermissionNameById(999)).toBe('Unknown');
    });
  });

  describe('role creation', () => {
    beforeEach(() => {
      component.newRole = {
        roleInfo: { icon: 'shield', name: 'Test Role' },
        description: 'Test Description',
        permissionIds: [1, 2]
      } as Partial<Role>;
      rolesService.createRole.and.returnValue(of({
        data: {
          id: '3',
          name: 'Test Role',
          description: 'Test Description',
          permissions: [{ id: 1 }, { id: 2 }]
        }
      }));
    });

    it('should create role successfully', () => {
      spyOn(component, 'closeModal');
      spyOn(component, 'fetchRoles');

      component.saveRole();

      expect(rolesService.createRole).toHaveBeenCalledWith(jasmine.objectContaining({
        name: 'Test Role',
        description: 'Test Description',
        permissionIds: [1, 2]
      }));
      expect(toastrService.success).toHaveBeenCalled();
      expect(component.closeModal).toHaveBeenCalled();
      expect(component.fetchRoles).toHaveBeenCalled();
    });

    it('should validate role name', () => {
      spyOn(window, 'alert');
      component.newRole.roleInfo!.name = '';

      component.saveRole();

      expect(window.alert).toHaveBeenCalledWith('Role name is required.');
      expect(rolesService.createRole).not.toHaveBeenCalled();
    });

    it('should validate description', () => {
      spyOn(window, 'alert');
      component.newRole.description = '';

      component.saveRole();

      expect(window.alert).toHaveBeenCalledWith('Description is required.');
      expect(rolesService.createRole).not.toHaveBeenCalled();
    });

    it('should validate permissions', () => {
      spyOn(window, 'alert');
      component.newRole.permissionIds = [];

      component.saveRole();

      expect(window.alert).toHaveBeenCalledWith('Please assign at least one permission.');
      expect(rolesService.createRole).not.toHaveBeenCalled();
    });
  });

  describe('role editing', () => {
    const mockRole = {
      id: '1',
      roleInfo: { icon: 'shield', name: 'Admin' },
      description: 'Administrator role',
      users: 5,
      created: '2023-01-01',
      permissionIds: [1, 2],
      isDefault: false
    };

    it('should edit role', () => {
      component.editRole(mockRole, 0);

      expect(component.isEditMode).toBe(true);
      expect(component.editingIndex).toBe(0);
      expect(component.newRole.roleInfo?.name).toBe('Admin');
      expect(component.isModalOpen).toBe(true);
    });

    it('should not edit default role', () => {
      const defaultRole = { ...mockRole, isDefault: true };

      component.editRole(defaultRole, 0);

      expect(component.isEditMode).toBe(false);
      expect(component.isModalOpen).toBe(false);
    });
  });

  describe('role deletion', () => {
    const mockRole = {
      id: '1',
      roleInfo: { icon: 'shield', name: 'Admin' },
      description: 'Administrator role',
      users: 5,
      created: '2023-01-01',
      permissionIds: [1, 2],
      isDefault: false
    };

    beforeEach(() => {
      component.roles = [mockRole];
      rolesService.deleteRole.and.returnValue(of({}));
    });

    it('should show delete confirmation modal', () => {
      const event = new Event('click');
      component.handleDeleteClick(mockRole, event);

      expect(component.showDeleteModal).toBe(true);
      expect(component.roleToDelete).toBe(mockRole);
    });

    it('should confirm role deletion', () => {
      spyOn(component, 'fetchRoles');
      component.roleToDelete = mockRole;
      component.deleteIndex = 0;

      component.confirmDeleteRole();

      expect(rolesService.deleteRole).toHaveBeenCalledWith('1');
      expect(toastrService.success).toHaveBeenCalled();
      expect(component.showDeleteModal).toBe(false);
      expect(component.fetchRoles).toHaveBeenCalled();
    });

    it('should cancel role deletion', () => {
      component.roleToDelete = mockRole;
      component.showDeleteModal = true;

      component.cancelDeleteRole();

      expect(component.showDeleteModal).toBe(false);
      expect(component.roleToDelete).toBeNull();
    });
  });

  describe('tooltip functionality', () => {
    const mockRole = {
      id: '1',
      roleInfo: { icon: 'shield', name: 'Admin' },
      description: 'Administrator role',
      users: 5,
      created: '2023-01-01',
      permissionIds: [1, 2],
      isDefault: false
    };

    it('should show role tooltip with delay', (done) => {
      const event = new MouseEvent('mouseenter', { clientX: 100, clientY: 200 });
      
      component.showRoleTooltip(event, mockRole);

      setTimeout(() => {
        expect(component.hoveredRole).toBe(mockRole);
        done();
      }, 350);
    });

    it('should hide role tooltip', () => {
      component.hoveredRole = mockRole;

      component.hideRoleTooltip();

      expect(component.hoveredRole).toBeNull();
    });

    it('should show action tooltip', () => {
      const mockElement = document.createElement('button');
      const event = { target: mockElement } as any;
      spyOn(mockElement, 'getBoundingClientRect').and.returnValue({
        left: 100,
        top: 200,
        width: 50,
        height: 30
      } as DOMRect);

      component.showActionTooltip(event, 'Edit');

      expect(component.actionTooltip).toBe('Edit');
    });
  });
});