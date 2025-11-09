import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandeService } from '../../service/commande.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Order } from '../../models/order.model';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { AuthService, User } from '../../service/auth.service';

@Component({
  selector: 'app-commande-vente-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, CurrencyPipe],
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
  activeTab: 'STANDARD' | 'PARTICULIERE' = 'STANDARD';

  constructor(private orderService: CommandeService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.currentUser = this.authService.currentUserValue;
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getActiveOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Échec du chargement des commandes';
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

  filterOrders(list: Order[]): Order[] {
    return list.filter(order => {
      const matchesSearch =
        order.reference?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        order.customer?.nom?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === 'ALL' || order.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
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
}
