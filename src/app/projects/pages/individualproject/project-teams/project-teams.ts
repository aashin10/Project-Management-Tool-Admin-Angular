import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  avatarColor: string;
  email: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-project-teams',
  imports: [CommonModule],
  templateUrl: './project-teams.html',
  styleUrl: './project-teams.css'
})
export class ProjectTeams {

  teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Asha Varma',
      role: 'Project Manager',
      avatar: 'AV',
      avatarColor: '#3b82f6',
      email: 'asha.varma@company.com',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Pranav Iyer',
      role: 'Senior Developer',
      avatar: 'PI',
      avatarColor: '#10b981',
      email: 'pranav.iyer@company.com',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Sarah Chen',
      role: 'UI/UX Designer',
      avatar: 'SC',
      avatarColor: '#f59e0b',
      email: 'sarah.chen@company.com',
      status: 'Active'
    },
    {
      id: '4',
      name: 'Michael Rodriguez',
      role: 'Backend Developer',
      avatar: 'MR',
      avatarColor: '#ef4444',
      email: 'michael.rodriguez@company.com',
      status: 'Active'
    },
    {
      id: '5',
      name: 'Emma Thompson',
      role: 'QA Engineer',
      avatar: 'ET',
      avatarColor: '#8b5cf6',
      email: 'emma.thompson@company.com',
      status: 'Active'
    },
    {
      id: '6',
      name: 'James Wilson',
      role: 'DevOps Engineer',
      avatar: 'JW',
      avatarColor: '#06b6d4',
      email: 'james.wilson@company.com',
      status: 'Active'
    }
  ];

  getActiveMembersCount(): number {
    return this.teamMembers.filter(member => member.status === 'Active').length;
  }

  getTotalMembersCount(): number {
    return this.teamMembers.length;
  }
}
