import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommandeService } from '../../../service/commande.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent implements OnChanges {
  @Input() orderId: number | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  order: any = null;
  isLoading = false;
  error = '';

  constructor(private commandeService: CommandeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isOpen && this.orderId) {
      this.loadOrderDetails();
    }
  }

  loadOrderDetails(): void {
    if (!this.orderId) return;

    this.isLoading = true;
    this.error = '';
    this.order = null;

    this.commandeService.getOrderDetails(this.orderId).subscribe({
      next: (res) => {
        this.order = res;
        console.log(res, "modal")
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Impossible de charger le détail de la commande.';
        this.isLoading = false;
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  get latestFacture() {
    return this.order?.factures?.[0] || null;
  }

  get totalPieces() {
    return this.order?.pieces?.reduce((sum: number, p: any) => sum + Number(p.quantite || 0), 0) || 0;
  }

  get payments() {
  return this.latestFacture?.paiements || [];
}

  get discounts() {
    return this.latestFacture?.remises || [];
  }

  get hasPayments(): boolean {
    return this.payments.length > 0;
  }

  get hasDiscounts(): boolean {
    return this.discounts.length > 0;
  }
}