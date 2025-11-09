import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReapproService } from '../../../service/reappro.service';
import { finalize } from 'rxjs/operators';
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
  dropdownOpen = false;
  today = new Date();

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

    getStatusColor(status: string | undefined): string {
    switch(status) {
      case 'DELIVERED': return '#10b981';
      case 'SHIPPED': return '#3b82f6';
      case 'CANCELLED': return '#ef4444';
      case 'DRAFT': return '#f59e0b';
      default: return '#6b7280';
    }
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
  if (!order?.id) {
    alert("ID de commande manquant !");
    return;
  }

  if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
    this.isLoading = true;

    this.orderService.cancelOrder(order.id)
      .pipe(finalize(() => this.isLoading = false)) // ✅ remis à false même en cas d'erreur
      .subscribe({
        next: () => {
          alert('Commande annulée avec succès ✅');
          this.loadData();
          this.loadStats();
        },
        error: (err) => {
          console.error('Erreur lors de l’annulation :', err);
          alert('Erreur lors de l’annulation ❌');
        }
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
        this.isLoading = false; // ✅ important
      },
      error: (err) => {
        console.error('Erreur validation réappro :', err);
        alert('Erreur lors de la validation ❌');
        this.isLoading = false; // ✅ toujours remettre ici aussi
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
    if (!this.selectedOrder) {
      alert('Aucune commande sélectionnée');
      return;
    }

    const pdfElement = document.getElementById('pdf-template');
    if (!pdfElement) {
      alert('Erreur: Template PDF non trouvé');
      return;
    }

    // Sauvegarder et modifier le style temporairement
    const originalStyles = {
      display: pdfElement.style.display,
      position: pdfElement.style.position,
      left: pdfElement.style.left,
      top: pdfElement.style.top
    };

    // Préparer l'élément pour la capture
    pdfElement.style.display = 'block';
    pdfElement.style.position = 'absolute';
    pdfElement.style.left = '0';
    pdfElement.style.top = '0';

    try {
      console.log('Début de la génération du PDF...');

      // Capturer avec html2canvas
      const canvas = await html2canvas(pdfElement, {
        scale: 2, // Haute résolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: pdfElement.scrollWidth,
        height: pdfElement.scrollHeight,
        windowWidth: pdfElement.scrollWidth,
        windowHeight: pdfElement.scrollHeight,
        onclone: (clonedDoc) => {
          // Appliquer les styles sur le clone si nécessaire
          const clonedPdf = clonedDoc.getElementById('pdf-template');
          if (clonedPdf) {
            clonedPdf.style.width = '210mm';
            clonedPdf.style.minHeight = '297mm';
          }
        }
      });

      console.log('Canvas généré:', canvas.width, 'x', canvas.height);

      // Créer le PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculer les dimensions de l'image
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      console.log('Dimensions PDF:', pdfWidth, 'x', pdfHeight);
      console.log('Dimensions Image:', imgWidth, 'x', imgHeight);

      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 1;

      // Première page
      pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Pages supplémentaires si nécessaire
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
        pageNumber++;
      }

      console.log(`PDF généré avec ${pageNumber} page(s)`);

      // Sauvegarder le PDF
      const fileName = `commande_${this.selectedOrder.reference}_${this.today.getFullYear()}${(this.today.getMonth()+1).toString().padStart(2, '0')}${this.today.getDate().toString().padStart(2, '0')}.pdf`;
      pdf.save(fileName);

      console.log('PDF sauvegardé:', fileName);

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la génération du PDF. Voir la console pour plus de détails.');
    } finally {
      // Restaurer les styles originaux
      pdfElement.style.display = originalStyles.display;
      pdfElement.style.position = originalStyles.position;
      pdfElement.style.left = originalStyles.left;
      pdfElement.style.top = originalStyles.top;
    }
  }

  // Version simplifiée alternative
  async exportToPDFSimple() {
    if (!this.selectedOrder) return;

    const element = document.getElementById('pdf-template');
    if (!element) return;

    const originalDisplay = element.style.display;
    element.style.display = 'block';

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`commande_${this.selectedOrder.reference}.pdf`);

    } catch (error) {
      console.error('Erreur export PDF:', error);
    } finally {
      element.style.display = originalDisplay;
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

// Méthode pour exporter dans différents formats
async exportImage(format: 'png' | 'jpeg' | 'webp' = 'png') {
  if (!this.selectedOrder) return;

  const element = document.getElementById('pdf-template');
  if (!element) return;

  // Sauvegarde du style initial
  const originalStyle = element.getAttribute('style') || '';
  element.style.display = 'block';
  element.style.width = 'auto';
  element.style.maxWidth = '800px'; // tu peux ajuster selon ton design
  element.style.margin = '0 auto';
  element.style.transform = 'scale(1)'; // éviter agrandissement

  try {
    const canvas = await html2canvas(element, {
      scale: 1.2, // suffisant pour une image nette sans distorsion
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const qualities = {
      'png': 1.0,
      'jpeg': 0.9,
      'webp': 0.8
    };

    const mimeTypes = {
      'png': 'image/png',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp'
    };

    const dataUrl = canvas.toDataURL(mimeTypes[format], qualities[format]);
    const link = document.createElement('a');
    link.download = `commande_${this.selectedOrder.reference}.${format}`;
    link.href = dataUrl;
    link.click();

    console.log(`✅ Image exportée en ${format.toUpperCase()}`);

  } catch (error) {
    console.error(`❌ Erreur export ${format}:`, error);
  } finally {
    element.setAttribute('style', originalStyle);
  }
}

}