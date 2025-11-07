import { Component, OnInit, OnDestroy, Directive, ElementRef, EventEmitter, HostListener, Output  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { AdminSidebarComponent } from '../admin/admin-sidebar/admin-sidebar.component';
import { CommonModule } from '@angular/common';
import { User } from '../service/auth.service';
import { Subscription } from 'rxjs';
import { StockService } from '../service/stock.service';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent,CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  user: User | null = null;
  private sub!: Subscription;
  showProfileMenu = false;
  showParamMenu =false;
  

  constructor(private authService: AuthService,
    private stockService: StockService,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  isAdminOrModerator(): boolean {
    const role = this.user?.role;
    return role === 'ADMIN' || role === 'MANAGER';
  }

   isAdmin(): boolean {
    const role = this.user?.role;
    return role === 'ADMIN';
  }

  logout(): void {
    this.authService.logout();
  }

    loading = false;

  // constructor(private adminToolsService: AdminToolsService) {}

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

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (!this.showProfileMenu) {
      this.showParamMenu = false;
    }
  }

  toggleParamMenu() {
    this.showParamMenu = !this.showParamMenu;
  }

  closeMenus() {
    this.showProfileMenu = false;
    this.showParamMenu = false;
  }

    @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Vérifie si le clic est à l'intérieur du menu
    if (!this.elRef.nativeElement.contains(target)) {
      this.closeMenus();
    }
  }

}
