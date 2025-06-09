import { Injectable } from '@angular/core';
import { Piece } from '../models/piece.model';
import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { environment } from '../environments/environment';
import { Observable, of } from 'rxjs';


interface ImportPayload {
  importData: {
    description: string;
    marge: number;
    fretAvecDD?: number;
    fretSansDD?: number;
    douane?: number;
    tva?: number;
    tauxDeChange: number;
    fileName?: string;
  };
  importParts: Array<{
    CODE_ART: string;
    marque?: string;
    oem?: string;
    auto_final?: string;
    LIB1?: string;
    Qte: number;
    qte_arv: number;
    PRIX_UNIT: number;
    prix_de_vente: number;
    POIDS_NET: number;
  }>;
}

interface DevisPreview {
  importParts: Array<{
    CODE_ART: string;
    marque?: string;
    oem?: string;
    LIB1?: string;
    Qte: number;
    prix_de_vente: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class PieceService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }
  private pieces: Piece[] = [
    {
      code: "FE38677",
      marque: "FEBI BILSTEIN",
      reference: "Filtre à carburant",
      autofinal: "AUDI Q5 I (8RB) Phase 2 2.0 TDI 16V Quattro 150 cv",
      libelle: "Filtre à carburant",
      quantite: 10,
      prixUnitaireEur: 9.96,
      poidsKg: 0.250,
      quantiteArrivee: 9,
      // margePourcentage: 40
    }
  ];

  private tauxChange = 4800;
  private fretTotal = 0;
  private fretMethode2 = 0;
  private margeStandard = 40;
  private tauxDouane = 10;
  private tauxTVA = 20;

  getPieces(): Piece[] {
    return this.pieces;
  }

  addPiece(piece: Piece): void {
    this.pieces.push(piece);
  }

  deletePiece(index: number): void {
    this.pieces.splice(index, 1);
  }

  updatePiece(index: number, piece: Piece): void {
    this.pieces[index] = piece;
  }

  // Méthodes de calcul
  calculerLigneMethode1(piece: Piece): any {
    const totalPoids = this.pieces.reduce((sum, p) => sum + p.poidsKg * p.quantite, 0);
    const ponderationPoids = totalPoids > 0 ? 
      ((piece.poidsKg * piece.quantite) / totalPoids * 100) : 0;
    
    const fretReparti = ((piece.poidsKg * piece.quantite) / totalPoids) * this.fretTotal;
    const caEur = (piece.prixUnitaireEur * piece.quantite) + fretReparti;
    const douaneEur = caEur * (this.tauxDouane / 100);
    const tvaEur = (caEur + douaneEur) * (this.tauxTVA / 100);
    const totalEur = caEur + douaneEur + tvaEur;
    const totalMGA = totalEur * this.tauxChange;
    const douaneTvaUnitaireMGA = totalMGA / piece.quantite;
    const prixFinalMGA = totalMGA / piece.quantite * (1 + this.margeStandard / 100);

    return {
      ponderationPoids,
      fretReparti,
      caEur,
      douaneEur,
      tvaEur,
      totalMGA,
      douaneTvaUnitaireMGA,
      prixFinalMGA,
      caPrevisionnelMGA: prixFinalMGA * piece.quantite
    };
  }

  calculerLigneMethode2(piece: Piece): any {
    const totalPoids = this.pieces.reduce((sum, p) => sum + p.poidsKg * p.quantite, 0);
    const ponderationPoids = totalPoids > 0 ? 
      ((piece.poidsKg * piece.quantite) / totalPoids * 100) : 0;
    
    const fretReparti = ((piece.poidsKg * piece.quantite) / totalPoids) * this.fretMethode2;
    const caEur = (piece.prixUnitaireEur * piece.quantite) + fretReparti;
    const totalMGA = caEur * this.tauxChange;
    const douaneTvaUnitaireMGA = totalMGA/ piece.quantite ;
    const prixFinalMGA = totalMGA / piece.quantite * (1 + this.margeStandard / 100);

    return {
      ponderationPoids,
      fretReparti,
      caEur,
      douaneEur: 0,
      tvaEur: 0,
      totalMGA,
      douaneTvaUnitaireMGA,
      prixFinalMGA,
      caPrevisionnelMGA: prixFinalMGA * piece.quantite
    };
  }

   calculerEcart(piece: Piece): any {
    const ecart = piece.quantite - piece.quantiteArrivee;
    const ecartClass = ecart > 0
      ? 'text-red-600 font-bold'
      : ecart < 0
        ? 'text-green-600 font-bold'
        : '';

    return {
      ecart,
      ecartClass
    };
  }

    // Calculs pour la méthode 1
    calculerTotauxMethode1(): { caPrevisionnel: number, margeTotale: number } {
        const result = this.pieces.reduce((acc, piece) => {
          const calculs = this.calculerLigneMethode1(piece);
          acc.caPrevisionnel += calculs.caPrevisionnelMGA;
          acc.margeTotale += (calculs.prixFinalMGA - calculs.douaneTvaUnitaireMGA) * piece.quantite;
          return acc;
        }, { caPrevisionnel: 0, margeTotale: 0 });
    
        return {
          caPrevisionnel: Math.round(result.caPrevisionnel),
          margeTotale: Math.round(result.margeTotale)
        };
      }
    
      // Calculs pour la méthode 2
      calculerTotauxMethode2(): { caPrevisionnel: number, margeTotale: number } {
        const result = this.pieces.reduce((acc, piece) => {
          const calculs = this.calculerLigneMethode2(piece);
          acc.caPrevisionnel += calculs.caPrevisionnelMGA;
          acc.margeTotale += (calculs.prixFinalMGA - calculs.douaneTvaUnitaireMGA) * piece.quantite;
          return acc;
        }, { caPrevisionnel: 0, margeTotale: 0 });
    
        return {
          caPrevisionnel: Math.round(result.caPrevisionnel),
          margeTotale: Math.round(result.margeTotale)
        };
      }
    
      // Calculs finaux
      calculerTotauxFinaux(): { caPrevisionnel: number, margeTotale: number } {
        const result = this.pieces.reduce((acc, piece) => {
          const m1 = this.calculerLigneMethode1(piece);
          const m2 = this.calculerLigneMethode2(piece);
          
          const prixApplicable = m1.prixFinalMGA - m2.douaneTvaUnitaireMGA;
          const prixFinal = this.arrondirInf(prixApplicable + m2.douaneTvaUnitaireMGA, -3);
          
          acc.caPrevisionnel += prixFinal * piece.quantite;
          acc.margeTotale += (prixFinal - m2.douaneTvaUnitaireMGA) * piece.quantite;
          return acc;
        }, { caPrevisionnel: 0, margeTotale: 0 });
    
        return {
          caPrevisionnel: Math.round(result.caPrevisionnel),
          margeTotale: Math.round(result.margeTotale)
        };
      }

      enregistrerImport(description: string): Observable<any> {
        const payload: ImportPayload = {
          importData: {
            description,
            marge: this.margeStandard,
            tauxDeChange: this.tauxChange,
            fretAvecDD: this.fretTotal,
            fretSansDD: this.fretMethode2,
            douane: this.tauxDouane,
            tva: this.tauxTVA,
            fileName: 'import_' + new Date().toISOString().split('T')[0] + '.xlsx'
          },
          importParts: this.pieces.map(piece => ({
            CODE_ART: piece.code,
            marque: piece.marque,
            LIB1: piece.libelle,
            oem: piece.reference,
            auto_final: piece.autofinal,
            Qte: piece.quantite,
            qte_arv: piece.quantiteArrivee || piece.quantite,
            PRIX_UNIT: piece.prixUnitaireEur,
            prix_de_vente: this.calculerPrixFinal(piece), // Utilisez votre méthode de calcul
            POIDS_NET: piece.poidsKg
          }))
        };
    
        return this.http.post(`${this.apiUrl}/import`, payload);
      }


   devisPreviews(): Observable<DevisPreview> {
    // Vérification des données
    if (!this.pieces || this.pieces.length === 0) {
      throw new Error('Aucune pièce à inclure dans le devis');
    }

    const payload: DevisPreview = {
      importParts: this.pieces.map(piece => ({
        CODE_ART: piece.code || '',
        marque: piece.marque || undefined,
        LIB1: piece.libelle || undefined,
        oem: piece.reference || undefined,
        Qte: piece.quantite,
        prix_de_vente: this.calculerPrixFinal(piece)
      })).filter(item => item.Qte > 0) // Filtre les pièces avec quantité > 0
    };

    return of(payload); // Retourne un Observable
  }

      private calculerPrixFinal(piece: Piece): number {
        const m1 = this.calculerLigneMethode1(piece);
        const m2 = this.calculerLigneMethode2(piece);
        const prixApplicable = m1.prixFinalMGA - m2.douaneTvaUnitaireMGA;
        return this.arrondirInf(prixApplicable + m2.douaneTvaUnitaireMGA, -3);
      }

  // Getters et Setters pour les paramètres
  getParametres() {
    return {
      tauxChange: this.tauxChange,
      fretTotal: this.fretTotal,
      fretMethode2: this.fretMethode2,
      margeStandard: this.margeStandard,
      tauxDouane: this.tauxDouane,
      tauxTVA: this.tauxTVA
    };
  }

  setParametres(params: any): void {
    this.tauxChange = params.tauxChange || 5000;
    this.fretTotal = params.fretTotal || 0;
    this.fretMethode2 = params.fretMethode2 || 0;
    this.margeStandard = params.margeStandard || 25;
    this.tauxDouane = params.tauxDouane || 20;
    this.tauxTVA = params.tauxTVA || 20;
  }
  exportToExcel(): void {
    // Préparer les données pour l'export
    const data = this.pieces.map(piece => {
      const m1 = this.calculerLigneMethode1(piece);
      const m2 = this.calculerLigneMethode2(piece);
      const prixApplicable = m1.prixFinalMGA - m2.douaneTvaUnitaireMGA;
      const prixFinal = this.arrondirInf(prixApplicable + m2.douaneTvaUnitaireMGA, -3);

      return {
        'Code Article': piece.code,
        'Marque': piece.marque,
        'Référence': piece.reference,
        'Quantité': piece.quantite,
        'Prix Unitaire (€)': piece.prixUnitaireEur,
        'Poids (kg)': piece.poidsKg,
        'Marge (%)': this.margeStandard,
        
        // Méthode 1
        'M1 Pondération (%)': m1.ponderationPoids,
        'M1 Fret (€)': m1.fretReparti,
        'M1 CA (€)': m1.caEur,
        'M1 Douane (€)': m1.douaneEur,
        'M1 TVA (€)': m1.tvaEur,
        'M1 Total TTC (MGA)': m1.totalMGA,
        'M1 Prix Final (MGA)': m1.prixFinalMGA,
        
        // Méthode 2
        'M2 Pondération (%)': m2.ponderationPoids,
        'M2 Fret (€)': m2.fretReparti,
        'M2 CA (€)': m2.caEur,
        'M2 Douane (€)': m2.douaneEur,
        'M2 TVA (€)': m2.tvaEur,
        'M2 Total TTC (MGA)': m2.totalMGA,
        'M2 D+TVA U. (MGA)': m2.douaneTvaUnitaireMGA,
        'M2 Prix Final (MGA)': m2.prixFinalMGA,
        
        // Calculs finaux
        'Prix Applicable': prixApplicable,
        'Prix Final': prixFinal
      };
    });

    

    // Créer un nouveau workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Calculs Pièces');
    
    // Générer le fichier Excel
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `calculs_pieces_${date}.xlsx`);
  }

  importFromExcel(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          this.pieces = jsonData.map((item: any) => ({
            code: item['CODE ART.'] || `ART-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            marque: item['Marque 1+2'] || '',
            reference: item['oem1+oem2'] || '',
            autofinal: item['auto final'] || '',
            libelle: item['LIB1'] || '',
            quantite: Number(item['Qté']) || 1,
            quantiteArrivee: Number(item['QTE ARRIVAL']) || Number(item['Qté']),
            prixUnitaireEur: Number(item['PRIX UNIT(€)']) || 0,
            poidsKg: Number(item['POIDS NET/ART (KG)']) || 0
          }));

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  private arrondirInf(valeur: number, precision: number): number {
    const factor = Math.pow(10, -precision);
    return Math.floor(valeur / factor) * factor;
  }

  getCurrentData(): any {

  return {
    importParts: this.pieces.map(piece => ({
      CODE_ART: piece.code,
      LIB1: piece.libelle,
      marque: piece.marque,
      oem: piece.reference,
      prix_de_vente:  this.calculerPrixFinal(piece),
      Qte: piece.quantite
    }))
  };
}

  // getPiece(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/pieces`);
  // }

  // searchPieces(term: string): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/pieces/search?q=${term}`);
  // }
}