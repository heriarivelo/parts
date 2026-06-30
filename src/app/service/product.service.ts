import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/pieces`; // Adaptez selon votre URL backend

constructor(private http: HttpClient) { }

getStockDetail(stockId: number) {
  return this.http.get<any>(`${this.apiUrl}/${stockId}/detail`);
}


}