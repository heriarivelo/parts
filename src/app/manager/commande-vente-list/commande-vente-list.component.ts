import { Component, OnInit } from '@angular/core';
  // commande-list.component.ts
// import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandeService } from '../../service/commande.service';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
// import { Router } from '@angular/router';
// import { Order } from '../../models/order.model';
import { FormsModule } from '@angular/forms';
import { Order } from '../../models/order.model';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-commande-vente-list',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, RouterLink, CommonModule, FormsModule, RouterModule],
  templateUrl: './commande-vente-list.component.html',
  styleUrl: './commande-vente-list.component.scss'
})
export class CommandeVenteListComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  error: string | null = null;
    searchQuery = '';
  statusFilter = 'ALL';
  currentPage = 1;
  itemsPerPage = 10;


  constructor(private orderService: CommandeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getActiveOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Échec du chargement des commandes';
        this.isLoading = false;
      }
    });
  }

  handleCancel(orderId: number): void {
    if (confirm('Annuler cette commande ?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => this.loadOrders(),
        error: () => alert('Échec de l\'annulation')
      });
    }
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
      'VALIDE': 'bg-green-100 text-green-800',
      'ANNULE': 'bg-red-100 text-red-800',
      'LIVRE': 'bg-blue-100 text-blue-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
    // Et cette méthode
  get filteredOrders() {
    return this.orders.filter(order => {
      const matchesSearch = order.reference.includes(this.searchQuery) || 
        order.manager.name.includes(this.searchQuery);
      const matchesStatus = this.statusFilter === 'ALL' || 
        order.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

    createFacture(commandeId: number) {
    this.router.navigate(['/manager/invoice', commandeId]);
  }
}