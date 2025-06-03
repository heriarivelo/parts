import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  StockStatut, 
  StockMovement, 
  MovementType, 
  StockUpdate 
} from '../models/stockpart.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class StockService {
  private apiUrl = `${environment.apiUrl}/manager/stock`;

  constructor(private http: HttpClient) {}

  getStockStatus(threshold?: number): Observable<StockStatut[]> {
    return this.http.get<StockStatut[]>(`${this.apiUrl}/status`, {
      params: threshold ? { threshold } : {}
    });
  }

  updateStock(update: StockUpdate): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/update`, update);
  }

  getStockHistory(productId: number): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.apiUrl}/history/${productId}`);
  }
  
}