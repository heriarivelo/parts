import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Produit {
  id: number;
  lib1: string;
  marque: string;
  oem: string;
  auto: string;
  // Ajoutez d'autres propriétés selon votre API
}

interface RechercheParams {
  lib1?: string;
  marque?: string;
  oem?: string;
  auto?: string;
  page: number;
  limit: number;
}

interface ApiResponse {
  results: Produit[];
  // Ajoutez d'autres propriétés de pagination si nécessaire
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

 
  // stock.service.ts
getAllStocks(params: any): Observable<any> {
  return this.http.get(`${this.apiUrl}/stocks/list`, { params });
}


  getStockAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stock/analytics`);
  }

  getAvailableProducts(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/stocks/available`);
}


   // getStocks(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/stock/list`); encien dans controlleur/part
  // }


  //   async rechercher(filtres: RechercheParams): Promise<Produit[]> {
  //   let params = new HttpParams()
  //     .set('page', filtres.page.toString())
  //     .set('limit', filtres.limit.toString());

  //   // Ajout conditionnel des paramètres
  //   if (filtres.lib1) params = params.set('lib1', filtres.lib1);
  //   if (filtres.marque) params = params.set('marque', filtres.marque);
  //   if (filtres.oem) params = params.set('oem', filtres.oem);
  //   if (filtres.auto) params = params.set('auto', filtres.auto);

  //   try {
  //     const response = await this.http.get<ApiResponse>(this.apiUrl, { params }).toPromise();
  //     return response?.results || [];
  //   } catch (error) {
  //     console.error('Erreur API :', error);
  //     throw error; // Important pour la gestion d'erreur dans le composant
  //   }
  // }

    getProductDistribution(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/stocks/products/${productId}/distribution`);
  }

  updateDistribution(productId: number, distributions: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/stocks/distribution`, {
      productId,
      distributions
    });
  }

   clearDatabase(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tools/clear-database`);
  }

}