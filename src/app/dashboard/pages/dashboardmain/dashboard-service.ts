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
   * Get dashboard summary data (all delivery units)
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

  /**
   * Get project status data for all delivery units
   */
  getAllProjectStatuses(): Observable<ProjectStatusDTO[]> {
    return this.http.get<ApiResponse<DashboardSummaryDTO>>(`${this.apiUrl}/summary`, {
      headers: this.headers
    }).pipe(
      map(response => response.data.projectStatuses)
    );
  }

  /**
   * Get project status data for a specific delivery unit
   * @param deliveryUnitId - The ID of the delivery unit
   */
  getProjectStatusByDeliveryUnit(deliveryUnitId: string): Observable<ProjectStatusDTO> {
    return this.http.get<ApiResponse<ProjectStatusDTO>>(
      `${this.apiUrl}/delivery-unit/${deliveryUnitId}/status`, 
      { headers: this.headers }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get project status data for a specific delivery unit (alternative: filter from summary)
   * Use this if your backend doesn't have a dedicated endpoint for single DU
   */
  getProjectStatusByDeliveryUnitFiltered(deliveryUnitName: string): Observable<ProjectStatusDTO | undefined> {
    return this.getAllProjectStatuses().pipe(
      map(statuses => statuses.find(s => s.deliveryUnit === deliveryUnitName))
    );
  }

  /**
   * Get activity chart data for a specific delivery unit
   * @param deliveryUnitId - The ID of the delivery unit
   */
  getActivityChartByDeliveryUnit(deliveryUnitId: string): Observable<ActivityChartDTO> {
    return this.http.get<ApiResponse<ActivityChartDTO>>(
      `${this.apiUrl}/delivery-unit/${deliveryUnitId}/activity`,
      { headers: this.headers }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get delivery unit list
   */
  getDeliveryUnits(): Observable<string[]> {
    return this.getAllProjectStatuses().pipe(
      map(statuses => statuses.map(s => s.deliveryUnit))
    );
  }
}









// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// // DTOs for API responses
// export interface MetricCardDTO {
//   totalProjects: number;
//   inProgressProjects: number;
//   onHoldProjects: number;
//   completedProjects: number;
//   totalDeliveryUnits: number;
// }

// export interface ProjectStatusDTO {
//   deliveryUnit: string;
//   inProgress: number;
//   onHold: number;
//   completed: number;
//   total: number;
// }

// export interface DashboardSummaryDTO {
//   totalProjects: number;
//   inProgressProjects: number;
//   onHoldProjects: number;
//   completedProjects: number;
//   totalDeliveryUnits: number;
//   projectStatuses: ProjectStatusDTO[];
// }

// export interface ChartPeriodDTO {
//   period: string;
//   projects: number;
// }

// export interface ActivityChartDTO {
//   monthly: ChartPeriodDTO[];
//   quarterly: ChartPeriodDTO[];
//   yearly: ChartPeriodDTO[];
//   last5Years: ChartPeriodDTO[];
//   allTime: ChartPeriodDTO[];
// }

// export interface ApiResponse<T> {
//   status: number;
//   data: T;
//   message: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class DashboardService {
//   private readonly apiUrl = 'https://localhost:7178/api/Dashboard';
//   private readonly headers = new HttpHeaders({
//     'accept': 'text/plain',
//     'Content-Type': 'application/json'
//   });

//   constructor(private http: HttpClient) {}

//   /**
//    * Get dashboard summary data
//    */
//   getDashboardSummary(): Observable<DashboardSummaryDTO> {
//     return this.http.get<ApiResponse<DashboardSummaryDTO>>(`${this.apiUrl}/summary`, {
//       headers: this.headers
//     }).pipe(
//       map(response => response.data)
//     );
//   }

//   /**
//    * Get activity chart data
//    */
//   getActivityChart(): Observable<ActivityChartDTO> {
//     return this.http.get<ApiResponse<ActivityChartDTO>>(`${this.apiUrl}/activity`, {
//       headers: this.headers
//     }).pipe(
//       map(response => response.data)
//     );
//   }
// }

