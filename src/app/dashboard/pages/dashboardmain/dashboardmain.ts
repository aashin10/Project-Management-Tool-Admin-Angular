import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardMetricCards } from './dashboard-metric-cards/dashboard-metric-cards';
import { ChartData, ProjectActivityTimelineComponent } from './project-activity-timeline/project-activity-timeline';
import { ProjectStatusComponent, ProjectStatusData } from './project-status-pie/project-status-pie';




export interface MetricCard {
  title: string;
  value: number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  trend?: string;
  trendColor?: string;
  borderColor?: string;
}

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [CommonModule, DashboardMetricCards, ProjectActivityTimelineComponent, ProjectStatusComponent],
  templateUrl: './dashboardmain.html',
  styleUrls: ['./dashboardmain.css']
})
export class DashboardMainComponent {
  
  metricCards: MetricCard[] = [
    {
      title: 'Total Projects',
      value: 37,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>`,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: '12%',
      trendColor: 'text-emerald-600',
      borderColor: 'border-blue-100'
    },
    {
      title: 'In Progress',
      value: 18,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`,
      iconBgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      trend: '8%',
      trendColor: 'text-emerald-600',
      borderColor: 'border-emerald-100'
    },
    {
      title: 'On Hold Projects',
      value: 5,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`,
      iconBgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Delivery Units',
      value: 5,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>`,
      iconBgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trend: '2%',
      trendColor: 'text-emerald-600',
      borderColor: 'border-purple-100'
    }
  ];

  // Project status data for different delivery units
  projectStatusData: ProjectStatusData[] = [
    {
      deliveryUnit: 'Engineering',
      inProgress: 8,
      completed: 6,
      onHold: 2,
      total: 16
    },
    {
      deliveryUnit: 'Design',
      inProgress: 4,
      completed: 3,
      onHold: 1,
      total: 8
    },
    {
      deliveryUnit: 'Product',
      inProgress: 3,
      completed: 2,
      onHold: 1,
      total: 6
    },
    {
      deliveryUnit: 'Quality Assurance',
      inProgress: 2,
      completed: 2,
      onHold: 1,
      total: 5
    },
    {
      deliveryUnit: 'DevOps',
      inProgress: 1,
      completed: 1,
      onHold: 0,
      total: 2
    }
  ];

  chartData: ChartData = {
    monthly: [
      { period: 'Week 1', projects: 15 },
      { period: 'Week 2', projects: 22 },
      { period: 'Week 3', projects: 18 },
      { period: 'Week 4', projects: 25 }
    ],
    quarterly: [
      { period: 'Q1 2024', projects: 45 },
      { period: 'Q2 2024', projects: 65 },
      { period: 'Q3 2024', projects: 52 },
      { period: 'Q4 2024', projects: 78 }
    ],
    yearly: [
      { period: 'Jan', projects: 12 },
      { period: 'Feb', projects: 15 },
      { period: 'Mar', projects: 18 },
      { period: 'Apr', projects: 22 },
      { period: 'May', projects: 20 },
      { period: 'Jun', projects: 25 },
      { period: 'Jul', projects: 28 },
      { period: 'Aug', projects: 30 },
      { period: 'Sep', projects: 27 },
      { period: 'Oct', projects: 32 },
      { period: 'Nov', projects: 35 },
      { period: 'Dec', projects: 37 }
    ],
    last5Years: [
      { period: '2020', projects: 120 },
      { period: '2021', projects: 185 },
      { period: '2022', projects: 220 },
      { period: '2023', projects: 280 },
      { period: '2024', projects: 320 }
    ],
    allTime: [
      { period: '2018', projects: 80 },
      { period: '2019', projects: 95 },
      { period: '2020', projects: 120 },
      { period: '2021', projects: 185 },
      { period: '2022', projects: 220 },
      { period: '2023', projects: 280 },
      { period: '2024', projects: 320 }
    ]
  };
}