import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ManagerService } from '../../service/manager.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

// export class MonComposant {
//   myForm = new FormGroup({
//     customerType: new FormControl('')
//   });
// }


enum CustomerType {
  RETAIL = 'RETAIL',
  B2B = 'B2B',
  WHOLESALE = 'WHOLESALE'
}

interface CartItem {
  productId: number;
  reference: string;
  description: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
}

interface InvoicePreview {
  items: {
    productName: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }[];
  subtotal: number;
  discounts: {
    label: string;
    amount: number;
  }[];
  total: number;
  estimatedTax?: number;
}

@Component({
  selector: 'app-order-create',
   standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './order-create.component.html',
  styleUrls: ['./order-create.component.scss']
})
export class OrderCreateComponent {
  orderForm: FormGroup;
  searchResults: any[] = [];
  customerTypes = Object.values(CustomerType);
  cartItems: CartItem[] = [];
  invoicePreview?: InvoicePreview;
  showModal = false;
  isLoading = false;
  currentManagerId = 1; // À remplacer par l'ID réel

  constructor(
    private fb: FormBuilder,
    private managerService: ManagerService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      customerType: [CustomerType.RETAIL, Validators.required],
      customerId: [null],
      searchQuery: [''],
      searchOem: [''],
      searchMarque: [''],
      nom: [''],
      contact: [''],
      nif: ['']
    });
  }

  getCustomerTypeLabel(type: CustomerType): string {
    switch(type) {
      case CustomerType.RETAIL: return 'Client détail';
      case CustomerType.B2B: return 'Professionnel';
      case CustomerType.WHOLESALE: return 'Grossiste';
      default: return '';
    }
  }

  searchParts() {
    const { searchQuery, searchOem, searchMarque } = this.orderForm.value;
    this.isLoading = true;
    
    this.managerService.searchProducts({
      query: searchQuery,
      oem: searchOem,
      marque: searchMarque
    }).subscribe({
      next: (results: any) => {
        this.searchResults = results as any[];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur recherche produits:', err);
        this.isLoading = false;
      }
    });
  }

  addToCart(product: any) {
    const existingItem = this.cartItems.find(item => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity < existingItem.availableStock) {
        existingItem.quantity += 1;
      } else {
        alert('Stock insuffisant');
      }
    } else {
      this.cartItems.push({
        productId: product.id,
        reference: product.referenceCode,
        description: product.libelle,
        unitPrice: product.importDetails[0]?.salePrice || 0,
        quantity: 1,
        availableStock: product.currentStock
      });
    }
  }

  updateQuantity(item: CartItem, event: Event) {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value);
    
    if (!isNaN(newQuantity)) {
      if (newQuantity >= 1 && newQuantity <= item.availableStock) {
        item.quantity = newQuantity;
      } else {
        alert(`La quantité doit être entre 1 et ${item.availableStock}`);
        input.value = item.quantity.toString();
      }
    }
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
  }

  cancelOrder() {
    this.cartItems = [];
    this.orderForm.reset({
      customerType: CustomerType.RETAIL
    });
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  previewInvoice() {
    if (this.cartItems.length === 0) return;

    this.isLoading = true;
    const orderData = this.prepareOrderData();
    
    this.managerService.previewInvoice(orderData).subscribe({
      next: (preview) => {
        this.invoicePreview = this.calculateInvoicePreview(preview);
        this.showModal = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur génération aperçu:', err);
        this.isLoading = false;
      }
    });
  }

  confirmOrder() {
    this.isLoading = true;
    const orderData = this.prepareOrderData();

    this.managerService.createOrder(orderData).subscribe({
      next: (result) => {
        alert(`Commande validée! Référence: ${result.orderId}`);
        this.closeModal();
        this.cancelOrder();
        this.router.navigate(['/manager/invoices', result.invoiceId]);
      },
      error: (err) => {
        console.error('Erreur confirmation:', err);
        this.isLoading = false;
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.invoicePreview = undefined;
  }

  private prepareOrderData() {
    return {
      customerType: this.orderForm.value.customerType,
      customerId: this.orderForm.value.customerId,
      managerId: this.currentManagerId,
      items: this.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      info: {
        nom: this.orderForm.value.nom,
        contact: this.orderForm.value.contact,
        nif: this.orderForm.value.nif,
      },
      totalAmount: this.getTotal(),
      notes: 'Commande via interface manager'
    };
  }

  private calculateInvoicePreview(orderData: any): InvoicePreview {
    const subtotal = this.getTotal();
    let discounts = [];

    if (orderData.customerType === CustomerType.B2B) {
      discounts.push({ label: 'Remise Professionnel', amount: subtotal * 0.1 });
    } else if (orderData.customerType === CustomerType.WHOLESALE) {
      discounts.push({ label: 'Remise Grossiste', amount: subtotal * 0.15 });
    }

    const total = subtotal;

    return {
      items: this.cartItems.map(item => ({
        productName: item.description,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.unitPrice * item.quantity
      })),
      subtotal,
      discounts,
      total,
      estimatedTax: total * 0.2
    };
  }
}