import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Roleslist } from './roleslist';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Table } from '../../../shared/table/table';
import { Modal } from '../../../shared/modal/modal';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('Roleslist Component Suite', () => {
  let component: Roleslist;
  let fixture: ComponentFixture<Roleslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        Roleslist,
        Sectiontitle,
        CustomButton,
        Table,
        Modal,
        SearchBar
      ]
    }).compileComponents();

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
      const button = fixture.debugElement.query(By.css('button'));
      expect(button).toBeTruthy();
      expect(button.nativeElement.textContent).toContain('Create Role');
    });

    it('should open modal when clicked', () => {
      spyOn(component, 'openModal');
      const button = fixture.debugElement.query(By.css('button'));
      button.nativeElement.click();
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
      const initial = component.roles.length;
      component.newRole = {
        roleInfo: { icon: 'shield', name: 'QA Tester' },
        description: 'Tests software',
        users: 0,
        created: '',
        permissions: ['read', 'write']
      };
      component.saveRole();
      expect(component.roles.length).toBe(initial + 1);
    });

    it('should trim whitespace from role name', () => {
      component.newRole = {
        roleInfo: { icon: 'shield', name: '  TrimmedRole  ' },
        description: 'Whitespace test',
        users: 0,
        created: '',
        permissions: ['read']
      };
      component.saveRole();
      const added = component.roles.find(r => r.roleInfo.name === 'TrimmedRole');
      expect(added).toBeTruthy();
    });

    it('should not add a role with empty name', () => {
      const initial = component.roles.length;
      component.newRole = {
        roleInfo: { icon: 'shield', name: '' },
        description: 'Invalid name',
        users: 0,
        created: '',
        permissions: ['read']
      };
      component.saveRole();
      expect(component.roles.length).toBe(initial);
    });

    it('should not add a role with no permissions', () => {
      const initial = component.roles.length;
      component.newRole = {
        roleInfo: { icon: 'shield', name: 'NoPermRole' },
        description: 'No perms',
        users: 0,
        created: '',
        permissions: []
      };
      component.saveRole();
      expect(component.roles.length).toBe(initial);
    });

    it('should not allow duplicate role names (case-insensitive)', () => {
      const initial = component.roles.length;
      const dupName = component.roles[0].roleInfo.name.toLowerCase();
      component.newRole = {
        roleInfo: { icon: 'shield', name: dupName.toUpperCase() },
        description: 'Duplicate test',
        users: 0,
        created: '',
        permissions: ['read']
      };
      component.saveRole();
      expect(component.roles.length).toBe(initial);
    });
  });

  // =====================================================
  // ✅ EDIT ROLE FUNCTIONALITY
  // =====================================================
  describe('Edit Role', () => {
    it('should not update if edited role has invalid data', () => {
      const role = component.roles[0];
      const originalName = role.roleInfo.name;
      component.editRole(role, 0);

      if (component.newRole.roleInfo) {
        component.newRole.roleInfo.name = '';
      }
      component.saveRole();
      expect(component.roles[0].roleInfo.name).toBe(originalName);
    });
  });

  // =====================================================
  // ✅ DELETE ROLE FUNCTIONALITY
  // =====================================================
  describe('Delete Role', () => {
  
    it('should not delete when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const initial = component.roles.length;
      component.deleteRole(0);
      expect(component.roles.length).toBe(initial);
    });
  });

  // =====================================================
  // ✅ PERMISSION TOGGLING
  // =====================================================
  describe('Permission Handling', () => {
    it('should toggle permission on/off', () => {
      const perm = component.permissionsList[0];
      component.newRole = {
        roleInfo: { icon: 'shield', name: 'Test Role' },
        description: 'Test',
        users: 0,
        created: '',
        permissions: []
      };

      component.togglePermission(perm);
      expect(component.newRole.permissions).toContain(perm);
      component.togglePermission(perm);
      expect(component.newRole.permissions).not.toContain(perm);
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
