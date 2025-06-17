import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Input, Output, EventEmitter } from '@angular/core';

interface DevisItem {
  reference: string;
  productName: string;
  marque: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

@Component({
  selector: 'app-commande-manager',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss']
})
export class CommandeMComponent {
  @Input() visible = false;
  @Input() items: DevisItem[] = [];
  @Input() total = 0;
  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmDevis = new EventEmitter<void>();

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onConfirm(): void {
    this.confirmDevis.emit();
  }
}