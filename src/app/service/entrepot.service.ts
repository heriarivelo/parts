import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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



  //     searchStocksWithoutEntrepot(searchQuery: any): Observable<any> {
  //   let params = new HttpParams();
    
  //   // // Ajout des paramètres de filtrage
  //   // if (filters.referenceCode) params = params.append('referenceCode', filters.referenceCode);
  //   // if (filters.oem) params = params.append('oem', filters.oem);
  //   // if (filters.libelle) params = params.append('libelle', filters.libelle);

  //   return this.http.get(`${this.apiUrl}/one`, {params: searchQuery });
  // }

   searchStocksWithoutEntrepot(searchQuery: string): Observable<any[]> {
    const params = new HttpParams().set('searchQuery', searchQuery);

    return this.http.get<any[]>(`${this.apiUrl}/one`, { params });
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

    transferStock(transferData: {
    stockId: number;
    fromEntrepotId: number;
    toEntrepotId: number;
    quantity: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer`, transferData);
  }
}