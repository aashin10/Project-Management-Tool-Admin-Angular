import { Component, Input } from '@angular/core';

export interface SprintData {
  totalIterations: number;
  active: number;
  completed: number;
}

export interface WorkItemsData {
  total: number;
  toDo: number;
  inProgress: number;
  done: number;
}

@Component({
  selector: 'app-overview-dashboard-card',
  imports: [],
  templateUrl: './overview-dashboard-card.html',
  styleUrl: './overview-dashboard-card.css'
})
export class OverviewDashboardCard {

  @Input() title!: string;
  @Input() value!: string | number;
  @Input() subtitle!: string;
  @Input() icon!: string; 
}
