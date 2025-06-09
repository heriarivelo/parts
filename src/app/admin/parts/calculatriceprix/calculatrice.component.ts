import { Component } from '@angular/core';
import { Piece } from '../../../models/piece.model';
import { PieceService } from '../../../service/piece.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../service/manager.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PdfService } from '../../../service/pdf.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-calculatrice',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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

   clientForm: FormGroup;

  // constructor(private fb: FormBuilder, private pdfService: PdfService, private orderService: OrderService) {
  //   this.clientForm = this.fb.group({
  //     customerType: ['B2B'],
  //     nom: ['', Validators.required],
  //     telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
  //     email: ['', Validators.email],
  //     adresse: [''],
  //     nif: ['']
  //   });
  // }

  constructor(
    public pieceService: PieceService,
    public managerService : ManagerService,
    private router: Router,
    private fb: FormBuilder,
    private pdfService: PdfService
  ) {
    this.parametres = this.pieceService.getParametres();
    this.clientForm = this.fb.group({
      customerType: ['B2B'],
      nom: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', Validators.email],
      adresse: [''],
      nif: ['']
    });
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

  showClientModal = false;
  selectedCustomerType = 'B2B';
  currentManagerId = 1;
  //  importData: any;
  importData: any = {}; // Initialisation vide ou avec des valeurs par défaut

  // Ouvre le modal client
  openClientModal() {
    this.showClientModal = true;
  }

  // Ferme le modal sans sauvegarder
  cancelClientModal() {
    this.showClientModal = false;
    this.clientForm.reset();
  }


async confirmDevis() {
  // 1. Récupérer les données actuelles du service
  const currentData = this.pieceService.getCurrentData(); // À implémenter dans PieceService
  
  // 2. Formater les données
  const orderData = this.formatDevisData(currentData || { importParts: [] });
  
  // 3. Vérifier qu'il y a des articles
  if (!orderData.items.length) {
    alert('Aucun article à commander');
    return;
  }

  const clientInfo = this.clientForm.value;

  // 4. Générer la référence
  const tempReference = `CMD-${Date.now()}`;
  
  // 5. Préparer les données pour le PDF
  const pdfData = {
    reference: tempReference,
    clientInfo,
    ...orderData,
    customerType: this.selectedCustomerType,
    date: new Date().toLocaleDateString('fr-FR')
  };

  try {
    // 6. Générer le PDF
    // await this.pdfService.generateAndExportPdf(pdfData, 'devis');
    await this.pdfService.exportAsImage(pdfData, 'devis', 'png')

    // 7. Enregistrer en base
    const orderPayload = {
      reference: tempReference,
      customerType: this.selectedCustomerType,
      managerId: this.currentManagerId,
      items: orderData.items.map((item :any) => ({
        productReference: item.reference, // Utilisez le champ approprié
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      totalAmount: orderData.total,
      clientInfo
    };

    // const result = await this.managerService.createOrder(orderPayload).toPromise();
    // console.log('Commande enregistrée:', result);
    
    // 8. Fermer le modal et reset
    this.showClientModal = false;
    this.showModal = false;
    this.clientForm.reset();

    // 9. Feedback utilisateur
    alert('Devis confirmé et PDF généré avec succès!');

  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la confirmation: ');
  }
}
}
