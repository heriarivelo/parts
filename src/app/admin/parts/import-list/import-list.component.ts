import { Component, OnInit } from '@angular/core';
import { ImportService } from '../../../service/import.service';
import { Import, ImportDetail } from '../../../models/import.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-import-list',
  templateUrl: './import-list.component.html',
  styleUrl: './import-list.component.scss',
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class ImportListComponent implements OnInit {
  imports: Import[] = [];
  selectedImport: Import | null = null;
  importDetails: ImportDetail[] = [];
  isLoading = true;
  detailsLoading = false;

  constructor(private importService: ImportService) {}

  ngOnInit(): void {
    this.loadImports();
  }

  loadImports(): void {
    this.isLoading = true;
    this.importService.getImports().subscribe({
      next: (data) => {
        this.imports = data.map((imp: any) => ({
          ...imp,
          totalCost: this.calculateTotalCost(imp),
          partsCount: imp.parts?.length || 0
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  showDetails(importItem: Import): void {
    this.selectedImport = importItem;
    this.detailsLoading = true;
    this.importService.getImportDetails(importItem.id).subscribe({
      next: (details) => {
        this.importDetails = details;
        this.detailsLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.detailsLoading = false;
      }
    });
  }

  calculateTotalCost(importItem: any): number {
    return (importItem.fretAvecDD || 0) + 
           (importItem.douane || 0) + 
           (importItem.tva || 0);
  }

  calculateMargin(purchase: number, sale: number): number {
    return ((sale - purchase) / purchase) * 100;
  }
}