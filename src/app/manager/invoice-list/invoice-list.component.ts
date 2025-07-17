import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../../service/invoice.service';
import { Invoice } from '../../models/invoice.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommandeService } from '../../service/commande.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../service/auth.service';
// import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, CommonModule, FormsModule ],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
  // providers: [DatePipe]
})
export class InvoiceListComponent implements OnInit {
 
  factures: Invoice[] = [];
  isLoading = true;
  error: string | null = null;
  showPaiementModal = false;
  selectedFacture: Invoice | null = null;
  paiementMontant = 0;
  paiementMethode = 'CASH';
    filteredFactures: Invoice[] = [];
  searchTerm = '';
  statusFilter = 'TOUS';
showDetailsModal = false;

  constructor(
    private factureService: InvoiceService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadFactures();
  }

    loadFactures(): void {
    this.isLoading = true;
    this.factureService.getFactures().subscribe({
      next: (factures) => {
        this.factures = factures;
        this.filterFactures();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.isLoading = false;
      }
    });
  }

  filterFactures(): void {
    this.filteredFactures = this.factures.filter(facture => {
      const matchesSearch = facture.referenceFacture.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        facture.commandeVente.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (facture.commandeVente.customer?.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false);
      
      const matchesStatus = this.statusFilter === 'TOUS' || 
        facture.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  // calculateRemiseTotale(facture: Invoice): number {
  //   return facture.remises.reduce((sum, remise) => sum + remise.montant, 0);
  // }

  calculateRemiseTotale(facture: Invoice): number {
  return facture.remises.reduce((sum, remise) => {
    if (remise.type === 'POURCENTAGE' && remise.taux) {
      // Calculer le montant de la remise en pourcentage
      const montantPourcentage = (facture.commandeVente.totalAmount * remise.taux) / 100;
      return sum + montantPourcentage;
    } else if (remise.montant) {
      // Utiliser le montant fixe directement
      return sum + remise.montant;
    }
    return sum;
  }, 0);
}

  updateStatus(facture: Invoice): void {
    // Logique pour mettre à jour le statut
    if (facture.resteAPayer == 0) {
      facture.status = 'PAYEE';
    } else if (facture.montantPaye > 0) {
      facture.status = 'PARTIELLE';
    } else {
      facture.status = 'NON_PAYEE';
    }
  }
  

  onSearchChange(): void {
    this.filterFactures();
  }

  onStatusFilterChange(): void {
    this.filterFactures();
  }

openDetailsModal(facture: Invoice): void {
  this.selectedFacture = facture;
  this.showDetailsModal = true;
}

  // loadFactures(): void {
  //   this.isLoading = true;
  //   this.factureService.getFactures().subscribe({
  //     next: (factures) => {
  //       this.factures = factures;
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       this.error = 'Échec du chargement des factures';
  //       this.isLoading = false;
  //     }
  //   });
  // }

  openPaiementModal(facture: Invoice): void {
    this.selectedFacture = facture;
    this.paiementMontant = facture.resteAPayer;
    this.showPaiementModal = true;
  }

  // submitPaiement(): void {
  //   if (!this.selectedFacture) return;

  //   this.factureService.enregistrerPaiement(
  //     this.selectedFacture.id,
  //     this.paiementMontant,
  //     this.paiementMethode
  //   ).subscribe({
  //     next: () => {
  //       this.loadFactures();
  //       this.showPaiementModal = false;
  //     },
  //     error: () => alert('Erreur lors de l\'enregistrement du paiement')
  //   });
  // }

 // invoice-list.component.ts
submitPaiement(): void {
  if (!this.selectedFacture) return;

  const paymentData = {
    montant: this.paiementMontant,
    mode: this.paiementMethode,
    reference: `PAY-${Date.now()}`
  };

  // console.log('📦 Données envoyées:', paymentData);

  this.factureService.enregistrerPaiement(
    this.selectedFacture.id,
    paymentData
  ).subscribe({
    next: () => {
      this.loadFactures();
      this.showPaiementModal = false;
      alert('Paiement enregistré!');
    },
    error: (err) => {
      console.error('Erreur complète:', err);
      alert(err.error?.error || 'Échec du paiement');
    }
  });
}

  // getStatusClass(status: string): string {
  //   const classes: Record<string, string> = {
  //     'PAYEE': 'bg-green-100 text-green-800',
  //     'PARTIELLEMENT_PAYEE': 'bg-blue-100 text-blue-800',
  //     'NON_PAYEE': 'bg-red-100 text-red-800',
  //     'ANNULEE': 'bg-gray-100 text-gray-800',
  //   };
  //   return classes[status] || 'bg-gray-100 text-gray-800';
  // }

    getStatusClass(status: string): string {
    switch (status) {
      case 'ANNULEE': return 'bg-yellow-100 text-yellow-800';
      case 'PARTIELLEMENT_PAYEE': return 'bg-blue-100 text-blue-800';
      case 'PAYEE': return 'bg-green-100 text-green-800';
      case 'NON_PAYEE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getProgression(facture: Invoice): number {
    return (facture.montantPaye / facture.prixTotal) * 100;
  }
  

   canCancel(facture: any): boolean {
    return facture?.status !== 'ANNULEE' && this.authService.hasRole('ADMIN');
  }

get userId(): number | null {
  const id = this.authService.currentUserValue?.id;
  return id ? Number(id) : null;
}

async annulerFacture(factureId: number, raison: string = 'Annulation par l\'admin'): Promise<void> {
  const confirmation = confirm('Êtes-vous sûr de vouloir annuler cette facture ?');
  if (!confirmation) {
    return;
  }

  const userId = this.userId;
  if (userId === null) {
    alert('Utilisateur non identifié.');
    return;
  }

  try {
    await this.factureService.annulerFacture(factureId, raison, userId).toPromise();
    alert('Facture annulée avec succès');
    this.loadFactures();
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la facture :', error);
    alert('Une erreur est survenue lors de l\'annulation de la facture.');
  }
}

}