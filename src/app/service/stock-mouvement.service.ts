// src/app/services/stock-movement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockMovement } from '../models/stock-mouvement.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class StockMovementService {
  // private baseUrl = '/api/stock-movements';
  private apiUrls = `${environment.apiUrl}/stock-movements`;


  constructor(private http: HttpClient) {}

  // getMovements(filters?: {
  //   type?: string;
  //   productId?: number;
  //   dateFrom?: string;
  //   dateTo?: string;
  // }): Observable<StockMovement[]> {
  //   let params = new HttpParams();
  //   if (filters) {
  //     Object.entries(filters).forEach(([k, v]) => {
  //       if (v != null) params = params.set(k, v.toString());
  //     });
  //   }
  //   return this.http.get<StockMovement[]>(this.apiUrls, { params });
  // }
    getMovements(params: any): Observable<{ data: StockMovement[]; meta: any }> {
    return this.http.get<{ data: StockMovement[]; meta: any }>(this.apiUrls, { params });
  }

  createMovement(data: Omit<StockMovement, 'id'|'createdAt'>): Observable<StockMovement> {
    return this.http.post<StockMovement>(this.apiUrls, data);
  }
}
