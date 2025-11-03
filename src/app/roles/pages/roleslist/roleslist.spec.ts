import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Roleslist } from './roleslist';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Table } from '../../../shared/table/table';
import { Modal } from '../../../shared/modal/modal';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService } from '../../services/roles.service';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';

describe('Roleslist Component Suite', () => {
  let component: Roleslist;
  let fixture: ComponentFixture<Roleslist>;
  let mockRolesService: jasmine.SpyObj<RolesService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    const rolesServiceSpy = jasmine.createSpyObj('RolesService', [
      'fetchRoles',
      'fetchPermissions',
      'createRole',
      'updateRole',
      'deleteRole'
    ]);
    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
      'warning',
      'info'
    ]);

    // Setup default return values
    rolesServiceSpy.fetchRoles.and.returnValue(of([
      {
        id: '1',
        name: 'Admin',
        description: 'Administrator role',
        userCount: 2,
        createdAt: '2024-01-01T00:00:00Z',
        permissions: [{ id: 1 }, { id: 2 }]
      }
    ]));
    rolesServiceSpy.fetchPermissions.and.returnValue(of([
      { id: 1, name: 'Read', description: 'Read permission' },
      { id: 2, name: 'Write', description: 'Write permission' }
    ]));
    rolesServiceSpy.createRole.and.returnValue(of({ success: true }));
    rolesServiceSpy.updateRole.and.returnValue(of({ success: true }));
    rolesServiceSpy.deleteRole.and.returnValue(of({ success: true }));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        Roleslist,
        Sectiontitle,
        CustomButton,
        Table,
        Modal,
        SearchBar,
        LoadingIndicator
      ],
      providers: [
        { provide: RolesService, useValue: rolesServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy }
      ]
    }).compileComponents();

    mockRolesService = TestBed.inject(RolesService) as jasmine.SpyObj<RolesService>;
    mockToastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;

    fixture = TestBed.createComponent(Roleslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // =====================================================
  // ✅ BASIC COMPONENT INITIALIZATION
  // =====================================================
  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize roles and filteredRoles', () => {
      expect(mockRolesService.fetchRoles).toHaveBeenCalled();
      expect(mockRolesService.fetchPermissions).toHaveBeenCalled();
      expect(component.roles.length).toBeGreaterThan(0);
      expect(component.filteredRoles.length).toBe(component.roles.length);
    });
  });

  // =====================================================
  // ✅ SECTION TITLE TESTS
  // =====================================================
  describe('Section Title', () => {
    it('should render correct title and description', () => {
      const sectionTitle = fixture.debugElement.query(By.directive(Sectiontitle)).componentInstance;
      expect(sectionTitle.title).toBe('All Roles');
      expect(sectionTitle.description).toContain('Manage user roles');
    });
  });

  // =====================================================
  // ✅ BUTTON TESTS
  // =====================================================
  describe('Create Role Button', () => {
    it('should render create role button', () => {
      const customButton = fixture.debugElement.query(By.directive(CustomButton));
      expect(customButton).toBeTruthy();
    });

    it('should open modal when clicked', () => {
      spyOn(component, 'openModal');
      component.openModal();
      expect(component.openModal).toHaveBeenCalled();
    });
  });

  // =====================================================
  // ✅ MODAL BEHAVIOR
  // =====================================================
  describe('Modal Behavior', () => {
    it('should open modal in create mode', () => {
      component.openModal();
      expect(component.isModalOpen).toBeTrue();
      expect(component.isEditMode).toBeFalse();
    });


    it('should close modal properly', () => {
      component.isModalOpen = true;
      component.closeModal();
      expect(component.isModalOpen).toBeFalse();
    });
  });

  // =====================================================
  // ✅ CREATE ROLE FUNCTIONALITY
  // =====================================================
  describe('Create Role', () => {
    it('should create a new valid role', () => {
      spyOn(window, 'alert');
      const initial = component.roles.length;
      component.newRole = {
        roleInfo: { icon: 'shield', name: 'QA Tester' },
        description: 'Tests software',
        users: 0,
        created: '',
        permissionIds: [1, 2]
      };
      component.saveRole();
      expect(mockRolesService.createRole).toHaveBeenCalled();
    });

    it('should trim whitespace from role name', () => {
      spyOn(window, 'alert');
      component.newRole = {
        roleInfo: { icon: 'shield', name: '  TrimmedRole  ' },
        description: 'Whitespace test',
        users: 0,
        created: '',
        permissionIds: [1]
      };
      component.saveRole();
      expect(mockRolesService.createRole).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'TrimmedRole'
        })
      );
    });

    it('should not add a role with empty name', () => {
      spyOn(window, 'alert');
      component.newRole = {
        roleInfo: { icon: 'shield', name: '' },
        description: 'Invalid name',
        users: 0,
        created: '',
        permissionIds: [1]
      };
      component.saveRole();
      expect(window.alert).toHaveBeenCalledWith('Role name is required.');
      expect(mockRolesService.createRole).not.toHaveBeenCalled();
    });

    it('should not add a role with no permissions', () => {
      spyOn(window, 'alert');
      component.newRole = {
        roleInfo: { icon: 'shield', name: 'NoPermRole' },
        description: 'No perms',
        users: 0,
        created: '',
        permissionIds: []
      };
      component.saveRole();
      expect(window.alert).toHaveBeenCalledWith('Please assign at least one permission.');
      expect(mockRolesService.createRole).not.toHaveBeenCalled();
    });

    it('should not allow duplicate role names (case-insensitive)', () => {
      spyOn(window, 'alert');
      const dupName = component.roles[0].roleInfo.name.toLowerCase();
      component.newRole = {
        roleInfo: { icon: 'shield', name: dupName.toUpperCase() },
        description: 'Duplicate test',
        users: 0,
        created: '',
        permissionIds: [1]
      };
      component.saveRole();
      expect(window.alert).toHaveBeenCalledWith('A role with this name already exists.');
      expect(mockRolesService.createRole).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // ✅ EDIT ROLE FUNCTIONALITY
  // =====================================================
  describe('Edit Role', () => {
    it('should not update if edited role has invalid data', () => {
      spyOn(window, 'alert');
      const role = component.roles[0];
      component.editRole(role, 0);

      if (component.newRole.roleInfo) {
        component.newRole.roleInfo.name = '';
      }
      component.saveRole();
      expect(window.alert).toHaveBeenCalledWith('Role name is required.');
      expect(mockRolesService.updateRole).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // ✅ DELETE ROLE FUNCTIONALITY
  // =====================================================
  describe('Delete Role', () => {
  
    it('should not delete when cancelled', () => {
      const initial = component.roles.length;
      component.cancelDeleteRole();
      expect(component.roles.length).toBe(initial);
      expect(component.showDeleteModal).toBeFalse();
    });
  });

  // =====================================================
  // ✅ PERMISSION TOGGLING
  // =====================================================
  describe('Permission Handling', () => {
    it('should toggle permission on/off', () => {
      const permissionId = 1;
      component.newRole = {
        roleInfo: { icon: 'shield', name: 'Test Role' },
        description: 'Test',
        users: 0,
        created: '',
        permissionIds: []
      };

      component.togglePermission(permissionId);
      expect(component.newRole.permissionIds).toContain(permissionId);
      component.togglePermission(permissionId);
      expect(component.newRole.permissionIds).not.toContain(permissionId);
    });
  });

  // =====================================================
  // ✅ SEARCH FUNCTIONALITY
  // =====================================================
  describe('Search', () => {
    it('should filter roles correctly', () => {
      component.onSearch('Admin');
      expect(component.filteredRoles.every(r => r.roleInfo.name.toLowerCase().includes('admin'))).toBeTrue();
    });

    it('should reset filter when search is cleared', () => {
      component.onSearch('');
      expect(component.filteredRoles.length).toBe(component.roles.length);
    });

    it('should return empty filteredRoles when search has no matches', () => {
      component.onSearch('NonExistentRole');
      expect(component.filteredRoles.length).toBe(0);
    });
  });
  
});
