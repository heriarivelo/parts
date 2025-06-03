import { Component, OnInit } from '@angular/core';
import { PieceService } from '../../../service/piece.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoriPrixService } from '../../../service/historiquePrix.service';
import { AuthService } from '../../../service/auth.service';
import { StockService } from '../../../service/stock.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-produit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './produit.component.html',
  styleUrl: './produit.component.scss'
})
export class ProduitComponent implements OnInit {
  isLoading = true;
  isModalOpen = false;
  analytics: any = {};

  isPriceModalOpen = false;
  currentProduct: any = null;
  priceForm: FormGroup;
  errorMessage: string | null = null;



  constructor(
    private authService: AuthService,
    private prixService: HistoriPrixService,
    private stockService: StockService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: ['']
    });
    this.priceForm = this.fb.group({
      newPrice: ['', [Validators.required, Validators.min(0.01)]],
      reason: ['', Validators.required]
    });
  }



    stocks: any[] = [];
  searchForm: FormGroup;
  pagination = {
    page: 1,
    limit: 20,
    total: 0
  };
  private _totalPages = 0;



  ngOnInit(): void {
    this.loadStocks();
  }

  loadStocks(): void {
    this.isLoading = true;
    const params = {
      page: this.pagination.page,
      limit: this.pagination.limit,
      ...this.searchForm.value
    };

    this.stockService.getAllStocks(params).subscribe({
      next: (response) => {
        this.stocks = response.data;
        this.pagination.total = response.meta.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });

      this.stockService.getStockAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
      },
      error: (err) => console.error(err)
    });
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadStocks();
  }


get pageNumbers(): number[] {
  this._totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
  return Array.from({ length: this._totalPages }, (_, i) => i + 1);
}

// Dans le template, utilisez : *ngFor="let page of pageNumbers"

  onSearch(): void {
    this.pagination.page = 1;
    this.loadStocks();
  }

  priceHistory: any[] = [];
  selectedPieceId: number | null = null;

 openPriceHistoryModal(pieceId: number): void {
    this.selectedPieceId = pieceId;
    this.isModalOpen = true;
    
    this.prixService.getPriceHistory(pieceId).subscribe({
      next: (data) => {
        this.priceHistory = data;
      },
      error: (err) => {
        console.error('Erreur:', err);
        // Gérer l'erreur (afficher un message, etc.)
      }
    });
  }

  // Ferme le modal
  closeModal(): void {
    this.isModalOpen = false;
    this.priceHistory = [];
    this.selectedPieceId = null;
  }

   openEditModal(stocks: any): void{
    
  }

   getStockStatus(stock: any): string {
    const total = stock.quantite;
    return total > 5 ? 'En stock' : total > 0 ? 'Stock faible' : 'Rupture';
  }

    getStatusClass(status: string): string {
    switch(status) {
      case 'En stock': return 'bg-green-100 text-green-800';
      case 'Stock faible': return 'bg-yellow-100 text-yellow-800';
      case 'Rupture': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

openPriceModal(stock: any) {
  this.currentProduct = {
    ...stock,
    id: stock.productId ? parseInt(stock.productId) : null,
    currentPrice: stock.prixFinal // Utilisez la propriété correcte
  };
  
  this.priceForm.patchValue({
    newPrice: stock.prixFinal // Utilisez prixFinal au lieu de price
  });
  this.isPriceModalOpen = true;
}

  closePriceModal() {
    this.isPriceModalOpen = false;
    this.currentProduct = null;
    this.priceForm.reset();
    this.errorMessage = null;
  }

  // updatePrice() {
  //   if (this.priceForm.invalid || !this.currentProduct) return;

  //   this.isLoading = true;
  //   this.errorMessage = null;

  //   const { newPrice, reason } = this.priceForm.value;

  //   this.prixService.updateProductPrice(
  //     this.currentProduct.id, // Adaptez selon votre structure
  //     newPrice,
  //     reason
  //   ).subscribe({
  //     next: () => {
  //       this.isLoading = false;
  //       this.closePriceModal();
  //       // Actualisez la liste ou le produit spécifique
  //       this.loadStocks();
  //     },
  //     error: (err) => {
  //       this.isLoading = false;
  //       this.errorMessage = err.error?.error || 'Erreur lors de la mise à jour';
  //     }
  //   });
  // }

  updatePrice() {
  if (this.priceForm.invalid || !this.currentProduct?.id) {
    return;
  }

  this.isLoading = true;
  this.errorMessage = null;

  const { newPrice, reason } = this.priceForm.value;

  console.log('Envoi requête avec:', {
    productId: this.currentProduct.id,
    newPrice,
    reason
  });

  this.prixService.updateProductPrice(
    this.currentProduct.id,
    parseFloat(newPrice), // Convertir en number
    reason
  ).subscribe({
    next: () => {
      this.isLoading = false;
      this.closePriceModal();
      this.loadStocks(); // Rafraîchir les données
    },
    error: (err) => {
      this.isLoading = false;
      console.error('Erreur détaillée:', err);
      this.errorMessage = this.getErrorMessage(err);
    }
  });
}

private getErrorMessage(error: any): string {
  if (error.error?.message) {
    return error.error.message;
  }
  if (error.status === 0) {
    return 'Erreur de connexion au serveur';
  }
  return 'Erreur lors de la mise à jour du prix';
}

isAdmin(): boolean {
  return this.authService.hasRole('ADMIN');
}

}
