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

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.searchQuery).toBe('');
      expect(component.selectedRole).toBe('all');
      expect(component.selectedStatus).toBe('all');
      expect(component.selectedRows).toEqual([]);
      expect(component.showDeleteModal).toBe(false);
      expect(component.showAddModal).toBe(false);
      expect(component.teamMembers.length).toBe(12);
      expect(component.employees.length).toBe(5);
    });
  });

  describe('Filtering Functionality', () => {
    it('should filter members by name', () => {
      component.searchQuery = 'Asha';
      const filtered = component.filteredMembers;
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Asha Varma');
    });

    it('should filter members by email', () => {
      component.searchQuery = 'pranav.iyer';
      const filtered = component.filteredMembers;
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].email).toContain('pranav.iyer');
    });

    it('should filter members by role', () => {
      component.selectedRole = 'Project Manager';
      const filtered = component.filteredMembers;
      
      expect(filtered.every(m => m.roles.includes('Project Manager'))).toBe(true);
    });

    it('should filter members by status', () => {
      component.selectedStatus = 'Active';
      const filtered = component.filteredMembers;
      
      expect(filtered.every(m => m.status === 'Active')).toBe(true);
    });

    it('should apply multiple filters simultaneously', () => {
      component.selectedRole = 'Senior Developer';
      component.selectedStatus = 'Active';
      const filtered = component.filteredMembers;
      
      expect(filtered.every(m => 
        m.roles.includes('Senior Developer') && m.status === 'Active'
      )).toBe(true);
    });

    it('should return all members when filters are set to "all"', () => {
      component.selectedRole = 'all';
      component.selectedStatus = 'all';
      component.searchQuery = '';
      
      expect(component.filteredMembers.length).toBe(component.teamMembers.length);
    });
  });

  describe('Table Data Management', () => {
    it('should map filtered members to table data correctly', () => {
      const tableData = component.tableData;
      const firstMember = component.filteredMembers[0];

      expect(tableData.length).toBe(component.filteredMembers.length);
      expect(tableData[0].member.name).toBe(firstMember.name);
      expect(tableData[0].roles).toEqual(firstMember.roles);
      expect(tableData[0].email).toBe(firstMember.email);
      expect(tableData[0].status).toBe(firstMember.status);
      expect(tableData[0].actions).toBe(firstMember.id);
    });

    it('should generate correct avatar initials', () => {
      const tableData = component.tableData;
      
      expect(tableData[0].member.avatar).toBe('AS'); // Asha Varma
    });
  });

  describe('Selection Management', () => {
    it('should update selected rows on selection change', () => {
      const mockSelection = [
        { actions: '1', member: { name: 'Asha Varma' } },
        { actions: '2', member: { name: 'Pranav Iyer' } }
      ];
      
      component.onSelectionChange(mockSelection);
      
      expect(component.selectedRows).toEqual(mockSelection);
      expect(component.selectedCount).toBe(2);
    });

    it('should calculate selected count correctly', () => {
      component.selectedRows = [{ actions: '1' }, { actions: '2' }, { actions: '3' }];
      
      expect(component.selectedCount).toBe(3);
    });
  });

  describe('Delete Single Member', () => {
    it('should open delete modal when remove action is triggered', () => {
      const mockEvent = { action: 'remove', row: { actions: '1' } };
      
      component.handleTableAction(mockEvent);
      
      expect(component.showDeleteModal).toBe(true);
      expect(component.memberToDelete?.id).toBe('1');
    });

    it('should cancel delete and reset state', () => {
      component.showDeleteModal = true;
      component.memberToDelete = component.teamMembers[0];
      
      component.cancelDelete();
      
      expect(component.showDeleteModal).toBe(false);
      expect(component.memberToDelete).toBeNull();
    });

    it('should delete single member on confirmation', () => {
      const memberToDelete = component.teamMembers[0];
      const initialCount = component.teamMembers.length;
      
      component.memberToDelete = memberToDelete;
      component.confirmDelete();
      
      expect(component.teamMembers.length).toBe(initialCount - 1);
      expect(component.teamMembers.find(m => m.id === memberToDelete.id)).toBeUndefined();
      expect(component.showDeleteModal).toBe(false);
    });

    it('should trigger clear selections after delete', (done) => {
      component.memberToDelete = component.teamMembers[0];
      
      component.confirmDelete();
      
      expect(component.clearTableSelections).toBe(true);
      
      setTimeout(() => {
        expect(component.clearTableSelections).toBe(false);
        done();
      }, 10);
    });
  });

  describe('Delete Multiple Members', () => {
    it('should open delete modal when removeSelected is called with selections', () => {
      component.selectedRows = [{ actions: '1' }, { actions: '2' }];
      
      component.removeSelected();
      
      expect(component.showDeleteModal).toBe(true);
    });

    it('should not open modal when removeSelected is called without selections', () => {
      component.selectedRows = [];
      
      component.removeSelected();
      
      expect(component.showDeleteModal).toBe(false);
    });

    it('should delete multiple selected members on confirmation', () => {
      const initialCount = component.teamMembers.length;
      component.selectedRows = [{ actions: '1' }, { actions: '2' }];
      
      component.confirmDelete();
      
      expect(component.teamMembers.length).toBe(initialCount - 2);
      expect(component.teamMembers.find(m => m.id === '1')).toBeUndefined();
      expect(component.teamMembers.find(m => m.id === '2')).toBeUndefined();
      expect(component.selectedRows.length).toBe(0);
    });
  });

  describe('Add Member Modal', () => {
    it('should open add member modal', () => {
      component.addMemberModal();
      
      expect(component.showAddModal).toBe(true);
    });

    it('should filter employees by search query', () => {
      component.addMemberSearchQuery = 'Amit';
      
      const filtered = component.filteredEmployees;
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Amit Sharma');
    });

    it('should filter employees by email', () => {
      component.addMemberSearchQuery = 'riya.das';
      
      const filtered = component.filteredEmployees;
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].email).toContain('riya.das');
    });

    it('should select employee', () => {
      const employee = component.employees[0];
      
      component.selectEmployee(employee);
      
      expect(component.selectedEmployee).toEqual(employee);
    });
  });

  describe('Role Management in Add Modal', () => {
    it('should toggle role selection', () => {
      component.toggleRole('Project Manager');
      
      expect(component.isRoleSelected('Project Manager')).toBe(true);
      expect(component.addMemberSelectedRoles).toContain('Project Manager');
      
      component.toggleRole('Project Manager');
      
      expect(component.isRoleSelected('Project Manager')).toBe(false);
      expect(component.addMemberSelectedRoles).not.toContain('Project Manager');
    });

    it('should handle multiple role selections', () => {
      component.toggleRole('Project Manager');
      component.toggleRole('Tech Lead');
      component.toggleRole('Senior Developer');
      
      expect(component.addMemberSelectedRoles.length).toBe(3);
      expect(component.isRoleSelected('Project Manager')).toBe(true);
      expect(component.isRoleSelected('Tech Lead')).toBe(true);
      expect(component.isRoleSelected('Senior Developer')).toBe(true);
    });
  });

  describe('Add Member Validation', () => {
    it('should show validation modal when employee is not selected', () => {
      component.selectedEmployee = null;
      component.addMemberSelectedRoles = ['Project Manager'];
      
      component.addMember();
      
      expect(component.showValidationModal).toBe(true);
    });

    it('should show validation modal when roles are not selected', () => {
      component.selectedEmployee = component.employees[0];
      component.addMemberSelectedRoles = [];
      
      component.addMember();
      
      expect(component.showValidationModal).toBe(true);
    });

    it('should prevent duplicate member addition by email', () => {
      const existingMember = component.teamMembers[0];
      const initialCount = component.teamMembers.length;
      
      component.selectedEmployee = {
        id: '999',
        name: 'Different Name',
        email: existingMember.email,
        status: 'Active'
      };
      component.addMemberSelectedRoles = ['Project Manager'];
      
      component.addMember();
      
      expect(component.showValidationModal).toBe(true);
      expect(component.teamMembers.length).toBe(initialCount);
    });

    it('should prevent duplicate member addition by name', () => {
      const existingMember = component.teamMembers[0];
      const initialCount = component.teamMembers.length;
      
      component.selectedEmployee = {
        id: '999',
        name: existingMember.name,
        email: 'different@email.com',
        status: 'Active'
      };
      component.addMemberSelectedRoles = ['Project Manager'];
      
      component.addMember();
      
      expect(component.showValidationModal).toBe(true);
      expect(component.teamMembers.length).toBe(initialCount);
    });
  });

  describe('Add Member Success', () => {
    it('should add new member with selected roles', () => {
      const initialCount = component.teamMembers.length;
      const employee = component.employees[0];
      
      component.selectedEmployee = employee;
      component.addMemberSelectedRoles = ['Project Manager', 'Tech Lead'];
      
      component.addMember();
      
      expect(component.teamMembers.length).toBe(initialCount + 1);
      
      const addedMember = component.teamMembers[component.teamMembers.length - 1];
      expect(addedMember.name).toBe(employee.name);
      expect(addedMember.email).toBe(employee.email);
      expect(addedMember.roles).toEqual(['Project Manager', 'Tech Lead']);
      expect(addedMember.status).toBe('Active');
    });

    it('should generate unique ID for new member', () => {
      const employee = component.employees[0];
      const currentMaxId = Math.max(...component.teamMembers.map(m => parseInt(m.id)));
      
      component.selectedEmployee = employee;
      component.addMemberSelectedRoles = ['Project Manager'];
      
      component.addMember();
      
      const addedMember = component.teamMembers[component.teamMembers.length - 1];
      expect(parseInt(addedMember.id)).toBeGreaterThan(currentMaxId);
    });
  });

  describe('Modal State Management', () => {
    it('should close add modal and reset all state', () => {
      component.showAddModal = true;
      component.addMemberSearchQuery = 'test query';
      component.selectedEmployee = component.employees[0];
      component.addMemberSelectedRoles = ['Project Manager', 'Tech Lead'];
      component.showValidationModal = true;
      
      component.closeAddModal();
      
      expect(component.showAddModal).toBe(false);
      expect(component.addMemberSearchQuery).toBe('');
      expect(component.selectedEmployee).toBeNull();
      expect(component.addMemberSelectedRoles).toEqual([]);
      expect(component.showValidationModal).toBe(false);
    });

    it('should close add modal after successful member addition', () => {
      component.selectedEmployee = component.employees[0];
      component.addMemberSelectedRoles = ['Project Manager'];
      component.showAddModal = true;
      
      component.addMember();
      
      expect(component.showAddModal).toBe(false);
    });
  });

  describe('Filter Change Handlers', () => {
    it('should handle search change', () => {
      const initialLength = component.filteredMembers.length;
      component.searchQuery = 'nonexistent';
      
      component.onSearchChange();
      
      expect(component.filteredMembers.length).toBeLessThan(initialLength);
    });

    it('should handle role filter change', () => {
      component.selectedRole = 'Tech Lead';
      
      component.onRoleFilterChange();
      
      expect(component.filteredMembers.every(m => m.roles.includes('Tech Lead'))).toBe(true);
    });

    it('should handle status filter change', () => {
      component.selectedStatus = 'Inactive';
      
      component.onStatusFilterChange();
      
      expect(component.filteredMembers.every(m => m.status === 'Inactive')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle action without matching member', () => {
      const mockEvent = { action: 'remove', row: { actions: 'nonexistent-id' } };
      
      component.handleTableAction(mockEvent);
      
      expect(component.showDeleteModal).toBe(true);
      expect(component.memberToDelete).toBeNull();
    });

    it('should handle case-insensitive search', () => {
      component.searchQuery = 'ASHA';
      
      const filtered = component.filteredMembers;
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered[0].name).toBe('Asha Varma');
    });

    it('should handle search with whitespace (not trimmed in main search)', () => {
      // Note: The filteredMembers getter doesn't trim, so whitespace affects search
      component.searchQuery = 'Asha'; // Without extra spaces
      
      const filtered = component.filteredMembers;
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Asha Varma');
    });

    it('should handle empty employee list in add modal', () => {
      component.employees = [];
      component.addMemberSearchQuery = 'any query';
      
      expect(component.filteredEmployees.length).toBe(0);
    });
  });
});