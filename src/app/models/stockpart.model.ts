// stock.model.ts

export enum MovementType {
  IMPORT = 'IMPORT',
  SALE = 'SALE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  LOSS = 'LOSS'
}

export enum StockStatus {
  DISPONIBLE = 'DISPONIBLE',
  RUPTURE = 'RUPTURE',
  COMMANDE = 'COMMANDE',
  PREORDER = 'PREORDER',
  RESERVE = 'RESERVE',
  RETOUR = 'RETOUR',
  DEFECTUEUX = 'DEFECTUEUX',
  CRITIQUE = 'CRITIQUE'
}

export interface StockMovement {
  id: number;
  productId: number;
  quantity: number;
  movementType: MovementType;
  date: Date;
  reason?: string;
  user?: string; // Si vous avez un suivi utilisateur
}

export interface StockStatut {
  productId: number;
  productReference: string;
  oem: string;
  marque: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lastPurchasePrice: number;
  status: StockStatus;
  lastMovementDate: Date;
  lowStockThreshold?: number;
}

// Interface pour la mise à jour du stock
export interface StockUpdate {
  productId: number;
  quantity: number;
  movementType: MovementType;
  reason?: string;
  destination?: string; // Utile pour les transferts
  adjustmentComment?: string; // Pour les ajustements
}