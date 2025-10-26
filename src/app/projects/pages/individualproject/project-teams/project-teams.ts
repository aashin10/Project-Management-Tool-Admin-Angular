import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectsService, Team, TeamMember } from '../../../../shared/services/projects.service';

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
    const project = this.projectsService.getProjectById(this.projectId);
    if (project) {
      this.teams = project.teams || [];
      this.allMembers = project.teamMembers || [];
      if (this.teams.length > 0) {
        this.selectedTeam = this.teams[0].id;
      }
    }
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