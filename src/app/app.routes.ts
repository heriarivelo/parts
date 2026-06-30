import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { CalculatriceComponent } from './admin/parts/calculatriceprix/calculatrice.component';
import { StocksComponent } from './admin/parts/stocks/stocks.component';
import { DashboardsComponent } from './admin/parts/dashboards/dashboards.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';


import { AuthGuard } from '../app/guards/auth.guard';
import { RoleGuard } from '../app/guards/role.guard';
import { CommandesFournisseursComponent } from './admin/parts/commandes-fournisseurs/commandes-fournisseurs.component';
import { UserManagementComponent } from './admin/parts/user-management/user-management.component';
import { ProfessionalClientsComponent } from './admin/parts/professional-clients/professional-clients.component';
import { CommandeParticuliereComponent } from './admin/commandes/commande-particuliere/commande-particuliere.component';

import { DashboardsMComponent } from './manager/parts/dashboards/dashboards.component';
import { EntrepotComponent } from './admin/parts/entrepot/entrepot.component';
import { ProduitComponent } from './admin/parts/produit/produit.component';
import { ImportListComponent } from './admin/parts/import-list/import-list.component';
import { InvoiceCreateComponent } from './manager/invoice-create/invoice-create.component';
import { OrderCreateComponent } from './manager/order-create/order-create.component';
import { HistoriqueCommandesComponent } from './admin/historique/historique-commandes/historique-commandes.component';
import { StockHistoryComponent } from './admin/historique/stock-history/stock-history.component';
import { InvoiceListComponent } from './manager/invoice-list/invoice-list.component';
import { CommandeVenteListComponent } from './manager/commande-vente-list/commande-vente-list.component';

import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
    {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      // { path: 'a-propos', component: AboutComponent },
      // { path: 'contact', component: ContactComponent },
    ],
  },

  {
    path: '',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },

  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'admin-reapprovisionnements', component: StocksComponent,data: { roles: ['ADMIN']} },
      { path: 'admin-tableau-de-bord', component: DashboardsMComponent, data: { roles: ['ADMIN']} },
      { path: 'admin-calculatrice-prix', component: CalculatriceComponent, data: { roles: ['ADMIN']} },
      { path: 'admin-commande', component: CommandesFournisseursComponent, data: { roles: ['ADMIN']} },
      { path: 'admin-gestion-users', component: UserManagementComponent, data: { roles: ['ADMIN']} },
      { path: 'admin-clients-pro', component: ProfessionalClientsComponent, data: { roles: ['ADMIN']} },
      { path: 'entrepot' , component: EntrepotComponent, data: { roles: ['ADMIN']} },
      { path: 'importation-historique' , component: ImportListComponent, data: { roles: ['ADMIN']} },
      // { path: 'manager/tableau-de-bord', component: DashboardsComponent },
      { path: 'commande/specifique', component: CommandeParticuliereComponent, data: { roles: ['ADMIN']} },

      { path: 'manager/invoice/:commandeId' , component: InvoiceCreateComponent },
      { path: 'manager/order' , component: OrderCreateComponent },


      { path: 'inventaire-piece' , component: ProduitComponent },
      { path: 'historique-commandes' , component: HistoriqueCommandesComponent },
      { path: 'historique-stocks' , component: StockHistoryComponent },
      { path: 'liste-facture' , component: InvoiceListComponent },
      { path: 'liste-commandes' , component: CommandeVenteListComponent },
    ],
  },






  // { 
  //   path: 'admin', 
  //   component: AdminDashboardComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN'] }
  // },

  // Ajoutez d'autres routes ici
  { path: '**', redirectTo: '' } // Redirige vers la page d'accueil pour les routes non trouvées
];
