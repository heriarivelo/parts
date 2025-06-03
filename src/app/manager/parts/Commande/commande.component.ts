import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-commande-manager',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss']
})
export class CommandeMComponent implements OnInit {
  totalPrice: any;
  commandes: any[] = [];
  selectedCommande: any = null;
  
  filters = {
    reference: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
    pageSize: 10
  };

  showModal: boolean = false;
  showDetailModal: boolean = false;
  referenceFacture: any;
  status: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCommandes();
  }

  calculateTotalPrice() {
    this.totalPrice = this.selectedCommande?.articles.reduce((total: number, article: any) => {
      return total + (article.prix_article * article.quantite);
    }, 0);
  }

  async openDetailModal(referencecommande: any) {
    console.log(referencecommande);
    const params = new HttpParams()
      .set('reference_commande', referencecommande);

    try {
      const response = await this.http.get<any>('http://localhost:8000/api/facture', { params }).toPromise();
      this.selectedCommande = response.commande;
      console.log(this.selectedCommande);
      this.calculateTotalPrice();
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
    }
  
    this.showDetailModal = true;
  }

  closeModal() {
    this.showDetailModal = false;
  }

  async fetchCommandes(): Promise<void> {
    let params = new HttpParams()
      .set('reference', this.filters.reference)
      .set('status', this.filters.status)
      .set('startDate', this.filters.startDate)
      .set('endDate', this.filters.endDate)
      .set('page', this.filters.page.toString())
      .set('limit', this.filters.pageSize.toString());

    try {
      const response = await this.http.get<any>('http://localhost:8000/api/commande', { params }).toPromise();
      this.commandes = response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
    }
  }

  onSearch(): void {
    this.fetchCommandes();
  }

  async validerFacture(): Promise<void> {
    if (!this.selectedCommande) {
      console.error('Commande non sélectionnée');
      return;
    }
    
    let referenceCommandes = this.selectedCommande?.commande?.reference;
  
    if (!this.totalPrice || !this.status) {
      console.error('Données manquantes pour la facture');
      if (!this.totalPrice) console.error('Total price manquant');
      if (!this.status) console.error('Status manquant');
      return;
    }
  
    const factureData = {
      prix_total: this.totalPrice,
      reference_commande: referenceCommandes,
      reference_fact: this.referenceFacture,
      status: this.status,
      type_remise: 'espece',
      remise: 12000,
    };
  
    console.log('Données de la facture:', factureData);
  
    try {
      const response = await this.http.post<any>('http://localhost:8000/api/facture/valider', factureData).toPromise();
  
      if (response) {
        console.log('Facture validée avec succès:', response);
        this.closeModal();  
      } else {
        console.error('Erreur lors de la validation de la facture:', response?.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel API:', error);
      alert('Une erreur est survenue lors de la validation de la facture');
    }
  }
}