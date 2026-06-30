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

  // getMovements(params: any): Observable<{ data: StockMovement[]; meta: any }> {
  //   return this.http.get<{ data: StockMovement[]; meta: any }>(this.apiUrls, { params });
  // }

  getStockMovements(params: {
  productId?: number | null;
  search?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  return this.http.get<any>(this.apiUrls, {
    params: {
      ...(params.productId ? { productId: params.productId } : {}),
      ...(params.search ? { search: params.search } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(params.startDate ? { startDate: params.startDate } : {}),
      ...(params.endDate ? { endDate: params.endDate } : {}),
      page: params.page || 1,
      limit: params.limit || 20,
    },
  });
}

  createMovement(data: Omit<StockMovement, 'id'|'createdAt'>): Observable<StockMovement> {
    return this.http.post<StockMovement>(this.apiUrls, data);
  }
}
