import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl; // Adaptez selon votre URL backend

  constructor(private http: HttpClient) { }


  // READ ONE
  getAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/analytics`);
  }


}