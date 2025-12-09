import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// ====== API MODELS ======
export interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
}

// This matches your C# DuDto exactly
export interface DeliveryUnitApi {
  id: number;
  name: string;
  code: string;
  description: string | null;
  duHeadName: string | null;
  duHeadEmail: string | null;
  isActive: boolean;
  projectCount: number;
}

export interface DeliveryUnitCreate {
  duName: string;
  duCode: string;
  description: string;
  duHeadName: string;
  duHeadEmail: string;
}


@Injectable({
  providedIn: 'root'
})
export class DeliveryUnitService {
  private apiUrl = 'https://localhost:7178/api/delivery-unit';

  constructor(private http: HttpClient) {}

  // 🟢 CREATE
  createDeliveryUnit(du: DeliveryUnitCreate): Observable<DeliveryUnitApi> {
  // ✅ Match backend property names exactly
  const payload = {
    name: du.duName,
    code: du.duCode,
    description: du.description,
    headName: du.duHeadName,
    headEmail: du.duHeadEmail
  };

  

  return this.http.post<ApiResponse<DeliveryUnitApi>>(this.apiUrl, payload).pipe(
    map(res => {
      return res.data;
    }),
    catchError(this.handleError)
  );
}


  // 🟡 UPDATE
  updateDeliveryUnit(id: number, du: DeliveryUnitCreate): Observable<DeliveryUnitApi> {
    // Match UpdateDuCommand properties exactly
    const payload = {
      Id: id,
      Name: du.duName,
      Code: du.duCode,
      Description: du.description,
      HeadName: du.duHeadName,
      HeadEmail: du.duHeadEmail
    };

    

    return this.http.put<ApiResponse<DeliveryUnitApi>>(`${this.apiUrl}/${id}`, payload).pipe(
      map(res => {
        return res.data;
      }),
      catchError(this.handleError)
    );
  }

  // 🔵 GET ALL
  getAllDeliveryUnits(): Observable<DeliveryUnitApi[]> {
    return this.http.get<ApiResponse<DeliveryUnitApi[]>>(this.apiUrl).pipe(
      map(res => {
        if (res.data && res.data.length > 0) {
        }
        return res.data || [];
      }),
      catchError(this.handleError)
    );
  }

  // 🔴 DELETE
  deleteDeliveryUnit(id: number): Observable<string> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        return res.message;
      }),
      catchError(this.handleError)
    );
  }

  // ⚠️ ERROR HANDLER
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Something went wrong; please try again later.';
    
    // Check if it's a client-side error (network error, etc)
    if (error.status === 0) {
      errorMessage = 'Network error: Unable to connect to the server. Please ensure the backend API is running.';
    } else if (error.status >= 500) {
      // Server-side error
      errorMessage = `Server Error (${error.status}): ${error.statusText}`;
      
      // Try to extract API error message if available
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      }
    } else if (error.status >= 400) {
      // Client error (4xx)
      errorMessage = `Request Error (${error.status}): ${error.statusText}`;
      
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}