import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { CommandeparticulierService } from '../../../service/commandeparticulier.service';
import { DatePipe } from '@angular/common';
import { PdfService } from '../../../service/pdf.service';
import { ManagerService } from '../../../service/manager.service';
import { ProClientService } from '../../../service/pro-clients.service';
import { AuthService, User } from '../../../service/auth.service';
import { OrderPreviewModalComponent } from '../order-preview-modal/order-preview-modal.component';

enum CustomerType {
  RETAIL = 'RETAIL',
  B2B = 'B2B',
  WHOLESALE = 'WHOLESALE'
}

@Component({
  selector: 'app-commande-particuliere',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, OrderPreviewModalComponent],
  templateUrl: './commande-particuliere.component.html',
  styleUrl: './commande-particuliere.component.scss'
})
export class CommandeParticuliereComponent implements OnInit, OnDestroy{
  private destroy$ = new Subject<void>();

  panier: any[] = [];
  pieceForm: FormGroup;
  clientForm: FormGroup;

  prixVenteConseille = 0;
  showModal = false;
  showClientModal = false;
  isLoading = false;
  isSubmitting = false;
  isLoadingClients = false;

  errorMessage = '';
  successMessage = '';

  today = new Date();
  currentUser: User | null = null;
  devisPreview: any = null;

  clientsB2B: any[] = [];
  customerTypes = Object.values(CustomerType);

  constructor(
    private panierService: CommandeparticulierService,
    private managerService: ManagerService,
    private proClientService: ProClientService,
    private pdfService : PdfService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.pieceForm = this.fb.group({
      nom: ['', Validators.required],
      reference: ['', Validators.required],
      marque: [''],
      poidsKg:[null, [Validators.required,Validators.min(0)]],
      fraisPort: [14.5, [Validators.required, Validators.min(0)]],
      prixAchat: [null, [Validators.required, Validators.min(0)]],
      tauxChange: [5000, [Validators.required, Validators.min(1)]],
      marge: [40, [Validators.required, Validators.min(0)]]
    });

    this.clientForm = this.fb.group({
      customerType: ['RETAIL', Validators.required],
      customerId: [null],
      nom: ['', Validators.required],
      telephone: ['', { validators: [Validators.required, Validators.pattern(/^\d{10,}$/)] }],
      email: ['', Validators.email],
      adresse: [''],
      nif: ['']
    });

          // S'abonner aux changements du type de client
      this.clientForm.get('customerType')?.valueChanges.subscribe(type => {
          this.onCustomerTypeChange();
      });
    
      this.currentUser = this.authService.currentUserValue;
  }


  ngOnInit(): void {
  this.currentUser = this.authService.currentUserValue;

  this.panierService.panier$
    .pipe(takeUntil(this.destroy$))
    .subscribe(panier => {
      this.panier = panier;
    });

  this.pieceForm.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.calculatePrice());

  this.clientForm.get('customerType')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.onCustomerTypeChange());

  this.calculatePrice();
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

private toNumber(value: any): number {
  return Number(value) || 0;
}

ajouterArticle(): void {
  this.errorMessage = '';
  this.successMessage = '';

  if (this.pieceForm.invalid) {
    this.pieceForm.markAllAsTouched();
    this.errorMessage = 'Veuillez compléter les champs obligatoires.';
    return;
  }

  const article = {
    ...this.pieceForm.value,
    prixVente: this.prixVenteConseille,
    quantite: 1
  };

  this.panierService.ajouterArticle(article);

  this.pieceForm.patchValue({
    nom: '',
    reference: '',
    marque: '',
    poidsKg: null,
    prixAchat: null
  });

  this.pieceForm.markAsPristine();
  this.pieceForm.markAsUntouched();

  this.successMessage = 'Article ajouté au panier.';
}

updateQuantity(article: any, event: Event): void {
  const input = event.target as HTMLInputElement;
  const quantity = Math.max(1, Number(input.value) || 1);
  this.panierService.modifierQuantite(article.id, quantity);
}

getTotal(): number {
  return this.panier.reduce((sum, article) => {
    return sum + this.toNumber(article.prixVente) * this.toNumber(article.quantite);
  }, 0);
}


  calculatePrice(): void {
    const formValues = this.pieceForm.value;
    this.prixVenteConseille = this.panierService.calculerPrixVente(formValues);
  }


  supprimerArticle(id: number): void {
    this.panierService.supprimerArticle(id);
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
          marque: item.marque || 'N/A',
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


async confirmDevis(): Promise<void> {
  this.errorMessage = '';
  this.successMessage = '';

  if (this.clientForm.invalid) {
    this.clientForm.markAllAsTouched();
    this.errorMessage = 'Veuillez remplir les champs obligatoires du client.';
    return;
  }

  if (!this.panier.length) {
    this.errorMessage = 'Aucun article à commander.';
    return;
  }

  this.isSubmitting = true;

  const clientInfo = this.clientForm.value;
  const total = this.getTotal();
  const tempReference = `CMD-${Date.now()}`;

  const orderPayload = {
    customerType: clientInfo.customerType,
    commandeType: 'PARTICULIERE',
    managerId: this.currentUser?.id ?? null,
    customerId: clientInfo.customerId ?? null,
    items: this.panier.map(item => ({
      reference: item.reference,
      productName: item.nom,
      marque: item.marque || null,
      unitPrice: Number(item.prixVente),
      quantity: Number(item.quantite)
    })),
    info: {
      nom: clientInfo.nom,
      telephone: clientInfo.telephone,
      email: clientInfo.email || null,
      adresse: clientInfo.adresse || null,
      nif: clientInfo.nif || null
    },
    totalAmount: total
  };

  try {
    const result: any = await firstValueFrom(this.managerService.createOrder(orderPayload));

    const pdfData = {
      reference: result?.reference || tempReference,
      clientInfo,
      items: orderPayload.items,
      customerType: clientInfo.customerType,
      date: this.today,
      subtotal: total
    };

    await this.pdfService.exportAsImage(pdfData, 'devis', 'png');

    this.panierService.viderPanier();
    this.showClientModal = false;
    this.showModal = false;

    this.clientForm.reset({
      customerType: 'RETAIL',
      customerId: null,
      nom: '',
      telephone: '',
      email: '',
      adresse: '',
      nif: ''
    });

    this.successMessage = `Devis ${pdfData.reference} confirmé avec succès.`;
  } catch (error: any) {
    this.errorMessage =
      error?.error?.message ||
      error?.message ||
      'Erreur lors de la confirmation de la commande.';
  } finally {
    this.isSubmitting = false;
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
  // console.log('Type de client changé:', type);

  if (type === 'B2B') {
    this.proClientService.getProClients('', 'ACTIVE').subscribe({
      next: (clients) => {
        // Filtrer uniquement les B2B
        this.clientsB2B = clients.filter((c: any) => c.type === 'B2B');
        // console.log('Clients B2B chargés:', this.clientsB2B);
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
  
  if (selectedClientId) {
    const client = this.clientsB2B.find(c => c.id === selectedClientId);
    
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

  isInvalid(controlName: string): boolean {
    const control = this.pieceForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  isFieldInvalid(field: string): boolean {
  const control = this.pieceForm.get(field);
  return !!control && control.invalid && control.touched;
}

}
