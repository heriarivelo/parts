import { Component } from '@angular/core';
import { Piece } from '../../../models/piece.model';
import { PieceService } from '../../../service/piece.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../service/manager.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calculatrice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculatrice.component.html',
  styleUrl: './calculatrice.component.scss'
})
export class CalculatriceComponent {
  title = 'gestion-pieces';
  parametres: any = {};
  nouvellePiece: Piece = {
    code: '',
    marque: '',
    reference: '',
    autofinal: '',
    libelle: '',
    quantite: 1,
    quantiteArrivee:1,
    prixUnitaireEur: 0,
    poidsKg: 0
  };
  totauxMethode1 = { caPrevisionnel: 0, margeTotale: 0 };
  totauxMethode2 = { caPrevisionnel: 0, margeTotale: 0 };
  totauxFinaux = { caPrevisionnel: 0, margeTotale: 0 };

  constructor(
    public pieceService: PieceService,
    public managerService : ManagerService,
    private router: Router
  ) {
    this.parametres = this.pieceService.getParametres();
  }

  description = '';
  isSaving = false;
  success = false;
  error = '';
  showImportModal = false;
  showDevisModal = false;

  appliquerParametres(): void {
    this.pieceService.setParametres(this.parametres);
  }

  ajouterPiece(): void {
    if (this.nouvellePiece.code) {
      this.pieceService.addPiece({...this.nouvellePiece});
      this.nouvellePiece = {
        code: '',
        marque: '',
        reference: '',
        autofinal: '',
        libelle: '',
        quantite: 1,
        quantiteArrivee:1,
        prixUnitaireEur: 0,
        poidsKg: 0
      };
    }
  }

  ngOnInit() {
    this.calculerTotaux();
  }

  calculerTotaux() {
    this.totauxMethode1 = this.pieceService.calculerTotauxMethode1();
    this.totauxMethode2 = this.pieceService.calculerTotauxMethode2();
    this.totauxFinaux = this.pieceService.calculerTotauxFinaux();
  }

  // Appeler cette méthode quand les données changent
  onDonneesChangees() {
    this.calculerTotaux();
  }
  

  supprimerPiece(index: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette pièce ?')) {
      this.pieceService.deletePiece(index);
    }
  }

  arrondirInf(valeur: number, precision: number): number {
    const factor = Math.pow(10, -precision);
    return Math.floor(valeur / factor) * factor;
  }
  exporterExcel(): void {
    this.pieceService.exportToExcel();
  }

  async importerExcel(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await this.pieceService.importFromExcel(file);
      // Réinitialiser l'input file pour permettre la sélection du même fichier
      event.target.value = '';
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      alert('Une erreur est survenue lors de l\'import du fichier Excel.');
    }
  }

  confirmImport() {
    this.isSaving = true;
    this.error = '';
    
    this.pieceService.enregistrerImport(this.description).subscribe({
      next: () => {
        this.isSaving = false;
        this.success = true;
      },
      error: (err) => {
        this.isSaving = false;
        this.error = 'Erreur lors de l\'enregistrement: ' + err.message;
      }
    });
  }

   showModal = false;
  isLoading = false;
  devisPreview: any;
  // Dans votre classe component
today = new Date();
randomId = Math.floor(Math.random() * 10000);

  // constructor(private devisService: DevisService) {}

  // Ouvre le modal et charge les données
  previewDevis() {
    this.showModal = true;
    this.isLoading = true;

    this.pieceService.devisPreviews().subscribe({
      next: (data) => {
        this.devisPreview = this.formatDevisData(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.isLoading = false;
      }
    });
  }

  // Ferme le modal
  closeModal() {
    this.showModal = false;
    this.devisPreview = null;
  }

  // Formate les données pour le template
  // private formatDevisData(data: any): any {
  //   return {
  //     items: data.importParts.map((item: any) => ({
  //       productName: item.LIB1 || 'Pièce sans nom',
  //       reference: item.CODE_ART,
  //       marque: item.marque || 'Non spécifiée',
  //       oem: item.oem || '-',
  //       unitPrice: item.prix_de_vente,
  //       quantity: item.Qte,
  //       total: item.prix_de_vente * item.Qte
  //     })),
  //     subtotal: data.importParts.reduce((sum: number, item: any) => sum + item.total, 0),
  //     total: data.importParts.reduce((sum: number, item: any) => sum + item.total, 0),
  //     discounts: []
  //   };
  // }

  private formatDevisData(data: any): any {
  const items = data.importParts.map((item: any) => {
    const quantity = item.Qte || 0;
    const unitPrice = item.prix_de_vente || 0;
    const total = unitPrice * quantity;

    return {
      productName: item.LIB1 || 'Pièce sans nom',
      reference: item.CODE_ART,
      marque: item.marque || 'Non spécifiée',
      oem: item.oem || '-',
      unitPrice,
      quantity,
      total
    };
  });

  const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);

  return {
    items,
    subtotal,
    total: subtotal, // Si tu n'as pas de frais ou taxes, tu peux garder `total = subtotal`
    discounts: []
  };
}


  // Confirme le devis
 confirmDevis() {
  if (!this.devisPreview) {
    alert('Aucun devis à confirmer');
    return;
  }

  this.isLoading = true;

  // Formatage des données pour l'API
  const orderData = {
    customerType: 'B2B', // À adapter selon votre logique
    // items: this.devisPreview.items.map(item => ({
    //   productId: item.reference, // Ou l'identifiant réel du produit
    //   quantity: item.quantity,
    //   unitPrice: item.unitPrice
    // })),
    totalAmount: this.devisPreview.total,
    notes: 'Devis confirmé via interface'
  };

  this.managerService.createOrder(orderData).subscribe({
    next: (result) => {
      this.isLoading = false;
      
      // Notification stylée (alternative à alert)
      alert(
        `Devis confirmé ! Référence: ${result.orderId}`,
      );

      // Réinitialisation et redirection
      this.closeModal();
      this.router.navigate(['/liste-commandes', result.orderId]);
    },
    error: (err) => {
      this.isLoading = false;
      console.error('Erreur confirmation:', err);
      
      alert(
        err.error?.message || 'Erreur lors de la confirmation',
      );
    }
  });
}
}
