import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommandeparticulierService {
  private panierSubject = new BehaviorSubject<any[]>([]);
  panier$ = this.panierSubject.asObservable();

  constructor() { }

  ajouterArticle(article: any): void {
    const currentPanier = this.panierSubject.value;
    const existingArticle = currentPanier.find(a => a.nom === article.nom);
    
    if (existingArticle) {
      existingArticle.quantite += 1;
    } else {
      currentPanier.push({
        ...article,
        quantite: 1,
        id: Date.now() // ID temporaire pour le front
      });
    }
    
    this.panierSubject.next([...currentPanier]);
  }

  supprimerArticle(id: number): void {
    const currentPanier = this.panierSubject.value.filter(a => a.id !== id);
    this.panierSubject.next([...currentPanier]);
  }

  modifierQuantite(id: number, quantite: number): void {
    const currentPanier = this.panierSubject.value;
    const article = currentPanier.find(a => a.id === id);
    
    if (article) {
      article.quantite = quantite;
      this.panierSubject.next([...currentPanier]);
    }
  }

  viderPanier(): void {
    this.panierSubject.next([]);
  }

//   calculerPrixVente(article: any): number {
//     return (article.prixAchat * article.tauxChange + article.fraisPort) * 
//            (1 + article.douane / 100) * 
//            (1 + article.marge / 100);
//   }

  calculerPrixVente(article: any): number {
   const total = article.poidsKg * article.fraisPort;
   const totalCout = total + article.prixAchat;
   const coutEnAr = totalCout * article.tauxChange;
   const marge = coutEnAr * article.marge / 100;
   const prixDeVente = marge + coutEnAr

    return (
        prixDeVente
    )
  }
}