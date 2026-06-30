// src/app/manager/stock-history/stock-history.component.ts
import { Component, OnInit } from '@angular/core';
import { StockMovementService } from '../../../service/stock-mouvement.service';
import { StockMovement } from '../../../models/stock-mouvement.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StockService } from '../../../service/stock.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminPaginationComponent } from '../../../components/admin-pagination/admin-pagination.component';
import { SearchInputComponent } from '../../../components/search-input/search-input.component';

@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AdminPaginationComponent, SearchInputComponent],
  templateUrl: './stock-history.component.html'
})
export class StockHistoryComponent implements OnInit {

  movementTypes = [
    { value: 'IMPORT', label: 'Import' },
    { value: 'SALE', label: 'Vente' },
    { value: 'RETURN', label: 'Retour' },
    { value: 'COMMANDE', label: 'Commande' },
    { value: 'ADJUSTMENT', label: 'Ajustement' },
    { value: 'TRANSFER', label: 'Transfert' },
    { value: 'LOSS', label: 'Perte' }
  ];

  movements: any[] = [];

searchTerm = '';
selectedProductId: number | null = null;
selectedType = '';
startDate = '';
endDate = '';

currentPage = 1;
pageSize = 20;
totalItems = 0;

isLoading = false;
errorMessage = '';


  constructor(
    private movementService: StockMovementService,
    private productService: StockService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadMovements();
  }

loadMovements(): void {
  this.isLoading = true;
  this.errorMessage = '';

  this.movementService.getStockMovements({
    productId: this.selectedProductId,
    search: this.searchTerm,
    type: this.selectedType,
    startDate: this.startDate,
    endDate: this.endDate,
    page: this.currentPage,
    limit: this.pageSize,
  }).subscribe({
    next: (res) => {
      this.movements = res.data || [];
      this.totalItems = res.meta?.total || 0;
      this.isLoading = false;
    },
    error: () => {
      this.movements = [];
      this.totalItems = 0;
      this.errorMessage = 'Erreur lors du chargement des mouvements de stock.';
      this.isLoading = false;
    },
  });
}

onSearch(): void {
  this.currentPage = 1;
  this.loadMovements();
}

onFilterChange(): void {
  this.currentPage = 1;
  this.loadMovements();
}

onPageChange(page: number): void {
  this.currentPage = page;
  this.loadMovements();
}

resetFilters(): void {
  this.searchTerm = '';
  this.selectedProductId = null;
  this.selectedType = '';
  this.startDate = '';
  this.endDate = '';
  this.currentPage = 1;
  this.loadMovements();
}

getMovementTypeLabel(type: string): string {
  const found = this.movementTypes.find(t => t.value === type);
  return found ? found.label : type;
}

}