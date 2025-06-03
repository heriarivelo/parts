import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { AdminSidebarComponent } from '../admin/admin-sidebar/admin-sidebar.component';
import { CommonModule } from '@angular/common';
import { User } from '../service/auth.service';
import { Subscription } from 'rxjs';

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

  isAdminOrModerator(): boolean {
    const role = this.user?.role;
    return role === 'ADMIN' || role === 'MANAGER';
  }

  logout(): void {
    this.authService.logout();
  }
}
