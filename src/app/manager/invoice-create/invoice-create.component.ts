import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvoiceService } from '../../service/invoice.service';
import { CommandeService } from '../../service/commande.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';


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

  submitInvoice() {
    const totals = this.calculateTotals();
    const { paymentAmount, paymentMethod, paymentReference } = this.invoiceForm.value;

    const payload: any = {
      orderId: this.orderId,
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

    this.orderService.validateOrder(this.orderId,payload).subscribe({
      next: () => {
        alert('Facture générée avec succès.');
        this.router.navigate(['/liste-facture']);
      },
      error: (err) => {
        console.error('Erreur génération facture', err);
        console.log("data", payload);
        alert('Une erreur est survenue.');
      }
    });
  }

  cancel() {
  history.back();
}

//farany control zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
}
