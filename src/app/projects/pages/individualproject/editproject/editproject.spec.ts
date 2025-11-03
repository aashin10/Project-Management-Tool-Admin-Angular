import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Editproject } from './editproject';

describe('Editproject', () => {
  let component: Editproject;
  let fixture: ComponentFixture<Editproject>;
  let routerSpy: any;

  beforeEach(async () => {
    routerSpy = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [Editproject],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: '1' } } } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editproject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get manager initials for single name', () => {
    component.manager = 'Asha';
    expect(component.managerInitials).toBe('AS');
  });

  it('should get manager initials for two names', () => {
    component.manager = 'Asha Varma';
    expect(component.managerInitials).toBe('AV');
  });

  it('should call onEditTeamMembers and navigate', () => {
    component.projectId = '1';
    component.onEditTeamMembers();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', '1', 'team']);
  });

  it('should call onUpdateProject and navigate', () => {
    component.projectId = '1';
    component.onUpdateProject();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', '1']);
  });

  it('should call onCancel and navigate', () => {
    component.projectId = '1';
    component.onCancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', '1']);
  });

  it('should return true for canCreate when all fields are filled', () => {
    component.projectName = 'Atlas';
    component.projectKey = 'ATL';
    component.manager = 'Asha Varma';
    component.deliveryUnit = 'Mobile';
    component.organisationName = 'Org';
    component.pocEmail = 'test@org.com';
    component.phoneNumber = '1234567890';
    expect(component.canCreate).toBeTrue();
  });

  it('should return missing fields when some are empty', () => {
    component.projectName = '';
    component.projectKey = '';
    component.manager = '';
    component.deliveryUnit = '';
    component.organisationName = '';
    component.pocEmail = '';
    component.phoneNumber = '';
    expect(component.missingFields).toEqual([
      'Project Name',
      'Project Key',
      'Project Manager',
      'Delivery Unit',
      'Organisation Name',
      'POC Email',
      'Phone Number'
    ]);
  });

  it('should handle form change events', () => {
    component.onProjectNameChange('New Name');
    expect(component.projectName).toBe('New Name');

    component.onProjectKeyChange('NEW');
    expect(component.projectKey).toBe('NEW');

    component.onDescriptionChange('New desc');
    expect(component.description).toBe('New desc');

    component.onOrganisationNameChange('New Org');
    expect(component.organisationName).toBe('New Org');

    component.onPocEmailChange('new@email.com');
    expect(component.pocEmail).toBe('new@email.com');

    component.onPhoneNumberChange('1234567890');
    expect(component.phoneNumber).toBe('1234567890');

    component.onManagerChange('New Manager');
    expect(component.manager).toBe('New Manager');

    component.onDeliveryUnitChange('New Unit');
    expect(component.deliveryUnit).toBe('New Unit');

    component.onAdditionalFieldsChange([{ id: 'test-id', name: 'Field1', value: 'Value1' }]);
    expect(component.additionalFields).toEqual([{ name: 'Field1', value: 'Value1' }]);
  });

  it('should get correct initials for project name', () => {
    component.projectName = 'Test Project';
    expect(component.getInitials()).toBe('TP');

    component.projectName = 'Single';
    expect(component.getInitials()).toBe('SI');

    component.projectName = '';
    expect(component.getInitials()).toBe('PN');

    component.projectName = '   ';
    expect(component.getInitials()).toBe('PN');
  });

  it('should load project data on init', () => {
    expect(component.projectName).toBe('Atlasss App');
    expect(component.projectKey).toBe('ATL');
    expect(component.manager).toBe('John Smith');
    expect(component.organisationName).toBe('Tech Solutions Inc');
  });

  it('should return false for canCreate when fields are missing', () => {
    component.projectName = '';
    component.projectKey = 'ATL';
    component.manager = 'John';
    component.deliveryUnit = 'Dev';
    component.organisationName = 'Org';
    component.pocEmail = 'email@test.com';
    component.phoneNumber = '123';
    expect(component.canCreate).toBeFalse();
  });
});
