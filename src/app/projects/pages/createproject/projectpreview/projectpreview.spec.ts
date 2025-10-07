import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPreviewComponent } from './projectpreview';

describe('ProjectPreviewComponent', () => {
  let component: ProjectPreviewComponent;
  let fixture: ComponentFixture<ProjectPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectPreviewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getInitials returns PN when projectName empty', () => {
    component.projectName = '';
    expect(component.getInitials()).toBe('PN');
  });

  it('getInitials returns first two letters for single-word name', () => {
    component.projectName = 'Apollo';
    expect(component.getInitials()).toBe('AP');
  });

  it('getInitials returns initials of first two words', () => {
    component.projectName = 'New Project';
    expect(component.getInitials()).toBe('NP');
  });

  it('emits createProject when create button action dispatched', () => {
    spyOn(component.createProject, 'emit');
    const customButtons = fixture.nativeElement.querySelectorAll('app-custom-button');
    expect(customButtons.length).toBeGreaterThan(0);
    // dispatch action event on first button
    const evt = new Event('action');
    customButtons[0].dispatchEvent(evt);
    expect(component.createProject.emit).toHaveBeenCalled();
  });

  it('emits cancel when cancel button action dispatched', () => {
    spyOn(component.cancel, 'emit');
    const customButtons = fixture.nativeElement.querySelectorAll('app-custom-button');
    expect(customButtons.length).toBeGreaterThan(1);
    const evt = new Event('action');
    customButtons[1].dispatchEvent(evt);
    expect(component.cancel.emit).toHaveBeenCalled();
  });
});
