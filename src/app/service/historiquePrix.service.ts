

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoriPrixService {
  private apiUrl = `${environment.apiUrl}/produit`;

  constructor(private http: HttpClient) { }

  getPriceHistory(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/by-import/${productId}`);
  }

  updateProductPrice(productId: number, newPrice: number, reason: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${productId}`, {
      newPrice,
      reason
    });
  }
}