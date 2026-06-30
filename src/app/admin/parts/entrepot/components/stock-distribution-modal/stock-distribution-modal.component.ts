import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../../../../service/stock.service';

@Component({
  selector: 'app-stock-distribution-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-distribution-modal.component.html',
})
export class StockDistributionModalComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() boxes: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  distribution: any = null;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadDistribution();
  }

  loadDistribution(): void {
    if (!this.selectedProduct?.productId) {
      this.errorMessage = 'Produit invalide.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.stockService.getProductDistribution(this.selectedProduct.productId).subscribe({
      next: (data) => {
        this.distribution = data;

        if (!this.distribution.assigned) {
          this.distribution.assigned = [];
        }

        if (!this.distribution.assigned.find((a: any) => a.entrepotId === null)) {
          this.distribution.assigned.push({
            entrepotId: null,
            entrepotName: 'Non affecté',
            quantity: this.distribution.unassigned
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors du chargement de la répartition.';
      }
    }).add(() => {
      this.isLoading = false;
    });
  }

  addDistributionRow(): void {
    if (!this.distribution) return;

    this.distribution.assigned.push({
      entrepotId: null,
      entrepotName: '',
      quantity: 0
    });
  }

  removeDistributionRow(index: number): void {
    if (!this.distribution) return;
    this.distribution.assigned.splice(index, 1);
  }

  getTotalAssigned(): number {
    if (!this.distribution) return 0;

    return this.distribution.assigned.reduce(
      (sum: number, item: any) => sum + (Number(item.quantity) || 0),
      0
    );
  }

  getRemainingQuantity(): number {
    if (!this.distribution) return 0;
    return this.distribution.total - this.getTotalAssigned();
  }

  isValidDistribution(): boolean {
    if (!this.distribution) return false;

    const assigned = this.distribution.assigned || [];

    const hasEmptyLine = assigned.some((item: any) =>
      item.quantity > 0 && !item.entrepotId
    );

    return this.getTotalAssigned() === this.distribution.total && !hasEmptyLine;
  }

  saveDistribution(): void {
    if (!this.distribution) return;

    this.errorMessage = '';

    if (!this.isValidDistribution()) {
      this.errorMessage = 'La répartition doit couvrir toute la quantité disponible.';
      return;
    }

    const distributions = this.distribution.assigned
      .filter((item: any) => Number(item.quantity) > 0)
      .map((item: any) => ({
        entrepotId: item.entrepotId,
        quantity: Number(item.quantity)
      }));

    this.isSaving = true;

    this.stockService.updateDistribution(
      this.selectedProduct.productId,
      distributions
    ).subscribe({
      next: () => {
        this.saved.emit();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors de l’enregistrement de la répartition.';
      }
    }).add(() => {
      this.isSaving = false;
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}