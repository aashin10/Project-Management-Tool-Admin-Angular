import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardMetricCards } from './dashboard-metric-cards/dashboard-metric-cards';
import { ProjectActivityTimelineComponent } from './project-activity-timeline/project-activity-timeline';
import { ProjectStatusComponent } from './project-status-pie/project-status-pie';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';
import { forkJoin } from 'rxjs';
import { DashboardService, DashboardSummaryDTO, ActivityChartDTO } from './dashboard-service';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../shared/services/notification.service';


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

export interface ProjectStatusData {
  deliveryUnit: string;
  inProgress: number;
  completed: number;
  onHold: number;
  total: number;
}

export interface ChartData {
  monthly: Array<{ period: string; projects: number }>;
  quarterly: Array<{ period: string; projects: number }>;
  yearly: Array<{ period: string; projects: number }>;
  last5Years: Array<{ period: string; projects: number }>;
  allTime: Array<{ period: string; projects: number }>;
}

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [
    CommonModule,
    DashboardMetricCards,
    ProjectActivityTimelineComponent,
    ProjectStatusComponent,
    Sectiontitle
  ],
  templateUrl: './dashboardmain.html',
  styleUrls: ['./dashboardmain.css']
})
export class DashboardMainComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);
  private notificationService = inject(NotificationService);

  metricCards: MetricCard[] = [];
  projectStatusData: ProjectStatusData[] = [];
  chartData: ChartData = {
    monthly: [],
    quarterly: [],
    yearly: [],
    last5Years: [],
    allTime: []
  };

  // Loading and error states - only one should be true at a time
  isLoading: boolean = true;
  loadingError: string | null = null;

  ngOnInit(): void {
    this.initializeDefaultData();
    this.loadDashboardData();
  }

  /**
   * Load all dashboard data from API - everything loads together
   */
  loadDashboardData(): void {
    console.log('🔄 Loading dashboard data...');
    
    // Set loading state and clear any previous errors
    this.isLoading = true;
    this.loadingError = null;
    this.cdr.markForCheck();
    
    forkJoin({
      summary: this.dashboardService.getDashboardSummary(),
      activity: this.dashboardService.getActivityChart()
    }).subscribe({
      next: (result) => {
        try {
          console.log('✅ Dashboard data loaded successfully:', result);
          
          // Map all data at once
          this.metricCards = this.mapSummaryToMetricCards(result.summary);
          this.projectStatusData = this.mapSummaryToProjectStatus(result.summary);
          this.chartData = this.mapActivityToChartData(result.activity);
          
          // Clear loading and error states
          this.loadingError = null;

          // Show success toast notification
          // setTimeout(() => {
          //   this.toastr.success('Dashboard loaded successfully', 'Success', {
          //     timeOut: 2000,
          //     progressBar: true
          //   });
          // }, 100);

          console.log('📊 Project Status Data (All Delivery Units):', this.projectStatusData);
        } finally {
          // Always clear loading state in finally block
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('❌ Error loading dashboard data:', error);
        
        // Provide specific error messages
        let errorMessage = 'Failed to load dashboard data. Please try again.';
        
        if (error?.name === 'TimeoutError' || error?.message?.includes('Timeout')) {
          errorMessage = 'Loading dashboard is taking longer than expected. Please wait or try refreshing the page.';
        } else if (error?.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error?.status >= 500) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else if (error?.status === 404) {
          errorMessage = 'Dashboard data not found.';
        }
        
        // Set error message and clear loading
        this.loadingError = errorMessage;
        this.isLoading = false;
        
        // Show error toast notification
        setTimeout(() => {
          this.toastr.error(this.loadingError!, 'Error', {
            timeOut: 3000,
            progressBar: true
          });
        }, 100);
        
        this.initializeDefaultData();
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Map summary DTO to metric cards
   */
  private mapSummaryToMetricCards(summary: DashboardSummaryDTO): MetricCard[] {
    return [
      {
        title: 'Total Projects',
        value: summary.totalProjects,
        icon: '/images/dashboard-card1.svg',
        iconBgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        trendColor: 'text-emerald-600',
        borderColor: 'border-blue-100'
      },
      {
        title: 'Active Projects',
        value: summary.inProgressProjects,
        icon: '/images/dashboard-card2.svg',
        iconBgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        trendColor: 'text-emerald-600',
        borderColor: 'border-emerald-100'
      },
      {
        title: 'Inactive Projects',
        value: summary.onHoldProjects,
        icon: '/images/dashboard-card3.svg',
        iconBgColor: 'bg-amber-50',
        iconColor: 'text-amber-600',
        borderColor: 'border-amber-100'
      },
      {
        title: 'Delivery Units',
        value: summary.totalDeliveryUnits,
        icon: '/images/dashboard-card4.svg',
        iconBgColor: 'bg-purple-50',
        iconColor: 'text-purple-600',
        trendColor: 'text-emerald-600',
        borderColor: 'border-purple-100'
      }
    ];
  }

  /**
   * Map summary DTO to project status data
   * This creates data for ALL delivery units + overall summary
   */
  private mapSummaryToProjectStatus(summary: DashboardSummaryDTO): ProjectStatusData[] {
    // Create overall summary card (All Delivery Units)
    const overallSummary: ProjectStatusData = {
      deliveryUnit: 'All Delivery Units',
      inProgress: summary.inProgressProjects,
      completed: summary.completedProjects,
      onHold: summary.onHoldProjects,
      total: summary.totalProjects
    };

    // Map individual delivery units
    const individualUnits = summary.projectStatuses.map(status => ({
      deliveryUnit: status.deliveryUnit,
      inProgress: status.inProgress,
      completed: status.completed,
      onHold: status.onHold,
      total: status.total
    }));
    
    // Return overall summary first, followed by individual units
    return [overallSummary, ...individualUnits];
  }

  /**
   * Map activity DTO to chart data
   */
  private mapActivityToChartData(activity: ActivityChartDTO): ChartData {
    return {
      monthly: activity.monthly || [],
      quarterly: activity.quarterly || [],
      yearly: activity.yearly || [],
      last5Years: activity.last5Years || [],
      allTime: activity.allTime || []
    };
  }

  /**
   * Initialize default data structure
   */
  private initializeDefaultData(): void {
    this.metricCards = [
      {
        title: 'Total Projects',
        value: 0,
        icon: '/images/dashboard-card1.svg',
        iconBgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        trendColor: 'text-emerald-600',
        borderColor: 'border-blue-100'
      },
      {
        title: 'In Progress',
        value: 0,
        icon: '/images/dashboard-card2.svg',
        iconBgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        trendColor: 'text-emerald-600',
        borderColor: 'border-emerald-100'
      },
      {
        title: 'On Hold Projects',
        value: 0,
        icon: '/images/dashboard-card3.svg',
        iconBgColor: 'bg-amber-50',
        iconColor: 'text-amber-600',
        borderColor: 'border-amber-100'
      },
      {
        title: 'Delivery Units',
        value: 0,
        icon: '/images/dashboard-card4.svg',
        iconBgColor: 'bg-purple-50',
        iconColor: 'text-purple-600',
        trendColor: 'text-emerald-600',
        borderColor: 'border-purple-100'
      }
    ];

    this.projectStatusData = [];
    
    this.chartData = {
      monthly: [],
      quarterly: [],
      yearly: [],
      last5Years: [],
      allTime: []
    };
  }

  /**
   * Refresh dashboard data
   */
  refreshData(): void {
    this.toastr.info('Refreshing dashboard...', 'Info', {
      timeOut: 2000
    });
    this.loadDashboardData();
  }

  /**
   * Redirect to user side
   */
  redirectToUserSide(): void {
    this.notificationService.addNotification(
      'info',
      'Redirecting to user interface',
      'Navigation'
    );
    window.location.href = 'https://pmt-user-frontend.vercel.app/projects';
  }
}



















//--------------------------------------------------------------------------------------------------------------------------------------
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { DashboardMetricCards } from './dashboard-metric-cards/dashboard-metric-cards';
// import { ProjectActivityTimelineComponent, ChartData } from './project-activity-timeline/project-activity-timeline';
// import { ProjectStatusComponent, ProjectStatusData } from './project-status-pie/project-status-pie';
// import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';

// export interface MetricCard {
//   title: string;
//   value: number;
//   icon: string; // path to svg file
//   iconBgColor: string;
//   iconColor: string;
//   trend?: string;
//   trendColor?: string;
//   borderColor?: string;
// }

// @Component({
//   selector: 'app-dashboard-main',
//   standalone: true,
//   imports: [CommonModule, DashboardMetricCards, ProjectActivityTimelineComponent, ProjectStatusComponent, Sectiontitle],
//   templateUrl: './dashboardmain.html',
//   styleUrls: ['./dashboardmain.css']
// })
// export class DashboardMainComponent {
// redirectToUserSide() {
//   window.location.href = 'https://pmt-user-frontend.vercel.app/projects';
// }

//   metricCards: MetricCard[] = [
//     {
//       title: 'Total Projects',
//       value: 37,
//       icon: "/images/dashboard-card1.svg",
//       iconBgColor: 'bg-blue-50',
//       iconColor: 'text-blue-600',
//       trendColor: 'text-emerald-600',
//       borderColor: 'border-blue-100'
//     },
//     {
//       title: 'In Progress',
//       value: 18,
//       icon: '/images/dashboard-card2.svg',
//       iconBgColor: 'bg-emerald-50',
//       iconColor: 'text-emerald-600',
//       trendColor: 'text-emerald-600',
//       borderColor: 'border-emerald-100'
//     },
//     {
//       title: 'On Hold Projects',
//       value: 5,
//       icon: '/images/dashboard-card3.svg',
//       iconBgColor: 'bg-amber-50',
//       iconColor: 'text-amber-600',
//       borderColor: 'border-amber-100'
//     },
//     {
//       title: 'Delivery Units',
//       value: 5,
//       icon: '/images/dashboard-card4.svg',
//       iconBgColor: 'bg-purple-50',
//       iconColor: 'text-purple-600',
//       trendColor: 'text-emerald-600',
//       borderColor: 'border-purple-100'
//     }
//   ];

//   projectStatusData: ProjectStatusData[] = [
//     {
//       deliveryUnit: 'Automotive. Travel & Transportation, Construction Solutions',
//       inProgress: 8,
//       completed: 6,
//       onHold: 2,
//       total: 16
//     },
//     {
//       deliveryUnit: 'Digital & Commerce Solutions',
//       inProgress: 4,
//       completed: 3,
//       onHold: 1,
//       total: 8
//     },
//     {
//       deliveryUnit: 'Retail & Warehouse Automation Solutions',
//       inProgress: 3,
//       completed: 2,
//       onHold: 1,
//       total: 6
//     },
//     {
//       deliveryUnit: 'Data & AI Solutions',
//       inProgress: 2,
//       completed: 2,
//       onHold: 1,
//       total: 5
//     },
//     {
//       deliveryUnit: 'Experience Design Studio',
//       inProgress: 1,
//       completed: 1,
//       onHold: 0,
//       total: 2
//     },
//         {
//       deliveryUnit: 'Experience Design Studio',
//       inProgress: 1,
//       completed: 1,
//       onHold: 0,
//       total: 2
//     }
//   ];

//   chartData: ChartData = {
//     monthly: [
//       { period: 'Week 1', projects: 15 },
//       { period: 'Week 2', projects: 22 },
//       { period: 'Week 3', projects: 18 },
//       { period: 'Week 4', projects: 25 }
//     ],
//     quarterly: [
//       { period: 'Q1 2024', projects: 45 },
//       { period: 'Q2 2024', projects: 65 },
//       { period: 'Q3 2024', projects: 52 },
//       { period: 'Q4 2024', projects: 78 }
//     ],
//     yearly: [
//       { period: 'Jan', projects: 12 },
//       { period: 'Feb', projects: 15 },
//       { period: 'Mar', projects: 18 },
//       { period: 'Apr', projects: 22 },
//       { period: 'May', projects: 20 },
//       { period: 'Jun', projects: 25 },
//       { period: 'Jul', projects: 28 },
//       { period: 'Aug', projects: 30 },
//       { period: 'Sep', projects: 27 },
//       { period: 'Oct', projects: 32 },
//       { period: 'Nov', projects: 35 },
//       { period: 'Dec', projects: 37 }
//     ],
//     last5Years: [
//       { period: '2020', projects: 120 },
//       { period: '2021', projects: 185 },
//       { period: '2022', projects: 220 },
//       { period: '2023', projects: 280 },
//       { period: '2024', projects: 320 }
//     ],
//     allTime: [
//       { period: '2018', projects: 80 },
//       { period: '2019', projects: 95 },
//       { period: '2020', projects: 120 },
//       { period: '2021', projects: 185 },
//       { period: '2022', projects: 220 },
//       { period: '2023', projects: 280 },
//       { period: '2024', projects: 320 }
//     ]
//   };
// }
