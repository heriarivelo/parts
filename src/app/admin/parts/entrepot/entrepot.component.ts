import { Component, OnInit } from '@angular/core';
import { EntrepotService } from '../../../service/entrepot.service';
import { Entrepot, Box, Item } from '../../../models/entrepot.model';
import { Stock } from '../../../models/stock.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-drag-drop',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  articleCode: string = '';
  notFound: boolean = false;
  okay: boolean = false;

  constructor(private entrepotService: EntrepotService) {}

  ngOnInit(): void {
    this.loadEntrepots();
    this.loadArticlesWithoutEntrepot(); // Nouvelle méthode
  }

  // Charger les entrepôts
  async loadEntrepots() {
    try {
      // On précise qu’on attend un tableau d’Entrepot
      const response = await this.entrepotService
        .getEntrepots()
        .toPromise() as Entrepot[];
      this.boxes = response.map((entrepot: Entrepot) => ({
        id: entrepot.id,
        name: entrepot.libelle,
        items: []
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
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits', err);
      }
    }); } catch (error) {
      console.error("Erreur lors du chargement des articles", error);
    }
  }


  // Ajouter un article (recherche)
  async addItem() {
    if (!this.articleCode.trim()) return;

    try {
      const response = await this.entrepotService.getStock(this.articleCode).toPromise();
      
      if (response && response.length) {
        const article = response[0];
        this.items.push({
          id: article.id,
          // codeArt: article.codeArt,
          marque: article.product?.marque,
          oem: article.product?.oem,
          lib1: article.lib1,
          quantite: article.quantite - (article.quantiteVendu || 0),
          prixFinal: article.prixFinal,
          quantiteVendu: article.quantiteVendu || 0,
          status: 'DISPONIBLE',
          // product: {
          //   marque: article.product?.marque,
          //   oem: article.product?.oem,
          //   autoFinal: article.product?.autoFinal,
          //   lib: article.product?.lib
          // }
        });
        this.notFound = false;
        this.okay = true;
      } else {
        this.notFound = true;
        this.okay = false;
      }
    } catch (error) {
      console.error("Erreur lors de la recherche", error);
      this.notFound = true;
      this.okay = false;
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
      // Recharger les données
      this.loadArticlesWithoutEntrepot();
      if (this.selectedBox) {
        this.openBoxDetails(this.selectedBox);
      }
    } catch (error) {
      console.error('Erreur de mise à jour', error);
      console.log('boxid update', boxId);
      console.log('stockid update', articleId);

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
}