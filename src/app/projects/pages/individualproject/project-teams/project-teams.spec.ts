import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTeams } from './project-teams';

describe('ProjectTeams', () => {
  let component: ProjectTeams;
  let fixture: ComponentFixture<ProjectTeams>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTeams]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTeams);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default team data', () => {
    expect(component.teams.length).toBe(4);
    expect(component.selectedTeam).toBe('1');
    expect(component.showDropdown).toBeFalse();
  });

  it('should filter members by selected team', () => {
    component.selectedTeam = '1';
    expect(component.filteredMembers.length).toBe(8); // Team 1 has 8 members
    expect(component.filteredMembers.every(member => member.team === '1')).toBeTrue();

    component.selectedTeam = '2';
    expect(component.filteredMembers.length).toBe(2); // Team 2 has 2 members
    expect(component.filteredMembers.every(member => member.team === '2')).toBeTrue();
  });

  it('should return correct selected team name', () => {
    component.selectedTeam = '1';
    expect(component.selectedTeamName).toBe('Team 1 - Frontend');

    component.selectedTeam = '2';
    expect(component.selectedTeamName).toBe('Team 2 - Backend');

    component.selectedTeam = '999'; // Non-existent team
    expect(component.selectedTeamName).toBe('');
  });

  it('should return correct member count', () => {
    component.selectedTeam = '1';
    expect(component.membersCount).toBe(8);

    component.selectedTeam = '4';
    expect(component.membersCount).toBe(3);
  });

  it('should select team and close dropdown', () => {
    component.showDropdown = true;
    component.selectTeam('2');
    expect(component.selectedTeam).toBe('2');
    expect(component.showDropdown).toBeFalse();
  });

  it('should toggle dropdown', () => {
    expect(component.showDropdown).toBeFalse();
    component.toggleDropdown();
    expect(component.showDropdown).toBeTrue();
    component.toggleDropdown();
    expect(component.showDropdown).toBeFalse();
  });

  it('should have all team members data', () => {
    expect(component.allMembers.length).toBe(14);
    const member = component.allMembers[0];
    expect(member).toEqual({
      id: '1',
      name: 'Asha Varma',
      role: 'Frontend Lead',
      avatar: 'AV',
      avatarColor: '#8b5cf6',
      email: 'asha.varma@company.com',
      team: '1'
    });
  });

  it('should filter members correctly for different teams', () => {
    // Test team 3 (DevOps)
    component.selectedTeam = '3';
    const devopsMembers = component.filteredMembers;
    expect(devopsMembers.length).toBe(1);
    expect(devopsMembers[0].name).toBe('James Brown');
    expect(devopsMembers[0].role).toBe('DevOps Engineer');

    // Test team 4 (QA)
    component.selectedTeam = '4';
    const qaMembers = component.filteredMembers;
    expect(qaMembers.length).toBe(3);
    expect(qaMembers.every(member => member.team === '4')).toBeTrue();
  });
});
