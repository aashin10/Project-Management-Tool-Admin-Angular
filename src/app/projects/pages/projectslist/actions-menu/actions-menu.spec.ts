import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsMenu } from './actions-menu';

describe('ActionsMenu', () => {
  let component: ActionsMenu;
  let fixture: ComponentFixture<ActionsMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionsMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default properties', () => {
    expect(component.projectId).toBe('');
    expect(component.isOpen).toBe(false);
    expect(component.isActive).toBe(false);
  });

  it('should accept input properties', () => {
    component.projectId = 'test-123';
    component.isOpen = true;
    component.isActive = true;

    expect(component.projectId).toBe('test-123');
    expect(component.isOpen).toBe(true);
    expect(component.isActive).toBe(true);
  });

  it('should emit viewDetails event with projectId', () => {
    spyOn(component.viewDetails, 'emit');

    component.projectId = 'project-123';
    component.onViewDetails();

    expect(component.viewDetails.emit).toHaveBeenCalled();
    expect(component.viewDetails.emit).toHaveBeenCalledWith('project-123');
  });

  it('should emit edit event with projectId', () => {
    spyOn(component.edit, 'emit');

    component.projectId = 'project-456';
    component.onEdit();

    expect(component.edit.emit).toHaveBeenCalled();
    expect(component.edit.emit).toHaveBeenCalledWith('project-456');
  });

  it('should emit archive event with projectId', () => {
    spyOn(component.archive, 'emit');

    component.projectId = 'project-789';
    component.onArchive();

    expect(component.archive.emit).toHaveBeenCalled();
    expect(component.archive.emit).toHaveBeenCalledWith('project-789');
  });

  it('should emit delete event with projectId', () => {
    spyOn(component.delete, 'emit');

    component.projectId = 'project-999';
    component.onDelete();

    expect(component.delete.emit).toHaveBeenCalled();
    expect(component.delete.emit).toHaveBeenCalledWith('project-999');
  });

  it('should handle multiple event emissions', () => {
    spyOn(component.viewDetails, 'emit');
    spyOn(component.edit, 'emit');
    spyOn(component.archive, 'emit');
    spyOn(component.delete, 'emit');

    component.projectId = 'test-project';

    component.onViewDetails();
    component.onEdit();
    component.onArchive();
    component.onDelete();

    expect(component.viewDetails.emit).toHaveBeenCalledWith('test-project');
    expect(component.edit.emit).toHaveBeenCalledWith('test-project');
    expect(component.archive.emit).toHaveBeenCalledWith('test-project');
    expect(component.delete.emit).toHaveBeenCalledWith('test-project');
  });

  it('should emit correct projectId for different projects', () => {
    spyOn(component.viewDetails, 'emit');

    component.projectId = 'project-1';
    component.onViewDetails();
    expect(component.viewDetails.emit).toHaveBeenCalledWith('project-1');

    component.projectId = 'project-2';
    component.onViewDetails();
    expect(component.viewDetails.emit).toHaveBeenCalledWith('project-2');
  });

  it('should handle empty projectId', () => {
    spyOn(component.viewDetails, 'emit');

    component.projectId = '';
    component.onViewDetails();

    expect(component.viewDetails.emit).toHaveBeenCalledWith('');
  });

  it('should handle special characters in projectId', () => {
    spyOn(component.viewDetails, 'emit');

    component.projectId = 'project-123_special@test.com';
    component.onViewDetails();

    expect(component.viewDetails.emit).toHaveBeenCalledWith('project-123_special@test.com');
  });
});
