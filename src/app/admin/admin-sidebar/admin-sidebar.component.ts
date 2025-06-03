import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { User } from '../../service/auth.service';
import { Subscription } from 'rxjs';


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
}
