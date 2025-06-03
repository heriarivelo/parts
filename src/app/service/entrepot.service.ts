import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntrepotService {
  private apiUrl = `${environment.apiUrl}/entrepots`;

  constructor(private http: HttpClient) { }

  // Créer un nouvel entrepôt
  createEntrepot(libelle: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { libelle });
  }

  // Récupérer tous les entrepôts
  getEntrepots(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // // Récupérer un entrepôt par ID
  // getEntrepotById(id: number): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/${id}`);
  // }

  // Supprimer un entrepôt
  deleteEntrepot(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Récupérer les stocks d'un entrepôt
  getEntrepotStock(entrepotId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/entrepot`, { params: { entrepotId: entrepotId } });
  }

  // Rechercher un article par code
  getStock(code: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/one`, { 
      params: { 
        referenceCode: code 
      } 
    });
  }

  updateStockEntrepot(data: { stockId: number; entrepotId: number | null }): Observable<any> {
    return this.http.put(`${this.apiUrl}/entrepots`, data);
  }


  // // Mettre à jour plusieurs stocks
  // updateStockListe(stocks: any[]): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/entreports/import`, { stocks });
  // }

  // // Récupérer tous les articles avec entrepôt
  // getArticlesWithEntrepot(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/entrepots`);
  // }

  // Récupérer les articles sans entrepôt
  getArticlesWithoutEntrepot(): Observable<any> {
    return this.http.get(`${this.apiUrl}/entrepots/no`);
  }
}