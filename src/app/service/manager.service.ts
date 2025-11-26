import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class ManagerService {
  private apiUrl = `${environment.apiUrl}/manager`;

  private apiUrls = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  // Gestion des produits
  searchProducts(params: {
    query?: string;
    oem?: string;
    marque?: string;
  }) {
    return this.http.get(`${this.apiUrl}/products/search`, { params });
  }

  previewInvoice(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrls}/preview`, orderData);
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post(this.apiUrls, orderData);
  }

}