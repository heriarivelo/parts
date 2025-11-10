import { Component, OnInit } from '@angular/core';
import { EntrepotService } from '../../../service/entrepot.service';
import { Entrepot, Box, Item } from '../../../models/entrepot.model';
import { Stock } from '../../../models/stock.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../../service/stock.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-drag-drop',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './entrepot.component.html',
})
export class EntrepotComponent implements OnInit {
  entrepot_libelle = '';
  newItem = { name: '', description: '' };
   boxes: Box[] = [];
  items: Item[] = [];

  errors: string = '';
  draggedItem: any = null;
  showModal = false;
  selectedBox: any = null;
  notFound: boolean = false;
  okay: boolean = false;

  transferForm: FormGroup;

  constructor(
    private entrepotService: EntrepotService,
    private stockService: StockService,
     private fb: FormBuilder
  ) {
    this.transferForm = this.fb.group({
      stockId: ['', Validators.required],
      fromEntrepotId: ['', Validators.required],
      toEntrepotId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0.01)]],
    });
  }



  ngOnInit(): void {
    this.loadEntrepots();
    this.loadArticlesWithoutEntrepot(); // Nouvelle méthode
  }

async loadEntrepots() {
  try {
    const response = await this.entrepotService.getEntrepots().toPromise() as Entrepot[];

    // Pour chaque entrepôt, on charge ses items
    this.boxes = await Promise.all(response.map(async (entrepot: Entrepot) => {
      const items = await this.entrepotService.getEntrepotStock(entrepot.id).toPromise();
      return {
        id: entrepot.id,
        name: entrepot.libelle,
        items: items || []
      };
    }));

  } catch (error) {
    console.error("Erreur lors du chargement des entrepôts", error);
  }
}


    async loadArticlesWithoutEntrepot() {
    try {
      // On précise qu’on attend un tableau d’Item
      const response = await this.entrepotService
        .getArticlesWithoutEntrepot().subscribe({
      next: (data) => {
        // console.log('Produits reçus :', data);
        this.items = data;
        console.log('Produits reçus :', this.items );

      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits', err);
      }
    }); } catch (error) {
      console.error("Erreur lors du chargement des articles", error);
    }
  }


    // stocks: any[] = [];
  isLoading = false;
  searchQuery: string = '';
  resultats: any[] = [];


  lancerRecherche() {
    if (this.searchQuery.trim()) {
      this.entrepotService.searchStocksWithoutEntrepot(this.searchQuery).subscribe({
        next: (res) => {
          this.resultats = res;
          console.log('Résultats:', this.resultats);
        },
        error: (err) => {
          console.error('Erreur lors de la recherche', err);
        }
      });
    }
  }

  // Mettre à jour l'entrepôt d'un article
async updateEntrepot(boxId: number, articleId: number) {
  try {
    await this.entrepotService.updateStockEntrepot({ 
      stockId: articleId, 
      entrepotId: boxId 
    }).toPromise();

    console.log('Mise à jour réussie');
    this.loadArticlesWithoutEntrepot();
    if (this.selectedBox) {
      this.openBoxDetails(this.selectedBox);
    }
  } catch (error) {
    console.error('Erreur de mise à jour', error);
  }
}


  // Créer un nouvel entrepôt
  async NewEntrepot() {
    if (!this.entrepot_libelle.trim()) return;

    try {
      await this.entrepotService.createEntrepot(this.entrepot_libelle).toPromise();
      this.entrepot_libelle = '';
      await this.loadEntrepots();
    } catch (error) {
      console.error('Erreur création entrepot', error);
    }
  }

  // Ouvrir les détails d'un entrepôt
  async openBoxDetails(box: any) {
    try {
      const response = await this.entrepotService.getEntrepotStock(box.id).toPromise();
      box.items = response || [];
      this.selectedBox = box;
      this.showModal = true;
    } catch (error) {
      console.error("Erreur chargement stock", error);
      box.items = [];
    }
  }

   drag(event: DragEvent, item: any) {
    this.draggedItem = item;
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
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

   entrepots: any[] = [];
  // products: any[] = [];
  selectedProduct: any = null;
  distribution: any = null;
  newEntrepotName = '';

  showDistribution(product: any): void {
    this.selectedProduct = product;
    const productId = product.productId;
    this.stockService.getProductDistribution(productId).subscribe({
      next: (data) => {
        this.distribution = data;
        // Ajouter une entrée pour le stock non affecté
        if (!this.distribution.assigned.find((a: any) => a.entrepotId === null)) {
          this.distribution.assigned.push({
            entrepotId: null,
            entrepotName: 'Non affecté',
            quantity: this.distribution.unassigned
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  addDistributionRow(): void {
    this.distribution.assigned.push({
      entrepotId: null,
      entrepotName: '',
      quantity: 0
    });
  }

  removeDistributionRow(index: number): void {
    this.distribution.assigned.splice(index, 1);
  }

  saveDistribution(): void {
    const distributions = this.distribution.assigned
      .filter((d: any) => d.quantity > 0)
      .map((d: any) => ({
        entrepotId: d.entrepotId,
        quantity: d.quantity
      }));

    this.stockService.updateDistribution(
      this.selectedProduct.productId,
      distributions
    ).subscribe({
      next: () => {
        this.closeDistribution();
    this.loadArticlesWithoutEntrepot(); // Nouvelle méthode
      },
      error: (err) => console.error(err)
    });
  }

  closeDistribution(): void {
    this.selectedProduct = null;
    this.distribution = null;
  }

  getTotalAssigned(): number {
    if (!this.distribution) return 0;
    return this.distribution.assigned.reduce((sum: number, a: any) => sum + (a.quantity || 0), 0);
  }

  isValidDistribution(): boolean {
    if (!this.distribution) return false;
    return this.getTotalAssigned() === this.distribution.total;
  }

    // stocks: any[] = [];
  // entrepots: any[] = [];
  showTransferModal = false;
  selectedStock: any;
  // isLoading = false;


  openTransferModal(stock: any): void {
    this.selectedStock = stock;
    this.transferForm.patchValue({
      stockId: stock.id,
      fromEntrepotId: stock.entrepotId,
      quantity: stock.quantite
    });
    this.showTransferModal = true;
  }

  closeTransferModal(): void {
    this.showTransferModal = false;
    this.selectedStock = null;
    this.transferForm.reset();
  }

  submitTransfer(): void {
    if (this.transferForm.invalid) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    this.isLoading = true;
    this.entrepotService.transferStock(this.transferForm.value).subscribe({
      next: () => {
        alert('Transfert effectué avec succès');
        this.closeTransferModal();
        this.loadArticlesWithoutEntrepot(); // Rafraîchir la liste
      },
      error: (err) => {
        alert('Erreur lors du transfert');
        console.error(err);
      }
    }).add(() => {
      this.isLoading = false;
    });
  }

  getItemCount(box: any): number {
  return box.items && box.items.length ? box.items.length : 0;
}
}