import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvoiceService } from '../../service/invoice.service';
import { CommandeService } from '../../service/commande.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfService } from '../../service/pdf.service';


@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './invoice-create.component.html',
  styleUrl: './invoice-create.component.scss'
})
export class InvoiceCreateComponent implements OnInit {

  orderId!: number;
  isLoading = true;
  orderDetails: any = null;
currentManagerId = 2;
  invoiceForm!: FormGroup;
  discounts: any[] = [];

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
  ) {}


  // ngOnInit(): void {
  //   this.invoiceForm = this.fb.group({
  //     discountValue: [0, [Validators.min(0)]],
  //     // Ajoute ici les autres champs de ton formulaire
  //   });
  // }
  ngOnInit(): void {
    this.orderId = +this.route.snapshot.paramMap.get('commandeId')!;
    this.initForm();
    this.loadOrderDetails();
  }

  initForm() {
    this.invoiceForm = this.fb.group({
      discountType: ['percentage'],
      discountValue: [0],
      discountDescription: [''],
      paymentMethod: ['CASH'],
      paymentAmount: [0],
      paymentReference: ['']
    });
  }

  loadOrderDetails() {
    this.orderService.getCommandeDetails(this.orderId).subscribe({
      next: (order) => {
        this.orderDetails = order;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commande', err);
        this.isLoading = false;
      }
    });
  }

  addDiscount() {
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

  removeDiscount(index: number) {
    this.discounts.splice(index, 1);
  }

  calculateTotals() {
    const pieces = this.orderDetails?.pieces || [];
    const subtotal = pieces.reduce(
      (acc: number, item: any) => acc + item.quantite * item.prixArticle, 0
    );

    let discountTotal = 0;
    for (let discount of this.discounts) {
      if (discount.type === 'percentage') {
        discountTotal += subtotal * (discount.value / 100);
      } else {
        discountTotal += discount.value;
      }
    }

    const total = Math.max(subtotal - discountTotal, 0);
    return { subtotal, discountTotal, total };
  }

  // submitInvoice() {
  //   const totals = this.calculateTotals();
  //   const { paymentAmount, paymentMethod, paymentReference } = this.invoiceForm.value;

  //   const payload: any = {
  //     orderId: this.orderId,
  //   };

  //   if (paymentAmount > 0) {
  //     payload.paymentDetails = {
  //       amount: paymentAmount,
  //       method: paymentMethod,
  //       reference: paymentReference,
  //       managerId: this.currentManagerId 
  //     };
  //   }

  //   if (this.discounts.length > 0) {
  //     payload.discounts = this.discounts;
  //   }

  //   this.orderService.validateOrder(this.orderId,payload).subscribe({
  //     next: () => {
  //       alert('Facture générée avec succès.');
  //       this.router.navigate(['/liste-facture']);
  //     },
  //     error: (err) => {
  //       console.error('Erreur génération facture', err);
  //       console.log("data", payload);
  //       alert('Une erreur est survenue.');
  //     }
  //   });
  // }

// submitInvoice() {
//   const totals = this.calculateTotals();
//   const { paymentAmount, paymentMethod, paymentReference } = this.invoiceForm.value;

//   // Préparer les données pour le PDF
//   const pdfData = {
//     referenceFacture: `FAC-${Date.now()}`,
//     createdAt: new Date(),
//     prixTotal: totals.total,
//     commandeVente: {
//       reference: this.orderDetails.reference,
//       customer: this.orderDetails.customer || null,
//       pieces: this.orderDetails.pieces.map((piece: any) => ({
//         product: {
//           codeArt: piece.product?.codeArt || 'N/A',
//           libelle: piece.product?.libelle || 'Pièce non spécifiée',
//           marque: piece.product?.marque || '-'
//         },
//         prixArticle: piece.prixArticle,
//         quantite: piece.quantite
//       }))
//     },
//     remises: this.discounts,
//     paymentDetails: paymentAmount > 0 ? {
//       amount: paymentAmount,
//       method: paymentMethod,
//       reference: paymentReference
//     } : null
//   };

//   // 1. Générer le PDF d'abord
//   // this.pdfService.generateAndExportPdf(pdfData, 'facture')
//   this.pdfService.exportAsImage(pdfData, 'facture', 'png')
//     .then(() => {
//       // 2. Enregistrer en base après succès du PDF
//       const payload: any = {
//         orderId: this.orderId,
//         referenceFacture: pdfData.referenceFacture,
//         prixTotal: totals.total,
//         remises: this.discounts
//       };

//       if (paymentAmount > 0) {
//         payload.paymentDetails = {
//           amount: paymentAmount,
//           method: paymentMethod,
//           reference: paymentReference,
//           managerId: this.currentManagerId 
//         };
//       }

//       return this.orderService.validateOrder(this.orderId, payload).toPromise();
//     })
//     .then(() => {
//       alert('Facture générée et enregistrée avec succès.');
//       this.router.navigate(['/liste-facture']);
//     })
//     .catch(err => {
//       console.error('Erreur:', err);
//       alert('Une erreur est survenue: ' + err.message);
//     });
// }

submitInvoice() {
  const totals = this.calculateTotals();
  const { paymentAmount, paymentMethod, paymentReference } = this.invoiceForm.value;

  // 1. Préparer le payload comme avant
  const payload: any = {
    orderId: this.orderId,
    referenceFacture: `FAC-${Date.now()}`, // Ajouté pour cohérence
    prixTotal: totals.total // Ajouté pour cohérence
  };

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

  // 2. D'abord envoyer au serveur
  this.orderService.validateOrder(this.orderId, payload).subscribe({
    next: (response) => {
      // 3. Si succès, préparer les données pour le PDF
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
            quantite: piece.quantite
          }))
        },
        subtotal:totals.subtotal,
        remises: totals.discountTotal,
        paymentDetails: paymentAmount > 0 ? {
          amount: paymentAmount,
          method: paymentMethod,
          reference: paymentReference
        } : null
      };

      // 4. Générer le PDF/image (remplacez par votre méthode réelle)
      this.pdfService.exportAsImage(pdfData, 'facture', 'png')
        .then(() => {
          alert('Facture générée et enregistrée avec succès.');
          this.router.navigate(['/liste-facture']);
        })
        .catch(pdfErr => {
          console.error('Erreur génération PDF:', pdfErr);
          alert('Facture enregistrée mais erreur de génération PDF.');
          this.router.navigate(['/liste-facture']);
        });
    },
    error: (err) => {
      console.error('Erreur enregistrement facture:', err);
      alert('Erreur lors de l\'enregistrement de la facture.');
    }
  });
}
  cancel() {
  history.back();
}

//farany control zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
}
