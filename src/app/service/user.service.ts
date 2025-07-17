import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`; // Adaptez selon votre URL backend

  constructor(private http: HttpClient,
    private authService: AuthService
  ) { }

 getUsers(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  updateUser(id: number, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user);
  }

  // deleteUser(id: number): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/${id}`);
  // }

  get userId(): number | null {
  const id = this.authService.currentUserValue?.id;
  return id ? Number(id) : null;
}

    deleteUser(id: number): Observable<any> {
    const userId = this.userId

    return this.http.delete(`${this.apiUrl}/${id}`, { body: { userId } });
  }
}