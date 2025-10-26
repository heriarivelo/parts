import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

export interface Produit {
  id: number;
  lib1: string;
  marque: string;
  oem: string;
  auto: string;
  // Ajoutez d'autres propriétés selon votre API
}

interface RechercheParams {
  lib1?: string;
  marque?: string;
  oem?: string;
  auto?: string;
  page: number;
  limit: number;
}

interface ApiResponse {
  results: Produit[];
  // Ajoutez d'autres propriétés de pagination si nécessaire
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

 
  // stock.service.ts
getAllStocks(params: any): Observable<any> {
  return this.http.get(`${this.apiUrl}/stocks/list`, { params });
}


  getStockAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stock/analytics`);
  }

  getAvailableProducts(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/stocks/available`);
}


    getProductDistribution(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/stocks/products/${productId}/distribution`);
  }

  updateDistribution(productId: number, distributions: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/stocks/distribution`, {
      productId,
      distributions
    });
  }

   clearDatabase(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tools/clear-database`);
  }

    getAllStocksWithoutPagination() {
    return this.http.get<any[]>(`${this.apiUrl}/stocks/all`);
  }

}