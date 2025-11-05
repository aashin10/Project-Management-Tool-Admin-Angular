import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Deliveryunitslist } from './deliveryunitslist';
import { Table } from '../../../shared/table/table';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Modal } from '../../../shared/modal/modal';

describe('Deliveryunitslist Component', () => {
  let component: Deliveryunitslist;
  let fixture: ComponentFixture<Deliveryunitslist>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockDeliveryUnit = {
    duInfo: { 
      initials: 'EN', 
      name: 'Engineering', 
      subtitle: 'Software Development & Architecture', 
      bgColor: 'bg-blue-500' 
    },
    duCode: 'ENG-001',
    duHead: { 
      avatar: 'SC', 
      name: 'Sarah Chen', 
      email: 'sarah.chen@company.com', 
      bgColor: 'bg-gray-200' 
    },
    activeMembers: '24',
    activeProjects: '8'
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        Deliveryunitslist,
        Table,
        Sectiontitle,
        CustomButton,
        SearchBar,
        Modal,
        CommonModule,
        FormsModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Deliveryunitslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.searchQuery).toBe('');
      expect(component.isModalOpen).toBe(false);
      expect(component.newDU.name).toBe('');
      expect(component.newDU.code).toBe('');
      expect(component.newDU.description).toBe('');
      expect(component.newDU.headName).toBe('');
      expect(component.newDU.headEmail).toBe('');
    });

    it('should initialize delivery units data', () => {
      expect(component.deliveryUnits.length).toBe(30);
      expect(component.filteredDeliveryUnits.length).toBe(30);
    });

    it('should have correct column configuration', () => {
      expect(component.columns.length).toBe(6);
      expect(component.columns[0].header).toBe('Delivery Unit Info');
      expect(component.columns[1].header).toBe('DU Code');
      expect(component.columns[2].header).toBe('DU Head');
      expect(component.columns[5].header).toBe('Actions');
    });

    it('should copy delivery units to filtered list on init', () => {
      expect(component.filteredDeliveryUnits).toEqual(component.deliveryUnits);
    });
  });

  describe('Modal Management', () => {
    it('should open modal when onAddNewDU is called', () => {
      component.isModalOpen = false;
      component.onAddNewDU();
      expect(component.isModalOpen).toBe(true);
    });

    it('should close modal when onCloseModal is called', () => {
      component.isModalOpen = true;
      component.onCloseModal();
      expect(component.isModalOpen).toBe(false);
    });

    it('should reset form when modal is closed', () => {
      component.newDU = {
        name: 'Test DU',
        code: 'TST-001',
        description: 'Test Description',
        headName: 'Test Head',
        headEmail: 'test@example.com'
      };

      component.onCloseModal();

      expect(component.newDU.name).toBe('');
      expect(component.newDU.code).toBe('');
      expect(component.newDU.description).toBe('');
      expect(component.newDU.headName).toBe('');
      expect(component.newDU.headEmail).toBe('');
    });

    it('should reset form when resetForm is called', () => {
      component.newDU = {
        name: 'Test',
        code: 'TST-001',
        description: 'Desc',
        headName: 'Name',
        headEmail: 'email@test.com'
      };

      component.resetForm();

      expect(component.newDU.name).toBe('');
      expect(component.newDU.code).toBe('');
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      component.deliveryUnits = [mockDeliveryUnit];
      component.filteredDeliveryUnits = [mockDeliveryUnit];
    });

    it('should filter by DU name', () => {
      component.onSearchChange('Engineering');
      expect(component.filteredDeliveryUnits.length).toBe(1);
      expect(component.filteredDeliveryUnits[0].duInfo.name).toBe('Engineering');
    });

    it('should filter by DU code', () => {
      component.onSearchChange('ENG-001');
      expect(component.filteredDeliveryUnits.length).toBe(1);
    });

    it('should filter by DU head name', () => {
      component.onSearchChange('Sarah Chen');
      expect(component.filteredDeliveryUnits.length).toBe(1);
    });

    it('should filter by DU head email', () => {
      component.onSearchChange('sarah.chen@company.com');
      expect(component.filteredDeliveryUnits.length).toBe(1);
    });

    it('should filter by subtitle', () => {
      component.onSearchChange('Software Development');
      expect(component.filteredDeliveryUnits.length).toBe(1);
    });

    it('should be case insensitive', () => {
      component.onSearchChange('ENGINEERING');
      expect(component.filteredDeliveryUnits.length).toBe(1);
    });

    it('should return all units when search query is empty', () => {
      component.onSearchChange('');
      expect(component.filteredDeliveryUnits.length).toBe(component.deliveryUnits.length);
    });

    it('should return empty array when no matches found', () => {
      component.onSearchChange('NonExistentDU');
      expect(component.filteredDeliveryUnits.length).toBe(0);
    });

    it('should update searchQuery property', () => {
      component.onSearchChange('Test Query');
      expect(component.searchQuery).toBe('test query');
    });
  });

  describe('DU Code Generation', () => {
    it('should auto-generate code when DU name changes', () => {
      component.newDU.name = 'Engineering';
      component.onDUNameChange();
      
      expect(component.newDU.code).toMatch(/^ENG-\d{3}$/);
    });

    it('should generate code with 3 digits', () => {
      component.newDU.name = 'Product Management';
      component.onDUNameChange();
      
      const codeParts = component.newDU.code.split('-');
      expect(codeParts[1].length).toBe(3);
    });

    it('should clear code when name is empty', () => {
      component.newDU.name = '';
      component.onDUNameChange();
      
      expect(component.newDU.code).toBe('');
    });

    it('should handle single word names', () => {
      component.newDU.name = 'Marketing';
      component.onDUNameChange();
      
      expect(component.newDU.code).toMatch(/^MAR-\d{3}$/);
    });

    it('should handle multi-word names', () => {
      component.newDU.name = 'Human Resources Department';
      component.onDUNameChange();
      
      expect(component.newDU.code).toMatch(/^HUM-\d{3}$/);
    });

    it('should convert to uppercase', () => {
      component.newDU.name = 'engineering';
      component.onDUNameChange();
      
      expect(component.newDU.code.split('-')[0]).toMatch(/^[A-Z]+$/);
    });
  });

  describe('Initials Generation', () => {
    it('should generate initials from two-word name', () => {
      const initials = component.getInitials('John Doe');
      expect(initials).toBe('JD');
    });

    it('should generate initials from single word', () => {
      const initials = component.getInitials('Engineering');
      expect(initials).toBe('EN');
    });

    it('should generate initials from multi-word name', () => {
      const initials = component.getInitials('Product Management Team');
      expect(initials).toBe('PM');
    });

    it('should handle names with extra spaces', () => {
  const initials = component.getInitials('  John   Doe  ');
  expect(initials).toBe('JD');
});

    it('should convert to uppercase', () => {
      const initials = component.getInitials('john doe');
      expect(initials).toBe('JD');
    });
  });

 

  describe('Form Validation', () => {
    beforeEach(() => {
      spyOn(window, 'alert');
    });

    it('should validate empty DU name', () => {
      component.newDU.name = '';
      const isValid = component.validateForm();
      
      expect(isValid).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Please enter a DU name');
    });

    it('should validate empty DU code', () => {
      component.newDU.name = 'Test';
      component.newDU.code = '';
      const isValid = component.validateForm();
      
      expect(isValid).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Please enter a DU code');
    });

    it('should validate DU code format', () => {
      component.newDU.name = 'Test';
      component.newDU.code = 'INVALID';
      const isValid = component.validateForm();
      
      expect(isValid).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('DU Code must be in format: 2-4 letters, dash, 3 digits (e.g., ENG-001)');
    });

    it('should validate duplicate DU code', () => {
      component.newDU.name = 'Test';
      component.newDU.code = 'ENG-001'; // Already exists in mock data
      component.newDU.description = 'Test';
      const isValid = component.validateForm();
      
      expect(isValid).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('This DU code already exists. Please use a unique code.');
    });

    it('should validate empty description', () => {
      component.newDU.name = 'Test';
      component.newDU.code = 'TST-999';
      component.newDU.description = '';
      const isValid = component.validateForm();
      
      expect(isValid).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Please enter a description');
    });

    it('should validate empty head name', () => {
      component.newDU.name = 'Test';
      component.newDU.code = 'TST-999';
      component.newDU.description = 'Test';
      component.newDU.headName = '';
      const isValid = component.validateForm();
      
      expect(isValid).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Please enter the head name');
    });

    it('should validate empty head email', () => {
      component.newDU.name = 'Test';
      component.newDU.code = 'TST-999';
      component.newDU.description = 'Test';
      component.newDU.headName = 'Test Head';
      component.newDU.headEmail = '';
      const isValid = component.validateForm();
      
      expect(isValid).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Please enter the head email');
    });

    it('should validate invalid email format', () => {
      component.newDU.name = 'Test';
      component.newDU.code = 'TST-999';
      component.newDU.description = 'Test';
      component.newDU.headName = 'Test Head';
      component.newDU.headEmail = 'invalid-email';
      const isValid = component.validateForm();
      
      expect(isValid).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Please enter a valid email address');
    });

    it('should accept valid email formats', () => {
      component.newDU.name = 'Test';
      component.newDU.code = 'TST-999';
      component.newDU.description = 'Test Description';
      component.newDU.headName = 'Test Head';
      component.newDU.headEmail = 'test@example.com';
      const isValid = component.validateForm();
      
      expect(isValid).toBe(true);
    });

    it('should accept valid DU code formats', () => {
      const validCodes = ['EN-001', 'ENG-123', 'ENGG-999', 'AB-100'];
      
      validCodes.forEach(code => {
        component.newDU.name = 'Test';
        component.newDU.code = code;
        component.newDU.description = 'Test';
        component.newDU.headName = 'Name';
        component.newDU.headEmail = 'test@test.com';
        
        const isValid = component.validateForm();
        expect(isValid).toBe(true);
      });
    });

    it('should trim whitespace in validation', () => {
      component.newDU.name = '  Test  ';
      component.newDU.code = 'TST-999';
      component.newDU.description = '  Description  ';
      component.newDU.headName = '  Name  ';
      component.newDU.headEmail = 'test@test.com';
      
      const isValid = component.validateForm();
      expect(isValid).toBe(true);
    });
  });

  describe('Create Delivery Unit', () => {
    beforeEach(() => {
      component.newDU = {
        name: 'New Engineering',
        code: 'NEW-001',
        description: 'New engineering department',
        headName: 'John Smith',
        headEmail: 'john.smith@company.com'
      };
    });

    it('should create new delivery unit with correct structure', () => {
      const initialLength = component.deliveryUnits.length;
      const event = new Event('submit');
      
<<<<<<< HEAD
      component.saveDeliveryUnit();
=======
      component.saveDeliveryUnit();;
>>>>>>> 22043ab013d578cc07f702c4625d97aa7d44216b
      
      expect(component.deliveryUnits.length).toBe(initialLength + 1);
    });

    it('should add new DU to beginning of array', () => {
      const event = new Event('submit');
<<<<<<< HEAD
      component.saveDeliveryUnit();
=======
      component.saveDeliveryUnit();;
>>>>>>> 22043ab013d578cc07f702c4625d97aa7d44216b
      
      expect(component.deliveryUnits[0].duCode).toBe('NEW-001');
    });

    it('should generate correct initials for DU', () => {
      const event = new Event('submit');
<<<<<<< HEAD
      component.saveDeliveryUnit();
=======
      component.saveDeliveryUnit();;
>>>>>>> 22043ab013d578cc07f702c4625d97aa7d44216b
      
      expect(component.deliveryUnits[0].duInfo.initials).toBe('NE');
    });

    it('should generate correct initials for head', () => {
      const event = new Event('submit');
<<<<<<< HEAD
      component.saveDeliveryUnit();
=======
      component.saveDeliveryUnit();;
>>>>>>> 22043ab013d578cc07f702c4625d97aa7d44216b
      
      expect(component.deliveryUnits[0].duHead.avatar).toBe('JS');
    });

    it('should convert code to uppercase', () => {
      component.newDU.code = 'new-001';
      const event = new Event('submit');
      
      component.saveDeliveryUnit();
      
      expect(component.deliveryUnits[0].duCode).toBe('NEW-001');
    });

    it('should initialize with zero members and projects', () => {
      const event = new Event('submit');
      component.saveDeliveryUnit();
      
      expect(component.deliveryUnits[0].activeMembers).toBe('0');
      expect(component.deliveryUnits[0].activeProjects).toBe('0');
    });

    it('should update filtered list after creation', () => {
      const initialLength = component.filteredDeliveryUnits.length;
      const event = new Event('submit');
      
<<<<<<< HEAD
      component.saveDeliveryUnit();
=======
      component.saveDeliveryUnit();;
>>>>>>> 22043ab013d578cc07f702c4625d97aa7d44216b
      
      expect(component.filteredDeliveryUnits.length).toBe(initialLength + 1);
    });

    it('should close modal after successful creation', () => {
      component.isModalOpen = true;
      const event = new Event('submit');
      
      component.saveDeliveryUnit();
      
      expect(component.isModalOpen).toBe(false);
    });

    it('should reset form after creation', () => {
      const event = new Event('submit');
      component.saveDeliveryUnit();
      
      expect(component.newDU.name).toBe('');
      expect(component.newDU.code).toBe('');
    });

    it('should not create if validation fails', () => {
      component.newDU.name = '';
      spyOn(window, 'alert');
      const initialLength = component.deliveryUnits.length;
      const event = new Event('submit');
      
<<<<<<< HEAD
      component.saveDeliveryUnit();
=======
      component.saveDeliveryUnit();;
>>>>>>> 22043ab013d578cc07f702c4625d97aa7d44216b
      
      expect(component.deliveryUnits.length).toBe(initialLength);
    });

    it('should prevent default form submission', () => {
      const event = new Event('submit');
      spyOn(event, 'preventDefault');
      
<<<<<<< HEAD
      component.saveDeliveryUnit();
=======
      component.saveDeliveryUnit();;
>>>>>>> 22043ab013d578cc07f702c4625d97aa7d44216b
      
      expect(event.preventDefault).toHaveBeenCalled();
    });

    
  });

  describe('Action Handling', () => {
    const testDU = {
      duInfo: { name: 'Engineering', initials: 'EN', subtitle: 'Software', bgColor: 'bg-blue-500' },
      duCode: 'ENG-001',
      duHead: { name: 'Sarah', email: 'sarah@test.com', avatar: 'SC', bgColor: 'bg-gray-200' },
      activeMembers: '10',
      activeProjects: '5'
    };

    it('should call editDeliveryUnit for edit action', () => {
      spyOn(component, 'editDeliveryUnit');
      
      component.onActionClick({ action: 'edit', row: testDU });
      
      expect(component.editDeliveryUnit).toHaveBeenCalledWith(testDU);
    });

    it('should call viewDeliveryUnit for view action', () => {
      spyOn(component, 'viewDeliveryUnit');
      
      component.onActionClick({ action: 'view', row: testDU });
      
      expect(component.viewDeliveryUnit).toHaveBeenCalledWith(testDU);
    });

    it('should call deleteDeliveryUnit for delete action', () => {
      spyOn(component, 'deleteDeliveryUnit');
      
      component.onActionClick({ action: 'delete', row: testDU });
      
      expect(component.deleteDeliveryUnit).toHaveBeenCalledWith(testDU);
    });

    it('should navigate to edit page with correct route', () => {
      component.editDeliveryUnit(testDU);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/delivery-units/edit', 'ENG-001']);
    });

    it('should navigate to view page with correct route', () => {
      component.viewDeliveryUnit(testDU);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/delivery-units/view', 'ENG-001']);
    });
  });

  describe('Delete Delivery Unit', () => {
    const testDU = {
      duInfo: { name: 'Engineering', initials: 'EN', subtitle: 'Software', bgColor: 'bg-blue-500' },
      duCode: 'ENG-001',
      duHead: { name: 'Sarah', email: 'sarah@test.com', avatar: 'SC', bgColor: 'bg-gray-200' },
      activeMembers: '10',
      activeProjects: '5'
    };

    it('should delete DU when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.deliveryUnits = [testDU];
      component.filteredDeliveryUnits = [testDU];
      
      component.deleteDeliveryUnit(testDU);
      
      expect(component.deliveryUnits.length).toBe(0);
      expect(component.filteredDeliveryUnits.length).toBe(0);
    });

    it('should not delete DU when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deliveryUnits = [testDU];
      component.filteredDeliveryUnits = [testDU];
      
      component.deleteDeliveryUnit(testDU);
      
      expect(component.deliveryUnits.length).toBe(1);
      expect(component.filteredDeliveryUnits.length).toBe(1);
    });

    it('should show confirmation dialog with DU name', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      
      component.deleteDeliveryUnit(testDU);
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete Engineering?');
    });

    it('should remove only the specified DU', () => {
      const anotherDU = {
        ...testDU,
        duCode: 'MAR-002',
        duInfo: { ...testDU.duInfo, name: 'Marketing' }
      };
      
      spyOn(window, 'confirm').and.returnValue(true);
      component.deliveryUnits = [testDU, anotherDU];
      component.filteredDeliveryUnits = [testDU, anotherDU];
      
      component.deleteDeliveryUnit(testDU);
      
      expect(component.deliveryUnits.length).toBe(1);
      expect(component.deliveryUnits[0].duCode).toBe('MAR-002');
    });

    it('should update both deliveryUnits and filteredDeliveryUnits', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.deliveryUnits = [testDU];
      component.filteredDeliveryUnits = [testDU];
      
      component.deleteDeliveryUnit(testDU);
      
      expect(component.deliveryUnits).toEqual([]);
      expect(component.filteredDeliveryUnits).toEqual([]);
    });
  });

  describe('Integration Tests', () => {
    it('should render table with delivery units', () => {
      const compiled = fixture.nativeElement;
      const table = compiled.querySelector('app-table');
      
      expect(table).toBeTruthy();
    });

    it('should render search bar', () => {
      const compiled = fixture.nativeElement;
      const searchBar = compiled.querySelector('app-search-bar');
      
      expect(searchBar).toBeTruthy();
    });

    it('should render add button', () => {
      const compiled = fixture.nativeElement;
      const addButton = compiled.querySelector('app-custom-button');
      
      expect(addButton).toBeTruthy();
    });

    it('should render modal', () => {
      const compiled = fixture.nativeElement;
      const modal = compiled.querySelector('app-modal');
      
      expect(modal).toBeTruthy();
    });

    it('should pass correct data to table', () => {
      expect(component.filteredDeliveryUnits.length).toBeGreaterThan(0);
    });

    it('should pass correct columns to table', () => {
      expect(component.columns.length).toBe(6);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty delivery units array', () => {
      component.deliveryUnits = [];
      component.filteredDeliveryUnits = [];
      
      component.onSearchChange('test');
      
      expect(component.filteredDeliveryUnits).toEqual([]);
    });

    it('should handle special characters in search', () => {
      component.onSearchChange('@#$%');
      
      expect(component.filteredDeliveryUnits).toBeDefined();
    });

    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(1000);
      component.onSearchChange(longQuery);
      
      expect(component.filteredDeliveryUnits).toBeDefined();
    });

    it('should handle null DU in delete', () => {
  spyOn(window, 'confirm').and.returnValue(true);

  expect(() => {
    component.deleteDeliveryUnit(null as any);
  }).not.toThrow();
});

    it('should handle duplicate initials gracefully', () => {
      const initials1 = component.getInitials('John Doe');
      const initials2 = component.getInitials('Jane Doe');
      
      expect(initials1).toBe('JD');
      expect(initials2).toBe('JD');
    });
  });
});