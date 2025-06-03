import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-articles-manager',
  imports: [
    CommonModule,
  ],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss'
})
export class ArcticlesMComponent {
    article = {
        imageUrl: '', 
        nom: 'Plaquettes de frein BOSCH',
        reference: 'FR-BO-2342',
        prixAchat: 45.00,
        tauxChange: 4800,
        fraisPort: 12.50,
        douane: 20,
        marge: 25,
        prixVente: 342000,
        margeMGA: 87000
      };
      imagePreview: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  onSelectImage() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        // 👉 Tu peux aussi enregistrer automatiquement l'image ici si besoin
        // this.uploadImage(file);
      };
      reader.readAsDataURL(file);
    }
  }
}