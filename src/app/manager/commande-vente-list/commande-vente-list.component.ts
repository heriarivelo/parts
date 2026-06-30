import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandeService } from '../../service/commande.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Order } from '../../models/order.model';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { AuthService, User } from '../../service/auth.service';
import { OrderDetailsComponent } from '../../admin/commandes/order-details/order-details.component';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { AdminPaginationComponent } from '../../components/admin-pagination/admin-pagination.component';

@Component({
  selector: 'app-commande-vente-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, CurrencyPipe, OrderDetailsComponent, SearchInputComponent, AdminPaginationComponent],
  templateUrl: './commande-vente-list.component.html',
  styleUrls: ['./commande-vente-list.component.scss']
})
export class CommandeVenteListComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  error: string | null = null;

  searchQuery = '';
  statusFilter = 'ALL';
  currentUser: User | null = null;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  activeTab: 'STANDARD' | 'PARTICULIERE' = 'STANDARD';

  constructor(private orderService: CommandeService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.currentUser = this.authService.currentUserValue;
  }

loadOrders(): void {
  this.isLoading = true;
  this.error = null;

  this.orderService.getActiveOrders({
    page: this.currentPage,
    pageSize: this.pageSize,
    search: this.searchQuery,
  }).subscribe({
    next: (res) => {
      this.orders = res.data || [];
      this.totalItems = res.pagination?.totalCount || 0;
      this.totalPages = res.pagination?.totalPages || 0;
      this.isLoading = false;
    },
    error: () => {
      this.error = 'Échec du chargement des commandes';
      this.orders = [];
      this.totalItems = 0;
      this.totalPages = 0;
      this.isLoading = false;
    }
  });
}

  get standardOrders(): Order[] {
    return this.orders.filter(o => o.commandetype === 'STANDARD');
  }

  get particuliereOrders(): Order[] {
    return this.orders.filter(o => o.commandetype === 'PARTICULIERE');
  }


onSearch(): void {
  this.currentPage = 1;
  this.loadOrders();
}


onPageChange(page: number): void {
  this.currentPage = page;
  this.loadOrders();
}

  switchTab(tab: 'STANDARD' | 'PARTICULIERE') {
    this.activeTab = tab;
  }

  createFacture(commandeId: number): void {
    this.router.navigate(['/manager/invoice', commandeId]);
  }

  handleCancel(orderId: number): void {
    if (confirm('Annuler cette commande ?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => this.loadOrders(),
        error: () => alert("Échec de l'annulation")
      });
    }
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
      'VALIDE': 'bg-green-100 text-green-800',
      'ANNULEE': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  hasAdminRole(): boolean {
    return this.authService.hasRole('ADMIN');
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
