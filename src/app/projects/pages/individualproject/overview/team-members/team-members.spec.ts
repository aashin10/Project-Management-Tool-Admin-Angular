import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamMembersComponent } from './team-members';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

describe('TeamMembersComponent', () => {
  let component: TeamMembersComponent;
  let fixture: ComponentFixture<TeamMembersComponent>;
  let router: Router;

  // Mock team members data
  const mockTeamMembers = [
    { name: 'John Doe', role: 'Developer', initials: 'JD', color: 'blue' },
    { name: 'Jane Smith', role: 'Designer', initials: 'JS', color: 'green' },
    { name: 'Mark Wilson', role: 'Manager', initials: 'MW', color: 'purple' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamMembersComponent, CommonModule],
      providers: [
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TeamMembersComponent);
    component = fixture.componentInstance;
    
    // Set default input values
    component.teamMembers = mockTeamMembers;
    component.showViewAll = true;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Template Tests
  describe('Template Rendering', () => {
    it('should render team members section title', () => {
      const titleElement = fixture.debugElement.query(By.css('h2'));
      expect(titleElement.nativeElement.textContent).toContain('Team Members');
    });

    it('should render all team members', () => {
      const teamMemberElements = fixture.debugElement.queryAll(By.css('.flex.items-center.gap-3'));
      expect(teamMemberElements.length).toBe(mockTeamMembers.length);
    });

    it('should display correct member information', () => {
      const firstMemberElement = fixture.debugElement.queryAll(By.css('.flex.items-center.gap-3'))[0];
      const nameElement = firstMemberElement.query(By.css('.text-sm.font-medium'));
      const roleElement = firstMemberElement.query(By.css('.text-xs'));
      const initialsElement = firstMemberElement.query(By.css('.rounded-full'));

      expect(nameElement.nativeElement.textContent).toContain(mockTeamMembers[0].name);
      expect(roleElement.nativeElement.textContent).toContain(mockTeamMembers[0].role);
      expect(initialsElement.nativeElement.textContent.trim()).toBe(mockTeamMembers[0].initials);
    });

      it('should show "View All" button when showViewAll is true', () => {
        component.showViewAll = true;
        fixture.detectChanges();
        
        const viewAllButton = fixture.debugElement.query(By.css('[data-testid="view-all"]'));
        expect(viewAllButton).toBeTruthy();
        expect(viewAllButton.nativeElement.textContent.trim()).toBe('View All →');
      });

      it('should not show "View All" button when showViewAll is false', () => {
        component.showViewAll = false;
        fixture.detectChanges();
        
        const viewAllButton = fixture.debugElement.query(By.css('[data-testid="view-all"]'));
        expect(viewAllButton).toBeNull();
      });

  });

  // Component Logic Tests
  describe('Component Logic', () => {
    it('should emit event when View All is clicked', () => {
      spyOn(component.viewAllClicked, 'emit');
      
      const viewAllButton = fixture.debugElement.query(By.css('.text-blue-600'));
      viewAllButton.nativeElement.click();
      
      expect(component.viewAllClicked.emit).toHaveBeenCalled();
    });

    it('should return correct color classes for blue', () => {
      const blueClasses = component.getColorClasses('blue');
      expect(blueClasses).toBe('bg-blue-100 text-blue-600');
    });

    it('should return correct color classes for green', () => {
      const greenClasses = component.getColorClasses('green');
      expect(greenClasses).toBe('bg-green-100 text-green-600');
    });

    it('should return correct color classes for purple', () => {
      const purpleClasses = component.getColorClasses('purple');
      expect(purpleClasses).toBe('bg-purple-100 text-purple-600');
    });

    it('should return default color classes for unknown color', () => {
      const unknownClasses = component.getColorClasses('unknown');
      expect(unknownClasses).toBe('bg-gray-100 text-gray-600');
    });
  });

  // Input/Output Tests
  describe('Input/Output Properties', () => {
    it('should initialize with empty team members array if not provided', () => {
      const newComponent = TestBed.createComponent(TeamMembersComponent).componentInstance;
      expect(newComponent.teamMembers).toEqual([]);
    });

    it('should initialize with showViewAll as true by default', () => {
      const newComponent = TestBed.createComponent(TeamMembersComponent).componentInstance;
      expect(newComponent.showViewAll).toBeTrue();
    });

    it('should update view when team members input changes', () => {
      const newTeamMembers = [
        { name: 'New Member', role: 'New Role', initials: 'NM', color: 'pink' }
      ];
      
      component.teamMembers = newTeamMembers;
      fixture.detectChanges();
      
      const teamMemberElements = fixture.debugElement.queryAll(By.css('.flex.items-center.gap-3'));
      expect(teamMemberElements.length).toBe(1);
      expect(teamMemberElements[0].query(By.css('.text-sm')).nativeElement.textContent)
        .toContain('New Member');
    });
  });

  // Style Classes Tests
  describe('Style Classes', () => {
    it('should apply correct hover classes to team member rows', () => {
      const memberRow = fixture.debugElement.query(By.css('.flex.items-center.gap-3'));
      expect(memberRow.classes['hover:bg-gray-50']).toBeTrue();
    });

    it('should apply correct size classes to initials circle', () => {
      const initialsCircle = fixture.debugElement.query(By.css('.rounded-full'));
      expect(initialsCircle.classes['w-10']).toBeTrue();
      expect(initialsCircle.classes['h-10']).toBeTrue();
    });
  });
});
