import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  role: string = 'CLIENT'; // Valeur par défaut
  error: string | null = null;
  isLoading: boolean = false;
  success: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.isLoading = true;
    this.error = null;
    this.success = false;

    this.authService.register(this.name, this.email, this.password, this.role).subscribe({
      next: () => {
        this.success = true;
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/profile']), 2000);
      },
      error: (err) => {
        this.error = err.error?.message || "Erreur lors de l'inscription";
        this.isLoading = false;
      }
    });
  }
}