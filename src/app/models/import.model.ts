export interface Import {
    id: number;
    fileName: string;
    importedAt: Date;
    tauxDeChange: number;
    fretAvecDD: number;
    fretSansDD: number;
    douane: number;
    tva: number;
    marge: number;
    totalCost: number;
    partsCount?: number;
  }
  
  export interface ImportDetail {
    id: number;
    codeArt: string;
    marque: string;
    oem: string;
    lib1: string;
    quantity: number;
    qttArrive: number;
    purchasePrice: number;
    salePrice: number;
    margin: number;
    poids: number;
  }