import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
// import { Observable } from 'rxjs';
import { Order, OrderStats, PaginatedOrders, Supplier } from '../models/stock.model';


interface Reappro {
  id: number;
  reference: string;
  status: string;
  createdAt: string;
  supplier?: {
    id: number;
    name: string;
    logo?: string;
    country: string;
  };
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
    product: {
      referenceCode: string;
      libelle: string;
    };
  }[];
}

interface ReapproItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  weightKg?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReapproService {
  private apiUrl = `${environment.apiUrl}/reappro`;

  private apiUrls = `${environment.apiUrl}/suppliers`;


  constructor(private http: HttpClient) {}

  getLowStock(
    threshold: number = 5,
    page: number = 1,
    pageSize: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('threshold', threshold.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get(`${this.apiUrl}/low-stock`, { params });
  }


  createReappro(items: ReapproItem[], status: string , userId: number,totalValue: number): Observable<any> {
    return this.http.post(this.apiUrl, { items, status, userId, totalValue });
  }

  // Liste des fournisseurs
  getSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrls}`);
  }

  getOrders(
    supplierId: number | null,
    searchTerm: string,
    page: number,
    itemsPerPage: number,
    sortField: string,
    sortDirection: string
  ): Observable<PaginatedOrders> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', itemsPerPage.toString());

    if (supplierId) params = params.set('supplierId', supplierId.toString());
    if (searchTerm) params = params.set('search', searchTerm);
    if (sortField) {
      params = params
        .set('sortField', sortField)
        .set('sortDirection', sortDirection);
    }

    return this.http.get<PaginatedOrders>(this.apiUrl, { params });
  }

  getOrderStats(): Observable<OrderStats> {
    return this.http.get<OrderStats>(`${this.apiUrl}/stats`);
  }

  getOrderDetails(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  cancelOrder(id: number): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/cancel`, {});
  }

  updateReapproStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }

  exportToExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }

}