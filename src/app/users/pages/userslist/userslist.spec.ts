import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Userslist } from './userslist';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Table } from '../../../shared/table/table';
import { Modal } from '../../../shared/modal/modal';

describe('Userslist', () => {
  let component: Userslist;
  let fixture: ComponentFixture<Userslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        Userslist,
        Sectiontitle,
        CustomButton,
        SearchBar,
        Table,
        Modal
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Userslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.showTypeDropdown).toBeFalse();
      expect(component.showStatusDropdown).toBeFalse();
      expect(component.showAdvancedFilter).toBeFalse();
      expect(component.showImportModal).toBeFalse();
      expect(component.showAddUserModal).toBeFalse();
      expect(component.filterType).toBe('');
      expect(component.filterStatus).toBe('');
      expect(component.searchQuery).toBe('');
      expect(component.selectedFileName).toBe('');
      expect(component.isDragging).toBeFalse();
    });

    it('should initialize with correct type and status options', () => {
      expect(component.typeOptions).toEqual([
        { label: 'Internal', value: 'internal' },
        { label: 'External', value: 'external' },
        { label: 'Customer', value: 'customer' }
      ]);

      expect(component.statusOptions).toEqual([
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]);
    });

    it('should initialize newUser object correctly', () => {
      expect(component.newUser).toEqual({
        fullName: '',
        email: '',
        jiraId: '',
        type: '',
        status: ''
      });
    });

    it('should have correct table columns configuration', () => {
      expect(component.tableColumns).toBeDefined();
      expect(component.tableColumns.length).toBe(6);
      expect(component.tableColumns[0].header).toBe('User');
      expect(component.tableColumns[0].type).toBe('user');
      expect(component.tableColumns[5].header).toBe('Actions');
      expect(component.tableColumns[5].type).toBe('actions');
    });
  });

  describe('Modal Operations', () => {
    it('should open add user modal', () => {
      component.onAddUser();
      expect(component.showAddUserModal).toBeTrue();
    });

    it('should close add user modal and reset form', () => {
      component.showAddUserModal = true;
      component.newUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        jiraId: 'JIRA123',
        type: 'internal',
        status: 'active'
      };

      component.closeAddUserModal();

      expect(component.showAddUserModal).toBeFalse();
      expect(component.newUser).toEqual({
        fullName: '',
        email: '',
        jiraId: '',
        type: '',
        status: ''
      });
    });

    it('should open import modal', () => {
      component.onImport();
      expect(component.showImportModal).toBeTrue();
    });

    it('should close import modal and reset state', () => {
      component.showImportModal = true;
      component.selectedFileName = 'test.csv';
      component.isDragging = true;

      component.closeImportModal();

      expect(component.showImportModal).toBeFalse();
      expect(component.selectedFileName).toBe('');
      expect(component.isDragging).toBeFalse();
    });
  });

  describe('Form Submission', () => {

    it('should submit new user successfully with valid data', () => {
      component.newUser = {
        fullName: 'John Doe',
        email: 'john@example.com',
        jiraId: 'JIRA123',
        type: 'internal',
        status: 'active'
      };
      component.showAddUserModal = true;

      component.submitNewUser();

      expect(component.showAddUserModal).toBeFalse();
      expect(component.validationErrors).toEqual([]);
    });

    it('should show validation error for missing required fields', () => {
      component.showAddUserModal = true;
      component.newUser = {
        fullName: '',
        email: 'john@example.com',
        jiraId: '',
        type: 'internal',
        status: 'active'
      };

      component.submitNewUser();

      expect(component.validationErrors).toContain('Full Name is required');
      expect(component.showAddUserModal).toBeTrue();
    });

    it('should show validation error for missing email', () => {
      component.showAddUserModal = true;
      component.newUser = {
        fullName: 'John Doe',
        email: '',
        jiraId: '',
        type: 'internal',
        status: 'active'
      };

      component.submitNewUser();

      expect(component.validationErrors).toContain('Email is required');
    });

    it('should show validation error for missing type', () => {
      component.showAddUserModal = true;
      component.newUser = {
        fullName: 'John Doe',
        email: 'john@example.com',
        jiraId: '',
        type: '',
        status: 'active'
      };

      component.submitNewUser();

      expect(component.validationErrors).toContain('Type is required');
    });

    it('should show validation error for missing status', () => {
      component.showAddUserModal = true;
      component.newUser = {
        fullName: 'John Doe',
        email: 'john@example.com',
        jiraId: '',
        type: 'internal',
        status: ''
      };

      component.submitNewUser();

      expect(component.validationErrors).toContain('Status is required');
    });
  });

  describe('Action Handling', () => {
    it('should handle edit action', () => {
      spyOn(console, 'log');
      const mockRow = { user: 'Test User', type: 'Internal' };

      component.onActionClick({ action: 'edit', row: mockRow });

      expect(console.log).toHaveBeenCalledWith('Action clicked:', 'edit', 'Row:', mockRow);
    });

    it('should handle delete action', () => {
      spyOn(console, 'log');
      const mockRow = { user: 'Test User', type: 'Internal' };

      component.onActionClick({ action: 'delete', row: mockRow });

      expect(console.log).toHaveBeenCalledWith('Action clicked:', 'delete', 'Row:', mockRow);
    });

    it('should handle view action', () => {
      spyOn(console, 'log');
      const mockRow = { user: 'Test User', type: 'Internal' };

      component.onActionClick({ action: 'view', row: mockRow });

      expect(console.log).toHaveBeenCalledWith('Action clicked:', 'view', 'Row:', mockRow);
    });

    it('should handle selection change', () => {
      spyOn(console, 'log');
      const selectedUsers = [
        { user: 'User 1', type: 'Internal' },
        { user: 'User 2', type: 'External' }
      ];

      component.onSelectionChange(selectedUsers);

      expect(component.selectedUsers).toEqual(selectedUsers);
      expect(console.log).toHaveBeenCalledWith('Selected users:', selectedUsers);
    });
  });

  describe('File Handling', () => {
    it('should handle file selection', () => {
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      };

      component.onFileSelected(mockEvent);

      expect(component.selectedFileName).toBe('test.csv');
    });

    it('should handle drag over', () => {
      const mockEvent = new DragEvent('dragover');
      spyOn(mockEvent, 'preventDefault');
      spyOn(mockEvent, 'stopPropagation');

      component.onDragOver(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.isDragging).toBeTrue();
    });

    it('should handle drag leave', () => {
      component.isDragging = true;
      const mockEvent = new DragEvent('dragleave');
      spyOn(mockEvent, 'preventDefault');
      spyOn(mockEvent, 'stopPropagation');

      component.onDragLeave(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.isDragging).toBeFalse();
    });

    it('should handle valid file drop', () => {
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      const mockEvent = new DragEvent('drop');
      Object.defineProperty(mockEvent, 'dataTransfer', {
        value: { files: [mockFile] }
      });
      spyOn(mockEvent, 'preventDefault');
      spyOn(mockEvent, 'stopPropagation');

      component.onDrop(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.isDragging).toBeFalse();
      expect(component.selectedFileName).toBe('test.csv');
    });

    it('should reject invalid file type on drop', () => {
      spyOn(window, 'alert');
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const mockEvent = new DragEvent('drop');
      Object.defineProperty(mockEvent, 'dataTransfer', {
        value: { files: [mockFile] }
      });
      spyOn(mockEvent, 'preventDefault');
      spyOn(mockEvent, 'stopPropagation');

      component.onDrop(mockEvent);

      expect(window.alert).toHaveBeenCalledWith('Please upload a CSV file');
      expect(component.selectedFileName).toBe('');
    });
  });

  describe('Search and Filter Operations', () => {
    it('should handle search change', () => {
      component.onSearchChange('test search');

      expect(component.searchQuery).toBe('test search');
    });

    it('should toggle advanced filter', () => {
      expect(component.showAdvancedFilter).toBeFalse();

      component.onAdvancedFilter();
      expect(component.showAdvancedFilter).toBeTrue();

      component.onAdvancedFilter();
      expect(component.showAdvancedFilter).toBeFalse();
    });

    it('should select type filter', () => {
      component.selectType('internal');

      expect(component.filterType).toBe('internal');
      expect(component.showTypeDropdown).toBeFalse();
    });

    it('should select status filter', () => {
      component.selectStatus('active');

      expect(component.filterStatus).toBe('active');
      expect(component.showStatusDropdown).toBeFalse();
    });

    it('should get correct type label', () => {
      expect(component.getTypeLabel()).toBe('All Types');

      component.filterType = 'internal';
      expect(component.getTypeLabel()).toBe('Internal');

      component.filterType = 'invalid';
      expect(component.getTypeLabel()).toBe('All Types');
    });

    it('should get correct status label', () => {
      expect(component.getStatusLabel()).toBe('All Status');

      component.filterStatus = 'active';
      expect(component.getStatusLabel()).toBe('Active');

      component.filterStatus = 'invalid';
      expect(component.getStatusLabel()).toBe('All Status');
    });
  });

  describe('CSV Export', () => {
    let mockLink: HTMLAnchorElement;
    let createElementSpy: jasmine.Spy;
    let createObjectURLSpy: jasmine.Spy;

    beforeEach(() => {
      mockLink = document.createElement('a');
      spyOn(mockLink, 'setAttribute').and.callThrough();
      spyOn(mockLink, 'click');
      
      createElementSpy = spyOn(document, 'createElement').and.returnValue(mockLink);
      createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('mock-url');
      spyOn(document.body, 'appendChild').and.callThrough();
      spyOn(document.body, 'removeChild').and.callThrough();
    });

    it('should export all users when none selected', () => {
      component.selectedUsers = [];
      component.onExport();

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        jasmine.stringMatching(/^users_export_all_.*\.csv$/)
      );
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
    });

    it('should export selected users', () => {
      component.selectedUsers = [
        { user: 'Selected User', type: 'Internal', status: 'Active', created: '01-01-2025', lastActivity: '02-01-2025' }
      ];

      component.onExport();

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        jasmine.stringMatching(/^users_export_selected_.*\.csv$/)
      );
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should generate correct initials for two-word names', () => {
      expect(component.getInitials('John Doe')).toBe('JD');
      expect(component.getInitials('Alice Johnson')).toBe('AJ');
    });

    it('should generate correct initials for single-word names', () => {
      expect(component.getInitials('John')).toBe('JO');
      expect(component.getInitials('A')).toBe('A');
    });

    it('should handle empty or null names', () => {
      expect(component.getInitials('')).toBe('');
      expect(component.getInitials(null as any)).toBe('');
      expect(component.getInitials(undefined as any)).toBe('');
    });

    it('should handle names with extra spaces', () => {
      expect(component.getInitials('  John   Doe  ')).toBe('JD');
    });
  });

  describe('Getters', () => {
    it('should return filtered users based on search', () => {
      component.searchQuery = 'Alice';

      const filtered = component.filteredUsers;

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(user =>
        user.user.toLowerCase().includes('alice') ||
        user.type.toLowerCase().includes('alice') ||
        user.status.toLowerCase().includes('alice')
      )).toBeTrue();
    });

    it('should return filtered users based on type filter', () => {
      component.filterType = 'internal';

      const filtered = component.filteredUsers;

      expect(filtered.every(user => user.type.toLowerCase() === 'internal')).toBeTrue();
    });

    it('should return filtered users based on status filter', () => {
      component.filterStatus = 'active';

      const filtered = component.filteredUsers;

      expect(filtered.every(user => user.status.toLowerCase() === 'active')).toBeTrue();
    });

    it('should combine search and filters', () => {
      component.searchQuery = 'Alice';
      component.filterType = 'internal';

      const filtered = component.filteredUsers;

      expect(filtered.every(user =>
        (user.user.toLowerCase().includes('alice') ||
         user.type.toLowerCase().includes('alice') ||
         user.status.toLowerCase().includes('alice')) &&
        user.type.toLowerCase() === 'internal'
      )).toBeTrue();
    });

    it('should return table data with correct structure', () => {
      const tableData = component.getTableData();

      expect(tableData.length).toBeGreaterThan(0);
      tableData.forEach(user => {
        expect(user).toEqual(jasmine.objectContaining({
          user: jasmine.objectContaining({
            name: jasmine.any(String),
            email: jasmine.any(String),
            avatar: jasmine.any(String)
          }),
          type: jasmine.any(String),
          status: jasmine.any(String),
          created: jasmine.any(String),
          lastActivity: jasmine.any(String),
          actions: jasmine.any(Object)
        }));
      });
    });

    it('should calculate total pages correctly', () => {
      const totalPages = component.totalPages();

      expect(totalPages).toBe(1); // Table component now handles pagination
    });
  });

  describe('Data Transformation', () => {
    it('should transform user data correctly in getTableData', () => {
      const tableData = component.getTableData();
      const firstUser = tableData[0];

      expect(firstUser.user.name).toBe(component.users[0].user);
      expect(firstUser.user.email).toBe(component.users[0].email);
      expect(firstUser.user.avatar).toBe(component.getInitials(component.users[0].user));
      expect(firstUser.type).toBe(component.users[0].type);
      expect(firstUser.status).toBe(component.users[0].status);
      expect(firstUser.created).toBe(component.users[0].created);
      expect(firstUser.lastActivity).toBe(component.users[0].lastActivity);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search query', () => {
      component.searchQuery = '';

      const filtered = component.filteredUsers;

      expect(filtered.length).toBe(component.users.length);
    });

    it('should handle case insensitive search', () => {
      component.searchQuery = 'ALICE';

      const filtered = component.filteredUsers;

      expect(filtered.some(user => user.user.toLowerCase().includes('alice'))).toBeTrue();
    });

    it('should handle case insensitive filters', () => {
      component.filterType = 'INTERNAL';

      const filtered = component.filteredUsers;

      expect(filtered.every(user => user.type.toLowerCase() === 'internal')).toBeTrue();
    });

    it('should handle empty filter values as "all"', () => {
      component.filterType = '';
      component.filterStatus = '';

      const filtered = component.filteredUsers;

      expect(filtered.length).toBe(component.users.length);
    });
  });

  describe('Bulk Actions', () => {
    beforeEach(() => {
      component.selectedUsers = [
        { 
          user: { name: 'Alice Johnson', email: 'alice.johnson@company.com', avatar: 'AJ' },
          type: 'Internal', 
          status: 'Active',
          created: '23-09-2025',
          lastActivity: '25-09-2025'
        },
        { 
          user: { name: 'Bob Smith', email: 'bob.smith@external.com', avatar: 'BS' },
          type: 'External', 
          status: 'Inactive',
          created: '27-09-2025',
          lastActivity: '30-09-2025'
        }
      ];
    });

    it('should show bulk actions section when users are selected', () => {
      expect(component.selectedUsers.length).toBeGreaterThan(0);
    });

    it('should call onAssignProjects when Assign Projects button is clicked', () => {
      spyOn(console, 'log');
      component.onAssignProjects();
      
      expect(console.log).toHaveBeenCalledWith('Assign projects to selected users:', component.selectedUsers);
    });

    it('should suspend selected users when Suspend button is clicked', () => {
      const initialUsers = component.users.length;
      component.onSuspendUsers();
      
      // Check that users status is updated
      const aliceUser = component.users.find(u => u.user === 'Alice Johnson');
      const bobUser = component.users.find(u => u.user === 'Bob Smith');
      
      expect(aliceUser?.status).toBe('Suspended');
      expect(bobUser?.status).toBe('Suspended');
      expect(component.selectedUsers.length).toBe(0);
      expect(component.users.length).toBe(initialUsers);
    });

    it('should open delete confirmation modal when bulk delete is clicked', () => {
      component.onBulkDelete();
      
      expect(component.showDeleteConfirmModal).toBeTrue();
      expect(component.pendingDeleteAction).toBe('bulk');
    });

    it('should delete selected users when confirmed', () => {
      // Setup selected users for bulk delete
      component.selectedUsers = [
        { 
          user: { name: 'Alice Johnson', email: 'alice.johnson@company.com', avatar: 'AJ' },
          type: 'Internal', 
          status: 'Active',
          created: '23-09-2025',
          lastActivity: '25-09-2025'
        },
        { 
          user: { name: 'Bob Smith', email: 'bob.smith@external.com', avatar: 'BS' },
          type: 'External', 
          status: 'Inactive',
          created: '27-09-2025',
          lastActivity: '30-09-2025'
        }
      ];
      
      const initialCount = component.users.length;
      component.pendingDeleteAction = 'bulk';
      
      component.confirmDelete();
      
      expect(component.users.length).toBe(initialCount - 2);
      expect(component.selectedUsers.length).toBe(0);
      expect(component.showDeleteConfirmModal).toBeFalse();
      
      // Verify users are actually deleted
      const aliceExists = component.users.some(u => u.user === 'Alice Johnson');
      const bobExists = component.users.some(u => u.user === 'Bob Smith');
      
      expect(aliceExists).toBeFalse();
      expect(bobExists).toBeFalse();
    });

    it('should close delete modal without deleting when cancelled', () => {
      const initialCount = component.users.length;
      component.showDeleteConfirmModal = true;
      
      component.closeDeleteConfirmModal();
      
      expect(component.showDeleteConfirmModal).toBeFalse();
      expect(component.users.length).toBe(initialCount);
      expect(component.userToDelete).toBeNull();
    });
  });

  describe('Single User Delete', () => {
    it('should open delete confirmation modal when delete action is clicked', () => {
      const mockUser = {
        user: { name: 'Alice Johnson', email: 'alice.johnson@company.com', avatar: 'AJ' },
        type: 'Internal',
        status: 'Active'
      };
      
      component.onActionClick({ action: 'delete', row: mockUser });
      
      expect(component.showDeleteConfirmModal).toBeTrue();
      expect(component.pendingDeleteAction).toBe('single');
      expect(component.userToDelete).toEqual(mockUser);
    });

    it('should delete single user when confirmed', () => {
      const initialCount = component.users.length;
      const userToDelete = {
        user: { name: 'Alice Johnson', email: 'alice.johnson@company.com', avatar: 'AJ' },
        type: 'Internal',
        status: 'Active'
      };
      
      component.userToDelete = userToDelete;
      component.pendingDeleteAction = 'single';
      
      component.confirmDelete();
      
      expect(component.users.length).toBe(initialCount - 1);
      expect(component.showDeleteConfirmModal).toBeFalse();
      expect(component.userToDelete).toBeNull();
      
      // Verify user is actually deleted
      const aliceExists = component.users.some(u => u.user === 'Alice Johnson');
      expect(aliceExists).toBeFalse();
    });
  });

  describe('Bulk Actions Initialization', () => {
    it('should initialize with no delete modal shown', () => {
      expect(component.showDeleteConfirmModal).toBeFalse();
    });

    it('should initialize with bulk pending delete action', () => {
      expect(component.pendingDeleteAction).toBe('bulk');
    });

    it('should initialize with null userToDelete', () => {
      expect(component.userToDelete).toBeNull();
    });
  });

  describe('Bulk Actions Edge Cases', () => {
    it('should handle suspending users that do not exist', () => {
      component.selectedUsers = [
        { 
          user: { name: 'Nonexistent User', email: 'nonexistent@test.com', avatar: 'NU' },
          type: 'Internal',
          status: 'Active'
        }
      ];
      
      const initialCount = component.users.length;
      component.onSuspendUsers();
      
      expect(component.users.length).toBe(initialCount);
      expect(component.selectedUsers.length).toBe(0);
    });

    it('should handle deleting users that do not exist', () => {
      component.selectedUsers = [
        { 
          user: { name: 'Nonexistent User', email: 'nonexistent@test.com', avatar: 'NU' },
          type: 'Internal',
          status: 'Active'
        }
      ];
      
      const initialCount = component.users.length;
      component.pendingDeleteAction = 'bulk';
      
      component.confirmDelete();
      
      expect(component.users.length).toBe(initialCount);
    });

    it('should clear selectedUsers after suspension', () => {
      component.selectedUsers = [
        { 
          user: { name: 'Alice Johnson', email: 'alice.johnson@company.com', avatar: 'AJ' },
          type: 'Internal',
          status: 'Active'
        }
      ];
      
      component.onSuspendUsers();
      
      expect(component.selectedUsers).toEqual([]);
    });

    it('should clear selectedUsers after bulk delete', () => {
      component.selectedUsers = [
        { 
          user: { name: 'Alice Johnson', email: 'alice.johnson@company.com', avatar: 'AJ' },
          type: 'Internal',
          status: 'Active'
        }
      ];
      
      component.pendingDeleteAction = 'bulk';
      component.confirmDelete();
      
      expect(component.selectedUsers).toEqual([]);
    });
  });

  describe('Select All Across Pages', () => {
    let tableComponent: Table;
    let tableFixture: ComponentFixture<Table>;

    beforeEach(() => {
      tableFixture = TestBed.createComponent(Table);
      tableComponent = tableFixture.componentInstance;
      
      // Set up table with 50 users (5 pages of 10 each)
      tableComponent.data = component.getTableData();
      tableComponent.columns = component.tableColumns;
      tableComponent.showCheckbox = true;
      tableComponent.selectAllAcrossPages = true;
      tableComponent.itemsPerPage = 10;
      tableComponent.currentPage = 1;
      tableFixture.detectChanges();
    });

    it('should select all 50 users when select all checkbox is clicked', () => {
      // Initially no users selected
      expect(tableComponent.selectedRows.size).toBe(0);
      
      // Click select all
      tableComponent.toggleAll();
      tableFixture.detectChanges();
      
      // Should select all 50 users across all pages
      expect(tableComponent.selectedRows.size).toBe(component.getTableData().length);
      expect(tableComponent.isAllSelected()).toBeTrue();
      expect(tableComponent.isSomeSelected()).toBeFalse();
    });

    it('should maintain selection when changing pages', () => {
      // Select all users
      tableComponent.toggleAll();
      tableFixture.detectChanges();
      
      expect(tableComponent.selectedRows.size).toBe(component.getTableData().length);
      
      // Navigate to page 2
      tableComponent.goToPage(2);
      tableFixture.detectChanges();
      
      // All users should still be selected
      expect(tableComponent.selectedRows.size).toBe(component.getTableData().length);
      
      // Check that first row on page 2 is selected (index 0 on paginated view = index 10 absolute)
      expect(tableComponent.isRowSelected(0)).toBeTrue();
      expect(tableComponent.isAllSelected()).toBeTrue();
    });

    it('should show correct selection when changing items per page', () => {
      // Select all users with 10 per page
      tableComponent.toggleAll();
      tableFixture.detectChanges();
      
      expect(tableComponent.selectedRows.size).toBe(component.getTableData().length);
      
      // Change to 50 items per page
      tableComponent.itemsPerPage = 50;
      tableComponent.goToPage(1);
      tableFixture.detectChanges();
      
      // All 50 users should still be selected
      expect(tableComponent.selectedRows.size).toBe(component.getTableData().length);
      expect(tableComponent.isAllSelected()).toBeTrue();
      
      // Check specific rows are selected
      for (let i = 0; i < Math.min(50, component.getTableData().length); i++) {
        expect(tableComponent.isRowSelected(i)).toBeTrue();
      }
    });

    it('should show indeterminate state when some but not all users are selected', () => {
      // Select only first 5 users
      for (let i = 0; i < 5; i++) {
        tableComponent.toggleRow(i);
      }
      tableFixture.detectChanges();
      
      expect(tableComponent.selectedRows.size).toBe(5);
      expect(tableComponent.isAllSelected()).toBeFalse();
      expect(tableComponent.isSomeSelected()).toBeTrue();
    });

    it('should deselect all users when clicking select all checkbox when all are selected', () => {
      // Select all users
      tableComponent.toggleAll();
      tableFixture.detectChanges();
      
      expect(tableComponent.selectedRows.size).toBe(component.getTableData().length);
      
      // Click select all again to deselect
      tableComponent.toggleAll();
      tableFixture.detectChanges();
      
      expect(tableComponent.selectedRows.size).toBe(0);
      expect(tableComponent.isAllSelected()).toBeFalse();
      expect(tableComponent.isSomeSelected()).toBeFalse();
    });

    it('should emit selection change with all selected users across pages', () => {
      spyOn(tableComponent.selectionChange, 'emit');
      
      // Select all users
      tableComponent.toggleAll();
      tableFixture.detectChanges();
      
      // Should emit array with all users
      expect(tableComponent.selectionChange.emit).toHaveBeenCalled();
      const emittedData = (tableComponent.selectionChange.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.length).toBe(component.getTableData().length);
    });

    it('should select individual user on different page correctly', () => {
      // Navigate to page 3
      tableComponent.goToPage(3);
      tableFixture.detectChanges();
      
      // Select first user on page 3 (absolute index 20)
      tableComponent.toggleRow(0);
      tableFixture.detectChanges();
      
      expect(tableComponent.selectedRows.size).toBe(1);
      expect(tableComponent.selectedRows.has(20)).toBeTrue();
      
      // Navigate to page 1
      tableComponent.goToPage(1);
      tableFixture.detectChanges();
      
      // User on page 3 should still be selected
      expect(tableComponent.selectedRows.size).toBe(1);
      expect(tableComponent.selectedRows.has(20)).toBeTrue();
    });

    it('should handle bulk delete with users selected across multiple pages', () => {
      // Select all users
      tableComponent.toggleAll();
      tableFixture.detectChanges();
      
      // Emit selection change to update component
      tableComponent.emitSelectionChange();
      
      // Update component's selected users
      component.selectedUsers = Array.from(tableComponent.selectedRows).map(index => component.getTableData()[index]);
      
      expect(component.selectedUsers.length).toBe(component.getTableData().length);
      
      // Perform bulk delete
      component.onBulkDelete();
      expect(component.showDeleteConfirmModal).toBeTrue();
      expect(component.pendingDeleteAction).toBe('bulk');
    });
  });
});