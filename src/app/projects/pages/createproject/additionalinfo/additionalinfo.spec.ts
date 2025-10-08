import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Additionalinfo } from './additionalinfo';

describe('Additionalinfo', () => {
  let component: Additionalinfo;
  let fixture: ComponentFixture<Additionalinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Additionalinfo]
    }).compileComponents();

    fixture = TestBed.createComponent(Additionalinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Template Rendering
  describe('Template Rendering', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('onAddInfo opens modal', () => {
      component.modalOpen = false;
      component.onAddInfo();
      expect(component.modalOpen).toBeTrue();
    });
  });

  // Component Logic
  describe('Component Logic', () => {
    it('addFromModal does nothing when name empty', () => {
      component.newFieldName = '';
      component.newFieldValue = 'some';
      component.addedFields = [];
      component.addFromModal();
      expect(component.addedFields.length).toBe(0);
    });

    it('addFromModal does nothing when value is empty', () => {
      component.newFieldName = 'some';
      component.newFieldValue = '';
      component.addedFields = [];
      component.addFromModal();
      expect(component.addedFields.length).toBe(0);
    });

    it('addFromModal adds correctly and emits', () => {
      spyOn(component, 'emitAddedFields').and.callThrough();
      component.newFieldName = 'extra info';
      component.newFieldValue = 'value here';
      component.addedFields = [];
      component.addFromModal();
      expect(component.addedFields.length).toBe(1);
      expect(component.addedFields[0].name).toBe('Extra Info');
      expect(component.addedFields[0].value).toBe('Value Here');
      expect(component.newFieldName).toBe('');
      expect(component.newFieldValue).toBe('');
      expect(component.modalOpen).toBeFalse();
      expect(component.emitAddedFields).toHaveBeenCalled();
    });

    it('addFromModal title-cases both name and value', () => {
      component.newFieldName = 'mIxEd CaSe NAME';
      component.newFieldValue = 'sOmE vaLuE';
      component.addedFields = [];
      component.addFromModal();
      expect(component.addedFields.length).toBe(1);
      expect(component.addedFields[0].name).toBe('Mixed Case Name');
      expect(component.addedFields[0].value).toBe('Some Value');
    });


    it('removeField removes and emits', () => {
      spyOn(component, 'emitAddedFields').and.callThrough();
      component.addedFields = [{ name: 'A', value: '1' }, { name: 'B', value: '2' }];
      component.removeField(1);
      expect(component.addedFields.length).toBe(1);
      expect(component.addedFields[0].name).toBe('A');
      expect(component.emitAddedFields).toHaveBeenCalled();
    });

    it('handleCancel closes modal', () => {
      component.modalOpen = true;
      component.handleCancel();
      expect(component.modalOpen).toBeFalse();
    });
  });

  // Template Interaction
  describe('Template Interaction', () => {
    it('Add button in modal is disabled until both fields are filled', () => {
      component.modalOpen = true;
      component.newFieldName = '';
      component.newFieldValue = '';
      fixture.detectChanges();

      const modal = fixture.nativeElement.querySelector('app-modal');
      expect(modal).toBeTruthy();
      const modalButtons = modal.querySelectorAll('app-custom-button');
      expect(modalButtons.length).toBeGreaterThanOrEqual(1);

      const addCustom = modalButtons[0];
      const innerBtn = addCustom.querySelector('button');
      expect(innerBtn.disabled).toBeTrue();

      component.newFieldName = 'Field';
      component.newFieldValue = '';
      fixture.detectChanges();
      expect(addCustom.querySelector('button').disabled).toBeTrue();

      component.newFieldValue = 'Value';
      fixture.detectChanges();
      expect(addCustom.querySelector('button').disabled).toBeFalse();
    });
  });

  
});
