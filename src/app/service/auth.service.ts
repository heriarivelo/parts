import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, catchError, of, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';

// export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CLIENT';
// export type CreateUserDto = Omit<User, '_id' | 'createdAt' | 'updatedAt'>;

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER' | 'CLIENT';
}

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private apiUrl = `${environment.apiUrl}/auth`; // À remplacer par votre URL
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (this.isBrowser) {
      const user = localStorage.getItem('currentUser');
      if (user) {
        this.currentUserSubject.next(JSON.parse(user));
      }
    }
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Méthodes publiques
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAdmin(): boolean {
    return this.currentUserValue?.role === 'ADMIN';
  }

  public get isModerateur(): boolean {
    return this.currentUserValue?.role === 'MANAGER';
  }

  public get isClient(): boolean {
    return this.currentUserValue?.role === 'CLIENT';
  }

  public get isUser(): boolean {
    return this.currentUserValue?.role === 'USER';
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(response => {
        const user = this.handleAuthSuccess(response);
        if (!user) {
          throw new Error('Authentication failed');
        }
        return user;
      }),
      catchError(error => {
        this.handleAuthError(error);
        throw error; // Propagation de l'erreur
      })
    );
  }
  
  register(name: string, email: string, password: string, role: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { 
      name, 
      email, 
      password, 
      role: role || 'CLIENT'
    }).pipe(
      map(response => {
        const user = this.handleAuthSuccess(response);
        if (!user) {
          throw new Error('Registration failed');
        }
        return user;
      }),
      catchError(error => {
        this.handleAuthError(error);
        throw error; // Propagation de l'erreur
      })
    );
  }
  
  private handleAuthSuccess(response: AuthResponse): User {
    if (!response?.user || !response?.token) {
      throw new Error('Invalid authentication response');
    }
  
    if (this.isBrowser) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
    
    this.currentUserSubject.next(response.user);
    return response.user;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isBrowser && !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  
  private handleAuthError(error: any): void {
    console.error('Authentication error:', error);
    // Vous pourriez ajouter ici une gestion centralisée des erreurs
  }

  // Méthode pour rafraîchir l'état d'authentification
  checkAuthStatus(): Observable<boolean> {
    if (!this.isBrowser) return of(false);

    const token = this.getToken();
    if (!token) return of(false);

    return this.http.get<{ user: User }>(`${this.apiUrl}/me`).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      }),
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  hasRole(role: User['role'] | User['role'][]): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }
}