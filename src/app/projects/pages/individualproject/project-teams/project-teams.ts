import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  avatarColor: string;
  email: string;
  team: string;
}

interface Team {
  id: string;
  name: string;
}

@Component({
  selector: 'app-project-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-teams.html',
  styleUrls: ['./project-teams.css']
})
export class ProjectTeams {
  
  teams: Team[] = [
    { id: '1', name: 'Team 1 - Frontend' },
    { id: '2', name: 'Team 2 - Backend' },
    { id: '3', name: 'Team 3 - DevOps' },
    { id: '4', name: 'Team 4 - QA' }
  ];

  selectedTeam: string = '1';
  showDropdown: boolean = false;

  allMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Asha Varma',
      role: 'Frontend Lead',
      avatar: 'AV',
      avatarColor: '#8b5cf6',
      email: 'asha.varma@company.com',
      team: '1'
    },
    {
      id: '2',
      name: 'Pranav Iyer',
      role: 'Senior Developer',
      avatar: 'PI',
      avatarColor: '#3b82f6',
      email: 'pranav.iyer@company.com',
      team: '1'
    },
    {
      id: '3',
      name: 'Sarah Chen',
      role: 'UI/UX Designer',
      avatar: 'SC',
      avatarColor: '#ec4899',
      email: 'sarah.chen@company.com',
      team: '1'
    },
    {
      id: '4',
      name: 'Mike Johnson',
      role: 'Frontend Developer',
      avatar: 'MJ',
      avatarColor: '#3b82f6',
      email: 'mike.johnson@company.com',
      team: '1'
    },
    {
      id: '5',
      name: 'Lisa Wong',
      role: 'Frontend Developer',
      avatar: 'LW',
      avatarColor: '#3b82f6',
      email: 'lisa.wong@company.com',
      team: '1'
    },
    {
      id: '6',
      name: 'David Kim',
      role: 'Frontend Developer',
      avatar: 'DK',
      avatarColor: '#3b82f6',
      email: 'david.kim@company.com',
      team: '1'
    },
    {
      id: '7',
      name: 'Emma Wilson',
      role: 'UI Designer',
      avatar: 'EW',
      avatarColor: '#f97316',
      email: 'emma.wilson@company.com',
      team: '1'
    },
    {
      id: '8',
      name: 'Alex Martinez',
      role: 'Frontend Developer',
      avatar: 'AM',
      avatarColor: '#3b82f6',
      email: 'alex.martinez@company.com',
      team: '1'
    },
    {
      id: '9',
      name: 'John Smith',
      role: 'Backend Lead',
      avatar: 'JS',
      avatarColor: '#10b981',
      email: 'john.smith@company.com',
      team: '2'
    },
    {
      id: '10',
      name: 'Maria Garcia',
      role: 'Backend Developer',
      avatar: 'MG',
      avatarColor: '#10b981',
      email: 'maria.garcia@company.com',
      team: '2'
    },
    {
      id: '11',
      name: 'James Brown',
      role: 'DevOps Engineer',
      avatar: 'JB',
      avatarColor: '#10b981',
      email: 'james.brown@company.com',
      team: '3'
    },
    {
      id: '12',
      name: 'Linda Davis',
      role: 'QA Lead',
      avatar: 'LD',
      avatarColor: '#f59e0b',
      email: 'linda.davis@company.com',
      team: '4'
    },
    {
      id: '13',
      name: 'Michael Brown',
      role: 'QA Engineer',
      avatar: 'MB',
      avatarColor: '#f59e0b',
      email: 'michael.brown@company.com',
      team: '4'
    },
    { id: '14',
      name: 'Sophia Lee',
      role: 'QA Engineer',
      avatar: 'SL',
      avatarColor: '#f59e0b',
      email: 'sophia.lee@company.com',
      team: '4'
    }
  ];

  get filteredMembers(): TeamMember[] {
    return this.allMembers.filter(member => member.team === this.selectedTeam);
  }

  get selectedTeamName(): string {
    return this.teams.find(team => team.id === this.selectedTeam)?.name || '';
  }

  get membersCount(): number {
    return this.filteredMembers.length;
  }

  selectTeam(teamId: string): void {
    this.selectedTeam = teamId;
    this.showDropdown = false;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }
}