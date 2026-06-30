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
  confirmPassword = '';
  role: string = 'USER'; // Valeur par défaut
  error: string | null = null;
  isLoading: boolean = false;
  success: boolean = false;

  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      alert('Les mots de passe ne correspondent pas !');
      return;
    }
    this.isLoading = true;
    this.error = null;
    this.success = false;

    this.authService.register(this.name, this.email, this.password, this.role).subscribe({
      next: () => {
        this.success = true;
        // console.log('SUCCESS', res);
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || "Erreur lors de l'inscription";
        this.isLoading = false;
      }
    });
  }
}