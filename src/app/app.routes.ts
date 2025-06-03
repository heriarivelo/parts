import { Routes } from '@angular/router';
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

import { ArcticlesMComponent } from './manager/parts/articles/articles.component';
import { DashboardsMComponent } from './manager/parts/dashboards/dashboards.component';
import { CommandeMComponent } from './manager/parts/Commande/commande.component';
import { NewMComponent } from './manager/parts/Commande/new/new.component';
import { FactureMComponent } from './manager/parts/Facture/facture.component';
import { FactureMDComponent } from './manager/parts/Facture/Detaille/factureD.component';
import { StocksMComponent } from './manager/parts/stocks/stocks.component';
import { EntrepotComponent } from './admin/parts/entrepot/entrepot.component';
import { ProduitComponent } from './admin/parts/produit/produit.component';
import { ImportListComponent } from './admin/parts/import-list/import-list.component';
import { InvoiceCreateComponent } from './manager/invoice-create/invoice-create.component';
import { OrderCreateComponent } from './manager/order-create/order-create.component';
import { StockDashboardComponent } from './manager/stock-dashboard/stock-dashboard.component';
import { HistoriqueCommandesComponent } from './admin/historique/historique-commandes/historique-commandes.component';
import { StockHistoryComponent } from './admin/historique/stock-history/stock-history.component';
import { InvoiceListComponent } from './manager/invoice-list/invoice-list.component';
import { CommandeVenteListComponent } from './manager/commande-vente-list/commande-vente-list.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'admin-stocks', component: StocksComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'admin-tableau-de-bord', component: DashboardsMComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'admin-calculatrice-prix', component: CalculatriceComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'admin-commande', component: CommandesFournisseursComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'admin-gestion-users', component: UserManagementComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'admin-clients-pro', component: ProfessionalClientsComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'entrepot' , component: EntrepotComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'importation-historique' , component: ImportListComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },


  { path: 'manager/article', component: ArcticlesMComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER']} },
  { path: 'manager/tableau-de-bord', component: DashboardsComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER']} },
  { path: 'manager/commande', component: CommandeMComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER']} },
  { path: 'manager/commande/new', component: NewMComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER']} },
  { path: 'manager/facture', component: FactureMComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER']} },
  { path: 'manager/facture/D', component: FactureMDComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER']} },
  { path: 'manager/stock' , component: StocksMComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER']} },


  { path: 'manager/invoice/:commandeId' , component: InvoiceCreateComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER']} },
  { path: 'manager/order' , component: OrderCreateComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER']} },
  { path: 'manager/stocks' , component: StockDashboardComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER']} },




  { path: 'inventaire-piece' , component: ProduitComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER' , 'ADMIN']} },
  { path: 'historique-commandes' , component: HistoriqueCommandesComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER' , 'ADMIN']} },
  { path: 'historique-stocks' , component: StockHistoryComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER' , 'ADMIN']} },
  { path: 'liste-facture' , component: InvoiceListComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER' , 'ADMIN']} },
  { path: 'liste-commandes' , component: CommandeVenteListComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER' , 'ADMIN']} },








  // { 
  //   path: 'admin', 
  //   component: AdminDashboardComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN'] }
  // },

  // Ajoutez d'autres routes ici
  { path: '**', redirectTo: '' } // Redirige vers la page d'accueil pour les routes non trouvées
];
