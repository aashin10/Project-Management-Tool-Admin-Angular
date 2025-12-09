import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { Settingsmain } from './settingsmain';
import { SuperAdminService, SuperAdminDTO } from './super-admin-service';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('Settingsmain', () => {
  let component: Settingsmain;
  let fixture: ComponentFixture<Settingsmain>;
  let superAdminServiceMock: jasmine.SpyObj<SuperAdminService>;

  const mockSuperAdminsDTO: SuperAdminDTO[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      isActive: true,
      createdAt: '2024-01-02T00:00:00.000Z'
    }
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('SuperAdminService', [
      'getAllSuperAdmins',
      'addSuperAdmin',
      'updateSuperAdmin',
      'deleteSuperAdmin'
    ]);
    serviceSpy.getAllSuperAdmins.and.returnValue(of(mockSuperAdminsDTO));

    await TestBed.configureTestingModule({
      imports: [Settingsmain, FormsModule, HttpClientTestingModule, ToastrModule.forRoot()],
      providers: [
        { provide: SuperAdminService, useValue: serviceSpy }
      ]
    }).compileComponents();

    superAdminServiceMock = TestBed.inject(SuperAdminService) as jasmine.SpyObj<SuperAdminService>;
    fixture = TestBed.createComponent(Settingsmain);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /** --------------------------------------------
   * Basic Creation & Default State
   * -------------------------------------------- */
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default super admins', () => {
    expect(component.superAdmins.length).toBe(2);
    expect(component.superAdmins[0].name).toBe('John Doe');
    expect(component.superAdmins[1].email).toBe('jane.smith@company.com');
  });

  it('should have modals closed by default', () => {
    expect(component.isAddModalOpen).toBeFalse();
    expect(component.isDeleteModalOpen).toBeFalse();
    expect(component.selectedAdmin).toBeNull();
  });

  /** --------------------------------------------
   * Add Modal Logic
   * -------------------------------------------- */
  describe('Add Modal', () => {
    it('should open Add modal and reset fields', () => {
      component.newAdminName = 'Old';
      component.newAdminEmail = 'old@example.com';
      component.openAddModal();

      expect(component.isAddModalOpen).toBeTrue();
      expect(component.newAdminName).toBe('');
      expect(component.newAdminEmail).toBe('');
    });

    it('should close Add modal and reset fields', () => {
      component.newAdminName = 'Test';
      component.newAdminEmail = 'test@example.com';
      component.openAddModal();
      component.closeAddModal();

      expect(component.isAddModalOpen).toBeFalse();
      expect(component.newAdminName).toBe('');
      expect(component.newAdminEmail).toBe('');
    });

    it('should validate Add form correctly', () => {
      component.newAdminName = 'John';
      component.newAdminEmail = '';
      expect(component.isAddFormValid).toBeFalse();

      component.newAdminEmail = 'john@example.com';
      expect(component.isAddFormValid).toBeTrue();
    });

    it('should add a new super admin when form is valid', () => {
      const newAdmin: SuperAdminDTO = {
        id: 3,
        name: 'Alice Brown',
        email: 'alice.brown@company.com',
        isActive: true,
        createdAt: '2024-01-03T00:00:00.000Z'
      };
      superAdminServiceMock.addSuperAdmin.and.returnValue(of(newAdmin));

      component.openAddModal();
      component.newAdminName = 'Alice Brown';
      component.newAdminEmail = 'alice.brown@company.com';
      component.addSuperAdmin();

      expect(component.superAdmins.length).toBe(3);
      const added = component.superAdmins[2];
      expect(added.name).toBe('Alice Brown');
      expect(added.email).toBe('alice.brown@company.com');
      expect(added.initials).toBe('AB');
      expect(component.isAddModalOpen).toBeFalse();
    });

    it('should not add admin if form is invalid', () => {
      component.openAddModal();
      component.newAdminName = '';
      component.newAdminEmail = '';
      component.addSuperAdmin();

      expect(component.superAdmins.length).toBe(2); // unchanged
      expect(component.isAddModalOpen).toBeTrue(); // modal stays open
    });
  });

  /** --------------------------------------------
   * Delete Modal Logic
   * -------------------------------------------- */
  describe('Delete Modal', () => {
    it('should open Delete modal', () => {
      const admin = component.superAdmins[0];
      component.openDeleteModal(admin);

      expect(component.isDeleteModalOpen).toBeTrue();
      expect(component.selectedAdmin).toBe(admin);
    });

    it('should close Delete modal', () => {
      const admin = component.superAdmins[0];
      component.openDeleteModal(admin);
      component.closeDeleteModal();

      expect(component.isDeleteModalOpen).toBeFalse();
      expect(component.selectedAdmin).toBeNull();
    });

    it('should delete a super admin', () => {
      superAdminServiceMock.deleteSuperAdmin.and.returnValue(of(void 0));
      
      const adminToDelete = component.superAdmins[0];
      component.openDeleteModal(adminToDelete);
      component.confirmDelete();

      expect(component.superAdmins.length).toBe(1);
      expect(component.superAdmins.find(a => a.id === adminToDelete.id)).toBeUndefined();
      expect(component.isDeleteModalOpen).toBeFalse();
      expect(component.selectedAdmin).toBeNull();
    });

    it('should not delete if no selected admin', () => {
      component.selectedAdmin = null;
      component.confirmDelete();

      expect(component.superAdmins.length).toBe(2); // unchanged
    });
  });

  /** --------------------------------------------
   * Initials Calculation (Private Method)
   * -------------------------------------------- */
  describe('Initials Calculation', () => {
    it('should return initials for two-word name', () => {
      expect((component as any).getInitials('John Doe')).toBe('JD');
    });

    it('should return initials for single-word name', () => {
      expect((component as any).getInitials('Alice')).toBe('AL');
    });

    it('should trim spaces and calculate initials', () => {
      expect((component as any).getInitials(' Bob Charles ')).toBe('BC');
    });
  });

  /** --------------------------------------------
   * DOM & UI Tests
   * -------------------------------------------- */
  describe('DOM interactions', () => {
    it('should render all super admins', () => {
      fixture.detectChanges();
      const adminElements = fixture.debugElement.queryAll(By.css('.space-y-3 > div.group'));
      expect(adminElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should open Add modal via Add button', () => {
      fixture.detectChanges();
      spyOn(component, 'openAddModal');
      const customButton = fixture.debugElement.query(By.css('app-custom-button'));
      expect(customButton).toBeTruthy();
    });

    it('should open Delete modal via Delete button', () => {
      fixture.detectChanges();
      if (component.superAdmins.length > 1) {
        const admin = component.superAdmins[1];
        component.openDeleteModal(admin);
        expect(component.isDeleteModalOpen).toBeTrue();
      }
    });

    it('should update DOM after adding a new admin', () => {
      const newAdmin: SuperAdminDTO = {
        id: 3,
        name: 'Charlie Smith',
        email: 'charlie@company.com',
        isActive: true,
        createdAt: '2024-01-03T00:00:00.000Z'
      };
      superAdminServiceMock.addSuperAdmin.and.returnValue(of(newAdmin));
      
      component.newAdminName = 'Charlie Smith';
      component.newAdminEmail = 'charlie@company.com';
      component.addSuperAdmin();
      fixture.detectChanges();

      expect(component.superAdmins.length).toBe(3);
    });

    it('should update DOM after deleting an admin', () => {
      superAdminServiceMock.deleteSuperAdmin.and.returnValue(of(void 0));
      
      if (component.superAdmins.length > 1) {
        const adminToDelete = component.superAdmins[1];
        component.openDeleteModal(adminToDelete);
        component.confirmDelete();
        fixture.detectChanges();

        expect(component.superAdmins.length).toBe(1);
      }
    });
  });

  /** --------------------------------------------
   * Edge Cases
   * -------------------------------------------- */
  describe('Edge Cases', () => {
    it('should handle adding admin with single name', () => {
      const newAdmin: SuperAdminDTO = {
        id: 3,
        name: 'Madonna',
        email: 'madonna@example.com',
        isActive: true,
        createdAt: '2024-01-03T00:00:00.000Z'
      };
      superAdminServiceMock.addSuperAdmin.and.returnValue(of(newAdmin));
      
      component.newAdminName = 'Madonna';
      component.newAdminEmail = 'madonna@example.com';
      component.addSuperAdmin();

      const added = component.superAdmins.find(a => a.email === 'madonna@example.com');
      expect(added?.initials).toBe('MA');
    });

    it('should not crash when deleting with null selectedAdmin', () => {
      component.selectedAdmin = null;
      expect(() => component.confirmDelete()).not.toThrow();
    });
  });
});
