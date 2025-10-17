import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editproject } from './editproject';

describe('Editproject', () => {
  let component: Editproject;
  let fixture: ComponentFixture<Editproject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editproject]
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
    const spy = spyOn(component['router'], 'navigate');
    component.projectId = '1';
    component.onEditTeamMembers();
    expect(spy).toHaveBeenCalledWith(['/projects', '1', 'team']);
  });

  it('should call onUpdateProject and navigate', () => {
    const spy = spyOn(component['router'], 'navigate');
    component.projectId = '1';
    component.onUpdateProject();
    expect(spy).toHaveBeenCalledWith(['/projects', '1']);
  });

  it('should call onCancel and navigate', () => {
    const spy = spyOn(component['router'], 'navigate');
    component.projectId = '1';
    component.onCancel();
    expect(spy).toHaveBeenCalledWith(['/projects', '1']);
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
});
