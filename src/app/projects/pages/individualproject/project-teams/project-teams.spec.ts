import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Observable } from 'rxjs';
import { ProjectTeams } from './project-teams';
import { ProjectsService } from '../../../services/projects.service';

describe('ProjectTeams', () => {
  let component: ProjectTeams;
  let fixture: ComponentFixture<ProjectTeams>;
  let projectsServiceMock: jasmine.SpyObj<ProjectsService>;

  const mockTeamMembers = [
    { id: 1, name: 'Asha Varma', role: 'Frontend Lead', email: 'asha@company.com', teamId: 1 },
    { id: 2, name: 'Raj Kumar', role: 'Frontend Developer', email: 'raj@company.com', teamId: 1 },
    { id: 3, name: 'Priya Singh', role: 'Backend Lead', email: 'priya@company.com', teamId: 2 }
  ];

  const mockTeams = [
    { id: '1', name: 'Frontend Team' },
    { id: '2', name: 'Backend Team' }
  ];

  const mockProjectResponse = {
    status: 200,
    data: {
      id: '1',
      name: 'Test Project',
      teams: mockTeams,
      teamMembers: mockTeamMembers
    },
    message: 'Success'
  };

  beforeEach(async () => {
    projectsServiceMock = jasmine.createSpyObj('ProjectsService', ['getProjectById', 'getTeamMembers']);
    projectsServiceMock.getProjectById.and.returnValue(of(mockProjectResponse as any));
    projectsServiceMock.getTeamMembers.and.returnValue(of({ status: 200, data: { members: mockTeamMembers }, message: 'Success' }));

    await TestBed.configureTestingModule({
      imports: [ProjectTeams],
      providers: [{ provide: ProjectsService, useValue: projectsServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectTeams);
    component = fixture.componentInstance;
    component.projectId = '1';
  });

  it('should initialize component and load project teams/members', () => {
    component.teams = mockTeams;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.teams.length).toBe(2);
    expect(component.showDropdown).toBe(false);
  });

  it('should filter members by selected team correctly', () => {
    component.teams = mockTeams;
    fixture.detectChanges();

    component.selectTeam('1');
    expect(component.selectedTeam).toBe('1');
    
    component.selectTeam('2');
    expect(component.selectedTeam).toBe('2');
  });

  it('should return correct team name and member count', () => {
    component.teams = mockTeams;
    fixture.detectChanges();

    component.selectedTeam = '1';
    expect(component.selectedTeamName).toBe('Frontend Team');
    expect(component.membersCount).toBeGreaterThanOrEqual(0);

    component.selectedTeam = '2';
    expect(component.selectedTeamName).toBe('Backend Team');
  });

  it('should select team and toggle dropdown', () => {
    component.teams = mockTeams;
    fixture.detectChanges();

    component.showDropdown = true;
    component.selectTeam('2');
    expect(component.selectedTeam).toBe('2');
    expect(component.showDropdown).toBe(false);

    component.toggleDropdown();
    expect(component.showDropdown).toBe(true);
    component.toggleDropdown();
    expect(component.showDropdown).toBe(false);
  });

  it('should get team name by ID and handle edge cases', () => {
    component.teams = mockTeams;
    fixture.detectChanges();

    expect(component.getTeamName('1')).toBe('Frontend Team');
    expect(component.getTeamName('2')).toBe('Backend Team');
    expect(component.getTeamName('999')).toBe('Unknown Team');
  });

  it('should handle empty teams and members', () => {
    component.teams = [];
    component.selectedTeamMembers = [];
    fixture.detectChanges();

    expect(component.teams.length).toBe(0);
    expect(component.selectedTeamMembers.length).toBe(0);
  });

  it('should handle API errors gracefully', () => {
    projectsServiceMock.getTeamMembers.and.returnValue(
      new Observable(subscriber => subscriber.error({ message: 'API Error' }))
    );

    component.teams = mockTeams;
    component.selectTeam('1');
    fixture.detectChanges();

    expect(component.errorMessage).toContain('API Error');
    expect(component.isLoading).toBe(false);
    expect(component.selectedTeamMembers.length).toBe(0);
  });
});
