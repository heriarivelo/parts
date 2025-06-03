export interface Product {
  id: number;
  referenceCode: string;
  codeArt?: string;
  oem?: string;
  marque?: string;
  libelle?: string;
  category?: string;
  compatibleWith: string[];
//   stocks: Stock[];
//   importDetails: ImportedPart[];
//   commandes: PiecesCommande[];
  createdAt: string; // ou Date si tu les convertis
  updatedAt: string; // ou Date si tu les convertis
}
