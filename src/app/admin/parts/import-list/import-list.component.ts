import { Component, OnInit } from '@angular/core';
import { ImportService } from '../../../service/import.service';
import { Import, ImportDetail } from '../../../models/import.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminPaginationComponent } from '../../../components/admin-pagination/admin-pagination.component';
import { SearchInputComponent } from '../../../components/search-input/search-input.component';
import { ImportDetailsComponent } from './import-details/import-details.component';

@Component({
  selector: 'app-import-list',
  templateUrl: './import-list.component.html',
  styleUrl: './import-list.component.scss',
  imports: [CommonModule, FormsModule, AdminPaginationComponent,SearchInputComponent, ImportDetailsComponent],
  standalone: true
})
export class ImportListComponent implements OnInit {
  imports: Import[] = [];
  isLoading = true;

searchTerm = '';
startDate = '';
endDate = '';

currentPage = 1;
pageSize = 10;
totalItems = 0;

// isLoading = false;
errorMessage = '';



  constructor(
    private importService: ImportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadImports();
  }

loadImports(): void {
  this.isLoading = true;
  this.errorMessage = '';

  this.importService.getImports({
    page: this.currentPage,
    pageSize: this.pageSize,
    search: this.searchTerm,
    startDate: this.startDate,
    endDate: this.endDate,
  }).subscribe({
    next: (res) => {
      this.imports = res.data || [];
      console.log(this.imports,"imp")
      this.totalItems = res.pagination?.total || 0;
      this.isLoading = false;
    },
    error: () => {
      this.imports = [];
      this.totalItems = 0;
      this.errorMessage = 'Erreur lors du chargement des imports.';
      this.isLoading = false;
    }
  });
}

onSearch(): void {
  this.currentPage = 1;
  this.loadImports();
}

onFilterChange(): void {
  this.currentPage = 1;
  this.loadImports();
}

onPageChange(page: number): void {
  this.currentPage = page;
  this.loadImports();
}

resetFilters(): void {
  this.searchTerm = '';
  this.startDate = '';
  this.endDate = '';
  this.currentPage = 1;
  this.loadImports();
}

selectedImportId: number | null = null;
showDetailsModal = false;

openDetails(importId: number): void {
  this.selectedImportId = importId;
  this.showDetailsModal = true;
}

closeDetails(): void {
  this.showDetailsModal = false;
  this.selectedImportId = null;
}


  calculateTotalCost(importItem: any): number {
    return (importItem.fretAvecDD || 0) + 
           (importItem.douane || 0) + 
           (importItem.tva || 0);
  }


  goToCalculatrice() {
    this.router.navigate(['/admin-calculatrice-prix']);
  }

    getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
      'TRAITEMENT': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'ANNULEE': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-red-100 text-red-800';
  }
}