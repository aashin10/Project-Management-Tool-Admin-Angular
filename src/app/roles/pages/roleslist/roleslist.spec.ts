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

describe('Roleslist Component', () => {
  let component: Roleslist;
  let fixture: ComponentFixture<Roleslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        Roleslist,       // standalone component
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

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize roles and filteredRoles with 5 roles', () => {
    expect(component.roles.length).toBe(5);
    expect(component.filteredRoles.length).toBe(5);
  });

  it('should open modal in create mode', () => {
    component.openModal();
    fixture.detectChanges();
    expect(component.isModalOpen).toBeTrue();
    expect(component.isEditMode).toBeFalse();
    expect(component.newRole.name).toBe('');
  });

  it('should prefill modal in edit mode', () => {
    const role = component.roles[0];
    component.editRole(role, 0);
    fixture.detectChanges();
    expect(component.isModalOpen).toBeTrue();
    expect(component.isEditMode).toBeTrue();
    expect(component.newRole.name).toBe(role.name);
    expect(component.editingIndex).toBe(0);
  });

  it('should save a new role', () => {
    component.newRole = { name: 'Test Role', description: '', users: 0, created: '', permissions: [] };
    component.isEditMode = false;
    const initialCount = component.roles.length;
    component.saveRole();
    fixture.detectChanges();
    expect(component.roles.length).toBe(initialCount + 1);
    expect(component.filteredRoles.length).toBe(initialCount + 1);
  });

  it('should update an existing role', () => {
    const originalName = component.roles[0].name;
    component.editRole(component.roles[0], 0);
    component.newRole.name = 'Updated Name';
    component.saveRole();
    fixture.detectChanges();
    expect(component.roles[0].name).toBe('Updated Name');
    expect(component.roles[0].name).not.toBe(originalName);
  });

  it('should delete a role', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const initialCount = component.roles.length;
    component.deleteRole(0);
    fixture.detectChanges();
    expect(component.roles.length).toBe(initialCount - 1);
    expect(component.filteredRoles.length).toBe(initialCount - 1);
  });

  it('should filter roles by search term', () => {
    component.onSearch('admin');
    fixture.detectChanges();
    expect(component.filteredRoles.length).toBe(1);
    expect(component.filteredRoles[0].name).toBe('Admin');
  });

  it('should toggle permissions', () => {
    const perm = component.permissionsList[0];
    component.newRole.permissions = [];
    component.togglePermission(perm);
    expect(component.newRole.permissions).toContain(perm);
    component.togglePermission(perm);
    expect(component.newRole.permissions).not.toContain(perm);
  });

  it('should handle table action edit', () => {
    const role = component.roles[1];
    component.handleTableAction({ action: 'edit', row: role, rowIndex: 1 });
    fixture.detectChanges();
    expect(component.isEditMode).toBeTrue();
    expect(component.editingIndex).toBe(1);
    expect(component.newRole.name).toBe(role.name);
  });

  it('should handle table action delete', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const initialCount = component.roles.length;
    const role = component.roles[1];
    component.handleTableAction({ action: 'delete', row: role, rowIndex: 1 });
    fixture.detectChanges();
    expect(component.roles.length).toBe(initialCount - 1);
  });

  it('should bind Sectiontitle inputs correctly', () => {
    const sectionTitleEl = fixture.debugElement.query(By.directive(Sectiontitle)).componentInstance;
    expect(sectionTitleEl.title).toBe('All Roles');
    expect(sectionTitleEl.description).toBe('Manage user roles and permissions across your organization');
  });

  it('should emit search event from SearchBar', () => {
    const searchBar = fixture.debugElement.query(By.directive(SearchBar)).componentInstance;
    spyOn(component, 'onSearch');
    searchBar.search.emit('test');
    expect(component.onSearch).toHaveBeenCalledWith('test');
  });

  it('should emit action from CustomButton', () => {
    const button = fixture.debugElement.query(By.directive(CustomButton)).componentInstance;
    spyOn(component, 'openModal');
    button.action.emit();
    expect(component.openModal).toHaveBeenCalled();
  });

  it('should open and close modal via Modal component', () => {
    const modal = fixture.debugElement.query(By.directive(Modal)).componentInstance;
    component.isModalOpen = true;
    fixture.detectChanges();
    expect(modal.isOpen).toBeTrue();
    modal.close.emit();
    fixture.detectChanges();
    expect(component.isModalOpen).toBeFalse();
  });
});
