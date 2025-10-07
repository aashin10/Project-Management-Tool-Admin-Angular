import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndividualprojectComponent } from './individualproject';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedModule } from '../../../shared/shared-module';
import { OverviewComponent } from './overview/overview';
import { TeamsAndRoles } from './teams-and-roles/teams-and-roles';
import { TeamMembersComponent } from './overview/team-members/team-members';
import { By } from '@angular/platform-browser';

describe('IndividualprojectComponent', () => {
  let component: IndividualprojectComponent;
  let fixture: ComponentFixture<IndividualprojectComponent>;
  let router: Router;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Create a proper mock for ParamMap
    const mockParamMap: ParamMap = {
      has: (key: string) => key === 'id',
      get: (key: string) => key === 'id' ? 'test-project-id' : null,
      getAll: (key: string) => key === 'id' ? ['test-project-id'] : [],
      keys: ['id']
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: mockParamMap
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        IndividualprojectComponent,
        CommonModule,
        SharedModule,
        OverviewComponent,
        TeamsAndRoles,
        TeamMembersComponent,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        },
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (value: string) => value,
            sanitize: (ctx: any, value: string) => value
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(IndividualprojectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Project Initialization Tests
  describe('Project Initialization', () => {
    
    it('should initialize projectId from route params', () => {
      expect(component.projectId).toBe('test-project-id');
    });

    it('should initialize with default project data', () => {
      expect(component.project).toBeDefined();
      expect(component.project.name).toBe('Atlasss App');
      expect(component.project.code).toBe('PROJ-001');
    });

    it('should start with overview tab active', () => {
      expect(component.activeTab).toBe('overview');
    });

    it('should load overview component by default', () => {
      const overviewElement = fixture.debugElement.query(By.css('app-overview'));
      expect(overviewElement).toBeTruthy();
    });
  });

  // Navigation Tests
  describe('Navigation', () => {
    it('should navigate back to projects list', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.goBackToProjects();
      expect(navigateSpy).toHaveBeenCalledWith(['/projects']);
    });

    it('should render back button', () => {
      const backButton = fixture.debugElement.query(By.css('button'));
      expect(backButton.nativeElement.textContent).toContain('Back to Projects');
    });
  });

  // Tab Switching Tests
  describe('Tab Switching', () => {
    it('should switch to team tab', async () => {
      component.selectTab('team');
      fixture.detectChanges();
      
      expect(component.activeTab).toBe('team');
      const teamElement = fixture.debugElement.query(By.css('app-teams-and-roles'));
      expect(teamElement).toBeTruthy();
    });

    it('should have correct styling for active tab', () => {
      // Get all nav buttons (skip the "Back to Projects" button)
      const navButtons = fixture.debugElement.queryAll(By.css('nav button'));
      const overviewTabButton = navButtons[0]; // First nav button is Overview
      
      // Check if overview tab has active classes
      const element = overviewTabButton.nativeElement;
      const hasTextBlue = element.classList.contains('text-blue-600');
      const hasBorderBlue = element.classList.contains('border-blue-600');
      
      expect(hasTextBlue).toBeTrue();
      expect(hasBorderBlue).toBeTrue();
    });

    it('should load team component when switching to team tab', async () => {
      spyOn(console, 'log');
      await component.selectTab('team');
      expect(console.log).toHaveBeenCalledWith('Team component to be loaded');
    });
  });

  // Project Actions Tests
  describe('Project Actions', () => {
    it('should handle edit project action', () => {
      spyOn(console, 'log');
      component.editProject();
      expect(console.log).toHaveBeenCalledWith('Edit project:', 'test-project-id');
    });

    it('should handle archive project action', () => {
      spyOn(console, 'log');
      component.archiveProject();
      expect(console.log).toHaveBeenCalledWith('Archive project:', 'test-project-id');
    });

    it('should handle delete project action', () => {
      spyOn(console, 'log');
      component.deleteProject();
      expect(console.log).toHaveBeenCalledWith('Delete project:', 'test-project-id');
    });
  });

  // Template Tests
  describe('Template Rendering', () => {
    it('should display project name and code', () => {
      const projectTitle = fixture.debugElement.query(By.css('h1'));
      const projectCode = fixture.debugElement.query(By.css('.text-xs.text-gray-500'));
      
      expect(projectTitle.nativeElement.textContent).toContain('Atlasss App');
      expect(projectCode.nativeElement.textContent).toContain('PROJ-001');
    });

    it('should display project status', () => {
      const statusElement = fixture.debugElement.query(By.css('.bg-green-100'));
      expect(statusElement.nativeElement.textContent.trim()).toBe('Ongoing');
    });

    it('should render project description', () => {
      const descriptionElement = fixture.debugElement.query(By.css('.text-sm.text-gray-600'));
      expect(descriptionElement.nativeElement.textContent)
        .toContain('Mobile application for atlas navigation and mapping');
    });

    it('should render action buttons', () => {
      const buttons = fixture.debugElement.queryAll(By.css('app-custom-button'));
      expect(buttons.length).toBe(3); // Edit, Archive, and Delete buttons
    });
  });

  // Component Behavior Tests
  describe('Component Behavior', () => {
    it('should handle tab selection and component loading', async () => {
      await component.selectTab('team');
      expect(component.activeTab).toBe('team');
      expect(component.teamComponent).toBeNull(); // Since it's not implemented yet
    });

    it('should maintain component state after tab switches', async () => {
      const initialTab = component.activeTab;
      await component.selectTab('team');
      await component.selectTab('overview');
      expect(component.activeTab).toBe('overview');
      expect(component.overviewComponent).toBeDefined();
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle missing project ID', async () => {
      // Create a new mock without ID
      const emptyParamMap: ParamMap = {
        has: (key: string) => false,
        get: (key: string) => null,
        getAll: (key: string) => [],
        keys: []
      };

      await TestBed.resetTestingModule();
      
      await TestBed.configureTestingModule({
        imports: [
          IndividualprojectComponent,
          CommonModule,
          SharedModule,
          OverviewComponent,
          TeamsAndRoles,
          TeamMembersComponent,
          RouterTestingModule.withRoutes([])
        ],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: emptyParamMap
              }
            }
          },
          {
            provide: DomSanitizer,
            useValue: {
              bypassSecurityTrustHtml: (value: string) => value,
              sanitize: (ctx: any, value: string) => value
            }
          }
        ]
      }).compileComponents();
      
      const newFixture = TestBed.createComponent(IndividualprojectComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();
      
      expect(newComponent.projectId).toBe('');
    });

    it('should handle multiple tab switches', async () => {
      await component.selectTab('team');
      await component.selectTab('overview');
      await component.selectTab('team');
      
      expect(component.activeTab).toBe('team');
    });
  });
});