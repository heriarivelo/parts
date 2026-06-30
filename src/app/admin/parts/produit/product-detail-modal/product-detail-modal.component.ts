import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StockService } from '../../../../service/stock.service';
import { ProductService } from '../../../../service/product.service';
import { OemListComponent } from '../components/oem-list/oem-list.component';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, OemListComponent],
  templateUrl: './product-detail-modal.component.html',
})
export class ProductDetailModalComponent implements OnInit {
  @Input() stockId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() distribute = new EventEmitter<any>();

  product: any = null;
  isLoading = false;
  errorMessage = '';

  constructor(private stockService: ProductService) {}

  ngOnInit(): void {
    this.loadDetail();
  }

  loadDetail(): void {
    if (!this.stockId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.stockService.getStockDetail(this.stockId).subscribe({
      next: (res) => {
        this.product = res;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors du chargement du détail produit.';
      }
    }).add(() => {
      this.isLoading = false;
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  onDistribute(): void {
    this.distribute.emit({
      ...this.product,
      id: this.product.stockId,
      stockId: this.product.stockId,
    });
  }
}