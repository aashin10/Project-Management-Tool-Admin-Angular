import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsAndRoles } from './teams-and-roles';

describe('TeamsAndRoles', () => {
  let component: TeamsAndRoles;
  let fixture: ComponentFixture<TeamsAndRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamsAndRoles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamsAndRoles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default properties', () => {
    expect(component.searchQuery).toBe('');
    expect(component.selectedRole).toBe('all');
    expect(component.selectedStatus).toBe('all');
    expect(component.selectedRows).toEqual([]);
    expect(component.showDeleteModal).toBe(false);
    expect(component.memberToDelete).toBeNull();
    expect(component.showAddModal).toBe(false);
    expect(component.addMemberSearchQuery).toBe('');
    expect(component.selectedEmployee).toBeNull();
    expect(component.addMemberSelectedRoles).toEqual([]);
    expect(component.showValidationModal).toBe(false);
  });

  it('should have all required configuration data', () => {
    expect(component.roleOptions.length).toBeGreaterThan(1);
    expect(component.statusOptions.length).toBeGreaterThan(1);
    expect(component.employees.length).toBeGreaterThan(0);
    expect(component.teamMembers.length).toBeGreaterThan(0);
    expect(component.tableColumns.length).toBeGreaterThan(0);
    expect(Array.isArray(component.teamMembers[0].roles)).toBe(true);
  });

  it('should filter members by search query', () => {
    // Name search
    component.searchQuery = 'Asha';
    expect(component.filteredMembers.length).toBe(1);
    expect(component.filteredMembers[0].name).toBe('Asha Varma');

    // Email search
    component.searchQuery = 'pranav.iyer';
    expect(component.filteredMembers.length).toBe(1);
    expect(component.filteredMembers[0].name).toBe('Pranav Iyer');

    // Case insensitive
    component.searchQuery = 'ASHA';
    expect(component.filteredMembers.length).toBe(1);

    // No matches
    component.searchQuery = 'nonexistentuser';
    expect(component.filteredMembers.length).toBe(0);
  });

  it('should filter members by role and status', () => {
    component.selectedRole = 'Project Manager';
    expect(component.filteredMembers.length).toBe(2); // Asha Varma and Ethan Brown have Project Manager role
    component.filteredMembers.forEach(member => {
      expect(member.roles).toContain('Project Manager');
    });

    component.selectedStatus = 'Inactive';
    let result = component.filteredMembers;
    result.forEach(member => {
      expect(member.status).toBe('Inactive');
    });

    // Combined filters
    component.searchQuery = 'Mike';
    component.selectedRole = 'Senior Developer';
    component.selectedStatus = 'Active';
    expect(component.filteredMembers.length).toBe(1);
    expect(component.filteredMembers[0].name).toBe('Mike Johnson');
  });

  it('should transform team members to table data format', () => {
    const result = component.tableData;
    expect(result.length).toBe(component.teamMembers.length);

    const firstRow = result[0];
    expect(firstRow.member).toBeDefined();
    expect(firstRow.roles).toBeDefined();
    expect(firstRow.email).toBeDefined();
    expect(firstRow.status).toBeDefined();
    expect(firstRow.actions).toBeDefined();

    expect(firstRow.member.name).toBe('Asha Varma');
    expect(firstRow.member.avatar).toBe('AS');
    expect(Array.isArray(firstRow.roles)).toBe(true);
  });

  it('should handle row selection and count', () => {
    const selectedRows = [{ id: '1' }, { id: '2' }];
    component.onSelectionChange(selectedRows);
    expect(component.selectedRows).toEqual(selectedRows);
    expect(component.selectedCount).toBe(2);

    component.selectedRows = [];
    expect(component.selectedCount).toBe(0);
  });

  it('should handle event handlers without errors', () => {
    expect(() => component.onSearchChange()).not.toThrow();
    expect(() => component.onRoleFilterChange()).not.toThrow();
    expect(() => component.onStatusFilterChange()).not.toThrow();
  });

  it('should handle table actions correctly', () => {
    // Remove action
    const event = { action: 'remove', row: { actions: '1' } };
    component.handleTableAction(event);
    expect(component.showDeleteModal).toBe(true);
    expect(component.memberToDelete?.id).toBe('1');

    // Unknown action
    const unknownEvent = { action: 'unknown', row: { actions: '1' } };
    component.handleTableAction(unknownEvent);
    expect(component.showDeleteModal).toBe(true); // Should remain true

    // Invalid member
    const invalidEvent = { action: 'remove', row: { actions: '999' } };
    component.handleTableAction(invalidEvent);
    expect(component.memberToDelete).toBeNull();
  });

  it('should manage delete operations', () => {
    // Remove selected - no selection
    component.removeSelected();
    expect(component.showDeleteModal).toBe(false);

    // Remove selected - with selection
    component.selectedRows = [{ id: '1' }];
    component.removeSelected();
    expect(component.showDeleteModal).toBe(true);

    // Cancel delete
    component.memberToDelete = component.teamMembers[0];
    component.cancelDelete();
    expect(component.showDeleteModal).toBe(false);
    expect(component.memberToDelete).toBeNull();

    // Confirm individual delete
    const initialLength = component.teamMembers.length;
    const memberToDelete = component.teamMembers[0];
    component.memberToDelete = memberToDelete;
    component.confirmDelete();
    expect(component.teamMembers.length).toBe(initialLength - 1);
    expect(component.teamMembers.find(m => m.id === memberToDelete.id)).toBeUndefined();
  });

  it('should handle bulk deletion', () => {
    const initialLength = component.teamMembers.length;
    component.selectedRows = [
      { actions: component.teamMembers[0].id },
      { actions: component.teamMembers[1].id }
    ];
    component.memberToDelete = null; // Bulk mode

    component.confirmDelete();

    expect(component.teamMembers.length).toBe(initialLength - 2);
    expect(component.selectedRows).toEqual([]);
    expect(component.showDeleteModal).toBe(false);
  });

  it('should manage add member modal', () => {
    // Open modal
    component.addMemberModal();
    expect(component.showAddModal).toBe(true);

    // Close modal and reset state
    component.addMemberSearchQuery = 'test';
    component.selectedEmployee = component.employees[0];
    component.addMemberSelectedRoles = ['Role 1'];
    component.showValidationModal = true;

    component.closeAddModal();
    expect(component.showAddModal).toBe(false);
    expect(component.addMemberSearchQuery).toBe('');
    expect(component.selectedEmployee).toBeNull();
    expect(component.addMemberSelectedRoles).toEqual([]);
    expect(component.showValidationModal).toBe(false);
  });

  it('should filter employees correctly', () => {
    // No search query
    component.addMemberSearchQuery = '';
    expect(component.filteredEmployees.length).toBe(component.employees.length);

    // Filter by name
    component.addMemberSearchQuery = 'Amit';
    expect(component.filteredEmployees.length).toBe(1);
    expect(component.filteredEmployees[0].name).toBe('Amit Sharma');

    // Filter by email
    component.addMemberSearchQuery = 'riya.das';
    expect(component.filteredEmployees.length).toBe(1);
    expect(component.filteredEmployees[0].name).toBe('Riya Das');

    // Case insensitive
    component.addMemberSearchQuery = 'AMIT';
    expect(component.filteredEmployees.length).toBe(1);

    // No matches
    component.addMemberSearchQuery = 'nonexistent';
    expect(component.filteredEmployees.length).toBe(0);
  });

  it('should handle employee and role selection', () => {
    // Employee selection
    const employee = component.employees[0];
    component.selectEmployee(employee);
    expect(component.selectedEmployee).toBe(employee);

    // Role selection check
    component.addMemberSelectedRoles = ['Project Manager'];
    expect(component.isRoleSelected('Project Manager')).toBe(true);
    expect(component.isRoleSelected('Tech Lead')).toBe(false);

    // Role toggle on
    component.addMemberSelectedRoles = [];
    component.toggleRole('Project Manager');
    expect(component.addMemberSelectedRoles).toEqual(['Project Manager']);

    // Role toggle off
    component.toggleRole('Project Manager');
    expect(component.addMemberSelectedRoles).toEqual([]);
  });

  it('should validate member addition', () => {
    // No employee selected
    component.selectedEmployee = null;
    component.addMemberSelectedRoles = ['Project Manager'];
    component.showAddModal = true;
    component.addMember();
    expect(component.showValidationModal).toBe(true);
    expect(component.showAddModal).toBe(true);

    // No roles selected
    component.selectedEmployee = component.employees[0];
    component.addMemberSelectedRoles = [];
    component.showValidationModal = false;
    component.addMember();
    expect(component.showValidationModal).toBe(true);
  });

  it('should add member successfully', () => {
    const initialLength = component.teamMembers.length;
    component.selectedEmployee = component.employees[0];
    component.addMemberSelectedRoles = ['Project Manager', 'Tech Lead'];

    component.addMember();

    expect(component.teamMembers.length).toBe(initialLength + 1);
    expect(component.showAddModal).toBe(false);

    const newMember = component.teamMembers[component.teamMembers.length - 1];
    expect(newMember.name).toBe(component.employees[0].name);
    expect(newMember.roles).toEqual(['Project Manager', 'Tech Lead']);
    expect(newMember.status).toBe('Active');
  });

  it('should prevent duplicate member addition', () => {
    const initialLength = component.teamMembers.length;
    component.showAddModal = true;

    // Try to add existing member
    component.selectedEmployee = {
      id: '999',
      name: 'Asha Varma',
      department: 'Engineering',
      email: 'asha.varma@company.com',
      status: 'active'
    };
    component.addMemberSelectedRoles = ['Project Manager'];

    component.addMember();

    expect(component.teamMembers.length).toBe(initialLength);
    expect(component.showValidationModal).toBe(true);
  });

  it('should handle member addition with validation', () => {
    // Add new member
    const newMember = {
      id: '999',
      name: 'New Member',
      department: 'Engineering',
      email: 'new.member@company.com',
      roles: ['Developer'],
      status: 'Active'
    };

    component.handleMemberAdded(newMember);
    expect(component.teamMembers.length).toBe(13); // Initial + 1
    expect(component.teamMembers[12].name).toBe('New Member');

    // Prevent duplicate by name
    const duplicateByName = {
      id: '1000',
      name: 'Asha Varma',
      department: 'Engineering',
      email: 'different@email.com',
      roles: ['Developer'],
      status: 'Active'
    };

    component.handleMemberAdded(duplicateByName);
    expect(component.teamMembers.length).toBe(13); // Should not add
    expect(component.showValidationModal).toBe(true);
  });

  it('should handle edge cases and error conditions', () => {
    // Empty search
    component.searchQuery = '   ';
    expect(component.filteredMembers.length).toBe(component.teamMembers.length);

    // Empty employee list
    const originalEmployees = component.employees;
    component.employees = [];
    expect(component.filteredEmployees).toEqual([]);
    component.employees = originalEmployees;

    // Empty team members list
    const originalMembers = component.teamMembers;
    component.teamMembers = [];
    expect(component.filteredMembers).toEqual([]);
    component.teamMembers = originalMembers;

    // Multiple role toggles
    component.addMemberSelectedRoles = ['Role 1'];
    component.toggleRole('Role 2');
    component.toggleRole('Role 3');
    component.toggleRole('Role 1'); // Remove
    expect(component.addMemberSelectedRoles).toEqual(['Role 2', 'Role 3']);
  });

  it('should handle complete workflows', () => {
    // Complete member addition workflow
    const initialCount = component.teamMembers.length;
    component.addMemberModal();
    component.selectEmployee(component.employees[0]);
    component.toggleRole('Project Manager');
    component.toggleRole('Tech Lead');
    component.addMember();

    expect(component.teamMembers.length).toBe(initialCount + 1);
    expect(component.showAddModal).toBe(false);

    // Complete deletion workflow
    const memberToDelete = component.teamMembers[0];
    component.handleTableAction({ action: 'remove', row: { actions: memberToDelete.id } });
    component.confirmDelete();

    expect(component.teamMembers.find(m => m.id === memberToDelete.id)).toBeUndefined();
    expect(component.showDeleteModal).toBe(false);
  });
});
