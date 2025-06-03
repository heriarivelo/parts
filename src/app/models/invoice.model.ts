export interface Invoice {
  id: number;
  commandeId: number;
  referenceFacture: string;
  prixTotal: number;
  montantPaye: number;
  resteAPayer: number;
  status: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  commandeVente: CommandeVente;
  remises: any[];
  paiements: any[];
  createdBy: User;
}

interface CommandeVente {
  id: number;
  reference: string;
  customerId: number | null;
  managerId: number;
  libelle: string | null;
  status: string;
  totalAmount: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  customer: any | null;
  pieces: Piece[];
}

interface Piece {
  id: number;
  commandeId: number;
  productId: number;
  quantite: number;
  prixArticle: number;
  remise: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

interface Product {
  id: number;
  referenceCode: string;
  codeArt: string;
  oem: string;
  marque: string;
  libelle: string;
  category: string | null;
  autoFinal: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}