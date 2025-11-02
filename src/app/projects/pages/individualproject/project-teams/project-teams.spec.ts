import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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
    { id: 1, name: 'Frontend Team' },
    { id: 2, name: 'Backend Team' }
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
    projectsServiceMock = jasmine.createSpyObj('ProjectsService', ['getProjectById']);
    projectsServiceMock.getProjectById.and.returnValue(of(mockProjectResponse as any));

    await TestBed.configureTestingModule({
      imports: [ProjectTeams],
      providers: [{ provide: ProjectsService, useValue: projectsServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectTeams);
    component = fixture.componentInstance;
    component.projectId = '1';
  });

  it('should initialize component and load project teams/members', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.teams.length).toBe(2);
    expect(component.allMembers.length).toBe(3);
    expect(component.selectedTeam).toBe('1');
    expect(component.showDropdown).toBe(false);
  });

  it('should filter members by selected team correctly', () => {
    fixture.detectChanges();

    component.selectedTeam = '1';
    expect(component.filteredMembers.length).toBe(2);
    expect(component.filteredMembers.every(m => m.team === '1')).toBe(true);

    component.selectedTeam = '2';
    expect(component.filteredMembers.length).toBe(1);
    expect(component.filteredMembers[0].team).toBe('2');
  });

  it('should return correct team name and member count', () => {
    fixture.detectChanges();

    component.selectedTeam = '1';
    expect(component.selectedTeamName).toBe('Frontend Team');
    expect(component.membersCount).toBe(2);

    component.selectedTeam = '2';
    expect(component.selectedTeamName).toBe('Backend Team');
    expect(component.membersCount).toBe(1);
  });

  it('should select team and toggle dropdown', () => {
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
    fixture.detectChanges();

    expect(component.getTeamName('1')).toBe('Frontend Team');
    expect(component.getTeamName('2')).toBe('Backend Team');
    expect(component.getTeamName('999')).toBe('Unknown Team');
  });

  it('should handle empty teams and members', () => {
    const emptyResponse = {
      status: 200,
      data: { id: '1', name: 'Empty Project', teams: [], teamMembers: [] },
      message: 'Success'
    };
    projectsServiceMock.getProjectById.and.returnValue(of(emptyResponse as any));

    const newComponent = TestBed.createComponent(ProjectTeams);
    newComponent.componentInstance.projectId = '1';
    newComponent.detectChanges();

    expect(newComponent.componentInstance.teams.length).toBe(0);
    expect(newComponent.componentInstance.filteredMembers.length).toBe(0);
  });

  it('should handle API errors gracefully', () => {
    projectsServiceMock.getProjectById.and.returnValue(
      new Observable(subscriber => subscriber.error(new Error('API Error')))
    );
    spyOn(console, 'error');

    const newComponent = TestBed.createComponent(ProjectTeams);
    newComponent.componentInstance.projectId = '1';
    newComponent.detectChanges();

    expect(console.error).toHaveBeenCalledWith(
      'Failed to load project teams:',
      jasmine.any(Error)
    );
  });
});

import { Observable } from 'rxjs';
