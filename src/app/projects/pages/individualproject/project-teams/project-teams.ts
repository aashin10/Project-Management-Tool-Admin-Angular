import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
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
export class ProjectTeams implements OnInit, OnChanges {
  @Input() projectId!: string;
  @Input() teams: Team[] = [];

  private _teams: Team[] = [];
  selectedTeam: string = '';
  showDropdown: boolean = false;
  selectedTeamMembers: TeamMember[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private projectsService: ProjectsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teams']) {
      this._teams = this.teams || [];
      if (this._teams.length > 0) {
        this.onTeamsReceived();
      } else {
      }
      // Manually trigger change detection
      this.cdr.detectChanges();
    }
  }

  private onTeamsReceived(): void {
    if (this.teams && this.teams.length > 0) {
      const firstTeamId = this.teams[0].id;
      this.selectedTeam = firstTeamId; // Don't convert to string, it's already a string
      this.loadTeamMembers(firstTeamId);
    } else {
    }
  }

  /**
   * Load team members for the selected team from the API
   */
  private loadTeamMembers(teamId: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.selectedTeamMembers = []; // Clear previous members
    
    // Manually trigger change detection to show loading state
    this.cdr.detectChanges();
    
    const teamIdNum = parseInt(teamId, 10);
    this.projectsService.getTeamMembers(this.projectId, teamIdNum).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response?.status === 200 && response?.data) {
          // Extract members from response
          const membersData = response.data.members || response.data;
          // Check if membersData is an array or if we need to access differently
          const membersList = Array.isArray(membersData) ? membersData : (membersData?.items || []);
          // Map the response to TeamMember objects
          const members = membersList.map((m: any) => ({
            id: m.id?.toString() || m.memberId?.toString() || '',
            name: m.name || m.memberName || '',
            role: m.role || m.position || 'Unknown',
            email: m.email || m.emailAddress || '',
            team: teamId
          }));
          this.selectedTeamMembers = members;
          this.errorMessage = '';
        } else {
          this.selectedTeamMembers = [];
          this.errorMessage = response?.message || 'Failed to load team members';
        }
        
        // Manually trigger change detection to update the view
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.selectedTeamMembers = [];
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load team members. Please try again.';
        
        // Manually trigger change detection to update the view
        this.cdr.detectChanges();
      }
    });
  }



  get selectedTeamName(): string {
    if (!this.selectedTeam) {
      return 'Select a team';
    }
    const team = this.teams.find(team => team.id === this.selectedTeam);
    return team?.name || 'Unknown Team';
  }

  get membersCount(): number {
    return this.selectedTeamMembers.length;
  }

  getTeamName(teamId: string): string {
    return this.teams.find(team => team.id === teamId)?.name || 'Unknown Team';
  }

  selectTeam(teamId: string): void {
    this.selectedTeam = teamId;
    this.showDropdown = false;
    this.loadTeamMembers(teamId);
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }
}