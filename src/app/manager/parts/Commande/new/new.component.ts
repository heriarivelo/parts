import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommandeparticulierService } from '../../../../service/commandeparticulier.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PdfService } from '../../../../service/pdf.service';
import { ManagerService } from '../../../../service/manager.service';
import { ProClientService } from '../../../../service/pro-clients.service';

enum CustomerType {
  RETAIL = 'RETAIL',
  B2B = 'B2B',
  WHOLESALE = 'WHOLESALE'
}

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
  clientsB2B: any[] = [];
  customerTypes = Object.values(CustomerType);

  constructor(
    private panierService: CommandeparticulierService,
    private managerService: ManagerService,
    private proClientService: ProClientService,
    private pdfService : PdfService,
    private fb: FormBuilder
  ) {
    this.pieceForm = this.fb.group({
      nom: [''],
      reference: [''],
      marque: [''],
      poidsKg:[],
      fraisPort: [14.5],
      prixAchat: [],
      tauxChange: [5000],
      marge: [40]
    });

    this.clientForm = this.fb.group({
      customerType: ['RETAIL'],
      customerId: [null],
      nom: ['', { validators: [Validators.required] }],
      telephone: ['', { validators: [Validators.required, Validators.pattern(/^\d{10,}$/)] }],
      email: [''],
      adresse: [''],
      nif: ['']
    });

          // S'abonner aux changements du type de client
      this.clientForm.get('customerType')?.valueChanges.subscribe(type => {
          this.onCustomerTypeChange();
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

  const orderPayload = {
    customerType: clientInfo.customerType,
    commandeType: 'PARTICULIERE',
    managerId: 1,
    customerId: clientInfo.customerId, // ⬅️ AJOUTEZ L'ID CLIENT SI B2B
    items: this.panier.map(item => ({
      // productId: item.id, // ⬅️ ASSUREZ-VOUS D'AVOIR UN ID DE PRODUIT
      reference: item.reference,
      productName: item.nom,
      marque: item.marque || null,
      unitPrice: item.prixVente,
      quantity: item.quantite
    })),
    info: {
      nom: clientInfo.nom,
      telephone: clientInfo.telephone, // ⬅️ CORRIGEZ ICI
      email: clientInfo.email || null,
      adresse: clientInfo.adresse || null,
      nif: clientInfo.nif || null
    },
    totalAmount: total
  };

  try {
    // Appel API
    const result = await this.managerService.createOrder(orderPayload).toPromise();

    // Génération du PDF
    const pdfData = {
      reference: tempReference,
      clientInfo,
      items: this.panier,
      customerType: clientInfo.customerType,
      date: this.today,
      subtotal: total
    };
    
    await this.pdfService.exportAsImage(pdfData, 'devis', 'png');
    
    // Réinitialisation
    this.panierService.viderPanier();
    this.showClientModal = false;
    this.clientForm.reset({
      customerType: 'RETAIL'
    });

    alert(`Devis ${tempReference} confirmé!\nPDF et image générés avec succès.`);
    
  } catch (error) {
    console.error('Erreur complète:', error);
    
    let errorMessage = 'Erreur lors de la confirmation';
    if (typeof error === 'object' && error !== null) {
      const errObj = error as { error?: any; message?: string };
      errorMessage += errObj.error?.message ? ` : ${errObj.error.message}` : 
                     errObj.message ? ` : ${errObj.message}` : 
                     ` : ${JSON.stringify(errObj)}`;
    } else {
      errorMessage += ` : ${String(error)}`;
    }
    
    alert(errorMessage);
  }
}


  getCustomerTypeLabel(type: CustomerType): string {
    switch(type) {
      case CustomerType.RETAIL: return 'Client détail';
      case CustomerType.B2B: return 'Professionnel';
      case CustomerType.WHOLESALE: return 'Grossiste';
      default: return '';
    }
  }

onCustomerTypeChange(): void {
  const type = this.clientForm.get('customerType')?.value;
  console.log('Type de client changé:', type);

  if (type === 'B2B') {
    this.proClientService.getProClients('', 'ACTIVE').subscribe({
      next: (clients) => {
        // Filtrer uniquement les B2B
        this.clientsB2B = clients.filter((c: any) => c.type === 'B2B');
        console.log('Clients B2B chargés:', this.clientsB2B);
      },
      error: (err) => console.error('Erreur chargement clients B2B :', err)
    });
  } else {
    this.clientsB2B = [];
    this.clientForm.patchValue({ 
      customerId: null,
      nom: '', 
      telephone: '', // ⬅️ CORRIGEZ ICI
      email: '',
      nif: '', 
      adresse: '' 
    });
  }
}

onB2BClientSelected(): void {
  const selectedClientId = this.clientForm.get('customerId')?.value;
  console.log('ID client sélectionné:', selectedClientId);
  
  if (selectedClientId) {
    const client = this.clientsB2B.find(c => c.id === selectedClientId);
    console.log('Client trouvé:', client);
    
    if (client) {
      this.clientForm.patchValue({
        nom: client.nom || '',
        telephone: client.telephone || client.phone || '', // ⬅️ CORRIGEZ ICI
        email: client.email || '',
        nif: client.nif || client.siret || '',
        adresse: client.adresse || client.address || ''
      });
    }
  } else {
    // Réinitialiser si aucun client sélectionné
    this.clientForm.patchValue({ 
      nom: '', 
      telephone: '', // ⬅️ CORRIGEZ ICI
      email: '',
      nif: '', 
      adresse: '' 
    });
  }
}

  // Ajouter ces getters dans votre classe
  get isB2B(): boolean {
      return this.clientForm.get('customerType')?.value === 'B2B';
  }

  get isFormValid(): boolean {
      return this.clientForm.valid && this.panier.length > 0;
  }

}