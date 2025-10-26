export interface Stock {
    id: number;
    codeArt: string;
    lib1: string;
    quantite: number;
    quantiteVendu: number;
    prixFinal: number;
    status: 'DISPONIBLE' | 'RUPTURE' | 'COMMANDE' | 'PREORDER' | 'RESERVE' | 'RETOUR' | 'DEFECTUEUX';
    product: {
      marque?: string;
      oem?: string;
      autoFinal?: string;
      lib?: string;
    };
  }

  export interface Order {
  id: number;
   reference: string;
  createdAt: string; 
  status: 'DRAFT' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  supplier: Supplier;
  items: OrderItem[];
  
}

export interface OrderItem {
  id: number;
  reference: string;
  name: string;
  quantity: number;
  unitPrice: number;
  weightKg?: number;
  notes?: string;
    product?: {  // Ajoutez cette propriété optionnelle
    id: number;
    codeArt:string;
    marque: string;
    referenceCode?: string;
    libelle: string;
    // autres propriétés du produit...
  };
}

export interface Supplier {
  id: number;
  name: string;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalAmount: number;
  pendingOrders: number;
  supplierCount: number;
}

export interface PaginatedOrders {
   orders: Order[]; 
  total: number;
  page: number;
  totalPages: number;
}