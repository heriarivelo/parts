import { Component, OnInit } from '@angular/core';
import { EntrepotService } from '../../../service/entrepot.service';
import { Entrepot, Warehouse, WarehouseStockItem } from '../../../models/entrepot.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminPaginationComponent } from '../../../components/admin-pagination/admin-pagination.component';
import { SearchInputComponent } from '../../../components/search-input/search-input.component';
import { DetailEntrepotComponent } from './detail-entrepot/detail-entrepot.component';
import { StockDistributionModalComponent } from './components/stock-distribution-modal/stock-distribution-modal.component';
import { StockLocationSearchComponent } from './components/stock-location-search/stock-location-search.component';

@Component({
  selector: 'app-drag-drop',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AdminPaginationComponent, SearchInputComponent, DetailEntrepotComponent, StockDistributionModalComponent,
    StockLocationSearchComponent
  ],
  templateUrl: './entrepot.component.html',
})
export class EntrepotComponent implements OnInit {
  entrepot_libelle = '';
  newItem = { name: '', description: '' };
  boxes: Warehouse[] = [];

  draggedItem: any = null;
  showModal = false;
  selectedBox: any = null;
  notFound: boolean = false;

  showCreateEntrepotModal = false;
  createEntrepotError = '';

  warehouseSearch = '';
  filteredBoxes: any[] = [];
  totalWarehouseItems = 0;

  currentWarehousePage = 1;
  itemsPerPage = 12;

  constructor(
    private entrepotService: EntrepotService
  ) {}

  ngOnInit(): void {
    this.loadEntrepots();
  }

loadEntrepots(): void {
  this.entrepotService.getEntrepots({
    search: this.warehouseSearch,
    page: this.currentWarehousePage,
    pageSize: this.itemsPerPage
  }).subscribe({
    next: (res) => {
    this.boxes = res.items.map((entrepot: any): Warehouse => ({
      id: entrepot.id,
      name: entrepot.libelle,
      stockCount: entrepot.stockCount,
      totalQuantity: entrepot.totalQuantity
    }));

      this.filteredBoxes = this.boxes;
      this.totalWarehouseItems = res.totalItems;
    },
    error: (error) => {
      console.error('Erreur lors du chargement des entrepôts', error);
    }
  });
}


  // Mettre à jour l'entrepôt d'un article
async updateEntrepot(boxId: number, articleId: number) {
  try {
    await this.entrepotService.updateStockEntrepot({ 
      stockId: articleId, 
      entrepotId: boxId 
    }).toPromise();

    console.log('Mise à jour réussie');
    this.loadEntrepots();
this.refreshStockSearch();

  } catch (error) {
    console.error('Erreur de mise à jour', error);
  }
}


  // Créer un nouvel entrepôt
  async NewEntrepot() {
    if (!this.entrepot_libelle.trim()) return;

    try {
      const libelle = this.entrepot_libelle.trim().toUpperCase();
      await this.entrepotService.createEntrepot(libelle).toPromise();
      this.entrepot_libelle = '';
      await this.loadEntrepots();
    } catch (error) {
      console.error('Erreur création entrepot', error);
    }
  }


  openBoxDetails(box: any): void {
    this.selectedBox = box;
    this.showModal = true;
  }

  allowDrop(event: DragEvent) {
      event.preventDefault();
    }

stockSearchRefreshKey = 0;

dragFromSearch(item: any): void {
  this.draggedItem = {
    ...item,
    id: item.stockId || item.id
  };
}

showDistribution(product: any): void {
  this.selectedProduct = {
    ...product,
    id: product.stockId || product.id
  };
}

refreshStockSearch(): void {
  this.stockSearchRefreshKey++;
}

onDistributionSaved(): void {
  this.closeDistribution();
  this.loadEntrepots();
  this.refreshStockSearch();
}

  async drop(event: DragEvent, box: any) {
    event.preventDefault();
    if (this.draggedItem) {
      console.log(box);
      await this.updateEntrepot(box.id, this.draggedItem.id);
      this.draggedItem = null;
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedBox = null;
  }

  // Supprimer un entrepôt
  async deleteEntrepot(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet entrepôt ?')) {
      try {
        await this.entrepotService.deleteEntrepot(id).toPromise();
        this.loadEntrepots();
      } catch (error) {
        console.error('Erreur suppression entrepot', error);
      }
    }
  }

  selectedProduct: any = null;

closeDistribution(): void {
  this.selectedProduct = null;
}

openCreateEntrepotModal(): void {
  this.createEntrepotError = '';
  this.entrepot_libelle = '';
  this.showCreateEntrepotModal = true;
}

closeCreateEntrepotModal(): void {
  this.showCreateEntrepotModal = false;
  this.createEntrepotError = '';
}

createEntrepotFromModal(): void {
  if (!this.entrepot_libelle || !this.entrepot_libelle.trim()) {
    this.createEntrepotError = 'Le nom de l’entrepôt est obligatoire.';
    return;
  }

  this.NewEntrepot();
  this.showCreateEntrepotModal = false;
}

filterWarehouses(): void {
  this.currentWarehousePage = 1;
  this.loadEntrepots();
}

get paginatedBoxes(): any[] {
  return this.boxes;
}

onWarehousePageChange(page: number): void {
  this.currentWarehousePage = page;
  this.loadEntrepots();
}

getItemCount(box: any): number {
  return box.stockCount || 0;
}


confirmDeleteEntrepot(box: any): void {
  const confirmed = confirm(`Supprimer l'entrepôt "${box.name}" ?`);
  if (!confirmed) return;

  this.deleteEntrepot(box.id);
}

refreshAfterStockAction(): void {
  this.loadEntrepots();
}
}