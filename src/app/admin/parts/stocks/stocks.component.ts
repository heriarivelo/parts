import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockService } from '../../../service/stock.service';
import {Stock} from '../../../models/stock.model';
// import { StockFilterPipe } from './stock.pipe';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stocks.component.html',
  styleUrl: './stocks.component.scss'
})
export class StocksComponent implements OnInit {
  // stocks: Stock[] = [];
  analytics: any = {};
  // isLoading = true;
  // private _maxSold: number = 1;

  stocks: any[] = [];
  searchForm: FormGroup;
  isLoading = false;
  pagination = {
    page: 1,
    limit: 20,
    total: 0
  };
  private _totalPages = 0;


  constructor(
    private stockService: StockService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadStocks();
  }

  loadStocks(): void {
    this.isLoading = true;
    const params = {
      page: this.pagination.page,
      limit: this.pagination.limit,
      ...this.searchForm.value
    };

    this.stockService.getAllStocks(params).subscribe({
      next: (response) => {
        this.stocks = response.data;
        this.pagination.total = response.meta.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });

       this.stockService.getStockAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
      },
      error: (err) => console.error(err)
    });
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadStocks();
  }


get pageNumbers(): number[] {
  this._totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
  return Array.from({ length: this._totalPages }, (_, i) => i + 1);
}

// Dans le template, utilisez : *ngFor="let page of pageNumbers"

  onSearch(): void {
    this.pagination.page = 1;
    this.loadStocks();
  }

  // constructor(private stockService: StockService) {}

  // ngOnInit(): void {
  //   this.loadData();
  // }

  // loadData(): void {
  //   this.isLoading = true;
    
  //   this.stockService.getStocks().subscribe({
  //     next: (data) => {
  //       this.stocks = data;
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       this.isLoading = false;
  //     }
  //   });

  //   this.stockService.getStockAnalytics().subscribe({
  //     next: (data) => {
  //       this.analytics = data;
  //     },
  //     error: (err) => console.error(err)
  //   });
  // }

  getStatusClass(status: string): string {
    switch(status) {
      case 'DISPONIBLE': return 'bg-green-100 text-green-800';
      case 'RUPTURE': return 'bg-red-100 text-red-800';
      case 'COMMANDE': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getProgressWidth(quantity: number, alertThreshold = 5): string {
    const percentage = Math.min((quantity / alertThreshold) * 100, 100);
    return `${percentage}%`;
  }

  getProgressColor(quantity: number, alertThreshold = 5): string {
    if (quantity === 0) return 'bg-red-600';
    if (quantity < alertThreshold) return 'bg-yellow-400';
    return 'bg-green-600';
  }

  // Dans stocks.component.ts
get maxSold(): number {
  if (!this.stocks?.length) return 1;
  return Math.max(...this.stocks.map(s => s.quantiteVendu), 1);
}

  getStatusClas(status: string): string {
    switch(status) {
      case 'En stock':
        return 'bg-green-100 text-green-800';
      case 'Faible stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Épuisé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

}
