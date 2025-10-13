import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-metric-card',
  imports: [CommonModule],
  templateUrl: './dashboard-metric-cards.html',
  styleUrl: './dashboard-metric-cards.css'
})
export class DashboardMetricCards {
  @Input() title!: string;
  @Input() value!: number;
  @Input() icon!: string;
  @Input() iconBgColor: string = 'bg-gray-50';
  @Input() iconColor: string = 'text-gray-600';
  @Input() trend?: string;
  @Input() trendColor?: string;
  @Input() borderColor?: string = 'border-gray-200';  // ← Add ? here
}