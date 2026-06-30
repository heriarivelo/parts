// commande.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { environment } from '../environments/environment';
import { Order } from '../models/order.model';
import { OrderDetails } from '../models/order.model';
import { catchError } from 'rxjs/operators';
// import { Observable } from 'rxjs';
export interface InvoiceData {
  orderId: number;
  payment: {
    method: string;
    amount: number;
    reference?: string;
  };
  discounts?: {
    type: 'percentage' | 'fixed';
    value: number;
    description?: string;
  }[];
}


@Injectable({ providedIn: 'root' })
export class CommandeService {
  private apiUrl = `${environment.apiUrl}/orders`;
  private apiUrls = environment.apiUrl;


  constructor(private http: HttpClient) {}

  getHistoriquesq() {
    return this.http.get<any[]>(this.apiUrl);
  }

  //   getHistorique(page: number = 1, pageSize: number = 10): Observable<any> {
  //   let params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('pageSize', pageSize.toString());

  //   return this.http.get(this.apiUrl, { params });
  // }

getHistorique(page = 1, pageSize = 10, search = '', status = '') {
  return this.http.get<any>(this.apiUrl, {
    params: {
      page,
      pageSize,
      search,
      status,
    },
  });
}

  //   createOrder(orderData: any): Observable<Order> {
  //   return this.http.post<Order>(this.apiUrl, orderData);
  // }

  validateOrder(orderId: number, invoiceData: InvoiceData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${orderId}/validate`, invoiceData);
  }

  // a jour le 20 juin
getActiveOrders(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/all`, { params });
}

  cancelOrder(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/cancel`, {});
  }
   getCommandeDetails(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

    getEntrepotsDisponibles(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrls}/entrepots/stock/${productId}`);
  }

    getProClientCommandeDetails(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${orderId}/details`);
  }

  getOrderDetails(id: number) {
  return this.http.get<any>(`${this.apiUrl}/${id}/details`);
}

  // getCommandeDetails(orderId: number): Observable<OrderDetails> {
  //   return this.http.get<OrderDetails>(`${this.apiUrl}/${orderId}`);
  // }
  
}
