import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

getImports(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  return this.http.get<any>(`${this.apiUrl}/import`, { params });
}

getImportDetails(
  importId: number,
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
  }
) {
  return this.http.get<any>(`${this.apiUrl}/import/${importId}/details`, { params });
}
}