import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProClientService, ProClient, ClientStats } from '../../../service/pro-clients.service';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// interface ProfessionalClient {
//   id: number;
//   name: string;
//   siret: string;
//   address: string;
//   postalCode: string;
//   city: string;
//   activity: string;
//   contactName: string;
//   contactPosition: string;
//   phone: string;
//   email: string;
//   revenue: number;
//   orderCount: number;
//   lastOrderDate: Date;
//   balanceDue: number;
//   status: 'Actif' | 'Inactif' | 'En retard';
//   paymentTerms: number;
//   creditLimit: number;
//   lastOrders: {
//     orderNumber: string;
//     date: Date;
//     amount: number;
//     status: 'Payé' | 'En attente' | 'En retard';
//   }[];
//   notes: {
//     author: string;
//     date: Date;
//     content: string;
//   }[];
// }

@Component({
  selector: 'app-professional-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './professional-clients.component.html',
  styleUrls: ['./professional-clients.component.scss']
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
  
  constructor(
    private proClientService: ProClientService,
    private fb: FormBuilder,
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      siret: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      address: ['', Validators.required],
      postalCode: ['', Validators.required],
      city: ['', Validators.required],
      activity: ['', Validators.required],
      contactName: ['', Validators.required],
      contactPosition: [''],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
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
  
  openEditModal(client: ProClient): void {
    this.isEditMode = true;
    this.clientForm.patchValue({
      name: client.nom,
      siret: client.siret,
      address: client.address,
      postalCode: client.postalCode,
      city: client.city,
      activity: client.activity,
      contactName: client.contactName,
      contactPosition: client.contactPosition,
      phone: client.telephone,
      email: client.email,
      paymentTerms: client.paymentTerms?.toString() || '30',
      creditLimit: client.creditLimit || 0
    });
    this.selectedClient = client;
    this.showClientModal = true;
  }
  
  closeClientModal(): void {
    this.showClientModal = false;
    this.selectedClient = null;
  }
  
  saveClient(): void {
    if (this.clientForm.invalid) {
    console.log('Formulaire invalide :', this.clientForm.errors);
    this.clientForm.markAllAsTouched(); // Force l'affichage des erreurs
    return;
  }
    
    const clientData = this.clientForm.value;
    console.log(clientData,'client');
    
    if (this.isEditMode && this.selectedClient) {
      this.proClientService.updateClient(this.selectedClient.id, clientData)
        .subscribe({
          next: () => {
            this.loadClients();
            this.closeClientModal();
          },
          error: (err) => console.error('Error updating client:', err)
        });
    } else {
      this.proClientService.createClient(clientData)
        .subscribe({
          next: () => {
      console.log('clientdata', clientData);
            this.loadClients();
            this.closeClientModal();
          },
          error: (err) => console.error('Error creating client:', err)
        });
    }
  }
  
  sendReminder(client: ProClient): void {
    // Implémentez la logique d'envoi de rappel ici
    console.log('Sending reminder to:', client.nom);
    // Vous pourriez appeler un service d'email ou de notification ici
  }
  
  exportToExcel(): void {
    // Implémentez l'export Excel ici
    console.log('Exporting clients to Excel');
  }

  editClient(client: any): void {
    // Exemple de traitement
    console.log('Édition du client :', client);
  }
  

  // exportToExcel(): void {
  //   // Implémenter l'export Excel
  //   console.log('Export des clients vers Excel');
  // }
}