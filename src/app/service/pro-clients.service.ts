// src/app/services/pro-client.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { environment } from '../environments/environment';
import { catchError } from 'rxjs/operators';


export interface ProClient {
  id: number;
  nom: string;
  siret: string;
  adresse?: string;
  postalCode: string;
  city: string;
  activity: string;
  contactName: string;
  contactPosition: string;
  telephone: string;
  email: string;
  paymentTerms: number;
  creditLimit: number;
  totalRevenue: number;
  lastOrderDate: string;
  status: string;
  balanceDue?: number;
  orderCount?: number;
  lastOrders?: any[];
  notes?: any[];
}

export interface ClientStats {
  activeClients: number;
  growthRate: number;
  avgRevenue: number;
  monthlyOrders: number;
  totalDebt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProClientService {
  private apiUrl = `${environment.apiUrl}/pro-clients`;

  constructor(private http: HttpClient) { }

  getProClients(searchTerm?: string, statusFilter?: string): Observable<ProClient[]> {
    let params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    
    return this.http.get<ProClient[]>(this.apiUrl, { params });
  }

  getClientStats(): Observable<ClientStats> {
    return this.http.get<ClientStats>(`${this.apiUrl}/stats`);
  }

  getClientDetails(id: number): Observable<ProClient> {
    return this.http.get<ProClient>(`${this.apiUrl}/${id}`);
  }

  createClient(clientData: any): Observable<ProClient> {
    return this.http.post<ProClient>(this.apiUrl, clientData);
  }

// pro-clients.service.ts
  updateClient(id: number, clientData: any): Observable<any> {
    console.log('Updating client with ID:', id, 'Data:', clientData);
    return this.http.patch<any>(`${this.apiUrl}/${id}`, clientData).pipe(
      catchError(error => {
        console.error('API Error:', error);
        return throwError(() => error);
      })
    );
  }
}