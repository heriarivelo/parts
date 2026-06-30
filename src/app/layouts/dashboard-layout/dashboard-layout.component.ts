import { Component, OnInit, OnDestroy, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { AuthService, User } from '../../service/auth.service';
import { StockService } from '../../service/stock.service';
import { AdminSidebarComponent } from '../../admin/admin-sidebar/admin-sidebar.component';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, CommonModule, RouterLink],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  user: User | null = null;

  showProfileMenu = false;
  showParamMenu = false;
  loading = false;

  private sub?: Subscription;

  constructor(
    private authService: AuthService,
    private stockService: StockService,
    private elRef: ElementRef,
    private router: Router
  ) {}

  @ViewChild('profileMenuContainer')
profileMenuContainer!: ElementRef;

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.user = user;
    });
    this.updatePageTitle(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updatePageTitle(event.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }

  logout(): void {
    this.authService.logout();
  }

  clearDatabase(): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les données sauf les utilisateurs ?')) {
      return;
    }

    this.loading = true;

    this.stockService.clearDatabase().subscribe({
      next: (res) => {
        alert(res.message || 'Base nettoyée !');
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors du nettoyage');
        this.loading = false;
      },
    });
  }

  toggleProfileMenu(event?: Event) {
  event?.stopPropagation();
  this.showProfileMenu = !this.showProfileMenu;
}

  toggleParamMenu(): void {
    this.showParamMenu = !this.showParamMenu;
  }

  closeMenus(): void {
    this.showProfileMenu = false;
    this.showParamMenu = false;
  }


@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  if (
    this.profileMenuContainer &&
    !this.profileMenuContainer.nativeElement.contains(event.target)
  ) {
    this.showProfileMenu = false;
    this.showParamMenu = false;
  }
}


  isSidebarCollapsed = false;

  onSidebarCollapsedChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  getRoleLabel(): string {
    const role = this.user?.role;

    if (role === 'ADMIN') return 'Admin';
    if (role === 'MANAGER') return 'Manager';

    return 'Utilisateur';
  }

  pageTitle = 'Tableau de bord';

  private pageTitles: Record<string, string> = {
    '/admin-tableau-de-bord': 'Tableau de bord',
    '/inventaire-piece': 'Gestion des stocks',
    '/admin-reapprovisionnements': 'Réapprovisionnement',
    '/historique-stocks': 'Mouvements de stock',
    '/manager/order': 'Création commande',
    '/liste-commandes': 'Liste des commandes',
    '/historique-commandes': 'Historique des commandes',
    '/liste-facture': 'Liste des factures',
    '/admin-commande': 'Commandes fournisseurs',
    '/entrepot': 'Gestion des entrepôts',
    '/importation-historique': 'Historique importations',
    '/admin-gestion-users': 'Utilisateurs',
    '/admin-clients-pro': 'Clients professionnels',
    '/admin-calculatrice-prix': 'Calculatrice de prix',
    '/profile': 'Mon profil',
  };

  private updatePageTitle(url: string): void {
    const cleanUrl = url.split('?')[0];

    this.pageTitle = this.pageTitles[cleanUrl] || 'KaleoParts';
  }
  
}