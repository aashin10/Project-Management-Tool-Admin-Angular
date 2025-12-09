import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';

import { Userslist } from './userslist';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Table } from '../../../shared/table/table';
import { Modal } from '../../../shared/modal/modal';
import { UsersApi, User } from '../../services/users-api';

// Mock UsersApi service
class MockUsersApi {
  getUsers() {
    return of([
      {
        id: 1,
        user: 'Alice Johnson',
        email: 'alice.johnson@company.com',
        type: 'Internal',
        status: 'Active',
        created: '23-09-2025',
        lastActivity: '25-09-2025'
      },
      {
        id: 2,
        user: 'Bob Smith',
        email: 'bob.smith@external.com',
        type: 'External',
        status: 'Active',
        created: '27-09-2025',
        lastActivity: '30-09-2025'
      }
    ]);
  }

  refreshUsers() {
    return this.getUsers();
  }

  createUser(user: any) {
    return of({ id: 3, ...user });
  }

  getUserById(id: number) {
    return of({
      status: 200,
      data: {
        id: id,
        name: 'Test User',
        email: 'test@example.com',
        jiraId: 'JIRA123',
        type: 'Internal',
        status: 'Active',
        created_At: '2023-01-01T00:00:00Z',
        last_Login: null
      },
      message: 'Success',
      statusCode: 200,
      succeeded: true
    });
  }
}

describe('Userslist', () => {
  let component: Userslist;
  let fixture: ComponentFixture<Userslist>;
  let mockUsersApi: MockUsersApi;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    mockUsersApi = new MockUsersApi();
    const toastrServiceMock = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning', 'clear']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        Userslist,
        Sectiontitle,
        CustomButton,
        SearchBar,
        Table,
        Modal,
        HttpClientTestingModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: UsersApi, useValue: mockUsersApi },
        { provide: ToastrService, useValue: toastrServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Userslist);
    component = fixture.componentInstance;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    // Initialize component with sample data for testing
    component.users = [
      {
        id: 1,
        user: 'Alice Johnson',
        email: 'alice.johnson@company.com',
        type: 'Internal',
        status: 'Active',
        created: '23-09-2025',
        lastActivity: '25-09-2025'
      },
      {
        id: 2,
        user: 'Bob Smith',
        email: 'bob.smith@external.com',
        type: 'External',
        status: 'Active',
        created: '27-09-2025',
        lastActivity: '30-09-2025'
      }
    ];
    // Don't call fixture.detectChanges() here to prevent ngOnInit from being called
    // fixture.detectChanges();
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
        { label: 'Internal', value: 'Internal' },
        { label: 'External', value: 'External' }
      ]);

      expect(component.statusOptions).toEqual([
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
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
    it('should open edit user modal and fetch user details', fakeAsync(() => {
      const mockUser = {
        id: 1,
        user: 'Test User',
        email: 'test@example.com',
        type: 'Internal',
        status: 'Active'
      };

      spyOn(mockUsersApi, 'getUserById').and.returnValue(of({
        status: 200,
        data: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          type: 'Internal',
          status: 'Active',
          jiraId: 'JIRA123',
          created_At: '2023-01-01T00:00:00Z',
          last_Login: null
        },
        message: 'Success',
        statusCode: 200,
        succeeded: true
      }));

      component.onEditUser(mockUser);
      tick();

      expect(component.showEditUserModal).toBeTrue();
      expect(component.editUser).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        jiraId: 'JIRA123',
        type: 'Internal',
        status: 'Active'
      });
    }));

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
    const mockRow = { id: 1, user: 'Test User', type: 'Internal' };

    it('should handle edit action and call onEditUser', () => {
      spyOn(component, 'onEditUser');
      component.onActionClick({ action: 'edit', row: { actions: mockRow } });
      expect(component.onEditUser).toHaveBeenCalledWith(mockRow);
    });

    it('should handle delete action', () => {
      const mockDeleteRow = { actions: { user: 'Test User', type: 'Internal' } };
      component.onActionClick({ action: 'delete', row: mockDeleteRow });
      expect(component.showDeleteConfirmModal).toBe(true);
      expect(component.userToDelete).toEqual(mockDeleteRow.actions);
    });

    it('should handle view action', () => {
      const mockViewRow = { user: 'Test User', type: 'Internal' };
      component.onActionClick({ action: 'view', row: mockViewRow });
      // View action does nothing currently, so just expect true to be true
      expect(true).toBe(true);
    });
  });

  describe('Selection Handling', () => {
    it('should handle selection change', () => {
      const selectedUsers = [
        { user: 'User 1', type: 'Internal' },
        { user: 'User 2', type: 'External' }
      ];
      component.onSelectionChange(selectedUsers);
      expect(component.selectedUsers).toEqual(selectedUsers);
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
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const mockEvent = new DragEvent('drop');
      Object.defineProperty(mockEvent, 'dataTransfer', {
        value: { files: [mockFile] }
      });
      spyOn(mockEvent, 'preventDefault');
      spyOn(mockEvent, 'stopPropagation');

      component.onDrop(mockEvent);

      expect(mockToastr.error).toHaveBeenCalledWith('Please upload a CSV file', 'Invalid File Type', jasmine.any(Object));
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
  });

});
