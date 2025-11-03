import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-metric-card',
  standalone: true,
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
  @Input() borderColor?: string = 'border-gray-200';

  constructor(private router: Router) {}

  handleCardClick(): void {
    // Define navigation based on card title
    const navigationMap: { [key: string]: any } = {
      'Total Projects': { path: '/projects', queryParams: {} },
      'In Progress': { path: '/projects', queryParams: { status: 'Active' } },
      'On Hold Projects': { path: '/projects', queryParams: { status: 'Inactive' } },
      'Delivery Units': { path: '/deliveryunits', queryParams: {} }
    };

    const navigation = navigationMap[this.title];
    
    if (navigation) {
      this.router.navigate([navigation.path], { 
        queryParams: navigation.queryParams 
      });
    }
  }
}
