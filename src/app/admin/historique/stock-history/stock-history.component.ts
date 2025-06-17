// src/app/manager/stock-history/stock-history.component.ts
import { Component, OnInit } from '@angular/core';
import { StockMovementService } from '../../../service/stock-mouvement.service';
import { StockMovement } from '../../../models/stock-mouvement.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StockService } from '../../../service/stock.service';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './stock-history.component.html'
})
export class StockHistoryComponent implements OnInit {
  movements: any[] = [];
  filterForm: FormGroup;
  isLoading = false;
  pagination = {
    page: 1,
    limit: 20,
    total: 0
  };
  products: any[] = [];
  movementTypes = [
    { value: 'IMPORT', label: 'Import' },
    { value: 'SALE', label: 'Vente' },
    { value: 'RETURN', label: 'Retour' },
    { value: 'COMMANDE', label: 'Commande' },
    { value: 'ADJUSTMENT', label: 'Ajustement' },
    { value: 'TRANSFER', label: 'Transfert' },
    { value: 'LOSS', label: 'Perte' }
  ];

  constructor(
    private movementService: StockMovementService,
    private productService: StockService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      productId: [''],
      type: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadMovements();
  }

  loadProducts(): void {
    this.productService.getAvailableProducts().subscribe({
      next: (products) => this.products = products
    });
  }

  loadMovements(): void {
    this.isLoading = true;
    const params = {
      page: this.pagination.page,
      limit: this.pagination.limit,
      ...this.filterForm.value
    };

    this.movementService.getMovements(params).subscribe({
      next: (response) => {
        this.movements = response.data;
        this.pagination.total = response.meta.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onFilter(): void {
    this.pagination.page = 1;
    this.loadMovements();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadMovements();
  }
  getPageNumbers(): number[] {
  const totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

getMovementTypeLabel(type: string): string {
  const found = this.movementTypes.find(t => t.value === type);
  return found ? found.label : type;
}


}