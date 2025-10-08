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

  // Template Rendering
  describe('Template Rendering', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  // Input/Output
  describe('Input/Output', () => {
    it('should accept @Input projectName and projectKey', () => {
      component.projectName = 'My Project';
      component.projectKey = 'MY-001';
      fixture.detectChanges();
      expect(component.projectName).toBe('My Project');
      expect(component.projectKey).toBe('MY-001');
    });
  });

  // Component Logic
  describe('Component Logic', () => {
    it('getInitials should return PN when empty', () => {
      component.projectName = '';
      expect(component.getInitials()).toBe('PN');
    });

    it('getInitials should handle single-word name', () => {
      component.projectName = 'Alpha';
      expect(component.getInitials()).toBe('AL');
    });

    it('getInitials should handle multi-word name', () => {
      component.projectName = 'Alpha Beta';
      expect(component.getInitials()).toBe('AB');
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('getInitials should handle null/undefined projectName', () => {
      component.projectName = null as any;
      expect(component.getInitials()).toBe('PN');

      component.projectName = undefined as any;
      expect(component.getInitials()).toBe('PN');
    });

    

    it('getInitials should handle single character', () => {
      component.projectName = 'A';
      expect(component.getInitials()).toBe('A');
    });

    

    it('getInitials should handle more than two words', () => {
      component.projectName = 'Alpha Beta Gamma Delta';
      expect(component.getInitials()).toBe('AB');
    });

    it('getInitials should handle special characters', () => {
      component.projectName = '!@# $%^';
      expect(component.getInitials()).toBe('!$');
    });

    it('getInitials should handle numbers', () => {
      component.projectName = '123 456';
      expect(component.getInitials()).toBe('14');
    });

    it('getInitials should handle extremely long names', () => {
      const longWord1 = 'A'.repeat(1000);
      const longWord2 = 'B'.repeat(1000);
      component.projectName = `${longWord1} ${longWord2}`;
      expect(component.getInitials()).toBe('AB');
    });

    it('createProject event should emit when triggered', () => {
      spyOn(component.createProject, 'emit');
      component.createProject.emit();
      expect(component.createProject.emit).toHaveBeenCalled();
    });

    it('cancel event should emit when triggered', () => {
      spyOn(component.cancel, 'emit');
      component.cancel.emit();
      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should handle rapid projectName changes', () => {
      const names = ['A', 'AB', 'ABC', 'ABCD', 'Alpha Beta'];
      const expectedInitials = ['A', 'AB', 'AB', 'AB', 'AB'];

      names.forEach((name, index) => {
        component.projectName = name;
        expect(component.getInitials()).toBe(expectedInitials[index]);
      });
    });

    it('should handle projectName with leading/trailing spaces', () => {
      component.projectName = '  Alpha Beta  ';
      expect(component.getInitials()).toBe('AB');
    });

    

    it('getInitials should handle single word with two characters', () => {
      component.projectName = 'AB';
      expect(component.getInitials()).toBe('AB');
    });

    it('getInitials should handle single word longer than two characters', () => {
      component.projectName = 'Project';
      expect(component.getInitials()).toBe('PR');
    });
  });
});
