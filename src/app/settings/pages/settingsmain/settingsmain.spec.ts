import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Settingsmain } from './settingsmain';
import { By } from '@angular/platform-browser';

describe('Settingsmain', () => {
  let component: Settingsmain;
  let fixture: ComponentFixture<Settingsmain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settingsmain, FormsModule]
    }).compileComponents();

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
      const adminElements = fixture.debugElement.queryAll(By.css('.space-y-3 > div'));
      expect(adminElements.length).toBe(component.superAdmins.length);
      expect(adminElements[0].nativeElement.textContent).toContain('John Doe');
    });

    it('should open Add modal via Add button', () => {
      const addButton = fixture.debugElement.query(By.css('app-custom-button button'));
      addButton.nativeElement.click();
      fixture.detectChanges();

      expect(component.isAddModalOpen).toBeTrue();
    });

    it('should open Delete modal via Delete button', () => {
      const deleteButtons = fixture.debugElement.queryAll(By.css('button[aria-label="Remove admin"]'));
      deleteButtons[0].nativeElement.click();
      fixture.detectChanges();

      expect(component.isDeleteModalOpen).toBeTrue();
      expect(component.selectedAdmin?.name).toBe('John Doe');
    });

    it('should update DOM after adding a new admin', () => {
      component.newAdminName = 'Charlie Smith';
      component.newAdminEmail = 'charlie@company.com';
      component.addSuperAdmin();
      fixture.detectChanges();

      const adminElements = fixture.debugElement.queryAll(By.css('.space-y-3 > div'));
      expect(adminElements.length).toBe(component.superAdmins.length);
      expect(adminElements[2].nativeElement.textContent).toContain('Charlie Smith');
    });

    it('should update DOM after deleting an admin', () => {
      const adminToDelete = component.superAdmins[0];
      component.openDeleteModal(adminToDelete);
      component.confirmDelete();
      fixture.detectChanges();

      const adminElements = fixture.debugElement.queryAll(By.css('.space-y-3 > div'));
      expect(adminElements.length).toBe(component.superAdmins.length);
      expect(adminElements.find(e => e.nativeElement.textContent.includes('John Doe'))).toBeUndefined();
    });
  });

  /** --------------------------------------------
   * Edge Cases
   * -------------------------------------------- */
  describe('Edge Cases', () => {
    it('should handle adding admin with single name', () => {
      component.newAdminName = 'Madonna';
      component.newAdminEmail = 'madonna@example.com';
      component.addSuperAdmin();

      const added = component.superAdmins[2];
      expect(added.initials).toBe('MA');
    });

    it('should handle deleting all admins', () => {
      component.superAdmins.slice().forEach(admin => {
        component.openDeleteModal(admin);
        component.confirmDelete();
      });
      expect(component.superAdmins.length).toBe(0);
    });

    it('should not crash when deleting with null selectedAdmin', () => {
      component.selectedAdmin = null;
      expect(() => component.confirmDelete()).not.toThrow();
    });
  });
});
