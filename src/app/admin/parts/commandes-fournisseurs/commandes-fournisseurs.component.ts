import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Supplier {
  id: number;
  name: string;
  country: string;
  logo: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface OrderItem {
  reference: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  orderNumber: string;
  supplier: Supplier;
  orderDate: Date;
  items: OrderItem[];
  totalAmount: number;
  status: 'En attente' | 'Expédié' | 'Livré' | 'Annulé';
}

@Component({
  selector: 'app-commandes-fournisseurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commandes-fournisseurs.component.html',
  styleUrl: './commandes-fournisseurs.component.scss'
})
export class CommandesFournisseursComponent implements OnInit {
    allOrders: Order[] = [];
    filteredOrders: Order[] = [];
    paginatedOrders: Order[] = [];
    suppliers: Supplier[] = [];
    
    selectedSupplier: number | null = null;
    searchTerm: string = '';
    selectedOrder: Order | null = null;
    
    // Pagination
    currentPage: number = 1;
    itemsPerPage: number = 10;
    totalPages: number = 1;
    
    // Sorting
    sortField: string = 'orderDate';
    sortDirection: 'asc' | 'desc' = 'desc';
    
    // Stats
    stats = {
      totalOrders: 0,
      totalAmount: 0,
      pendingOrders: 0,
      supplierCount: 0
    };
  
    ngOnInit(): void {
      this.loadSuppliers();
      this.loadOrders();
      this.calculateStats();
    }
  
    loadSuppliers(): void {
      // Simuler des données de fournisseurs
      this.suppliers = [
        { id: 1, name: 'Bosch Automotive', country: 'Allemagne', logo: 'assets/bosch-logo.png' },
        { id: 2, name: 'Denso Corporation', country: 'Japon', logo: 'assets/denso-logo.png' },
        { id: 3, name: 'Valeo', country: 'France', logo: 'assets/valeo-logo.png' },
        { id: 4, name: 'ZF Friedrichshafen', country: 'Allemagne', logo: 'assets/zf-logo.png' },
        { id: 5, name: 'Magna International', country: 'Canada', logo: 'assets/magna-logo.png' },
      ];
    }
  
    loadOrders(): void {
      // Simuler des données de commandes
      this.allOrders = [
        {
          orderNumber: 'CMD-2023-001',
          supplier: this.suppliers[0],
          orderDate: new Date('2023-05-15'),
          items: [
            { reference: 'BOS-001', name: 'Plaquettes de frein avant', quantity: 50, unitPrice: 42.99 },
            { reference: 'BOS-002', name: 'Filtre à huile', quantity: 100, unitPrice: 12.50 }
          ],
          totalAmount: 50 * 42.99 + 100 * 12.50,
          status: 'Livré'
        },
        // Ajouter d'autres commandes de démo...
      ];
      
      this.filterOrders();
    }
  
    calculateStats(): void {
      this.stats = {
        totalOrders: this.allOrders.length,
        totalAmount: this.allOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        pendingOrders: this.allOrders.filter(o => o.status === 'En attente').length,
        supplierCount: this.suppliers.length
      };
    }
  
    filterOrders(): void {
      this.filteredOrders = this.allOrders.filter(order => {
        // Filtre par fournisseur
        if (this.selectedSupplier && order.supplier.id !== this.selectedSupplier) {
          return false;
        }
        
        // Filtre par recherche
        if (this.searchTerm) {
          const term = this.searchTerm.toLowerCase();
          return (
            order.orderNumber.toLowerCase().includes(term) ||
            order.supplier.name.toLowerCase().includes(term) ||
            order.items.some(item => item.name.toLowerCase().includes(term)))
        }
        
        return true;
      });
      
      // Appliquer le tri
      this.sortOrders();
      
      // Réinitialiser la pagination
      this.currentPage = 1;
      this.updatePagination();
    }
  
    sort(field: string): void {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      
      this.sortOrders();
      this.updatePagination();
    }
  
    sortOrders(): void {
      this.filteredOrders.sort((a, b) => {
        let valueA, valueB;
        
        if (this.sortField === 'orderNumber') {
          valueA = a.orderNumber;
          valueB = b.orderNumber;
        } else if (this.sortField === 'orderDate') {
          valueA = a.orderDate;
          valueB = b.orderDate;
        } else if (this.sortField === 'totalAmount') {
          valueA = a.totalAmount;
          valueB = b.totalAmount;
        } else {
          valueA = a.supplier.name;
          valueB = b.supplier.name;
        }
        
        if (valueA < valueB) {
          return this.sortDirection === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return this.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
  
    updatePagination(): void {
      this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      this.paginatedOrders = this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
    }
  
    getPageNumbers(): number[] {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (this.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        let start = Math.max(1, this.currentPage - 2);
        let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
        
        if (end - start + 1 < maxVisiblePages) {
          start = end - maxVisiblePages + 1;
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    }
  
    goToPage(page: number): void {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.updatePagination();
      }
    }
  
    nextPage(): void {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.updatePagination();
      }
    }
  
    prevPage(): void {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updatePagination();
      }
    }
  
    showItems(order: Order): void {
      this.selectedOrder = order;
    }
  
    viewOrderDetails(order: Order): void {
      // Implémenter la navigation vers la page de détails
      console.log('View order details:', order);
    }
  
    cancelOrder(order: Order): void {
      if (confirm(`Êtes-vous sûr de vouloir annuler la commande ${order.orderNumber}?`)) {
        order.status = 'Annulé';
        this.calculateStats();
        this.filterOrders();
      }
    }
  
    exportToExcel(): void {
      // Implémenter l'export Excel
      console.log('Export to Excel');
    }
  }
