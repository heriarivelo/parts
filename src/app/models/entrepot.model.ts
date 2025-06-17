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

export interface Box {
  id: number;
  name: string;
  items: Item[];
}

export interface Item {
  id: number;
  referenceCode?: string;
  codeArt?: string;
  lib1?: string; 
  oem:string;
  marque:string;              // ← ajouté
  quantite: number;
  qttsansEntrepot: number,
  quantiteVendu?: number;
  prixFinal?: number;          // ← ajouté
  status: string;
  // product?: {                  // ← ajouté
  //   marque?: string;
  //   oem?: string;
  //   autoFinal?: string;
  //   lib?: string;
  // };
}

