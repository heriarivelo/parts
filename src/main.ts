import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { StocksComponent } from './app/admin/parts/stocks/stocks.component';
import { DashboardsComponent } from './app/admin/parts/dashboards/dashboards.component';
import { CalculatriceComponent } from './app/admin/parts/calculatriceprix/calculatrice.component';
// import { AboutComponent } from './app/about.component';


import { AuthGuard } from '../src/app/guards/auth.guard';
import { RoleGuard } from '../src/app/guards/role.guard';
import { LoginComponent } from './app/pages/login/login.component';
import { RegisterComponent } from './app/pages/register/register.component';
import { CommandesFournisseursComponent } from './app/admin/parts/commandes-fournisseurs/commandes-fournisseurs.component';
import { UserManagementComponent } from './app/admin/parts/user-management/user-management.component';
import { ProfessionalClientsComponent } from './app/admin/parts/professional-clients/professional-clients.component';

import { ArcticlesMComponent } from './app/manager/parts/articles/articles.component';
import { DashboardsMComponent } from './app/manager/parts/dashboards/dashboards.component';
import { CommandeMComponent } from './app/manager/parts/Commande/commande.component';
import { NewMComponent } from './app/manager/parts/Commande/new/new.component';
import { FactureMComponent } from './app/manager/parts/Facture/facture.component';
import { FactureMDComponent } from './app/manager/parts/Facture/Detaille/factureD.component';
import { StocksMComponent } from './app/manager/parts/stocks/stocks.component';
import { EntrepotComponent } from './app/admin/parts/entrepot/entrepot.component';
import { ProduitComponent } from './app/admin/parts/produit/produit.component';
import { ImportListComponent } from './app/admin/parts/import-list/import-list.component';
import { InvoiceCreateComponent } from './app/manager/invoice-create/invoice-create.component';
import { OrderCreateComponent } from './app/manager/order-create/order-create.component';
import { StockDashboardComponent } from './app/manager/stock-dashboard/stock-dashboard.component';
import { HistoriqueCommandesComponent } from './app/admin/historique/historique-commandes/historique-commandes.component';
import { StockHistoryComponent } from './app/admin/historique/stock-history/stock-history.component';
import { InvoiceListComponent } from './app/manager/invoice-list/invoice-list.component';
import { CommandeVenteListComponent } from './app/manager/commande-vente-list/commande-vente-list.component';


const routes: Routes = [
  { path: '', component: LoginComponent },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'admin-stocks', component: StocksComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'admin-tableau-de-bord', component: DashboardsMComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'admin-calculatrice-prix', component: CalculatriceComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'admin-commande', component: CommandesFournisseursComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'admin-gestion-users', component: UserManagementComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'admin-clients-pro', component: ProfessionalClientsComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'entrepot' , component: EntrepotComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },
  { path: 'importation-historique' , component: ImportListComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN']} },


    { path: 'manager/article', component: ArcticlesMComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER']} },
    { path: 'manager/tableau-de-bord', component: DashboardsComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER', 'ADMIN']} },
    { path: 'manager/commande', component: CommandeMComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER', 'ADMIN']} },
    { path: 'commande/specifique', component: NewMComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['ADMIN', 'ADMIN']} },
    { path: 'manager/facture', component: FactureMComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER', 'ADMIN']} },
    { path: 'manager/facture/D', component: FactureMDComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER', 'ADMIN']} },
    { path: 'manager/stock' , component: StocksMComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER', 'ADMIN']} },


    { path: 'manager/invoice/:commandeId' , component: InvoiceCreateComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER', 'ADMIN']} },
    { path: 'manager/order' , component: OrderCreateComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER', 'ADMIN']} },
    { path: 'manager/stocks' , component: StockDashboardComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER', 'ADMIN']} },





    { path: 'inventaire-piece' , component: ProduitComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER' , 'ADMIN']} },
    { path: 'historique-commandes' , component: HistoriqueCommandesComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER' , 'ADMIN']} },
    { path: 'historique-stocks' , component: StockHistoryComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER' , 'ADMIN']} },
    { path: 'liste-facture' , component: InvoiceListComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER' , 'ADMIN']} },
    { path: 'liste-commandes' , component: CommandeVenteListComponent,canActivate: [AuthGuard, RoleGuard],data: { roles: ['MANAGER' , 'ADMIN']} },




    



  // Ajoutez d'autres routes ici
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ]
});
