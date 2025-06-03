import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string | null = null;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.isLoading = true;
    this.error = null;
  
    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        // user est garanti de type User ici (pas null)
        this.redirectBasedOnRole(user.role);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Échec de la connexion';
        this.isLoading = false;
      }
    });
  }

  private redirectBasedOnRole(role: string): void {
    const routes: Record<string, string> = {
      'ADMIN': '/admin-tableau-de-bord',
      'MANAGER': '/manager/order',
      'CLIENT': '/client',
      'USER': '/profile'
    };
    this.router.navigate([routes[role] || '/']);
  }
}