import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TransferStockModalComponent } from '../components/transfer-stock-modal/transfer-stock-modal.component';
import { EntrepotService } from '../../../../service/entrepot.service';
import { SearchInputComponent } from '../../../../components/search-input/search-input.component';
import { FormsModule } from '@angular/forms';
import { AdminPaginationComponent } from '../../../../components/admin-pagination/admin-pagination.component';

@Component({
  selector: 'app-detail-entrepot',
  standalone: true,
  imports: [CommonModule, TransferStockModalComponent, SearchInputComponent, FormsModule, AdminPaginationComponent],
  templateUrl: './detail-entrepot.component.html',
  styleUrl: './detail-entrepot.component.scss'
})
export class DetailEntrepotComponent implements OnInit {
  @Input() selectedBox: any;
  @Input() boxes: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  items: any[] = [];
  searchTerm = '';

  currentPage = 1;
  pageSize = 8;
  totalItems = 0;

  isLoading = false;
  errorMessage = '';

  constructor(
    private entrepotService: EntrepotService
  ) {}

  ngOnInit(): void {
    this.loadEntrepotItems();
  }

  loadEntrepotItems(): void {
  if (!this.selectedBox?.id) return;

  this.isLoading = true;
  this.errorMessage = '';

  this.entrepotService.getEntrepotStock({
    entrepotId: this.selectedBox.id,
    search: this.searchTerm,
    page: this.currentPage,
    pageSize: this.pageSize,
  }).subscribe({
    next: (res) => {
      this.items = res.items || [];
      this.totalItems = res.totalItems || 0;
    },
    error: (err) => {
      console.error('Erreur chargement pièces entrepôt', err);
      this.items = [];
      this.totalItems = 0;
      this.errorMessage = 'Erreur lors du chargement des pièces.';
    }
  }).add(() => {
    this.isLoading = false;
  });
}

onSearchChange(): void {
  this.currentPage = 1;
  this.loadEntrepotItems();
}

onPageChange(page: number): void {
  this.currentPage = page;
  this.loadEntrepotItems();
}

  closeModal(): void {
    this.close.emit();
  }

showTransferModal = false;
selectedStock: any = null;

openTransferModal(item: any): void {
  this.selectedStock = item;
  this.showTransferModal = true;
}

closeTransferModal(): void {
  this.showTransferModal = false;
  this.selectedStock = null;
}

onTransferSuccess(): void {
  this.closeTransferModal();
  this.loadEntrepotItems();
  this.refresh.emit();
}
}