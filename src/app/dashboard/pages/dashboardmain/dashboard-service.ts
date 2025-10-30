import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// DTOs for API responses
export interface MetricCardDTO {
  totalProjects: number;
  inProgressProjects: number;
  onHoldProjects: number;
  completedProjects: number;
  totalDeliveryUnits: number;
}

export interface ProjectStatusDTO {
  deliveryUnit: string;
  inProgress: number;
  onHold: number;
  completed: number;
  total: number;
}

export interface DashboardSummaryDTO {
  totalProjects: number;
  inProgressProjects: number;
  onHoldProjects: number;
  completedProjects: number;
  totalDeliveryUnits: number;
  projectStatuses: ProjectStatusDTO[];
}

export interface ChartPeriodDTO {
  period: string;
  projects: number;
}

export interface ActivityChartDTO {
  monthly: ChartPeriodDTO[];
  quarterly: ChartPeriodDTO[];
  yearly: ChartPeriodDTO[];
  last5Years: ChartPeriodDTO[];
  allTime: ChartPeriodDTO[];
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = 'https://localhost:7178/api/Dashboard';
  private readonly headers = new HttpHeaders({
    'accept': 'text/plain',
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard summary data
   */
  getDashboardSummary(): Observable<DashboardSummaryDTO> {
    return this.http.get<ApiResponse<DashboardSummaryDTO>>(`${this.apiUrl}/summary`, {
      headers: this.headers
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get activity chart data
   */
  getActivityChart(): Observable<ActivityChartDTO> {
    return this.http.get<ApiResponse<ActivityChartDTO>>(`${this.apiUrl}/activity`, {
      headers: this.headers
    }).pipe(
      map(response => response.data)
    );
  }
}






// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, map } from 'rxjs';
// import { MetricCard } from './dashboardmain';
// import { ProjectStatusData } from './project-status-pie/project-status-pie';
// import { ChartData } from './project-activity-timeline/project-activity-timeline';


// // API Response Interfaces
// interface DashboardSummaryResponse {
//   status: number;
//   data: {
//     totalProjects: number;
//     inProgressProjects: number;
//     onHoldProjects: number;
//     completedProjects: number;
//     totalDeliveryUnits: number;
//     projectStatuses: Array<{
//       deliveryUnit: string;
//       inProgress: number;
//       onHold: number;
//       completed: number;
//       total: number;
//     }>;
//   };
//   message: string;
// }

// interface ActivityChartResponse {
//   status: number;
//   data: {
//     monthly: Array<{ period: string; projects: number }>;
//     quarterly: Array<{ period: string; projects: number }>;
//     yearly: Array<{ period: string; projects: number }>;
//     last5Years: Array<{ period: string; projects: number }>;
//     allTime: Array<{ period: string; projects: number }>;
//   };
//   message: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class DashboardService {
//   private baseUrl = 'https://localhost:7178/api/Dashboard';

//   constructor(private http: HttpClient) {}

//   /**
//    * Fetch and format metric cards data
//    */
//   getMetricCards(): Observable<MetricCard[]> {
//     return this.http.get<DashboardSummaryResponse>(`${this.baseUrl}/summary`).pipe(
//       map(response => {
//         const data = response.data;
//         return [
//           {
//             title: 'Total Projects',
//             value: data.totalProjects,
//             icon: '/images/dashboard-card1.svg',
//             iconBgColor: 'bg-blue-50',
//             iconColor: 'text-blue-600',
//             trendColor: 'text-emerald-600',
//             borderColor: 'border-blue-100'
//           },
//           {
//             title: 'In Progress',
//             value: data.inProgressProjects,
//             icon: '/images/dashboard-card2.svg',
//             iconBgColor: 'bg-emerald-50',
//             iconColor: 'text-emerald-600',
//             trendColor: 'text-emerald-600',
//             borderColor: 'border-emerald-100'
//           },
//           {
//             title: 'On Hold Projects',
//             value: data.onHoldProjects,
//             icon: '/images/dashboard-card3.svg',
//             iconBgColor: 'bg-amber-50',
//             iconColor: 'text-amber-600',
//             borderColor: 'border-amber-100'
//           },
//           {
//             title: 'Delivery Units',
//             value: data.totalDeliveryUnits,
//             icon: '/images/dashboard-card4.svg',
//             iconBgColor: 'bg-purple-50',
//             iconColor: 'text-purple-600',
//             trendColor: 'text-emerald-600',
//             borderColor: 'border-purple-100'
//           }
//         ];
//       })
//     );
//   }

//   /**
//    * Fetch and format project status data
//    */
//   getProjectStatusData(): Observable<ProjectStatusData[]> {
//     return this.http.get<DashboardSummaryResponse>(`${this.baseUrl}/summary`).pipe(
//       map(response => {
//         return response.data.projectStatuses.map(status => ({
//           deliveryUnit: status.deliveryUnit,
//           inProgress: status.inProgress,
//           completed: status.completed,
//           onHold: status.onHold,
//           total: status.total
//         }));
//       })
//     );
//   }

//   /**
//    * Fetch and format chart data
//    */
//   getChartData(): Observable<ChartData> {
//     return this.http.get<ActivityChartResponse>(`${this.baseUrl}/activity`).pipe(
//       map(response => response.data)
//     );
//   }

//   /**
//    * Fetch complete dashboard summary (all data in one call)
//    */
//   getDashboardSummary(): Observable<DashboardSummaryResponse> {
//     return this.http.get<DashboardSummaryResponse>(`${this.baseUrl}/summary`);
//   }

//   /**
//    * Fetch activity chart data
//    */
//   getActivityChart(): Observable<ActivityChartResponse> {
//     return this.http.get<ActivityChartResponse>(`${this.baseUrl}/activity`);
//   }
// }