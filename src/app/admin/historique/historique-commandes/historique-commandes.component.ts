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


  pagination = {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  };
  isLoading = false;
  Math = Math;


  selectedCommande: any = null;
  showDetailsModal = false;



  constructor(private commandeService: CommandeService) {}

  ngOnInit() {
    this.loadCommandes();
  }

  filtrerCommandes() {
    this.commandesFiltrees = this.commandes.filter(c =>
      c && // ✅ commande existe
      (!this.filtreStatut || c.status === this.filtreStatut) &&
      (!this.recherche ||
        (c.reference && c.reference.toLowerCase().includes(this.recherche.toLowerCase())) ||
        (c.customer?.nom && c.customer.nom.toLowerCase().includes(this.recherche.toLowerCase()))
      )
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

   loadCommandes(page: number = 1): void {
    this.isLoading = true;
    this.commandeService.getHistorique(page, this.pagination.pageSize)
      .subscribe({
        next: (response) => {
          this.commandes = response.data;
          this.pagination = response.pagination;
          this.filtrerCommandes();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.isLoading = false;
        }
      });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.loadCommandes(page);
    }
  }

  // Dans historique-commandes.component.ts
calculateTotal(commande: any): number {
  return commande.pieces?.reduce((sum: number, piece: any) => {
    return sum + (piece.quantite * piece.prixArticle);
  }, 0) || 0;
}

getPages(): number[] {
  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, this.pagination.currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(this.pagination.totalPages, startPage + maxVisiblePages - 1);

  // Adjust start page if we're at the end
  startPage = Math.max(1, endPage - maxVisiblePages + 1);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
}

openDetailModal(commande: any) {
  this.selectedCommande = commande;
  this.showDetailsModal = true;

}

 closeModal() {
    this.showDetailsModal = false;
  }

  calculatePieceTotal(piece: any): number {
  return piece.quantite * piece.prixArticle;
}

getFactureStatus(facture: any): string {
  switch(facture.status) {
    case 'PAYEE':
      return 'Payée';
    case 'PARTIELLEMENT_PAYEE':
      return 'Partiellement payée';
    case 'NON_PAYEE':
      return facture.montantPaye > 0 ? 'Partiellement payée' : 'Impayée';
    default:
      return facture.resteAPayer === 0 ? 'Payée' : 
             facture.montantPaye > 0 ? 'Partiellement payée' : 'Impayée';
  }
}

getStatusColor(facture: any): string {
  if (facture.status === 'PAYEE' || facture.resteAPayer === 0) {
    return 'bg-green-100 text-green-800';
  }
  if (facture.status === 'PARTIELLEMENT_PAYEE' || facture.montantPaye > 0) {
    return 'bg-yellow-100 text-yellow-800';
  }
  return 'bg-red-100 text-red-800';
}

}
