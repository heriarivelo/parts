import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { OrderDetails } from '../models/order.model';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class ManagerService {
  private apiUrl = `${environment.apiUrl}/manager`;

  // private apiUrl = 'http://localhost:8000/api/manager';

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

  // getStockInfo(productId: number) {
  //   return this.http.get(`${this.apiUrl}/stock/${productId}`);
  // }

  // Gestion des commandes
//   createOrder(orderData: {
//     customerId?: number;
//     items: Array<{
//       productId: number;
//       quantity: number;
//       unitPrice: number;
//     }>;
//     notes?: string;
//   }) {
//     return this.http.post(`${this.apiUrl}/orders`, orderData);
//   }

//   // Facturation
//   createInvoice(invoiceData: {
//     orderId: number;
//     discounts?: Array<{
//       type: 'percentage' | 'fixed';
//       value: number;
//       description?: string;
//     }>;
//   }) {
//     return this.http.post(`${this.apiUrl}/invoices`, invoiceData);
//   }

  // Clients
  // getCustomers() {
  //   return this.http.get(`${this.apiUrl}/customers`);
  // }

  // createCustomer(customerData: {
  //   nom: string;
  //   telephone: string;
  //   email?: string;
  //   adresse?: string;
  // }) {
  //   return this.http.post(`${this.apiUrl}/customers`, customerData);
  // }

  // Ajoutez cette méthode à votre ManagerService
// getOrderDetails(orderId: number) {
//   return this.http.get(`${this.apiUrl}/orders/${orderId}`);
// }

// Modifiez la méthode getOrderDetails pour inclure le type de retour
// getOrderDetails(orderId: number): Observable<OrderDetails> {
//   return this.http.get<OrderDetails>(`${this.apiUrls}/${orderId}`);
// }

  previewInvoice(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrls}/preview`, orderData);
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post(this.apiUrls, orderData);
  }

  // createInvoice(invoiceData: any): Observable<any> {
  //   return this.http.post(`${this.apiUrls}/invoices`, invoiceData);
  // }

}