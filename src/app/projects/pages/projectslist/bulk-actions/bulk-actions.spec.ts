import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BulkActions } from './bulk-actions';
import { CustomButton } from '../../../../shared/custom-button/custom-button';

describe('BulkActions Component', () => {
  let component: BulkActions;
  let fixture: ComponentFixture<BulkActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkActions, CustomButton]
    }).compileComponents();

    fixture = TestBed.createComponent(BulkActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default selectedCount of 0', () => {
    expect(component.selectedCount).toBe(0);
  });

  it('should emit delete event when onDelete is called', () => {
    spyOn(component.delete, 'emit');

    component.onDelete();

    expect(component.delete.emit).toHaveBeenCalled();
  });

  it('should display correct selected count in template', () => {
    component.selectedCount = 5;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('5 selected');
  });

  it('should show bulk actions when selectedCount > 0', () => {
    component.selectedCount = 3;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('div')).toBeTruthy();
  });

  it('should hide bulk actions when selectedCount is 0', () => {
    component.selectedCount = 0;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.children.length).toBe(0);
  });
});