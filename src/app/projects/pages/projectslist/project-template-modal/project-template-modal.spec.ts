import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectTemplateModal } from './project-template-modal';

describe('ProjectTemplateModal', () => {
  let component: ProjectTemplateModal;
  let fixture: ComponentFixture<ProjectTemplateModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTemplateModal]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectTemplateModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selectTemplate should emit template and close', () => {
    spyOn(component.templateSelected, 'emit');
    spyOn(component.closeModal, 'emit');
    component.selectTemplate('Scrum');
    expect(component.templateSelected.emit).toHaveBeenCalledWith('Scrum');
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

});
