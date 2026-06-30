import { CommonModule } from '@angular/common';
// import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { User } from '../../service/auth.service';
import { Subscription } from 'rxjs';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-admin-sidebar',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent  implements OnInit, OnDestroy {
    showCommande = false;
    isLoggedIn = false;
     user: User | null = null;
     private sub!: Subscription;
     @Output() collapsedChange = new EventEmitter<boolean>();
   
     constructor(private authService: AuthService) {}
   
     ngOnInit(): void {
       this.sub = this.authService.currentUser$.subscribe(user => {
         this.isLoggedIn = !!user;
         this.user = user;
       });
     }
   
     ngOnDestroy(): void {
       this.sub?.unsubscribe();
     }
   
     isAdmin(): boolean {
       const role = this.user?.role;
       return role === 'ADMIN';
     }

     isModerator(): boolean {
      const role = this.user?.role;
      return role === 'MANAGER';
    }

    getRoleLabel(): string {
  const role = this.user?.role;
  if (role === 'ADMIN') return 'Admin';
  if (role === 'MANAGER') return 'Manager';
  return 'Utilisateur'; // ou autre valeur par défaut
}

  
    logout(): void {
      this.authService.logout();
    }

    isCollapsed = false;

    toggleSidebar(): void {
      this.isCollapsed = !this.isCollapsed;
      this.collapsedChange.emit(this.isCollapsed);

      if (this.isCollapsed) {
        this.showCommande = false;
      }
    }

    isSidebarCollapsed = false;

    onSidebarCollapsedChange(isCollapsed: boolean): void {
      this.isSidebarCollapsed = isCollapsed;
    }

  toggleCommandeMenu(): void {
    if (this.isCollapsed) {
      return;
    }

    this.showCommande = !this.showCommande;
  }
}
