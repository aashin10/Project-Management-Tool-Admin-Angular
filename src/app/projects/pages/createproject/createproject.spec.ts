// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { Createproject } from './createproject';

// describe('Createproject', () => {
//   let component: Createproject;
//   let fixture: ComponentFixture<Createproject>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [Createproject]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(Createproject);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   // Template Rendering
//   describe('Template Rendering', () => {
//     it('should create', () => {
//       expect(component).toBeTruthy();
//     });
//   });

//   // Input/Output Properties
//   describe('Input/Output Properties', () => {
//     it('should initialize child inputs when provided', () => {
//       // smoke: check component inputs exist
//       expect(component).toBeDefined();
//     });
//   });

//   // Component Logic
//   describe('Component Logic', () => {
//     it('should have a default state for new project creation', () => {
//       // basic check for any initialization logic
//       expect(component).toBeTruthy();
//     });
//   });
// });

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Createproject } from './createproject';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { BasicInformationComponent } from './basicinfo/basicinfo';
import { TeamOrganizationComponent } from './teaminfo/teaminfo';
import { ProjectPreviewComponent } from './projectpreview/projectpreview';
import { Additionalinfo } from './additionalinfo/additionalinfo';
import { CommonModule } from '@angular/common';

describe('Createproject', () => {
  let component: Createproject;
  let fixture: ComponentFixture<Createproject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        Createproject, // standalone component
        Sectiontitle,
        BasicInformationComponent,
        TeamOrganizationComponent,
        ProjectPreviewComponent,
        Additionalinfo
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Createproject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // -------------------------------
  // Template Rendering
  // -------------------------------
  describe('Template Rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render the section title with correct text', () => {
      const sectionTitle = fixture.debugElement.query(By.directive(Sectiontitle)).componentInstance;
      expect(sectionTitle.title).toBe('Create New Project');
      expect(sectionTitle.description).toContain('Set up your project');
    });

    it('should display "Back to Projects" link', () => {
      const backLink = fixture.debugElement.query(By.css('.back-link span')).nativeElement;
      expect(backLink.textContent).toContain('Back to Projects');
    });
  });

  // -------------------------------
  // Input/Output Properties
  // -------------------------------
  describe('Input/Output Properties', () => {
    it('should pass projectName and projectKey to ProjectPreview', () => {
      component.projectName = 'Demo Project';
      component.projectKey = 'DP01';
      fixture.detectChanges();

      const preview = fixture.debugElement.query(By.directive(ProjectPreviewComponent)).componentInstance;
      expect(preview.projectName).toBe('Demo Project');
      expect(preview.projectKey).toBe('DP01');
    });

    it('should update projectName when BasicInformation emits projectNameChange', () => {
      const basicInfo = fixture.debugElement.query(By.directive(BasicInformationComponent)).componentInstance;
      basicInfo.projectNameChange.emit('Updated Project');
      fixture.detectChanges();

      expect(component.projectName).toBe('Updated Project');
    });

    it('should update manager when TeamOrganization emits managerChange', () => {
      const teamOrg = fixture.debugElement.query(By.directive(TeamOrganizationComponent)).componentInstance;
      teamOrg.managerChange.emit('John Doe');
      fixture.detectChanges();

      expect(component.manager).toBe('John Doe');
    });

    it('should update additionalFields when Additionalinfo emits addedFieldsChange', () => {
      const additionalInfo = fixture.debugElement.query(By.directive(Additionalinfo)).componentInstance;
      const mockFields = [{ name: 'Deadline', value: '2025-12-31' }];
      additionalInfo.addedFieldsChange.emit(mockFields);
      fixture.detectChanges();

      expect(component.additionalFields).toEqual(mockFields);
    });
  });

  // -------------------------------
  // Component Logic
  // -------------------------------
  describe('Component Logic', () => {
    it('should log project details when onCreateProject is called', () => {
      spyOn(console, 'log');
      component.projectName = 'Project X';
      component.projectKey = 'PX01';
      component.description = 'Test Project';
      component.priority = 'Medium';
      component.manager = 'Alice';
      component.deliveryUnit = 'Unit A';
      component.additionalFields = [{ name: 'Budget', value: '10000' }];

      component.onCreateProject();

      expect(console.log).toHaveBeenCalledWith('Creating project:', jasmine.objectContaining({
        name: 'Project X',
        key: 'PX01',
        description: 'Test Project',
        priority: 'Medium',
        manager: 'Alice',
        deliveryUnit: 'Unit A',
        additionalFields: [{ name: 'Budget', value: '10000' }]
      }));
    });

    it('should log cancel message when onCancel is called', () => {
      spyOn(console, 'log');
      component.onCancel();
      expect(console.log).toHaveBeenCalledWith('Cancel project creation');
    });
  });

  // -------------------------------
  // Edge Cases
  // -------------------------------
  describe('Edge Cases', () => {
    it('should handle empty project creation', () => {
      spyOn(console, 'log');
      component.projectName = '';
      component.projectKey = '';
      component.description = '';
      component.priority = '';
      component.manager = '';
      component.deliveryUnit = '';
      component.additionalFields = [];

      component.onCreateProject();

      expect(console.log).toHaveBeenCalledWith('Creating project:', jasmine.objectContaining({
        name: '',
        key: '',
        description: '',
        priority: '',
        manager: '',
        deliveryUnit: '',
        additionalFields: []
      }));
    });

    it('should handle null and undefined values gracefully', () => {
      spyOn(console, 'log');
      component.projectName = null as any;
      component.projectKey = undefined as any;
      component.description = null as any;
      component.additionalFields = null as any;

      expect(() => component.onCreateProject()).not.toThrow();
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle extremely long project names', () => {
      const longName = 'A'.repeat(1000);
      component.projectName = longName;
      fixture.detectChanges();

      const preview = fixture.debugElement.query(By.directive(ProjectPreviewComponent)).componentInstance;
      expect(preview.projectName).toBe(longName);
    });
  });
});
