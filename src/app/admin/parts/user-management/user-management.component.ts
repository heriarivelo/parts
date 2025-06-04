import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../service/user.service';
import { User, CreateUserDto } from '../../../models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone:true,
  imports: [
    FormsModule, CommonModule // Ajoutez cette ligne
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  isModalOpen = false;
  isEditMode = false;
  currentUser: any = {};

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
    this.currentUser = { name: '', email: '', role: 'USER' };
    this.isModalOpen = true;
  }

  openEditModal(user: any): void {
    this.isEditMode = true;
    this.currentUser = { ...user };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  // saveUser(): void {
  //   const operation = this.isEditMode 
  //     ? this.userService.updateUser(this.currentUser.id, this.currentUser)
  //     : this.userService.createUser(this.currentUser);
  //     console.log('users',this.currentUser );

  //   operation.subscribe({
  //     next: () => {
  //       this.loadUsers();
  //       this.closeModal();
  //     },
  //     error: (error) => console.error('Error saving user:', error)
  //   });
  // }

  saveUser(): void {
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
        password: this.currentUser.password // 🟡 requis uniquement à la création
      };

  const operation = isEdit
    ? this.userService.updateUser(this.currentUser.id, userPayload)
    : this.userService.createUser(userPayload);

  console.log('Payload envoyé :', userPayload);

  operation.subscribe({
    next: () => {
      this.loadUsers();
      this.closeModal();
    },
    error: (error) => console.error('Erreur lors de la sauvegarde :', error)
  });
}


  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
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