import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntrepotService } from '../../../../../service/entrepot.service';

@Component({
  selector: 'app-transfer-stock-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer-stock-modal.component.html',
})
export class TransferStockModalComponent implements OnInit {
  @Input() selectedStock: any;
  @Input() selectedBox: any;
  @Input() boxes: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() transferred = new EventEmitter<void>();

  transferForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private entrepotService: EntrepotService
  ) {
    this.transferForm = this.fb.group({
      stockId: ['', Validators.required],
      fromEntrepotId: ['', Validators.required],
      toEntrepotId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {
    this.transferForm.patchValue({
      stockId: this.selectedStock?.id,
      fromEntrepotId: this.selectedBox?.id,
      quantity: this.selectedStock?.quantite
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  submitTransfer(): void {
    this.errorMessage = '';

    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    this.isLoading = true;

    this.entrepotService.transferStock(this.transferForm.value).subscribe({
      next: () => {
        this.transferred.emit();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors du transfert.';
      }
    }).add(() => {
      this.isLoading = false;
    });
  }
}