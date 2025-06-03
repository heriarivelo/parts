// src/app/models/stock-movement.model.ts
export interface StockMovement {
  id: number;
  type: 'IMPORT' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER' | 'LOSS';
  quantity: number;
  source?: string;
  reason?: string;
  createdAt: string;    // ISO date
  product: {
    id: number;
    referenceCode: string;
    libelle: string;
  };
  user: {
    id: number;
    name: string;
  };
}
