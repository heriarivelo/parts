import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportService } from '../../../../service/import.service';
import { OemListComponent } from '../../produit/components/oem-list/oem-list.component';
import { AdminPaginationComponent } from '../../../../components/admin-pagination/admin-pagination.component';
import { SearchInputComponent } from '../../../../components/search-input/search-input.component';

@Component({
  selector: 'app-import-details',
  standalone: true,
  imports: [CommonModule, OemListComponent, AdminPaginationComponent, SearchInputComponent],
  templateUrl: './import-details.component.html',
  styleUrl: './import-details.component.scss'
})
export class ImportDetailsComponent implements OnChanges {
  @Input() importId: number | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  details: any[] = [];

  detailSearchTerm = '';
  detailCurrentPage = 1;
  detailPageSize = 20;
  detailTotalItems = 0;

  isDetailsLoading = false;

  constructor(private importService: ImportService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['importId'] && this.importId) {
      this.detailCurrentPage = 1;
      this.detailSearchTerm = '';
      this.loadImportDetails();
    }
  }

  loadImportDetails(): void {
    if (!this.importId) return;

    this.isDetailsLoading = true;

    this.importService.getImportDetails(this.importId, {
      page: this.detailCurrentPage,
      pageSize: this.detailPageSize,
      search: this.detailSearchTerm,
    }).subscribe({
      next: (res) => {
        this.details = res.data || [];
        this.detailTotalItems = res.pagination?.total || 0;
        this.isDetailsLoading = false;
      },
      error: () => {
        this.details = [];
        this.detailTotalItems = 0;
        this.isDetailsLoading = false;
      }
    });
  }

  onDetailSearch(): void {
    this.detailCurrentPage = 1;
    this.loadImportDetails();
  }

  onDetailPageChange(page: number): void {
    this.detailCurrentPage = page;
    this.loadImportDetails();
  }

  closeModal(): void {
    this.close.emit();
  }

  calculateMargin(purchase: any, sale: any): number {
    const p = this.normalizeNumber(purchase);
    const s = this.normalizeNumber(sale);

    if (p === 0) return 0;

    return ((s - p) / p) * 100;
  }

  getMargin(detail: any): number {
    const margin = this.calculateMargin(detail.purchasePrice, detail.salePrice);
    return isFinite(margin) ? margin : 0;
  }

  normalizeNumber(value: any): number {
    if (value === null || value === undefined) return 0;

    if (typeof value === 'string') {
      value = value.replace(/,/g, '.');
    }

    const num = Number(value);
    return isFinite(num) ? num : 0;
  }
}