import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modal } from './modal';

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event on onClose', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should emit close event on backdrop click', () => {
    spyOn(component, 'onClose');
    const event = {
      target: {},
      currentTarget: {}
    } as unknown as MouseEvent;
    component.onBackdropClick(event);
    expect(component.onClose).toHaveBeenCalled();
  });

  it('should not emit close event if click is inside modal', () => {
    spyOn(component, 'onClose');
    const event = {
      target: { someProperty: 'value' },
      currentTarget: {}
    } as unknown as MouseEvent;
    component.onBackdropClick(event);
    expect(component.onClose).not.toHaveBeenCalled();
  });

  it('should have isOpen input default to false', () => {
    expect(component.isOpen).toBeFalse();
  });

  it('should set isOpen input to true', () => {
    component.isOpen = true;
    expect(component.isOpen).toBeTrue();
  });

  
});
