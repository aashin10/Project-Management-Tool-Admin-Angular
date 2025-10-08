import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TeamsAndRoles } from './teams-and-roles';
import { Table } from '../../../../shared/table/table';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { Modal } from '../../../../shared/modal/modal';

describe('TeamsAndRoles Component', () => {
  let component: TeamsAndRoles;
  let fixture: ComponentFixture<TeamsAndRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamsAndRoles, FormsModule, Table, CustomButton, Modal]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsAndRoles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test 1: Component Creation
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Initial State
  it('should initialize with default values', () => {
    expect(component.searchQuery).toBe('');
    expect(component.selectedRole).toBe('all');
    expect(component.selectedStatus).toBe('all');
    expect(component.selectedRows).toEqual([]);
    expect(component.showDeleteModal).toBe(false);
    expect(component.showAddModal).toBe(false);
    expect(component.teamMembers.length).toBe(12);
  });

  // Test 3: Filter by Search Query (Name)
  it('should filter team members by name in search query', () => {
    component.searchQuery = 'Asha';
    const filtered = component.filteredMembers;
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Asha Varma');
  });

  // Test 4: Filter by Search Query (Email)
  it('should filter team members by email in search query', () => {
    component.searchQuery = 'pranav.iyer';
    const filtered = component.filteredMembers;
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].email).toContain('pranav.iyer');
  });

  // Test 5: Filter by Role
  it('should filter team members by selected role', () => {
    component.selectedRole = 'Project Manager';
    const filtered = component.filteredMembers;
    
    expect(filtered.length).toBe(2); // Asha Varma and Ethan Brown
    expect(filtered.every(m => m.roles.includes('Project Manager'))).toBe(true);
  });

  // Test 6: Filter by Status
  it('should filter team members by status', () => {
    component.selectedStatus = 'Active';
    const filtered = component.filteredMembers;
    
    const activeMembers = component.teamMembers.filter(m => m.status === 'Active');
    expect(filtered.length).toBe(activeMembers.length);
    expect(filtered.every(m => m.status === 'Active')).toBe(true);
  });

  // Test 7: Combined Filters
  it('should apply multiple filters together', () => {
    component.searchQuery = 'engineer';
    component.selectedRole = 'Senior Developer';
    component.selectedStatus = 'Active';
    
    const filtered = component.filteredMembers;
    
    expect(filtered.every(m => 
      (m.name.toLowerCase().includes('engineer') || m.email.toLowerCase().includes('engineer')) &&
      m.roles.includes('Senior Developer') &&
      m.status === 'Active'
    )).toBe(true);
  });

  // Test 8: Table Data Mapping
  it('should correctly map team members to table data', () => {
    const tableData = component.tableData;

    expect(tableData.length).toBe(component.filteredMembers.length);
    expect(tableData[0]).toEqual(jasmine.objectContaining({
      member: jasmine.any(Object),
      roles: jasmine.any(Array),
      email: jasmine.any(String),
      status: jasmine.any(String),
      actions: jasmine.any(String)
    }));
  });

  // Test 9: Selection Change
  it('should update selected rows when selection changes', () => {
    const mockSelectedRows = [
      { actions: '1', member: { name: 'Asha Varma' } },
      { actions: '2', member: { name: 'Pranav Iyer' } }
    ];
    
    component.onSelectionChange(mockSelectedRows);
    
    expect(component.selectedRows).toEqual(mockSelectedRows);
    expect(component.selectedCount).toBe(2);
  });

  // Test 10: Handle Remove Action
  it('should open delete modal when remove action is triggered', () => {
    const mockEvent = {
      action: 'remove',
      row: { actions: '1' }
    };
    
    component.handleTableAction(mockEvent);
    
    expect(component.showDeleteModal).toBe(true);
    expect(component.memberToDelete).toBeTruthy();
    expect(component.memberToDelete?.id).toBe('1');
  });

  // Test 11: Cancel Delete
  it('should close delete modal and clear memberToDelete on cancel', () => {
    component.showDeleteModal = true;
    component.memberToDelete = component.teamMembers[0];
    
    component.cancelDelete();
    
    expect(component.showDeleteModal).toBe(false);
    expect(component.memberToDelete).toBeNull();
  });

  // Test 12: Confirm Delete Single Member
  it('should delete a single member when confirmed', () => {
    const memberToDelete = component.teamMembers[0];
    const initialCount = component.teamMembers.length;
    
    component.memberToDelete = memberToDelete;
    component.confirmDelete();
    
    expect(component.teamMembers.length).toBe(initialCount - 1);
    expect(component.teamMembers.find(m => m.id === memberToDelete.id)).toBeUndefined();
    expect(component.showDeleteModal).toBe(false);
  });

  // Test 13: Confirm Delete Multiple Members
  it('should delete multiple selected members when confirmed', () => {
    const initialCount = component.teamMembers.length;
    component.selectedRows = [
      { actions: '1' },
      { actions: '2' }
    ];
    
    component.confirmDelete();
    
    expect(component.teamMembers.length).toBe(initialCount - 2);
    expect(component.teamMembers.find(m => m.id === '1')).toBeUndefined();
    expect(component.teamMembers.find(m => m.id === '2')).toBeUndefined();
    expect(component.showDeleteModal).toBe(false);
  });

  // Test 14: Open Add Member Modal
  it('should open add member modal', () => {
    component.addMemberModal();
    
    expect(component.showAddModal).toBe(true);
  });

  // Test 15: Filter Employees in Add Modal
  it('should filter employees by search query in add modal', () => {
    component.addMemberSearchQuery = 'Amit';
    const filtered = component.filteredEmployees;
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Amit Sharma');
  });

  // Test 16: Select Employee and Toggle Roles
  it('should select employee and toggle roles', () => {
    const employee = component.employees[0];
    
    component.selectEmployee(employee);
    expect(component.selectedEmployee).toEqual(employee);
    
    component.toggleRole('Project Manager');
    expect(component.isRoleSelected('Project Manager')).toBe(true);
    
    component.toggleRole('Tech Lead');
    expect(component.isRoleSelected('Tech Lead')).toBe(true);
    
    component.toggleRole('Project Manager');
    expect(component.isRoleSelected('Project Manager')).toBe(false);
  });

  // Test 17: Add Member Successfully
  it('should add a new member with selected employee and roles', () => {
    const initialCount = component.teamMembers.length;
    const employee = component.employees[0];
    
    component.selectedEmployee = employee;
    component.addMemberSelectedRoles = ['Project Manager', 'Tech Lead'];
    
    component.addMember();
    
    expect(component.teamMembers.length).toBe(initialCount + 1);
    const addedMember = component.teamMembers[component.teamMembers.length - 1];
    expect(addedMember.name).toBe(employee.name);
    expect(addedMember.roles).toEqual(['Project Manager', 'Tech Lead']);
    expect(addedMember.status).toBe('Active');
  });

  // Test 18: Prevent Duplicate Member Addition
  it('should show validation error when trying to add duplicate member', () => {
    const existingMember = component.teamMembers[0];
    
    component.selectedEmployee = {
      id: '999',
      name: existingMember.name,
      email: existingMember.email,
      department: existingMember.department,
      status: 'Active'
    };
    component.addMemberSelectedRoles = ['Project Manager'];
    
    component.addMember();
    
    expect(component.showValidationModal).toBe(true);
    expect(component.teamMembers.length).toBe(12); // Should not add duplicate
  });

  // Test 19: Show Validation Modal for Missing Fields
  it('should show validation modal when employee or roles are missing', () => {
    component.selectedEmployee = null;
    component.addMemberSelectedRoles = [];
    
    component.addMember();
    
    expect(component.showValidationModal).toBe(true);
  });

  // Test 20: Close Add Modal and Reset State
  it('should close add modal and reset all related state', () => {
    component.showAddModal = true;
    component.addMemberSearchQuery = 'test';
    component.selectedEmployee = component.employees[0];
    component.addMemberSelectedRoles = ['Project Manager'];
    
    component.closeAddModal();
    
    expect(component.showAddModal).toBe(false);
    expect(component.addMemberSearchQuery).toBe('');
    expect(component.selectedEmployee).toBeNull();
    expect(component.addMemberSelectedRoles).toEqual([]);
  });

  // Test 21: Remove Selected with Empty Selection
  it('should not proceed with removal when no rows are selected', () => {
    component.selectedRows = [];
    const initialCount = component.teamMembers.length;

    component.removeSelected();

    // Modal should not open when no rows are selected
    expect(component.showDeleteModal).toBe(false);
    expect(component.teamMembers.length).toBe(initialCount);
  });

  // Test 22: Clear Table Selections After Delete
  it('should trigger clearTableSelections flag after confirming delete', (done) => {
    component.memberToDelete = component.teamMembers[0];
    
    component.confirmDelete();
    
    expect(component.clearTableSelections).toBe(true);
    
    // Check that flag is reset after timeout
    setTimeout(() => {
      expect(component.clearTableSelections).toBe(false);
      done();
    }, 10);
  });
});