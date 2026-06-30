import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-order-preview-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './order-preview-modal.component.html',
})
export class OrderPreviewModalComponent {
  @Input() isOpen = false;
  @Input() isLoading = false;

  @Input() title = 'Aperçu';
  @Input() confirmLabel = 'Confirmer';
  @Input() backLabel = 'Retour';

  @Input() preview: any = null;
  @Input() clientInfo: any = null;
  @Input() customerTypeLabel = '';
  @Input() showClientBlock = false;
  @Input() date: Date = new Date();

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}