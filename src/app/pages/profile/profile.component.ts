import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  user: any = null;

  isLoading = false;
  isSavingProfile = false;
  isChangingPassword = false;

  successMessage = '';
  errorMessage = '';

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: UserService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  loadProfile(): void {
    this.isLoading = true;

    this.authService.getMyProfile().subscribe({
      next: (user) => {
        this.user = user;

        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors du chargement du profil.';
        this.isLoading = false;
      },
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.clearMessages();
    this.isSavingProfile = true;

    this.authService.updateMyProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.user = res.user;
        this.successMessage = res.message || 'Profil mis à jour avec succès.';
        this.isSavingProfile = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erreur lors de la mise à jour du profil.';
        this.isSavingProfile = false;
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Les nouveaux mots de passe ne correspondent pas.';
      return;
    }

    this.clearMessages();
    this.isChangingPassword = true;

    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Mot de passe modifié avec succès.';
        this.passwordForm.reset();
        this.isChangingPassword = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erreur lors du changement de mot de passe.';
        this.isChangingPassword = false;
      },
    });
  }

  getRoleLabel(role: string): string {
    if (role === 'ADMIN') return 'Administrateur';
    if (role === 'MANAGER') return 'Manager';
    return 'Utilisateur';
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}