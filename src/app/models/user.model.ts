export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'USER' | 'CLIENT';
    password: string;
  }

  export type CreateUserDto = Omit<User, '_id' | 'createdAt' | 'updatedAt'>;
  
  // Pour la mise à jour (tous les champs optionnels sauf _id)
  export type UpdateUserDto = Partial<Omit<User, '_id'>> & { _id: string };