import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicInformationComponent } from './basicinfo';

describe('BasicInformationComponent', () => {
  let component: BasicInformationComponent;
  let fixture: ComponentFixture<BasicInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Template Rendering
  describe('Template Rendering', () => {
    it('should create and render inputs', async () => {
      expect(component).toBeTruthy();
      await fixture.whenStable();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('#projectName')).toBeTruthy();
      expect(el.querySelector('#projectKey')).toBeTruthy();
      expect(el.querySelector('#description')).toBeTruthy();
    });
  });

  // Input/Output Properties
  describe('Input/Output Properties', () => {
    it('generateProjectKey should create key from projectName and emit', () => {
      spyOn(component.projectKeyChange, 'emit');
      component.projectName = 'My Project!';
      component.generateProjectKey();
      expect(component.projectKey).toBe('MYP-001');
      expect(component.projectKeyChange.emit).toHaveBeenCalledWith('MYP-001');
    });

    it('generateProjectKey should set default when projectName empty and emit', () => {
      spyOn(component.projectKeyChange, 'emit');
      component.projectName = '';
      component.generateProjectKey();
      expect(component.projectKey).toBe('PRJ-001');
      expect(component.projectKeyChange.emit).toHaveBeenCalledWith('PRJ-001');
    });
  });

  // Style Classes
  describe('Style Classes', () => {
    it('selected getters return placeholder when empty', () => {
      component.priority = '';
      component.status = '';
      expect(component.selectedPriority.value).toBe('');
      expect(component.selectedStatus.value).toBe('');
    });
  });

  // Component Logic
  describe('Component Logic', () => {
    it('onProjectNameChange should emit projectNameChange and generate key', () => {
      spyOn(component.projectNameChange, 'emit');
      spyOn(component.projectKeyChange, 'emit');
      component.projectName = 'Alpha Team';
      component.onProjectNameChange();
      expect(component.projectNameChange.emit).toHaveBeenCalledWith('Alpha Team');
      expect(component.projectKey).toBe('ALP-001');
      expect(component.projectKeyChange.emit).toHaveBeenCalled();
    });

    it('selectStatus should set status, emit and close dropdown', () => {
      spyOn(component.statusChange, 'emit');
      component.statusDropdownOpen = true;
      component.selectStatus('inprogress');
      expect(component.status).toBe('inprogress');
      expect(component.statusChange.emit).toHaveBeenCalledWith('inprogress');
      expect(component.statusDropdownOpen).toBeFalse();
    });

    it('selectPriority should set priority, emit and close dropdown', () => {
      spyOn(component.priorityChange, 'emit');
      component.priorityDropdownOpen = true;
      component.selectPriority('high');
      expect(component.priority).toBe('high');
      expect(component.priorityChange.emit).toHaveBeenCalledWith('high');
      expect(component.priorityDropdownOpen).toBeFalse();
    });
  });
});
