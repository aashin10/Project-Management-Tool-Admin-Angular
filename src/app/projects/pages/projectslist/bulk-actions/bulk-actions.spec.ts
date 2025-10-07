import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkActions } from './bulk-actions';

describe('BulkActions', () => {
  let component: BulkActions;
  let fixture: ComponentFixture<BulkActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default properties', () => {
    expect(component.selectedCount).toBe(0);
  });

  it('should accept selectedCount input', () => {
    component.selectedCount = 5;
    expect(component.selectedCount).toBe(5);
  });

  it('should emit delete event when onDelete is called', () => {
    spyOn(component.delete, 'emit');

    component.onDelete();

    expect(component.delete.emit).toHaveBeenCalled();
    expect(component.delete.emit).toHaveBeenCalledWith();
  });

  it('should handle multiple delete calls', () => {
    spyOn(component.delete, 'emit');

    component.onDelete();
    component.onDelete();
    component.onDelete();

    expect(component.delete.emit).toHaveBeenCalledTimes(3);
  });

  it('should work with different selectedCount values', () => {
    spyOn(component.delete, 'emit');

    component.selectedCount = 0;
    component.onDelete();

    component.selectedCount = 1;
    component.onDelete();

    component.selectedCount = 10;
    component.onDelete();

    expect(component.delete.emit).toHaveBeenCalledTimes(3);
  });
});
