import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) { }

  findOrCreateClient(searchParams: any, clientData?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/find-or-create`, {
      siret: searchParams.siret,
      phone: searchParams.phone,
      email: searchParams.email,
      clientData
    });
  }
}