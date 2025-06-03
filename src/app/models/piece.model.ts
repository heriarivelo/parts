export interface Piece {
    code: string;
    marque: string;
    reference: string;
    autofinal: string;
    libelle: string;
    quantite: number;
    quantiteArrivee:number;
    prixUnitaireEur: number;
    poidsKg: number;
    // margePourcentage: number;
  }

  export interface PieceBdd {
    id: number;
    codeArt: string;
    marque?: string;
    oem?: string;
    autoFinal?: string;
    libelle: string;
    stocks: {
      quantite: number;
      status: string;
      prixFinal?: number;
    }[];
  }