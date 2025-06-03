import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../service/stockpart.service';
import { StockStatut, StockMovement, MovementType, StockStatus } from '../../models/stockpart.model';

@Component({
  selector: 'app-stock-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-dashboard.component.html',
  styleUrl: './stock-dashboard.component.scss'
})
export class StockDashboardComponent implements OnInit {
  stockData: StockStatut[] = [];
  filteredData: StockStatut[] = [];
  
  // Ajout des valeurs possibles pour les filtres
  statusOptions = Object.values(StockStatus);
  brands: string[] = [];
  
  filters = {
    status: '',
    marque: '',
    criticalOnly: false
  };

  constructor(private stockService: StockService) {}

  ngOnInit() {
    this.loadStockData();
  }

  loadStockData() {
    this.stockService.getStockStatus().subscribe({
      next: (data) => {
        this.stockData = data;
        this.extractBrands();
        this.applyFilters();
      },
      error: (err) => console.error('Erreur de chargement du stock:', err)
    });
  }

  private extractBrands() {
    const brandSet = new Set<string>();
    this.stockData.forEach(item => {
      if (item.marque) brandSet.add(item.marque);
    });
    this.brands = Array.from(brandSet);
  }

  applyFilters() {
    this.filteredData = this.stockData.filter(item => {
      const matchesStatus = !this.filters.status || item.status === this.filters.status;
      const matchesBrand = !this.filters.marque || item.marque === this.filters.marque;
      const matchesCritical = !this.filters.criticalOnly || 
        (item.currentStock <= (item.lowStockThreshold || 0));
      
      return matchesStatus && matchesBrand && matchesCritical;
    });
  }
}