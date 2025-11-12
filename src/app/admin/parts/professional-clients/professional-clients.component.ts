import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProClientService, ProClient, ClientStats } from '../../../service/pro-clients.service';
import { CommandeService } from '../../../service/commande.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-professional-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './professional-clients.component.html',
  styleUrls: ['./professional-clients.component.scss'],
  providers: [ DatePipe ]
})
export class ProfessionalClientsComponent implements OnInit {
  clients: ProClient[] = [];
  filteredClients: ProClient[] = [];
  paginatedClients: ProClient[] = [];
  stats: ClientStats = {
    activeClients: 0,
    growthRate: 0,
    avgRevenue: 0,
    monthlyOrders: 0,
    totalDebt: 0
  };
  
  searchTerm: string = '';
  clientStatusFilter: string = 'all';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  // Modal state
  selectedClient: ProClient | null = null;
  showClientModal: boolean = false;
  isEditMode: boolean = false;
  clientForm: FormGroup;

  selectedCommande: any = null;
  showDetailsModal = false;
  isLoadingDetails = false;
  errorDetails: string | null = null;
  
  constructor(
    private proClientService: ProClientService,
    private fb: FormBuilder,
    private commandeService: CommandeService,
    private datePipe: DatePipe,
  ) {
    this.clientForm = this.fb.group({
      name: [''],
      siret: ['', [Validators.pattern(/^\d{10}$/)]],
      address: [''],
      city: [''],
      activity: [''],
      contactName: [''],
      contactPosition: [''],
      phone: ['', [Validators.pattern(/^\d{10,}$/)]],
      email: ['', [Validators.email]],
      paymentTerms: ['30'],
      creditLimit: [0]
    });
  }
  
  ngOnInit(): void {
    this.loadClients();
    this.loadStats();
  }
  
  loadClients(): void {
    this.proClientService.getProClients(this.searchTerm, this.clientStatusFilter)
      .subscribe({
        next: (clients) => {
          this.clients = clients;
          this.filteredClients = [...clients];
          this.updatePaginatedClients();
        },
        error: (err) => console.error('Error loading clients:', err)
      });
  }
  
  loadStats(): void {
    this.proClientService.getClientStats()
      .subscribe({
        next: (stats) => this.stats = stats,
        error: (err) => console.error('Error loading stats:', err)
      });
  }
  
  filterClients(): void {
    this.currentPage = 1;
    this.loadClients();
  }
  
  updatePaginatedClients(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedClients = this.filteredClients.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  // Pagination methods
  getPageNumbers(): number[] {
    const pageCount = Math.ceil(this.filteredClients.length / this.itemsPerPage);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedClients();
  }
  
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedClients();
    }
  }
  
  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.filteredClients.length) {
      this.currentPage++;
      this.updatePaginatedClients();
    }
  }
  
  // Client actions
  viewClientDetails(client: ProClient): void {
    this.proClientService.getClientDetails(client.id)
      .subscribe({
        next: (details) => this.selectedClient = details,
        error: (err) => console.error('Error loading client details:', err)
      });
  }
  
  openAddClientModal(): void {
    this.isEditMode = false;
    this.clientForm.reset();
    this.showClientModal = true;
  }
  
  
  closeClientModal(): void {
    this.showClientModal = false;
    this.selectedClient = null;
  }
  
openEditModal(client: ProClient): void {
  this.isEditMode = true;
  
  // Parser l'adresse complète en parties séparées
  let address = '';
  let city = '';
  
  if (client.adresse) {
    const addressParts = client.adresse.split(', ');
    if (addressParts.length >= 2) {
      address = addressParts[0];
      city = addressParts[1];
    } else if (addressParts.length === 1) {
      address = addressParts[0];
    }
  }
  
  this.clientForm.patchValue({
    name: client.nom,
    siret: client.siret || '',
    address: address,
    city: city,
    activity: '', // Ces champs n'existent pas dans votre modèle
    contactName: '', // Vous devrez les gérer différemment
    contactPosition: '',
    phone: client.telephone,
    email: client.email || '',
    paymentTerms: '30',
    creditLimit: 0
  });
  
  this.selectedClient = client;
  this.showClientModal = true;
}

// Méthode saveClient corrigée
saveClient(): void {
  const formData = this.clientForm.value;
  
  // Valider seulement les patterns (email, siret, phone)
  const emailControl = this.clientForm.get('email');
  const siretControl = this.clientForm.get('siret');
  const phoneControl = this.clientForm.get('phone');
  
  if (emailControl?.invalid || siretControl?.invalid || phoneControl?.invalid) {
    console.log('Erreurs de format');
    this.clientForm.markAllAsTouched();
    return;
  }
  
  // Préparer les données
  const clientData = {
    name: formData.name || this.selectedClient?.nom,
    siret: formData.siret || this.selectedClient?.siret,
    address: formData.address,
    city: formData.city,
    phone: formData.phone || this.selectedClient?.telephone,
    email: formData.email || this.selectedClient?.email,
    activity: formData.activity,
    contactName: formData.contactName,
    contactPosition: formData.contactPosition,
    paymentTerms: formData.paymentTerms,
    creditLimit: formData.creditLimit
  };
  
  // console.log('Données envoyées:', clientData);
  
  if (this.isEditMode && this.selectedClient) {
    this.proClientService.updateClient(this.selectedClient.id, clientData)
      .subscribe({
        next: (updatedClient) => {
          // console.log('Client mis à jour:', updatedClient);
          this.loadClients();
          this.closeClientModal();
        },
        error: (err) => {
          console.error('Error updating client:', err);
          alert('Erreur lors de la mise à jour du client');
        }
      });
  } else {
    // En mode création, vérifier les champs minimum
    if (!formData.name || !formData.phone) {
      alert('Le nom et le téléphone sont obligatoires');
      return;
    }
    
    this.proClientService.createClient(clientData)
      .subscribe({
        next: (newClient) => {
          // console.log('Client créé:', newClient);
          this.loadClients();
          this.closeClientModal();
        },
        error: (err) => {
          console.error('Error creating client:', err);
          alert('Erreur lors de la création du client');
        }
      });
  }
}
  sendReminder(client: ProClient): void {
    // Implémentez la logique d'envoi de rappel ici
    console.log('Sending reminder to:', client.nom);
    // Vous pourriez appeler un service d'email ou de notification ici
  }
  

  editClient(client: any): void {
    // Exemple de traitement
    console.log('Édition du client :', client);
  }

  // openDetailModal(order: any) {
  //   this.selectedCommande = order;
  //   this.showDetailsModal = true;

  // }

  openDetailModal(order: any): void {
    this.isLoadingDetails = true;
    this.errorDetails = null;
    // console.log('Commande sélectionnée:', order);

    this.commandeService.getProClientCommandeDetails(order.orderId || order.id).subscribe({
      next: (data) => {
        // Maintenant data est l'objet commande directement
        this.selectedCommande = data;
        this.showDetailsModal = true;
        this.isLoadingDetails = false;
        // console.log('Détails commande:', this.selectedCommande);
      },
      error: (err) => {
        console.error('Erreur récupération détails commande', err);
        this.errorDetails = 'Impossible de charger les détails';
        this.isLoadingDetails = false;
      }
    });
  }

  closeModal() {
      this.showDetailsModal = false;
    }

    calculatePieceTotal(piece: any): number {
    return piece.quantite * piece.prixArticle;
  }

  getFactureStatus(facture: any): string {
    switch(facture.status) {
      case 'PAYEE':
        return 'Payée';
      case 'PARTIELLEMENT_PAYEE':
        return 'Partiellement payée';
      case 'NON_PAYEE':
        return facture.montantPaye > 0 ? 'Partiellement payée' : 'Impayée';
      default:
        return facture.resteAPayer === 0 ? 'Payée' : 
              facture.montantPaye > 0 ? 'Partiellement payée' : 'Impayée';
    }
  }

  getStatusColor(facture: any): string {
    if (facture.status === 'PAYEE' || facture.resteAPayer === 0) {
      return 'bg-green-100 text-green-800';
    }
    if (facture.status === 'PARTIELLEMENT_PAYEE' || facture.montantPaye > 0) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-red-100 text-red-800';
  }

  calculateTotal(commande: any): number {
    return commande.pieces?.reduce((sum: number, piece: any) => {
      return sum + (piece.quantite * piece.prixArticle);
    }, 0) || 0;
  }

  formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    return this.datePipe.transform(date, 'dd/MM/yyyy') || 'Format error';
  } catch (e) {
    return 'Erreur';
  }
}
  
}