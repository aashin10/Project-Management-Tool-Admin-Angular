import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { OverviewComponent } from './overview/overview';
import { TeamsAndRoles } from './teams-and-roles/teams-and-roles';
import { SharedModule } from '../../../shared/shared-module';

@Component({
  selector: 'app-individualproject',
  standalone: true,
  imports: [CommonModule,OverviewComponent,TeamsAndRoles,SharedModule],
  templateUrl: './individualproject.html',
  styleUrl: './individualproject.css'
})
export class IndividualprojectComponent implements OnInit {
  activeTab: 'overview'  | 'team' = 'overview';
  projectId: string = '';
  
  // Project data (this would typically come from a service)
  project = {
    name: 'Atlasss App',
    code: 'PROJ-001',
    status: 'Ongoing',
    description: 'Mobile application for atlas navigation and mapping',
    avatar: 'AA',
    avatarColor: '#cc4700ff'
  };

  // Overview component reference (lazy loaded)
  overviewComponent: any = null;
  sprintsComponent: any = null;
  teamComponent: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    // CRITICAL: Get project ID from route params in constructor
    const id = this.route.snapshot.paramMap.get('id');
    this.projectId = id !== null ? id : '';
  }

  ngOnInit(): void {
    // Load overview by default
    this.loadOverviewComponent();
  }

  selectTab(tab: 'overview'  | 'team'): void {
    this.activeTab = tab;
    
    // Lazy load components based on selected tab
    switch(tab) {
      case 'overview':
        this.loadOverviewComponent();
        break;
      case 'team':
        this.loadTeamComponent();
        break;
    }
  }

  private async loadOverviewComponent(): Promise<void> {
    if (!this.overviewComponent) {
      // Lazy load the overview component
      const { OverviewComponent } = await import('./overview/overview');
      this.overviewComponent = OverviewComponent;
    }
  }

  private async loadTeamComponent(): Promise<void> {
    if (!this.teamComponent) {
      // Lazy load the team component (to be implemented)
      // const { TeamComponent } = await import('./team/team.component');
      // this.teamComponent = TeamComponent;
      console.log('Team component to be loaded');
    }
  }

  goBackToProjects(): void {
    this.router.navigate(['/projects']);
  }

  editProject(): void {
    console.log('Edit project:', this.projectId);
    // Navigate to edit page or open modal
  }

  archiveProject(): void {
    console.log('Archive project:', this.projectId);
    // Show confirmation dialog and archive
  }

  deleteProject(): void {
    console.log('Delete project:', this.projectId);
    // Show confirmation dialog and delete
  }
}