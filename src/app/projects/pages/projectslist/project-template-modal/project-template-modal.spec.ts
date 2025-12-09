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

  it('should create component with output events', () => {
    expect(component).toBeTruthy();
    expect(component.templateSelected).toBeDefined();
    expect(component.closeModal).toBeDefined();
  });

  it('should emit templateSelected with template name', () => {
    spyOn(component.templateSelected, 'emit');
    spyOn(component.closeModal, 'emit');
    
    component.selectTemplate('Scrum');
    
    expect(component.templateSelected.emit).toHaveBeenCalledWith('Scrum');
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should select different templates and emit events', () => {
    spyOn(component.templateSelected, 'emit');
    
    component.selectTemplate('Kanban');
    expect(component.templateSelected.emit).toHaveBeenCalledWith('Kanban');
    
    component.selectTemplate('Waterfall');
    expect(component.templateSelected.emit).toHaveBeenCalledWith('Waterfall');
  });

  it('should emit closeModal on onClose', () => {
    spyOn(component.closeModal, 'emit');
    
    component.onClose();
    
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should handle multiple sequential template selections', () => {
    const templateSpy = spyOn(component.templateSelected, 'emit');
    const closeSpy = spyOn(component.closeModal, 'emit');
    
    component.selectTemplate('Scrum');
    component.selectTemplate('Kanban');
    component.selectTemplate('Waterfall');
    
    expect(templateSpy).toHaveBeenCalledTimes(3);
    expect(closeSpy).toHaveBeenCalledTimes(3);
  });

  it('should emit templateSelected before closeModal', () => {
    const emissionOrder: string[] = [];
    
    component.templateSelected.subscribe(() => {
      emissionOrder.push('templateSelected');
    });
    
    component.closeModal.subscribe(() => {
      emissionOrder.push('closeModal');
    });
    
    component.selectTemplate('Scrum');
    
    expect(emissionOrder).toEqual(['templateSelected', 'closeModal']);
  });

  it('should handle custom and edge case template names', () => {
    spyOn(component.templateSelected, 'emit');
    
    component.selectTemplate('Custom Template');
    expect(component.templateSelected.emit).toHaveBeenCalledWith('Custom Template');
    
    component.selectTemplate('@#$%');
    expect(component.templateSelected.emit).toHaveBeenCalledWith('@#$%');
    
    component.selectTemplate('');
    expect(component.templateSelected.emit).toHaveBeenCalledWith('');
  });
});
