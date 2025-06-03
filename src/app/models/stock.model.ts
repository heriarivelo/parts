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