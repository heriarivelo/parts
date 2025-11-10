import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockService } from '../../../service/stock.service';
import {Stock} from '../../../models/stock.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ReapproService } from '../../../service/reappro.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './stocks.component.html',
  styleUrl: './stocks.component.scss'
})
export class StocksComponent implements OnInit {
  lowStockProducts: any[] = [];
  selectedProducts: any[] = [];
  loading = false;
  threshold = 5;
  searchTerm: string = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 1;

  private searchSubject = new Subject<string>();

  statuses = [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'SHIPPED', label: 'En attente' }
  ];
  selectedStatus = 'DRAFT';
  currentManagerId = 1;

  Math = Math;

  // Objet pour suivre les sélections entre les pages
  selectedProductsMap: { [productId: number]: {
    selected: boolean;
    quantityToOrder: number;
    unitPrice: number;
    weightKg: number;
  }} = {};

  constructor(
    private stockService: StockService,
    private reapproService: ReapproService
  ) {}

  ngOnInit(): void {
    this.loadLowStockProducts();

        this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        this.currentPage = 1; // reset pagination
        this.loadLowStockProducts(term);
      });
  }

  loadLowStockProducts(search: string = this.searchTerm): void {
    this.loading = true;
    this.reapproService.getLowStock(this.threshold, this.currentPage, this.pageSize, search).subscribe({
      next: (response) => {
        this.lowStockProducts = response.data.map((p: any) => {
          const productId = p.product.id;
          const savedSelection = this.selectedProductsMap[productId];
          
          return {
            ...p,
            selected: savedSelection ? savedSelection.selected : false,
            quantityToOrder: savedSelection ? savedSelection.quantityToOrder : Math.max(5 - p.quantite, 1),
            unitPrice: savedSelection ? savedSelection.unitPrice : p.product.importDetails?.[0]?.purchasePrice,
            weightKg: savedSelection ? savedSelection.weightKg : p.product.importDetails?.[0]?.poids
          };
        });
        
        this.totalItems = response.pagination.totalCount;
        this.totalPages = response.pagination.totalPages;
        this.updateSelectedProducts();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.loadLowStockProducts();
    }
  }

  onThresholdChange(): void {
    this.currentPage = 1;
    this.loadLowStockProducts();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadLowStockProducts();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value || '';
    this.searchTerm = value;
    this.searchSubject.next(value);
  }


  getPageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    startPage = Math.max(1, endPage - maxVisiblePages + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  toggleProductSelection(product: any): void {
    const productId = product.product.id;
    
    product.selected = !product.selected;
    
    this.selectedProductsMap[productId] = {
      selected: product.selected,
      quantityToOrder: product.quantityToOrder,
      unitPrice: product.unitPrice,
      weightKg: product.weightKg || 0
    };
    
    this.updateSelectedProducts();
  }

  updateQuantityToOrder(product: any, newQuantity: number): void {
    product.quantityToOrder = newQuantity;
    
    if (product.selected) {
      const productId = product.product.id;
      if (this.selectedProductsMap[productId]) {
        this.selectedProductsMap[productId].quantityToOrder = newQuantity;
      }
      this.updateSelectedProducts();
    }
  }

  updateSelectedProducts(): void {
    this.selectedProducts = Object.keys(this.selectedProductsMap)
      .filter(productId => this.selectedProductsMap[+productId].selected)
      .map(productId => {
        const p = this.selectedProductsMap[+productId];
        const product = this.lowStockProducts.find(prod => prod.product.id === +productId) || {};
        
        return {
          productId: +productId,
          reference: product.product?.referenceCode || '',
          name: product.product?.libelle || '',
          quantity: p.quantityToOrder,
          unitPrice: p.unitPrice,
          weightKg: p.weightKg
        };
      });
  }

  submitReappro(): void {
    if (this.selectedProducts.length === 0) return;

    this.loading = true;
    const items = this.selectedProducts.map(p => ({
      productId: p.productId,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      weightKg: p.weightKg
    }));

    this.reapproService.createReappro(items, this.selectedStatus, this.currentManagerId, this.totalValue).subscribe({
      next: (response) => {
        this.selectedProducts.forEach(p => {
          delete this.selectedProductsMap[p.productId];
        });
        
        this.loadLowStockProducts();
        this.selectedProducts = [];
        this.loading = false;
        alert('Réapprovisionnement enregistré avec succès !');
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }

  // Ajoutez ces méthodes dans votre classe StocksComponent

updateQuantity(product: any): void {
  if (product.selected) {
    const productId = product.product.id;
    if (this.selectedProductsMap[productId]) {
      this.selectedProductsMap[productId].quantityToOrder = product.quantityToOrder;
    }
  }
  this.updateSelectedProducts(); // Pour recalculer les totaux
}

updateUnitPrice(product: any, newPrice: number): void {
  product.unitPrice = newPrice; // Met à jour le produit local
  if (product.selected) {
    const productId = product.product.id;
    if (this.selectedProductsMap[productId]) {
      this.selectedProductsMap[productId].unitPrice = newPrice;
    }
  }
  this.updateSelectedProducts(); // Pour recalculer les totaux
}

updateWeight(product: any, newWeight: number): void {
  product.weightKg = newWeight; // Met à jour le produit local
  if (product.selected) {
    const productId = product.product.id;
    if (this.selectedProductsMap[productId]) {
      this.selectedProductsMap[productId].weightKg = newWeight;
    }
  }
  this.updateSelectedProducts(); // Pour recalculer les totaux
}

get totalQuantity(): number {
  return Object.values(this.selectedProductsMap)
    .filter(item => item.selected)
    .reduce((sum, p) => sum + p.quantityToOrder, 0);
}

get totalValue(): number {
  return Object.values(this.selectedProductsMap)
    .filter(item => item.selected)
    .reduce((sum, p) => {
      const price = p.unitPrice || 0;
      const quantity = p.quantityToOrder || 0;
      return sum + (quantity * price);
    }, 0);
}

get totalWeightKg(): number {
  return Object.values(this.selectedProductsMap)
    .filter(item => item.selected)
    .reduce((sum, p) => {
      const weight = p.weightKg || 0;
      const quantity = p.quantityToOrder || 0;
      return sum + (quantity * weight);
    }, 0);
}
}