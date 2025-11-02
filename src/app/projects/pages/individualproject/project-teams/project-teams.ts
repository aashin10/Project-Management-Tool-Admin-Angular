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
    console.log('ProjectTeams component initialized');
    console.log('Initial teams from @Input:', this.teams);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges called with changes:', changes);
    console.log('teams input value:', this.teams);
    console.log('teams input length:', this.teams?.length);
    if (changes['teams']) {
      console.log('Teams changed from:', changes['teams'].previousValue, 'to:', changes['teams'].currentValue);
      this._teams = this.teams || [];
      console.log('_teams set to:', this._teams);
      if (this._teams.length > 0) {
        console.log('Calling onTeamsReceived because teams exist');
        this.onTeamsReceived();
      } else {
        console.log('Not calling onTeamsReceived because no teams');
      }
      // Manually trigger change detection
      this.cdr.detectChanges();
    }
  }

  private onTeamsReceived(): void {
    console.log('onTeamsReceived called with', this.teams.length, 'teams');
    console.log('teams array:', this.teams);
    
    if (this.teams && this.teams.length > 0) {
      const firstTeamId = this.teams[0].id;
      console.log('Loading first team with ID:', firstTeamId, 'type:', typeof firstTeamId);
      this.selectedTeam = firstTeamId; // Don't convert to string, it's already a string
      console.log('selectedTeam set to:', this.selectedTeam);
      this.loadTeamMembers(firstTeamId);
    } else {
      console.log('No teams to load');
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
    console.log('Loading team members for teamId:', teamId, 'teamIdNum:', teamIdNum);
    
    this.projectsService.getTeamMembers(this.projectId, teamIdNum).subscribe({
      next: (response) => {
        console.log('Team members API response:', response);
        console.log('Response status:', response?.status);
        console.log('Response data:', response?.data);
        
        this.isLoading = false;
        
        if (response?.status === 200 && response?.data) {
          // Extract members from response
          const membersData = response.data.members || response.data;
          console.log('Members data extracted:', membersData);
          
          // Check if membersData is an array or if we need to access differently
          const membersList = Array.isArray(membersData) ? membersData : (membersData?.items || []);
          console.log('Members list:', membersList);
          
          // Map the response to TeamMember objects
          const members = membersList.map((m: any) => ({
            id: m.id?.toString() || m.memberId?.toString() || '',
            name: m.name || m.memberName || '',
            role: m.role || m.position || 'Unknown',
            email: m.email || m.emailAddress || '',
            team: teamId
          }));
          
          console.log('Mapped members:', members);
          this.selectedTeamMembers = members;
          this.errorMessage = '';
        } else {
          this.selectedTeamMembers = [];
          this.errorMessage = response?.message || 'Failed to load team members';
          console.error('Invalid response structure:', response);
        }
        
        // Manually trigger change detection to update the view
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading team members:', err);
        console.error('Error details:', err?.error);
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
    console.log('selectedTeamName - selectedTeam:', this.selectedTeam, 'found team:', team);
    return team?.name || 'Unknown Team';
  }

  get membersCount(): number {
    return this.selectedTeamMembers.length;
  }

  getTeamName(teamId: string): string {
    return this.teams.find(team => team.id === teamId)?.name || 'Unknown Team';
  }

  selectTeam(teamId: string): void {
    console.log('selectTeam called with:', teamId, 'type:', typeof teamId);
    this.selectedTeam = teamId;
    this.showDropdown = false;
    this.loadTeamMembers(teamId);
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }
}