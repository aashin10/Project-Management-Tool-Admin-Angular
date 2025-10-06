import { Component, Input } from '@angular/core';

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
  @Input() icon!: string; // pass raw SVG inner paths
}
