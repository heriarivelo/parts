import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReapproService } from '../../../service/reappro.service';
import { forkJoin } from 'rxjs';
import { StatusFrPipe } from './status.pipe';
import { Order, OrderStats, PaginatedOrders, Supplier } from '../../../models/stock.model';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-commandes-fournisseurs',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusFrPipe],
  templateUrl: './commandes-fournisseurs.component.html',
  styleUrl: './commandes-fournisseurs.component.scss'
})
export class CommandesFournisseursComponent implements OnInit {
  orders: Order[] = [];
  suppliers: Supplier[] = [];
  stats: OrderStats = {
    totalOrders: 0,
    totalAmount: 0,
    pendingOrders: 0,
    supplierCount: 0
  };
  paginatedOrders: any[] = [];
  
  selectedSupplier: number | null = null;
  searchTerm = '';
  selectedOrder: Order | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 1;
  
  // Sorting
  sortField = 'createdAt';
  sortDirection = 'desc';

  isLoading = false;

  constructor(private orderService: ReapproService) {}

  ngOnInit(): void {
    this.loadData();
    this.loadSuppliers();
    this.loadStats();
  }

  loadData(): void {
  this.orderService
    .getOrders(
      this.selectedSupplier,
      this.searchTerm,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    )
    .subscribe({
      next: (data) => {
        this.orders = data.orders.map((order : Order) => ({
          ...order,
          supplier: order.supplier || { 
            name: 'Non spécifié', 
            country: '',
            logo: 'assets/default-supplier.png'
          }
        }));
        this.totalItems = data.total;
        this.totalPages = data.totalPages;
      },
      error: (err) => console.error('Error loading orders:', err)
    });
}

  loadSuppliers(): void {
    this.orderService.getSuppliers().subscribe({
      next: (suppliers) => (this.suppliers = suppliers),
      error: (err) => console.error('Error loading suppliers:', err)
    });
  }

  loadStats(): void {
    this.orderService.getOrderStats().subscribe({
      next: (stats) => (this.stats = stats),
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  filterOrders(): void {
    this.currentPage = 1;
    this.loadData();
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadData();
  }

  showItems (order: Order): void {
    this.selectedOrder = order;
      console.log('✅ Détails reçus:', order);
  }

  viewOrderDetails(order: Order): void {
    // console.log("⚡ viewOrderDetails appelé avec :", order);
  this.orderService.getOrderDetails(order.id).subscribe({
    next: (order) => {
      this.selectedOrder = order;
      // console.log('✅ Détails reçus:', order);
    },
    error: (err) => {
      console.error('Erreur lors du chargement des détails:', err);
    }
  });
}


  cancelOrder(order: Order): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      this.orderService.cancelOrder(order.id).subscribe({
        next: () => {
          this.loadData();
          this.loadStats();
        },
        error: (err) => console.error('Error cancelling order:', err)
      });
    }
  }

  exportToExcels(): void {
    this.orderService.exportToExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `commandes_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error exporting orders:', err)
    });
  }

  // Pagination methods
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadData();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }


    validerReappro(order: Order): void {
    if (!order.id) {
      alert("ID du réapprovisionnement manquant !");
      return;
    }

    this.isLoading = true;

    this.orderService.updateReapproStatus(order.id, 'SHIPPED').subscribe({
      next: (res) => {
        console.log('Réappro validé :', res);
        alert('Réapprovisionnement validé avec succès ✅');
      },
      error: (err) => {
        console.error('Erreur validation réappro :', err);
        alert('Erreur lors de la validation ❌');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }



exportToExcel() {
  const data = this.selectedOrder?.items.map(item => ({
    CODE_ART: item.product?.codeArt,
    Marque: item.product?.marque,
    "Oem1+oem2": item.product?.oem,
    'Auto_final': item.product?.autoFinal,
    Désignation: item.product?.libelle,
    Quantité: item.quantity
  }));
  if (!data) {
  console.warn("Aucune donnée à exporter");
  return;
}
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pièces');
  
  XLSX.writeFile(wb, `pieces_commande_${this.selectedOrder?.reference}.xlsx`);
}

async exportToPDF() {
  const element = document.getElementById('order-details');
  if (!element) return;

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`commande_${this.selectedOrder?.reference}.pdf`);
}

exportAsImage() {
  const element = document.getElementById('order-details');
  if (!element) return;

  html2canvas(element).then(canvas => {
    const link = document.createElement('a');
    link.download = `commande_${this.selectedOrder?.reference}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}
}