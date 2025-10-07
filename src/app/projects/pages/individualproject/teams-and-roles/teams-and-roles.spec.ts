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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial Properties', () => {
    it('should have default search query', () => {
      expect(component.searchQuery).toBe('');
    });

    it('should have default selected role', () => {
      expect(component.selectedRole).toBe('all');
    });

    it('should have default selected status', () => {
      expect(component.selectedStatus).toBe('all');
    });

    it('should have empty selected rows', () => {
      expect(component.selectedRows).toEqual([]);
    });

    it('should have delete modal closed by default', () => {
      expect(component.showDeleteModal).toBe(false);
    });

    it('should have no member to delete by default', () => {
      expect(component.memberToDelete).toBeNull();
    });

    it('should have add modal closed by default', () => {
      expect(component.showAddModal).toBe(false);
    });

    it('should have empty add member search query', () => {
      expect(component.addMemberSearchQuery).toBe('');
    });

    it('should have no selected employee', () => {
      expect(component.selectedEmployee).toBeNull();
    });

    it('should have empty selected roles', () => {
      expect(component.addMemberSelectedRoles).toEqual([]);
    });

    it('should have validation modal closed', () => {
      expect(component.showValidationModal).toBe(false);
    });
  });

  describe('Configuration Data', () => {
    it('should have role options with all option first', () => {
      expect(component.roleOptions.length).toBeGreaterThan(1);
      expect(component.roleOptions[0]).toEqual({ value: 'all', label: 'All Roles' });
    });

    it('should have status options with all option first', () => {
      expect(component.statusOptions.length).toBeGreaterThan(1);
      expect(component.statusOptions[0]).toEqual({ value: 'all', label: 'All Statuses' });
    });

    it('should have employee list', () => {
      expect(component.employees.length).toBeGreaterThan(0);
      expect(component.employees[0].id).toBeDefined();
      expect(component.employees[0].name).toBeDefined();
      expect(component.employees[0].email).toBeDefined();
    });

    it('should have role options for add member', () => {
      expect(component.addMemberRoleOptions.length).toBeGreaterThan(0);
      expect(component.addMemberRoleOptions).toContain('Project Manager');
    });

    it('should have team members with roles as arrays', () => {
      expect(component.teamMembers.length).toBeGreaterThan(0);
      expect(Array.isArray(component.teamMembers[0].roles)).toBe(true);
    });

    it('should have table columns configured', () => {
      expect(component.tableColumns.length).toBeGreaterThan(0);
      expect(component.tableColumns[0].header).toBe('Member Info');
      expect(component.tableColumns[1].header).toBe('Roles');
    });
  });

  describe('filteredMembers getter', () => {
    beforeEach(() => {
      // Reset filters
      component.searchQuery = '';
      component.selectedRole = 'all';
      component.selectedStatus = 'all';
    });

    it('should return all members when no filters applied', () => {
      const result = component.filteredMembers;
      expect(result.length).toBe(component.teamMembers.length);
    });

    it('should filter by search query - name match', () => {
      component.searchQuery = 'Asha';
      const result = component.filteredMembers;
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Asha Varma');
    });

    it('should filter by search query - email match', () => {
      component.searchQuery = 'pranav.iyer';
      const result = component.filteredMembers;
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Pranav Iyer');
    });

    it('should filter by search query - case insensitive', () => {
      component.searchQuery = 'ASHA';
      const result = component.filteredMembers;
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Asha Varma');
    });

    it('should return empty array for no matches', () => {
      component.searchQuery = 'nonexistentuser';
      const result = component.filteredMembers;
      expect(result.length).toBe(0);
    });

    it('should filter by role', () => {
      component.selectedRole = 'Project Manager';
      const result = component.filteredMembers;
      expect(result.length).toBe(1);
      expect(result[0].roles).toContain('Project Manager');
    });

    it('should filter by status', () => {
      component.selectedStatus = 'Inactive';
      const result = component.filteredMembers;
      result.forEach(member => {
        expect(member.status).toBe('Inactive');
      });
    });

    it('should combine search and role filters', () => {
      component.searchQuery = 'Mike'; // Search for Mike (name contains Mike)
      component.selectedRole = 'Senior Developer'; // Filter by Senior Developer role
      const result = component.filteredMembers;
      expect(result.length).toBeGreaterThan(0);
      result.forEach(member => {
        expect(member.roles).toContain('Senior Developer');
      });
    });

    it('should combine all filters', () => {
      component.searchQuery = 'Mike';
      component.selectedRole = 'Senior Developer';
      component.selectedStatus = 'Active';
      const result = component.filteredMembers;
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Mike Johnson');
    });
  });

  describe('tableData getter', () => {
    it('should transform team members to table format', () => {
      const result = component.tableData;
      expect(result.length).toBe(component.teamMembers.length);
      expect(result[0].member).toBeDefined();
      expect(result[0].roles).toBeDefined();
      expect(result[0].email).toBeDefined();
      expect(result[0].status).toBeDefined();
      expect(result[0].actions).toBeDefined();
    });

    it('should format member info correctly', () => {
      const result = component.tableData;
      expect(result[0].member.name).toBe('Asha Varma');
      expect(result[0].member.avatar).toBe('AS');
    });

    it('should preserve roles as array', () => {
      const result = component.tableData;
      expect(Array.isArray(result[0].roles)).toBe(true);
      expect(result[0].roles).toContain('Project Manager');
    });
  });

  describe('Selection Management', () => {
    it('should handle selection changes', () => {
      const selectedRows = [{ id: '1' }, { id: '2' }];
      component.onSelectionChange(selectedRows);
      expect(component.selectedRows).toEqual(selectedRows);
    });

    it('should return correct selected count', () => {
      component.selectedRows = [{ id: '1' }, { id: '2' }];
      expect(component.selectedCount).toBe(2);
    });

    it('should return zero count when no selection', () => {
      component.selectedRows = [];
      expect(component.selectedCount).toBe(0);
    });
  });

  describe('Event Handlers', () => {
    it('should handle search change', () => {
      expect(() => component.onSearchChange()).not.toThrow();
      // Search is handled automatically through getter
    });

    it('should handle role filter change', () => {
      expect(() => component.onRoleFilterChange()).not.toThrow();
      // Filter is handled automatically through getter
    });

    it('should handle status filter change', () => {
      expect(() => component.onStatusFilterChange()).not.toThrow();
      // Filter is handled automatically through getter
    });
  });

  describe('Table Actions', () => {
    it('should handle remove action', () => {
      const event = { action: 'remove', row: { actions: '1' } };
      component.handleTableAction(event);
      expect(component.showDeleteModal).toBe(true);
      expect(component.memberToDelete?.id).toBe('1');
    });

    it('should handle unknown action', () => {
      const event = { action: 'unknown', row: { actions: '1' } };
      expect(() => component.handleTableAction(event)).not.toThrow();
      expect(component.showDeleteModal).toBe(false);
    });

    it('should handle remove action with invalid member id', () => {
      const event = { action: 'remove', row: { actions: '999' } };
      component.handleTableAction(event);
      expect(component.showDeleteModal).toBe(true);
      expect(component.memberToDelete).toBeNull();
    });
  });

  describe('Delete Operations', () => {
    beforeEach(() => {
      // Reset modal state
      component.showDeleteModal = false;
      component.memberToDelete = null;
      component.selectedRows = [];
    });

    describe('removeSelected', () => {
      it('should not show modal when no rows selected', () => {
        component.removeSelected();
        expect(component.showDeleteModal).toBe(false);
      });

      it('should show modal when rows are selected', () => {
        component.selectedRows = [{ id: '1' }];
        component.removeSelected();
        expect(component.showDeleteModal).toBe(true);
      });
    });

    describe('cancelDelete', () => {
      it('should close delete modal and reset member to delete', () => {
        component.showDeleteModal = true;
        component.memberToDelete = component.teamMembers[0];
        component.cancelDelete();
        expect(component.showDeleteModal).toBe(false);
        expect(component.memberToDelete).toBeNull();
      });
    });

    describe('confirmDelete', () => {
      it('should remove individual member', () => {
        const initialLength = component.teamMembers.length;
        const memberToDelete = component.teamMembers[0];
        component.memberToDelete = memberToDelete;

        component.confirmDelete();

        expect(component.teamMembers.length).toBe(initialLength - 1);
        expect(component.teamMembers.find(m => m.id === memberToDelete.id)).toBeUndefined();
        expect(component.showDeleteModal).toBe(false);
        expect(component.memberToDelete).toBeNull();
      });

      it('should remove selected members in bulk', () => {
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

      it('should handle bulk deletion with no selected rows', () => {
        const initialLength = component.teamMembers.length;
        component.selectedRows = [];
        component.memberToDelete = null;

        component.confirmDelete();

        expect(component.teamMembers.length).toBe(initialLength);
        expect(component.showDeleteModal).toBe(false);
      });
    });
  });

  describe('Add Member Modal', () => {
    beforeEach(() => {
      // Reset add modal state
      component.showAddModal = false;
      component.addMemberSearchQuery = '';
      component.selectedEmployee = null;
      component.addMemberSelectedRoles = [];
      component.showValidationModal = false;
    });

    describe('Modal Management', () => {
      it('should open add member modal', () => {
        component.addMemberModal();
        expect(component.showAddModal).toBe(true);
      });

      it('should close add member modal and reset state', () => {
        component.showAddModal = true;
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
    });

    describe('Employee Filtering', () => {
      it('should return all employees when no search query', () => {
        component.addMemberSearchQuery = '';
        const result = component.filteredEmployees;
        expect(result.length).toBe(component.employees.length);
      });

      it('should filter employees by name', () => {
        component.addMemberSearchQuery = 'Amit';
        const result = component.filteredEmployees;
        expect(result.length).toBe(1);
        expect(result[0].name).toBe('Amit Sharma');
      });

      it('should filter employees by email', () => {
        component.addMemberSearchQuery = 'riya.das';
        const result = component.filteredEmployees;
        expect(result.length).toBe(1);
        expect(result[0].name).toBe('Riya Das');
      });

      it('should filter case insensitively', () => {
        component.addMemberSearchQuery = 'AMIT';
        const result = component.filteredEmployees;
        expect(result.length).toBe(1);
        expect(result[0].name).toBe('Amit Sharma');
      });

      it('should return empty array for no matches', () => {
        component.addMemberSearchQuery = 'nonexistent';
        const result = component.filteredEmployees;
        expect(result.length).toBe(0);
      });
    });

    describe('Employee Selection', () => {
      it('should select employee', () => {
        const employee = component.employees[0];
        component.selectEmployee(employee);
        expect(component.selectedEmployee).toBe(employee);
      });
    });

    describe('Role Selection', () => {
      it('should check if role is selected', () => {
        component.addMemberSelectedRoles = ['Project Manager'];
        expect(component.isRoleSelected('Project Manager')).toBe(true);
        expect(component.isRoleSelected('Tech Lead')).toBe(false);
      });

      it('should toggle role on (add)', () => {
        component.addMemberSelectedRoles = [];
        component.toggleRole('Project Manager');
        expect(component.addMemberSelectedRoles).toEqual(['Project Manager']);
      });

      it('should toggle role off (remove)', () => {
        component.addMemberSelectedRoles = ['Project Manager'];
        component.toggleRole('Project Manager');
        expect(component.addMemberSelectedRoles).toEqual([]);
      });
    });

    describe('Member Addition', () => {
      it('should show validation modal when no employee selected', () => {
        // Setup test state
        component.selectedEmployee = null;
        component.addMemberSelectedRoles = ['Project Manager'];
        component.showAddModal = true;
        component.showValidationModal = false;

        component.addMember();

        expect(component.showValidationModal).toBe(true);
        expect(component.showAddModal).toBe(true); // Modal should stay open
      });

      it('should show validation modal when no roles selected', () => {
        // Setup test state
        component.selectedEmployee = component.employees[0];
        component.addMemberSelectedRoles = [];
        component.showAddModal = true;
        component.showValidationModal = false;

        component.addMember();

        expect(component.showValidationModal).toBe(true);
        expect(component.showAddModal).toBe(true);
      });

      it('should add member successfully', () => {
        const initialLength = component.teamMembers.length;
        component.selectedEmployee = component.employees[0];
        component.addMemberSelectedRoles = ['Project Manager', 'Tech Lead'];

        spyOn(component, 'handleMemberAdded').and.callThrough();

        component.addMember();

        expect(component.handleMemberAdded).toHaveBeenCalledWith({
          ...component.employees[0],
          roles: ['Project Manager', 'Tech Lead'],
          status: 'Active'
        });
        expect(component.teamMembers.length).toBe(initialLength + 1);
        expect(component.showAddModal).toBe(false);
      });

      it('should prevent duplicate member addition', () => {
        const initialLength = component.teamMembers.length;
        // Setup test state
        component.showAddModal = true;
        component.showValidationModal = false;

        // Try to add a member that already exists (Asha Varma)
        component.selectedEmployee = {
          id: '999',
          name: 'Asha Varma',
          department: 'Engineering',
          email: 'asha.varma@company.com',
          status: 'active'
        };
        component.addMemberSelectedRoles = ['Project Manager'];

        component.addMember();

        expect(component.teamMembers.length).toBe(initialLength); // Should not add
        expect(component.showValidationModal).toBe(true);
        expect(component.showAddModal).toBe(true); // Modal should stay open
      });
    });

    describe('handleMemberAdded', () => {
      it('should add new member to team', () => {
        const initialLength = component.teamMembers.length;
        const newMember = {
          id: '999',
          name: 'New Member',
          department: 'Engineering',
          email: 'new.member@company.com',
          roles: ['Developer'],
          status: 'Active'
        };

        component.handleMemberAdded(newMember);

        expect(component.teamMembers.length).toBe(initialLength + 1);
        const addedMember = component.teamMembers[component.teamMembers.length - 1];
        expect(addedMember.name).toBe('New Member');
        expect(addedMember.roles).toEqual(['Developer']);
        expect(component.showAddModal).toBe(false);
      });

      it('should generate unique ID for new member', () => {
        const newMember = {
          id: 'existing',
          name: 'Test Member',
          department: 'Engineering',
          email: 'test@company.com',
          roles: ['Tester'],
          status: 'Active'
        };

        component.handleMemberAdded(newMember);

        const addedMember = component.teamMembers[component.teamMembers.length - 1];
        expect(addedMember.id).not.toBe('existing');
        expect(typeof addedMember.id).toBe('string');
      });

      it('should prevent duplicate by name', () => {
        const initialLength = component.teamMembers.length;
        const duplicateMember = {
          id: '999',
          name: 'Asha Varma', // Existing name
          department: 'Engineering',
          email: 'different@email.com',
          roles: ['Developer'],
          status: 'Active'
        };

        component.handleMemberAdded(duplicateMember);

        expect(component.teamMembers.length).toBe(initialLength);
        expect(component.showValidationModal).toBe(true);
      });

      it('should prevent duplicate by email', () => {
        const initialLength = component.teamMembers.length;
        const duplicateMember = {
          id: '999',
          name: 'Different Name',
          department: 'Engineering',
          email: 'asha.varma@company.com', // Existing email
          roles: ['Developer'],
          status: 'Active'
        };

        component.handleMemberAdded(duplicateMember);

        expect(component.teamMembers.length).toBe(initialLength);
        expect(component.showValidationModal).toBe(true);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty search query', () => {
      component.searchQuery = '   '; // Only whitespace
      const result = component.filteredMembers;
      expect(result.length).toBe(component.teamMembers.length);
    });

    it('should handle undefined member status', () => {
      const memberWithoutStatus = {
        id: '999',
        name: 'Test Member',
        department: 'Engineering',
        roles: ['Developer'],
        email: 'test@company.com'
        // No status property
      };

      component.teamMembers.push(memberWithoutStatus as any);
      component.selectedStatus = 'Active';

      const result = component.filteredMembers;
      const foundMember = result.find(m => m.id === '999');
      expect(foundMember).toBeUndefined(); // Should not match any status filter

      // Clean up
      component.teamMembers.pop();
    });

    it('should handle null member in table action', () => {
      spyOn(console, 'log');
      const event = { action: 'remove', row: { actions: 'nonexistent' } };
      component.handleTableAction(event);
      expect(component.showDeleteModal).toBe(true);
      expect(component.memberToDelete).toBeNull();
    });

    it('should handle empty employee list', () => {
      const originalEmployees = component.employees;
      component.employees = [];

      const result = component.filteredEmployees;
      expect(result).toEqual([]);

      // Restore
      component.employees = originalEmployees;
    });

    it('should handle empty team members list', () => {
      const originalMembers = component.teamMembers;
      component.teamMembers = [];

      const result = component.filteredMembers;
      expect(result).toEqual([]);

      // Restore
      component.teamMembers = originalMembers;
    });

    it('should handle bulk deletion with empty selection', () => {
      const originalMembers = component.teamMembers;
      component.selectedRows = [];
      component.memberToDelete = null;

      component.confirmDelete();

      expect(component.teamMembers).toEqual(originalMembers);
      expect(component.showDeleteModal).toBe(false);
    });

    it('should handle role toggle with empty array', () => {
      component.addMemberSelectedRoles = [];
      component.toggleRole('New Role');
      expect(component.addMemberSelectedRoles).toEqual(['New Role']);
    });

    it('should handle multiple role toggles', () => {
      component.addMemberSelectedRoles = ['Role 1'];
      component.toggleRole('Role 2');
      component.toggleRole('Role 3');
      component.toggleRole('Role 1'); // Remove

      expect(component.addMemberSelectedRoles).toEqual(['Role 2', 'Role 3']);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete member addition workflow', () => {
      const initialMemberCount = component.teamMembers.length;

      // Open modal
      component.addMemberModal();
      expect(component.showAddModal).toBe(true);

      // Select employee
      component.selectEmployee(component.employees[0]);
      expect(component.selectedEmployee).toBe(component.employees[0]);

      // Select roles
      component.toggleRole('Project Manager');
      component.toggleRole('Tech Lead');
      expect(component.addMemberSelectedRoles).toEqual(['Project Manager', 'Tech Lead']);

      // Add member
      component.addMember();
      expect(component.teamMembers.length).toBe(initialMemberCount + 1);
      expect(component.showAddModal).toBe(false);

      // Verify added member
      const newMember = component.teamMembers[component.teamMembers.length - 1];
      expect(newMember.name).toBe(component.employees[0].name);
      expect(newMember.roles).toEqual(['Project Manager', 'Tech Lead']);
      expect(newMember.status).toBe('Active');
    });

    it('should handle complete deletion workflow', () => {
      const initialMemberCount = component.teamMembers.length;
      const memberToDelete = component.teamMembers[0];

      // Select member for deletion
      component.handleTableAction({ action: 'remove', row: { actions: memberToDelete.id } });
      expect(component.showDeleteModal).toBe(true);
      expect(component.memberToDelete).toBe(memberToDelete);

      // Confirm deletion
      component.confirmDelete();
      expect(component.teamMembers.length).toBe(initialMemberCount - 1);
      expect(component.teamMembers.find(m => m.id === memberToDelete.id)).toBeUndefined();
      expect(component.showDeleteModal).toBe(false);
    });

    it('should handle complex filtering scenario', () => {
      // Set up filters - should only return Mike Johnson
      component.searchQuery = 'Mike'; // Search for Mike by name
      component.selectedRole = 'Senior Developer'; // Filter by Senior Developer role
      component.selectedStatus = 'Active'; // Filter by Active status

      const result = component.filteredMembers;

      // Should only return Mike Johnson who matches all criteria
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Mike Johnson');
      expect(result[0].roles).toContain('Senior Developer');
      expect(result[0].status).toBe('Active');
    });
  });
});
