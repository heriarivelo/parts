import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FactureItem {
  article_commande_id: number;
  commande_reference: string;
  code_art: string;
  LIB1: string;
  quantite: number;
  article_price: number;
  total_article_price: number;
  reference_fact: string;
  prix_total: number;
  status: string;
}

@Component({
  selector: 'app-facture-detaile',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './factureD.component.html',
  styleUrls: ['./factureD.component.css']
})
export class FactureMDComponent {
  // Données statiques de la facture
  commandeReference: string = 'ABC123';
  factureItems: FactureItem[] = [
    {
      article_commande_id: 1,
      commande_reference: 'ABC123',
      code_art: 'A001',
      LIB1: 'Article 1',
      quantite: 2,
      article_price: 15.5,
      total_article_price: 31,
      reference_fact: 'F123',
      prix_total: 31,
      status: 'Payée'
    },
    {
      article_commande_id: 2,
      commande_reference: 'ABC123',
      code_art: 'A002',
      LIB1: 'Article 2',
      quantite: 1,
      article_price: 25,
      total_article_price: 25,
      reference_fact: 'F123',
      prix_total: 31,
      status: 'Payée'
    }
  ];
  get totalFacture() {
    return this.factureItems.reduce((acc, item) => acc + item.prix_total, 0);
  }
}
