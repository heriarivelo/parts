// historique-commandes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommandeService } from '../../../service/commande.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminPaginationComponent } from '../../../components/admin-pagination/admin-pagination.component';
import { SearchInputComponent } from '../../../components/search-input/search-input.component';
import { OrderDetailsComponent } from '../../commandes/order-details/order-details.component';

@Component({
  selector: 'app-historique-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPaginationComponent, SearchInputComponent, OrderDetailsComponent],
  templateUrl: './historique-commandes.component.html'
})
export class HistoriqueCommandesComponent implements OnInit {
  commandes: any[] = [];
  filtreStatut = '';
  recherche = '';
  statuts = ['TRAITEMENT', 'LIVREE', 'ANNULEE'];

  pagination = {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  };

  isLoading = false;

  constructor(private commandeService: CommandeService) {}

  ngOnInit() {
    this.loadCommandes();
  }

loadCommandes(page: number = 1): void {
  this.isLoading = true;

  this.commandeService
    .getHistorique(
      page,
      this.pagination.pageSize,
      this.recherche,
      this.filtreStatut
    )
    .subscribe({
      next: (response) => {
        this.commandes = response.data || [];
        this.pagination = response.pagination;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.commandes = [];
        this.isLoading = false;
      },
    });
}

onSearch(): void {
  this.pagination.currentPage = 1;
  this.loadCommandes(1);
}

onStatusFilterChange(): void {
  this.pagination.currentPage = 1;
  this.loadCommandes(1);
}

changePage(page: number): void {
  if (page >= 1 && page <= this.pagination.totalPages) {
    this.loadCommandes(page);
  }
}


  getStatutColor(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'TRAITEMENT': return 'bg-blue-100 text-blue-800';
      case 'LIVREE': return 'bg-green-100 text-green-800';
      case 'ANNULEE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }


selectedOrderId: number | null = null;
isOrderDetailsOpen = false;

openOrderDetails(orderId: number): void {
  this.selectedOrderId = orderId;
  this.isOrderDetailsOpen = true;
}

closeOrderDetails(): void {
  this.isOrderDetailsOpen = false;
  this.selectedOrderId = null;
}

}
