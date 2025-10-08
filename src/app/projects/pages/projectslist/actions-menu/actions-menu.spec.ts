import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionsMenu } from './actions-menu';

describe('ActionsMenu Component', () => {
  let component: ActionsMenu;
  let fixture: ComponentFixture<ActionsMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsMenu]
    }).compileComponents();

    fixture = TestBed.createComponent(ActionsMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.projectId).toBe('');
    expect(component.isOpen).toBe(false);
    expect(component.isActive).toBe(false);
  });

  it('should emit viewDetails event with projectId when onViewDetails is called', () => {
    spyOn(component.viewDetails, 'emit');
    component.projectId = '123';

    component.onViewDetails();

    expect(component.viewDetails.emit).toHaveBeenCalledWith('123');
  });

  it('should emit edit event with projectId when onEdit is called', () => {
    spyOn(component.edit, 'emit');
    component.projectId = '456';

    component.onEdit();

    expect(component.edit.emit).toHaveBeenCalledWith('456');
  });

  it('should emit archive event with projectId when onArchive is called', () => {
    spyOn(component.archive, 'emit');
    component.projectId = '789';

    component.onArchive();

    expect(component.archive.emit).toHaveBeenCalledWith('789');
  });

  it('should emit delete event with projectId when onDelete is called', () => {
    spyOn(component.delete, 'emit');
    component.projectId = '999';

    component.onDelete();

    expect(component.delete.emit).toHaveBeenCalledWith('999');
  });
});