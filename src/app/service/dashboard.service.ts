import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

interface DashboardStats {
  totalSales: number;
  monthlySales: { month: string; amount: number }[];
  topProducts: { productName: string; sales: number }[];
  stockAlerts: { productName: string; remaining: number }[];
  revenueTrend: { date: string; amount: number }[];
  customerGrowth: { month: string; count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}