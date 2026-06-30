// src/app/interfaces/entrepot.interface.ts
export interface Entrepot {
  id: number;
  libelle: string;
  oem:string;
  marque:string;
  createdAt: string;
  updatedAt: string;
  stocks: any[];
}

export interface ApiResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: T[];
}

// src/app/interfaces/stock.interface.ts
export interface Stock {
  code_art: string;
  lib1: string;
  quantite: number;
  quantite_vendu: number;
  prix_final: number;
}

// src/app/models/entrepot.model.ts
// export interface Entrepot {
//   id: number;
//   libelle: string;
//   // … autres champs si besoin
// }

export interface Warehouse {
  id: number;
  name: string;
  stockCount: number;
  totalQuantity: number;
}

export interface WarehouseStockItem {
  id: number;
  stockEntrepotId?: number;
  productId?: number;

  referenceCode?: string;
  codeArt?: string;
  lib1?: string;

  oem?: string;
  marque?: string;

  quantite: number;
  qttsansEntrepot?: number;
  quantiteVendu?: number;

  prixFinal?: number;
  status?: string;

  entrepot?: string;
}

