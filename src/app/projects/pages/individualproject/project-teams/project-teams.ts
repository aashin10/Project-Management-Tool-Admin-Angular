import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectsService, Project, Team, TeamMember } from '../../../services/projects.service';

@Component({
  selector: 'app-project-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-teams.html',
  styleUrls: ['./project-teams.css']
})
export class ProjectTeams implements OnInit {
  @Input() projectId!: string;

  teams: Team[] = [];
  selectedTeam: string = '1';
  showDropdown: boolean = false;
  allMembers: TeamMember[] = [];

  constructor(private projectsService: ProjectsService) {}

  ngOnInit(): void {
    this.projectsService.getProjectById(this.projectId).subscribe({
      next: (response) => {
        if (response.status === 200) {
          const project = response.data;
          this.teams = (project.teams || []).map(t => ({ id: t.id.toString(), name: t.name }));
          this.allMembers = (project.teamMembers || []).map(m => ({
            id: m.id.toString(),
            name: m.name,
            role: m.role,
            email: m.email,
            team: m.teamId.toString()
          }));
          if (this.teams.length > 0) {
            this.selectedTeam = this.teams[0].id;
          }
        }
      },
      error: (err) => {
        console.error('Failed to load project teams:', err);
      }
    });
  }



  get filteredMembers(): TeamMember[] {
    return this.allMembers.filter(member => member.team === this.selectedTeam);
  }

  get selectedTeamName(): string {
    return this.teams.find(team => team.id === this.selectedTeam)?.name || '';
  }

  get membersCount(): number {
    return this.filteredMembers.length;
  }

  getTeamName(teamId: string): string {
    return this.teams.find(team => team.id === teamId)?.name || 'Unknown Team';
  }

  selectTeam(teamId: string): void {
    this.selectedTeam = teamId;
    this.showDropdown = false;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }
}