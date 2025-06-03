import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Facture {
  id: number;
  reference_commande: string;
  reference_fact: string;
  prix_total: number;
  status: number; // 0 = En attente, 1 = Payée
}

@Component({
  selector: 'app-facture',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './facture.component.html',
  styleUrls: ['./facture.component.css']
})
export class FactureMComponent implements OnInit {
  factures: Facture[] = [];

  constructor() {}

  ngOnInit(): void {
    // Données simulées — à remplacer par un appel au service HTTP si nécessaire
    this.factures = [
      {
        id: 1,
        reference_commande: 'CMD12345',
        reference_fact: 'FACT2024-001',
        prix_total: 150000,
        status: 1
      },
      {
        id: 2,
        reference_commande: 'CMD12346',
        reference_fact: 'FACT2024-002',
        prix_total: 98000,
        status: 0
      }
    ];
  }
}
