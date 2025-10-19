import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../service/user.service';
import { User, CreateUserDto } from '../../../models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    FormsModule, CommonModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  isModalOpen = false;
  isEditMode = false;
  currentUser: any = {};
  isLoading = false;
  successMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers(this.page, this.pageSize).subscribe({
      next: (response) => {
        this.users = response.users;
        this.total = response.total;
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentUser = { name: '', email: '', role: 'USER', password: '' };
    this.isModalOpen = true;
    this.successMessage = ''; // Reset message
  }

  openEditModal(user: any): void {
    this.isEditMode = true;
    this.currentUser = { ...user };
    this.isModalOpen = true;
    this.successMessage = ''; // Reset message
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.currentUser = { name: '', email: '', role: 'USER', password: '' };
  }

saveUser(): void {
  if (this.isLoading) return;

  this.isLoading = true;
  const isEdit = this.isEditMode;

  const userPayload = isEdit
    ? {
        name: this.currentUser.name,
        email: this.currentUser.email,
        role: this.currentUser.role
      }
    : {
        name: this.currentUser.name,
        email: this.currentUser.email,
        role: this.currentUser.role,
        password: this.currentUser.password
      };

  console.log('Payload envoyé :', userPayload);

  const operation = isEdit
    ? this.userService.updateUser(this.currentUser.id, userPayload)
    : this.userService.createUser(userPayload);

  operation.subscribe({
    next: (response: any) => {
      console.log('Réponse API:', response);
      
      // Gérer la réponse selon le format de votre API
      if (response.user) {
        // Si l'API retourne { message: "...", user: {...} }
        this.loadUsers(); // Recharger la liste
        this.closeModal();
        this.showSuccessMessage(
          isEdit 
            ? 'Utilisateur modifié avec succès!' 
            : 'Utilisateur créé avec succès!'
        );
      } else {
        // Si l'API retourne l'utilisateur directement
        this.loadUsers();
        this.closeModal();
        this.showSuccessMessage(
          isEdit 
            ? 'Utilisateur modifié avec succès!' 
            : 'Utilisateur créé avec succès!'
        );
      }
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Erreur lors de la sauvegarde :', error);
      this.isLoading = false;
      // Optionnel: afficher un message d'erreur
      // this.showErrorMessage('Erreur lors de la sauvegarde');
    }
  });
}

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    // Optionnel: cacher le message après 3 secondes
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
          this.showSuccessMessage('Utilisateur supprimé avec succès!');
        },
        error: (error) => console.error('Error deleting user:', error)
      });
    }
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadUsers();
  }

  getRoleBadgeClass(role: string): string {
    const baseClass = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch(role) {
      case 'ADMIN':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'MANAGER':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClass} bg-green-100 text-green-800`;
    }
  }
}