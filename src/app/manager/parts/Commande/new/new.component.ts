import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommandeparticulierService } from '../../../../service/commandeparticulier.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PdfService } from '../../../../service/pdf.service';

@Component({
  selector: 'app-new',
  imports: [
    CommonModule, FormsModule, RouterModule, ReactiveFormsModule, DatePipe],
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewMComponent implements OnInit {
  panier: any[] = [];
  pieceForm: FormGroup;
  prixVenteConseille: number = 0;

    // Modal properties
  showModal = false;
  showClientModal = false;
  today = new Date();
  isLoading = false;
  
  // Facture preview data
  devisPreview: any = null;
  
  // Client form
  clientForm: FormGroup;

  constructor(
    private panierService: CommandeparticulierService,
    private pdfService : PdfService,
    private fb: FormBuilder
  ) {
    this.pieceForm = this.fb.group({
      nom: [''],
      reference: [''],
      marque: [''],
      poidsKg:[],
      fraisPort: [14.5],
      prixAchat: [45.00],
      tauxChange: [5000],
      marge: [40]
    });

    this.clientForm = this.fb.group({
      customerType: ['RETAIL'],
      nom: ['', { validators: [Validators.required] }],
      telephone: ['', { validators: [Validators.required] }],
      email: [''],
      adresse: [''],
      nif: ['']
    });
  }

  ngOnInit(): void {
    this.panierService.panier$.subscribe(panier => {
      this.panier = panier;
    });
    
    this.calculatePrice();
    
    this.pieceForm.valueChanges.subscribe(() => {
      this.calculatePrice();
    });
  }

  calculatePrice(): void {
    const formValues = this.pieceForm.value;
    this.prixVenteConseille = this.panierService.calculerPrixVente(formValues);
  }

  ajouterArticle(): void {
    const article = {
      ...this.pieceForm.value,
      prixVente: this.prixVenteConseille
    };
    
    this.panierService.ajouterArticle(article);
    this.pieceForm.patchValue({ nom: '' }); // Réinitialiser seulement le nom
  }

  supprimerArticle(id: number): void {
    this.panierService.supprimerArticle(id);
  }

  updateQuantity(article: any, event: any): void {
    const quantity = event.target.value;
    this.panierService.modifierQuantite(article.id, quantity);
  }

  getTotal(): number {
    return this.panier.reduce((sum, article) => sum + (article.prixVente * article.quantite), 0);
  }

  getMarge(): number {
    const formValues = this.pieceForm.value;
   const total = (formValues.poidsKg * formValues.fraisPort);
   const coutTotal = (formValues.prixAchat + total) * formValues.tauxChange;
    return this.prixVenteConseille - coutTotal;
  }

    // Modal methods
  openModal(): void {
    if (this.panier.length === 0) return;
    
    this.isLoading = true;
    this.showModal = true;
    
    // Simulate loading
    setTimeout(() => {
      this.devisPreview = {
        date: this.today,
        items: this.panier.map(item => ({
          reference: item.reference,
          productName: item.nom,
          marque: 'N/A',
          unitPrice: item.prixVente,
          quantity: item.quantite,
          total: item.prixVente * item.quantite
        })),
        total: this.getTotal(),
        tva: 0 // Change this if you have TVA
      };
      this.isLoading = false;
    }, 500);
  }

  closeModal(): void {
    this.showModal = false;
    this.devisPreview = null;
  }

  openClientModal(): void {
    this.showModal = false;
    this.showClientModal = true;
  }

  cancelClientModal(): void {
    this.showClientModal = false;
    this.showModal = true;
  }

  async confirmDevis() {
  // 1. Validation du formulaire
  if (this.clientForm.invalid) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  // 2. Vérification du panier
  if (!this.panier.length) {
    alert('Aucun article à commander');
    return;
  }

  // 3. Préparation des données
  const clientInfo = this.clientForm.value;
  const total = this.getTotal();
  const tempReference = `CMD-${Date.now()}`;

  // 4. Préparation des données pour PDF
  const pdfData = {
    reference: tempReference,
    clientInfo,
    items: this.panier.map(item => ({
      reference: item.reference,
      productName: item.nom,
      marque: item.marque || 'N/A',
      unitPrice: item.prixVente,
      quantity: item.quantite,
      total: item.prixVente * item.quantite
    })),
    customerType: clientInfo.customerType,
    date: this.today,
    subtotal: total
  };

  // 5. Préparation du payload pour l'API
  const orderPayload = {
    reference: tempReference,
    customerType: clientInfo.customerType,
    // managerId: this.currentManagerId,
    items: pdfData.items, // Réutilisation des mêmes données
    totalAmount: total,
    clientInfo: {
      name: clientInfo.nom,
      phone: clientInfo.telephone,
      email: clientInfo.email || null,
      address: clientInfo.adresse || null,
      nif: clientInfo.customerType === 'B2B' ? clientInfo.nif : null
    },
    status: 'PENDING' // Ajout d'un statut par défaut
  };

  try {
    // 6. Génération des documents (en parallèle pour plus de performance)
    // const [pdfResult, imageResult] = await Promise.all([
    const [pdfResult] = await Promise.all([
      // this.pdfService.exportAsPdf(pdfData, 'devis'),
      this.pdfService.exportAsImage(pdfData, 'devis', 'png')
    ]);

    // 7. Enregistrement en base de données
    // const result = await this.managerService.createOrder(orderPayload).toPromise();
    
    this.panierService.viderPanier();
    this.showClientModal = false;
    this.clientForm.reset({
      customerType: 'RETAIL'
    });

    alert(`Devis ${tempReference} confirmé!\nPDF et image générés avec succès.`);
    
    console.log('Commande enregistrée:', {
      // dbResult: result,
      pdfResult,
      // imageResult
    });

  } catch (error) {
    console.error('Erreur complète:', error);
    
   let errorMessage = 'Erreur lors de la confirmation';

if (typeof error === 'object' && error !== null) {
  const errObj = error as { error?: any; message?: string };

  if (errObj.error?.message) {
    errorMessage += ` : ${errObj.error.message}`;
  } else if (typeof errObj.message === 'string') {
    errorMessage += ` : ${errObj.message}`;
  } else {
    errorMessage += ` : ${JSON.stringify(errObj)}`;
  }
} else {
  errorMessage += ` : ${String(error)}`;
}
    
    alert(errorMessage);
    
    // Optionnel: Recharger les données si échec
    // this.panierService.panier$.next([...this.panier]);
  }
}

}