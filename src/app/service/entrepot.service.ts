import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntrepotService {
  private apiUrl = `${environment.apiUrl}/entrepots`;

  constructor(private http: HttpClient) { }

  // Créer un nouvel entrepôt
  createEntrepot(libelle: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { libelle });
  }

  getEntrepots(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  return this.http.get<{
    items: any[];
    totalItems: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>(`${this.apiUrl}`, {
    params: {
      search: params?.search || '',
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 9),
    },
  });
}

  // Supprimer un entrepôt
  deleteEntrepot(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Récupérer les stocks d'un entrepôt
  getEntrepotStock(params: {
    entrepotId: number;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<{
    items: any[];
    totalItems: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    return this.http.get<{
      items: any[];
      totalItems: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`${this.apiUrl}/entrepot`, {
      params: {
        entrepotId: String(params.entrepotId),
        search: params.search || '',
        page: String(params.page || 1),
        pageSize: String(params.pageSize || 10),
      },
    });
  }

  updateStockEntrepot(data: { stockId: number; entrepotId: number | null }): Observable<any> {
    return this.http.put(`${this.apiUrl}/entrepots`, data);
  }

  transferStock(transferData: {
    stockId: number;
    fromEntrepotId: number;
    toEntrepotId: number;
    quantity: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer`, transferData);
  }
}