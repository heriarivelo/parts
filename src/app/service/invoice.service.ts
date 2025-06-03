import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Invoice } from '../models/invoice.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/manager`;

  private apiUrls = `${environment.apiUrl}/factures`;


  constructor(private http: HttpClient) {}

  // generateInvoice(data: {
  //   orderId: number;
  //   paymentDetails?: {
  //     amount: number;
  //     method: string;
  //     reference?: string;
  //   };
  //   discounts?: Array<{
  //     type: 'percentage' | 'fixed';
  //     value: number;
  //     description?: string;
  //   }>;
  // }) {
  //   return this.http.post(`${this.apiUrl}/invoices/full`, data);
  // }

  // getInvoices(params?: {
  //   status?: string;
  //   startDate?: string;
  //   endDate?: string;
  //   customerId?: number;
  // }) {
  //   return this.http.get(`${this.apiUrl}/invoices`, { params });
  // }

  // addPayment(invoiceId: number, payment: {
  //   amount: number;
  //   method: string;
  //   reference?: string;
  // }) {
  //   return this.http.post(
  //     `${this.apiUrls}/${invoiceId}/payments`,
  //     payment
  //   );
  // }

  // printInvoice(invoiceId: number) {
  //   return this.http.get(
  //     `${this.apiUrl}/invoices/${invoiceId}/print`,
  //     { responseType: 'blob' }
  //   );
  // }

   getFactures(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrls);
  }

  //   getFactures(): Observable<Facture[]> {
  //   return this.http.get<Facture[]>(this.apiUrl);
  // }

  enregistrerPaiement(id: number, paymentData: any): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrls}/${id}/paiements`, 
      paymentData
    );
  }
  
}