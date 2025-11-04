import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  private readonly apiUrl = 'http://localhost:5291/api';

  constructor(private http: HttpClient) {}

  getProjects(page: number = 1, pageSize: number = 5, searchTerm?: string): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<any>(`${this.apiUrl}/Projects`, { params });
  }

  getUsers(searchTerm: string): Observable<any> {
    const body = {
      searchTerm: searchTerm,
      page: 1,
      pageSize: 5,
    };

    return this.http.post<any>(`${this.apiUrl}/User/paginated`, body);
  }
}
