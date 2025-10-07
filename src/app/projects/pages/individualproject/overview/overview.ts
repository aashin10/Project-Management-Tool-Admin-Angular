import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewDashboardCard } from './overview-dashboard-card/overview-dashboard-card';
import { WorkItemDistributionComponent, WorkItemDistributionItem } from './work-item-distribution/work-item-distribution';
import { IndividualSprintData, SprintAnalyticsComponent } from './sprint-analytics/sprint-analytics';
import { WorkTypeData, WorkTypesComponent } from './types-of-work/types-of-work';
import { TeamMember, TeamMembersComponent } from './team-members/team-members';


interface SprintData {
  totalIterations: number;
  active: number;
  completed: number;
}

interface WorkItemsData {
  total: number;
  toDo: number;
  inProgress: number;
  done: number;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule, 
    OverviewDashboardCard, 
    WorkItemDistributionComponent, 
    SprintAnalyticsComponent,
    WorkTypesComponent,
    TeamMembersComponent // Add this import
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class OverviewComponent implements OnInit {
  
  @Output() viewAllClicked = new EventEmitter<void>();

  onTeamMembersViewAll() {
  this.viewAllClicked.emit();
}



  sprintData: SprintData = {
    totalIterations: 8,
    active: 2,
    completed: 6
  };

  workItemsData: WorkItemsData = {
    total: 99,
    toDo: 24,
    inProgress: 8,
    done: 67
  };

  currentSprintProgress = 78;
  teamMembersCount = 12;

  currentSprint: IndividualSprintData = {
    id: 'sprint-12',
    name: 'Sprint 12',
    progress: 78,
    goal: 'Complete user authentication and dashboard improvements',
    startDate: 'Jan 15',
    endDate: 'Jan 29',
    status: 'Active',
    toDo: 24,
    inProgress: 8,
    done: 67,
    completedStoryPoints: 285,
    totalStoryPoints: 354,
    completedIssues: 14,
    issuesCount: 18
  };

  sprints: IndividualSprintData[] = [
    this.currentSprint,
    {
      id: 'sprint-11',
      name: 'Sprint 11',
      progress: 100,
      goal: 'Backend API development',
      startDate: 'Jan 1',
      endDate: 'Jan 14',
      status: 'Completed',
      toDo: 0,
      inProgress: 0,
      done: 42,
      completedStoryPoints: 320,
      totalStoryPoints: 320,
      completedIssues: 16,
      issuesCount: 16
    },
    {
      id: 'sprint-10',
      name: 'Sprint 10',
      progress: 100,
      goal: 'Database schema design',
      startDate: 'Dec 15',
      endDate: 'Dec 31',
      status: 'Completed',
      toDo: 0,
      inProgress: 0,
      done: 38,
      completedStoryPoints: 295,
      totalStoryPoints: 295,
      completedIssues: 15,
      issuesCount: 15
    }
  ];

  workTypes: WorkTypeData[] = [
    { name: 'Story', percentage: 45, color: '#059669', icon: 'file-text' },
    { name: 'Task', percentage: 32, color: '#3B82F6', icon: 'check-square' },
    { name: 'Bug', percentage: 15, color: '#EF4444', icon: 'alert-circle' },
    { name: 'Epic', percentage: 7, color: '#8B5CF6', icon: 'zap' }
  ];

  workItemDistribution: WorkItemDistributionItem[] = [
    { label: 'To Do', value: 24, percentage: 24, color: '#3B82F6' },
    { label: 'In Progress', value: 8, percentage: 8, color: '#F59E0B' },
    { label: 'Completed', value: 67, percentage: 68, color: '#059669' }
  ];

  cardData = [
    {
      title: 'Sprint Iterations',
      value: this.sprintData.totalIterations,
      subtitle: `${this.sprintData.active} active, ${this.sprintData.completed} completed`,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-current"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
    },
    {
      title: 'Work Items',
      value: this.workItemsData.total,
      subtitle: `${this.workItemsData.toDo} To Do • ${this.workItemsData.inProgress} In Progress • ${this.workItemsData.done} Done`,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-current"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>`
    },
    {
      title: 'Current Sprint Progress',
      value: this.currentSprint.progress + '%',
      subtitle: ` ${this.currentSprint.name} • ${this.currentSprint.startDate} - ${this.currentSprint.endDate}`,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-current"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`
    },
    {
      title: 'Team Members',
      value: this.teamMembersCount,
      subtitle: 'Active contributors',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-current"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
    }
  ];

  teamMembers:TeamMember[] = [
    { name: 'Adria Varma', role: 'Project Manager', initials: 'AV', color: 'blue' },
    { name: 'Pranav Iyer', role: 'Tech Lead', initials: 'PI', color: 'green' },
    { name: 'Sarah Chen', role: 'UX/UI Designer', initials: 'SC', color: 'purple' },
    { name: 'Mike Johnson', role: 'Senior Developer', initials: 'MJ', color: 'orange' },
    { name: 'Lisa Wong', role: 'QA Engineer', initials: 'LW', color: 'pink' },
    { name: 'Fuhad', role: 'AI Engineer', initials: 'FS', color: 'blue' },
  ];

  ngOnInit(): void {
    // Data would typically be fetched from a service
  }

  onSprintChange(sprintId: string) {
    console.log('Sprint changed to:', sprintId);
  }

  onExportReport() {
    console.log('Export report requested');
  }

  // Remove getWorkTypeIcon method from here since it's now in WorkTypesComponent
}