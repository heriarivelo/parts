import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-admin-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-pagination.component.html',
})
export class AdminPaginationComponent {
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() maxVisiblePages = 5;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  getPageNumbers(): number[] {
    const total = this.totalPages;
    const max = this.maxVisiblePages;

    let start = Math.max(1, this.currentPage - Math.floor(max / 2));
    let end = Math.min(total, start + max - 1);

    if (end - start + 1 < max) {
      start = Math.max(1, end - max + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.pageChange.emit(page);
  }
}