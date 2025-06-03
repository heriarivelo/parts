// historique-commandes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommandeService } from '../../../service/commande.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historique-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historique-commandes.component.html'
})
export class HistoriqueCommandesComponent implements OnInit {
  commandes: any[] = [];
  commandesFiltrees: any[] = [];
  filtreStatut = '';
  recherche = '';
  statuts = ['EN_ATTENTE', 'TRAITEMENT', 'LIVREE', 'ANNULEE'];

  constructor(private commandeService: CommandeService) {}

  ngOnInit() {
    this.commandeService.getHistorique().subscribe(data => {
      this.commandes = data;
      this.commandesFiltrees = data;
    });
  }

  filtrerCommandes() {
    this.commandesFiltrees = this.commandes.filter(c =>
      (!this.filtreStatut || c.status === this.filtreStatut) &&
      (!this.recherche || c.reference.toLowerCase().includes(this.recherche.toLowerCase()))
    );
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'TRAITEMENT': return 'bg-blue-100 text-blue-800';
      case 'LIVREE': return 'bg-green-100 text-green-800';
      case 'ANNULEE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  voirDetails(commande: any) {
    // Redirige ou ouvre un modal
    console.log("Voir les détails de:", commande);
  }
}
