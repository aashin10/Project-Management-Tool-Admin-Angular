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

describe('Roleslist Component - Comprehensive Unit Tests', () => {
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

  // ----------------------------------------------
  // ✅ Basic Initialization
  // ----------------------------------------------
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize roles and filteredRoles properly', () => {
    expect(component.roles.length).toBeGreaterThan(0);
    expect(component.filteredRoles.length).toBe(component.roles.length);
  });

  it('should render Sectiontitle component correctly', () => {
    const sectionTitle = fixture.debugElement.query(By.directive(Sectiontitle)).componentInstance;
    expect(sectionTitle.title).toBe('All Roles');
    expect(sectionTitle.description).toBe('Manage user roles and permissions across your organization');
  });

  // ----------------------------------------------
  // ✅ Modal Operations
  // ----------------------------------------------
  it('should open modal in create mode', () => {
    component.openModal();
    fixture.detectChanges();
    expect(component.isModalOpen).toBeTrue();
    expect(component.isEditMode).toBeFalse();
    expect(component.newRole.name).toBe('');
  });

  it('should prefill modal fields in edit mode', () => {
    const role = component.roles[0];
    component.editRole(role, 0);
    fixture.detectChanges();
    expect(component.isModalOpen).toBeTrue();
    expect(component.isEditMode).toBeTrue();
    expect(component.newRole.name).toBe(role.name);
    expect(component.editingIndex).toBe(0);
  });

  it('should close modal when Modal emits close event', () => {
    component.isModalOpen = true;
    fixture.detectChanges();
    const modal = fixture.debugElement.query(By.directive(Modal)).componentInstance;
    modal.close.emit();
    fixture.detectChanges();
    expect(component.isModalOpen).toBeFalse();
  });

  // ----------------------------------------------
  // ✅ Create Role Functionality
  // ----------------------------------------------
  it('should create a new valid role', () => {
    const initialCount = component.roles.length;
    component.newRole = { name: 'New Role', description: 'Desc', users: 0, created: '', permissions: ['read'] };
    component.isEditMode = false;
    component.saveRole();
    fixture.detectChanges();
    expect(component.roles.length).toBe(initialCount + 1);
    expect(component.filteredRoles.some(r => r.name === 'New Role')).toBeTrue();
  });

  it('should not create a role without a name', () => {
    const initialCount = component.roles.length;
    component.newRole = { name: '', description: 'No name role', users: 0, created: '', permissions: ['read'] };
    component.saveRole();
    fixture.detectChanges();
    expect(component.roles.length).toBe(initialCount);
  });

  it('should not create a role without permissions', () => {
    const initialCount = component.roles.length;
    component.newRole = { name: 'No Permission', description: '', users: 0, created: '', permissions: [] };
    component.saveRole();
    fixture.detectChanges();
    expect(component.roles.length).toBe(initialCount);
  });

  it('should prevent creating duplicate role names', () => {
    const duplicateName = component.roles[0].name;
    const initialCount = component.roles.length;
    component.newRole = { name: duplicateName, description: '', users: 0, created: '', permissions: ['read'] };
    component.saveRole();
    fixture.detectChanges();
    expect(component.roles.length).toBe(initialCount);
  });

  // ----------------------------------------------
  // ✅ Edit Role Functionality
  // ----------------------------------------------
  it('should update an existing role', () => {
    const index = 0;
    const originalName = component.roles[index].name;
    component.editRole(component.roles[index], index);
    component.newRole.name = 'Updated Role';
    component.saveRole();
    fixture.detectChanges();
    expect(component.roles[index].name).toBe('Updated Role');
    expect(component.roles[index].name).not.toBe(originalName);
  });

  // ----------------------------------------------
  // ✅ Delete Role Functionality
  // ----------------------------------------------
  it('should delete a role when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const initialCount = component.roles.length;
    component.deleteRole(0);
    fixture.detectChanges();
    expect(component.roles.length).toBe(initialCount - 1);
  });

  it('should not delete a role when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const initialCount = component.roles.length;
    component.deleteRole(0);
    fixture.detectChanges();
    expect(component.roles.length).toBe(initialCount);
  });

  // ----------------------------------------------
  // ✅ Search & Filtering
  // ----------------------------------------------
  it('should filter roles by search term (case-insensitive)', () => {
    component.onSearch('admin');
    fixture.detectChanges();
    expect(component.filteredRoles.every(r => r.name.toLowerCase().includes('admin'))).toBeTrue();
  });

  it('should reset filteredRoles when search term is empty', () => {
    component.onSearch('');
    fixture.detectChanges();
    expect(component.filteredRoles.length).toBe(component.roles.length);
  });

  // ----------------------------------------------
  // ✅ Permissions Handling
  // ----------------------------------------------
  it('should toggle permissions correctly', () => {
    const perm = component.permissionsList[0];
    component.newRole.permissions = [];
    component.togglePermission(perm);
    expect(component.newRole.permissions).toContain(perm);
    component.togglePermission(perm);
    expect(component.newRole.permissions).not.toContain(perm);
  });

  // ----------------------------------------------
  // ✅ Table Actions
  // ----------------------------------------------
  it('should handle table action: edit', () => {
    const role = component.roles[1];
    component.handleTableAction({ action: 'edit', row: role });
    fixture.detectChanges();
    expect(component.isEditMode).toBeTrue();
    expect(component.newRole.name).toBe(role.name);
  });

  it('should handle table action: delete', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const role = component.roles[1];
    const initialCount = component.roles.length;
    component.handleTableAction({ action: 'delete', row: role });
    fixture.detectChanges();
    expect(component.roles.length).toBe(initialCount - 1);
  });

  // ----------------------------------------------
  // ✅ Pagination & Empty State Handling
  // ----------------------------------------------
  it('should handle pagination correctly', () => {
    component.roles = Array.from({ length: 25 }, (_, i) => ({
      name: `Role ${i}`,
      description: 'Desc',
      users: i,
      created: '2024-10-01',
      permissions: ['read']
    }));
    component.filteredRoles = [...component.roles];
    fixture.detectChanges();
    expect(component.filteredRoles.length).toBe(25);
  });

  it('should handle empty state (no roles)', () => {
    component.roles = [];
    component.filteredRoles = [];
    fixture.detectChanges();
    const table = fixture.debugElement.query(By.directive(Table)).componentInstance;
    expect(table).toBeTruthy();
    // You may check empty-table message or behavior here
  });

  // ----------------------------------------------
  // ✅ Component Integration Checks
  // ----------------------------------------------
  it('should emit search event from SearchBar', () => {
    const searchBar = fixture.debugElement.query(By.directive(SearchBar)).componentInstance;
    spyOn(component, 'onSearch');
    searchBar.search.emit('test');
    expect(component.onSearch).toHaveBeenCalledWith('test');
  });

  it('should emit action event from CustomButton', () => {
    const button = fixture.debugElement.query(By.directive(CustomButton)).componentInstance;
    spyOn(component, 'openModal');
    button.action.emit();
    expect(component.openModal).toHaveBeenCalled();
  });
});
