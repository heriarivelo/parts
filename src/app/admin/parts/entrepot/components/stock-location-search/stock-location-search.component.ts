import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { StockService } from '../../../../../service/stock.service';
import { SearchInputComponent } from '../../../../../components/search-input/search-input.component';

@Component({
  selector: 'app-stock-location-search',
  standalone: true,
  imports: [CommonModule, SearchInputComponent],
  templateUrl: './stock-location-search.component.html',
})
export class StockLocationSearchComponent implements OnInit, OnChanges {
  mode: 'all' | 'unassigned' = 'unassigned';
  search = '';
  results: any[] = [];
  totalItems = 0;

  currentPage = 1;
  pageSize = 5;

  isLoading = false;

  @Input() refreshKey = 0;

  @Output() distribute = new EventEmitter<any>();
  @Output() dragItem = new EventEmitter<any>();

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadResults();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshKey'] && !changes['refreshKey'].firstChange) {
      this.loadResults();
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadResults();
  }

  loadResults(): void {
    this.isLoading = true;

    this.stockService.searchStockLocations({
      mode: this.search.trim() ? 'all' : 'unassigned',
      search: this.search.trim(),
      page: this.currentPage,
      pageSize: this.pageSize,
    }).subscribe({
      next: (res) => {
        this.results = res.items || [];
        this.totalItems = res.totalItems || 0;
      },
      error: (err) => {
        console.error('Erreur chargement stocks', err);
        this.results = [];
        this.totalItems = 0;
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage <= 1) return;
    this.currentPage--;
    this.loadResults();
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages) return;
    this.currentPage++;
    this.loadResults();
  }

  onDistribute(item: any): void {
    this.distribute.emit(item);
  }

  onDragStart(event: DragEvent, item: any): void {
    if ((item.qttsansEntrepot || 0) <= 0) {
      event.preventDefault();
      return;
    }

    this.dragItem.emit({
      ...item,
      id: item.stockId || item.id
    });
  }
}