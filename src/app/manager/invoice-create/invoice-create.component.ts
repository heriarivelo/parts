import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { InvoiceService } from '../../service/invoice.service';
import { CommandeService } from '../../service/commande.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfService } from '../../service/pdf.service';
import { lastValueFrom } from 'rxjs';


interface Piece {
  productId: number;
  productName: string;
  quantite: number;
  entrepotId: number | null;
  entrepotsDisponibles: Entrepot[];
}

interface Entrepot {
  id: number;
  nom: string;
  quantiteDisponible: number;
}

interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
}

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './invoice-create.component.html',
  styleUrls: ['./invoice-create.component.scss']
})
export class InvoiceCreateComponent implements OnInit {
  orderId!: number;
  isLoading = true;
  orderDetails: any = null;
  currentManagerId = 2;
  
  invoiceForm: FormGroup;
  discounts: Discount[] = [];
  piecesFormArray: FormArray;

  discountTypes = [
    { value: 'percentage', label: 'Pourcentage (%)' },
    { value: 'fixed', label: 'Montant Fixe (MGA)' }
  ];

  paymentMethods = ['CASH', 'MOBILE_MONEY', 'VIREMENT', 'CHEQUE'];

  constructor(
    private route: ActivatedRoute,
    private orderService: CommandeService,
    private invoiceService: InvoiceService,
    private pdfService: PdfService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.piecesFormArray = this.fb.array([]);
    this.invoiceForm = this.fb.group({
      discountType: ['percentage'],
      discountValue: [0, [Validators.min(0)]],
      discountDescription: [''],
      paymentMethod: ['CASH', Validators.required],
      paymentAmount: [0, [Validators.min(0)]],
      paymentReference: [''],
      pieces: this.piecesFormArray
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('commandeId');
    if (id) {
      this.orderId = +id;
      this.loadOrderDetails();
    } else {
      console.error('No order ID provided');
      this.router.navigate(['/liste-commandes']);
    }
  }

  async loadOrderDetails(): Promise<void> {
    this.isLoading = true;
    try {
      const order = await lastValueFrom(this.orderService.getCommandeDetails(this.orderId));
      this.orderDetails = order;

      if (this.orderDetails?.pieces?.length) {
        this.piecesFormArray.clear();
        
        for (const piece of this.orderDetails.pieces) {
          const entrepots = await lastValueFrom(
            this.orderService.getEntrepotsDisponibles(piece.productId)
          );
          
          this.addPieceFormGroup(piece, entrepots);
        }
      }
    } catch (err) {
      console.error('Error loading order details', err);
      this.router.navigate(['/liste-commandes']);
    } finally {
      this.isLoading = false;
    }
  }

  private addPieceFormGroup(piece: any, entrepots: any[]): void {
    const entrepotsDisponibles = (entrepots || []).map(e => ({
      id: e.id,
      nom: e.libelle,
      quantiteDisponible: e.quantite
    }));

    const pieceGroup = this.fb.group({
      productId: [piece.productId, Validators.required],
      productName: [piece.productName, Validators.required],
      quantite: [piece.quantite, [Validators.required, Validators.min(1)]],
      entrepotId: [null, [Validators.required, this.entrepotValidator(entrepotsDisponibles)]],
      entrepotsDisponibles: [entrepotsDisponibles]
    });

    this.piecesFormArray.push(pieceGroup);
  }

  private entrepotValidator(entrepots: Entrepot[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (value === null || value === undefined || value === '') {
        return { required: true };
      }
      
      if (!entrepots.some(e => e.id === value)) {
        return { invalidEntrepot: true };
      }
      
      return null;
    };
  }

  onEntrepotChange(pieceGroup: AbstractControl): void {
    const group = pieceGroup as FormGroup;
    const selectedEntrepotId = group.get('entrepotId')?.value;
    const availableWarehouses = group.get('entrepotsDisponibles')?.value || [];
    
    const selectedWarehouse = availableWarehouses.find((w: Entrepot) => w.id === selectedEntrepotId);
    
    if (selectedWarehouse) {
      const requestedQty = group.get('quantite')?.value;
      if (selectedWarehouse.quantiteDisponible < requestedQty) {
        group.get('entrepotId')?.setErrors({ insufficientQuantity: true });
      } else {
        const currentErrors = group.get('entrepotId')?.errors;
        if (currentErrors) {
          delete currentErrors['insufficientQuantity'];
          group.get('entrepotId')?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
        }
      }
    }
  }

  addDiscount(): void {
    const { discountType, discountValue, discountDescription } = this.invoiceForm.value;
    
    if (discountValue > 0) {
      this.discounts.push({
        type: discountType,
        value: discountValue,
        description: discountDescription
      });
      
      this.invoiceForm.patchValue({
        discountValue: 0,
        discountDescription: ''
      });
    }
  }

  removeDiscount(index: number): void {
    this.discounts.splice(index, 1);
  }

  calculateTotals(): { subtotal: number; discountTotal: number; total: number } {
    const pieces = this.orderDetails?.pieces || [];
    const subtotal = pieces.reduce(
      (acc: number, item: any) => acc + (item.quantite * item.prixArticle), 0
    );

    const discountTotal = this.discounts.reduce((acc, discount) => {
      return discount.type === 'percentage' 
        ? acc + (subtotal * discount.value / 100)
        : acc + discount.value;
    }, 0);

    const total = Math.max(0, subtotal - discountTotal);
    
    return { subtotal, discountTotal, total };
  }

submitInvoice() {
  // 1. Vérification des entrepôts (nouvelle partie)
  if (this.piecesFormArray) {
    const missingWarehouse = this.piecesFormArray.controls.some(control => {
      return !control.get('entrepotId')?.value;
    });

    if (missingWarehouse) {
      alert('Veuillez sélectionner un entrepôt pour chaque article');
      this.markAllAsTouched();
      return;
    }
  }

  // 2. Calcul des totaux (inchangé)
  const totals = this.calculateTotals();
  const { paymentAmount, paymentMethod, paymentReference } = this.invoiceForm.value;

  // 3. Préparation du payload (adapté pour les entrepôts)
  const payload: any = {
    orderId: this.orderId,
    referenceFacture: `FAC-${Date.now()}`,
    prixTotal: totals.total,
    managerId: this.currentManagerId
  };

  // Ajout des pièces avec entrepôts si disponibles
  if (this.piecesFormArray) {
    payload.pieces = this.piecesFormArray.value.map((p: any) => ({
      productId: p.productId,
      quantite: p.quantite,
      entrepotId: p.entrepotId // Nouveau champ
    }));
  } else {
    // Fallback pour l'ancienne version
    payload.pieces = this.orderDetails.pieces.map((p: any) => ({
      productId: p.productId,
      quantite: p.quantite
    }));
  }

  // Paiement et remises (inchangé)
  if (paymentAmount > 0) {
    payload.paymentDetails = {
      amount: paymentAmount,
      method: paymentMethod,
      reference: paymentReference,
      managerId: this.currentManagerId
    };
  }

  if (this.discounts.length > 0) {
    payload.discounts = this.discounts;
  }

  console.log('Payload envoyé:', payload); // Debug

  // 4. Envoi au serveur (inchangé)
  this.orderService.validateOrder(this.orderId, payload).subscribe({
    next: (response) => {
      // 5. Génération du PDF (adapté pour garder la même structure)
      const pdfData = {
        referenceFacture: payload.referenceFacture,
        createdAt: new Date(),
        prixTotal: totals.total,
        commandeVente: {
          reference: this.orderDetails.reference,
          customer: this.orderDetails.customer || null,
          pieces: this.orderDetails.pieces.map((piece: any) => ({
            product: {
              codeArt: piece.product?.codeArt || 'N/A',
              libelle: piece.product?.libelle || 'Pièce non spécifiée',
              marque: piece.product?.marque || '-'
            },
            prixArticle: piece.prixArticle,
            quantite: piece.quantite,
            // Ajout optionnel de l'entrepôt dans le PDF si besoin
            entrepot: this.piecesFormArray?.value.find((p: any) => 
              p.productId === piece.productId)?.entrepotId || 'N/A'
          }))
        },
        subtotal: totals.subtotal,
        remises: totals.discountTotal,
        paymentDetails: paymentAmount > 0 ? {
          amount: paymentAmount,
          method: paymentMethod,
          reference: paymentReference
        } : null
      };

      this.pdfService.exportAsImage(pdfData, 'facture', 'png')
        .then(() => {
          alert('Facture générée avec succès');
          this.router.navigate(['/liste-facture']);
        })
        .catch(pdfErr => {
          console.error('Erreur PDF:', pdfErr);
          alert('Facture enregistrée mais erreur de génération PDF');
          this.router.navigate(['/liste-facture']);
        });
    },
    error: (err) => {
      console.error('Erreur:', err);
      alert(`Erreur: ${err.error?.message || err.message}`);
    }
  });
}

// Ajoutez cette méthode si elle n'existe pas
private markAllAsTouched(): void {
  this.invoiceForm.markAllAsTouched();
  if (this.piecesFormArray) {
    this.piecesFormArray.controls.forEach(control => {
      control.markAllAsTouched();
    });
  }
}

  cancel(): void {
    this.router.navigate(['/liste-commandes']);
  }
}