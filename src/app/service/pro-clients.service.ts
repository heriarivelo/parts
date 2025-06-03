// src/app/services/pro-client.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ProClient {
  id: number;
  nom: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  activity: string;
  contactName: string;
  contactPosition: string;
  telephone: string;
  email: string;
  paymentTerms: number;
  creditLimit: number;
  revenue: number;
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

  updateClient(id: number, clientData: any): Observable<ProClient> {
    return this.http.put<ProClient>(`${this.apiUrl}/${id}`, clientData);
  }
}