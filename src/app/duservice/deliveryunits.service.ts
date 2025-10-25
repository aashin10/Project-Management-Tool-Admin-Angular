import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Model for the data from the backend
export interface DeliveryUnitApi {
  id: number;
  name: string;
  code: string;
  description: string;
  headName: string;
  headEmail: string;
  headId?: number | null;
  activeMembers?: number | null;
  activeProjects?: number | null;
}

// Model for creating/updating DUs (Input model for the service)
export interface DeliveryUnitCreate {
  id?: number; // Optional on the frontend
  name: string;
  code: string;
  description: string;
  headName: string;
  headEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryUnitService {
  private apiUrl = 'https://localhost:7072/api/DeliveryUnit';
  
  constructor(private http: HttpClient) {}

  // --- Core Logic for Creation (POST) ---
  createDeliveryUnit(du: DeliveryUnitCreate): Observable<any> {
    console.log('Attempting to create DU with initial data:', du);
    
    // GUARANTEED FIX for C# non-nullable ID error:
    // Create a payload that explicitly sets 'id: 0' to satisfy the C# command model.
    const createPayload = {
      id: 0, 
      name: du.name,
      code: du.code,
      description: du.description,
      headName: du.headName,
      headEmail: du.headEmail,
    };
    
    console.log('Sending final creation payload:', createPayload);

    return this.http.post<any>(this.apiUrl, createPayload).pipe(
      catchError(this.handleError)
    );
  }
  
  // --- Core Logic for Update (PUT) ---
  updateDeliveryUnit(id: number, du: DeliveryUnitCreate): Observable<any> {
    console.log(`Updating DU: ${this.apiUrl}/${id}`, du);
    
    // For update, the ID must match the URL ID.
    const updatePayload = {
        id: id,
        name: du.name,
        code: du.code,
        description: du.description,
        headName: du.headName,
        headEmail: du.headEmail,
    };
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, updatePayload).pipe(
      catchError(this.handleError)
    );
  }
  
  // --- Other Methods ---

  getAllDeliveryUnits(): Observable<DeliveryUnitApi[]> {
    console.log('Calling API:', this.apiUrl);
    return this.http.get<DeliveryUnitApi[]>(this.apiUrl);
  }

  deleteDeliveryUnit(id: number): Observable<any> {
    console.log(`Deleting DU: ${this.apiUrl}/${id}`);
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
  
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred (network/CORS):', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
