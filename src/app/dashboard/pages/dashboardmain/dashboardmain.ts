import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardMetricCards } from './dashboard-metric-cards/dashboard-metric-cards';
import { ProjectActivityTimelineComponent, ChartData } from './project-activity-timeline/project-activity-timeline';
import { ProjectStatusComponent, ProjectStatusData } from './project-status-pie/project-status-pie';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';

export interface MetricCard {
  title: string;
  value: number;
  icon: string; // path to svg file
  iconBgColor: string;
  iconColor: string;
  trend?: string;
  trendColor?: string;
  borderColor?: string;
}

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [CommonModule, DashboardMetricCards, ProjectActivityTimelineComponent, ProjectStatusComponent, Sectiontitle],
  templateUrl: './dashboardmain.html',
  styleUrls: ['./dashboardmain.css']
})
export class DashboardMainComponent {
redirectToUserSide() {
  window.location.href = 'https://pmt-user-frontend.vercel.app/projects';
}

  metricCards: MetricCard[] = [
    {
      title: 'Total Projects',
      value: 37,
      icon: "/images/dashboard-card1.svg",
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trendColor: 'text-emerald-600',
      borderColor: 'border-blue-100'
    },
    {
      title: 'In Progress',
      value: 18,
      icon: '/images/dashboard-card2.svg',
      iconBgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      trendColor: 'text-emerald-600',
      borderColor: 'border-emerald-100'
    },
    {
      title: 'On Hold Projects',
      value: 5,
      icon: '/images/dashboard-card3.svg',
      iconBgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Delivery Units',
      value: 5,
      icon: '/images/dashboard-card4.svg',
      iconBgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trendColor: 'text-emerald-600',
      borderColor: 'border-purple-100'
    }
  ];

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
