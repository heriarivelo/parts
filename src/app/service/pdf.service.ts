import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

   private logoBase64: string | null = null;

  constructor(private http: HttpClient) {
    this.loadLogo();
  }

private async loadLogo(): Promise<void> {
  try {
    const logoBlob: Blob = await firstValueFrom(
      this.http.get('/assets/logo.png', { responseType: 'blob' })
    );
    this.logoBase64 = await this.blobToBase64(logoBlob);
  } catch (error) {
    console.error('Erreur chargement logo:', error);
    this.logoBase64 = null;
  }
}


  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Exporte un document (devis/facture) au format PDF
   */
  async exportAsPdf(data: any, type: 'devis' | 'facture'): Promise<void> {
    const { html, fileName } = this.prepareDocument(data, type);
    const element = this.createTempElement(html);
    
    try {
      const canvas = await this.generateCanvas(element);
      this.generatePdf(canvas, fileName);
    } finally {
      document.body.removeChild(element);
    }
  }

  /**
   * Exporte un document (devis/facture) au format image
   */
  async exportAsImage(data: any, type: 'devis' | 'facture', format: 'png' | 'jpeg' = 'png'): Promise<void> {
    const { html, fileName } = this.prepareDocument(data, type);
    const element = this.createTempElement(html);
    
    try {
      const canvas = await this.generateCanvas(element);
      this.downloadImage(canvas, fileName, format);
    } finally {
      document.body.removeChild(element);
    }
  }

  private prepareDocument(data: any, type: 'devis' | 'facture'): { html: string, fileName: string } {
    return {
      html: type === 'devis' ? this.generateDevisHtml(data) : this.generateFactureHtml(data),
      fileName: `${type}_${data.reference || new Date().getTime()}`
    };
  }

  private generateDevisHtml(devis: any): string {
    const dateOptions: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    return `
      <div id="pdf-content" style="padding: 20px; font-family: Arial, sans-serif; width: 210mm; background: white; box-sizing: border-box;">
        <!-- En-tête -->
        <div style="border-bottom: 2px solid #f63b42; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 20px;">
                    ${this.logoBase64 ? 
            `<img src="${this.logoBase64}" alt="Logo" style="height: 60px; margin-right: 20px;">` : 
            '<div style="height: 60px; width: 60px; background: #f63b42; color: white; display: flex; align-items: center; justify-content: center; margin-right: 20px;">KP</div>'
          }
            <div>
              <h1 style="color: #f63b42; font-weight: 800; font-size: 22px; margin: 0 0 5px 0;">
                kaleo<span style="color: #333;">PARTS</span>
              </h1>
              <p style="margin: 3px 0; font-size: 13px; color: #555;">Tél: 038 66 332 82</p>
              <p style="margin: 3px 0; font-size: 13px; color: #555;">Email: kaleoparts@gmail.com</p>
              <p style="margin: 3px 0; font-size: 13px; color: #555;">NIF: 6018289282</p>
            </div>
          </div>
          
          <div style="text-align: right;">
            <h2 style="color: #f63b42; font-size: 20px; margin: 0 0 10px 0;">DEVIS</h2>
            <p style="margin: 5px 0; font-size: 14px;"><strong>N°:</strong> ${devis.reference || 'TEMP'}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Date:</strong> ${new Date(devis.date || Date.now()).toLocaleDateString('fr-FR', dateOptions)}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Validité:</strong> 30 jours</p>
          </div>
        </div>

        <!-- Client -->
        <div style="margin-bottom: 25px; background: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
          <h3 style="color: #333; font-size: 16px; margin: 0 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
            ${devis.customerType === 'B2B' ? 'CLIENT PROFESSIONNEL' : 'CLIENT'}
          </h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <p style="margin: 8px 0;"><strong>Nom:</strong> ${devis.clientInfo?.nom || 'Non spécifié'}</p>
              ${devis.clientInfo?.telephone ? `<p style="margin: 8px 0;"><strong>Téléphone:</strong> ${devis.clientInfo.telephone}</p>` : ''}
            </div>
            <div>
              ${devis.clientInfo?.email ? `<p style="margin: 8px 0;"><strong>Email:</strong> ${devis.clientInfo.email}</p>` : ''}
              ${devis.clientInfo?.adresse ? `<p style="margin: 8px 0;"><strong>Adresse:</strong> ${devis.clientInfo.adresse}</p>` : ''}
              ${devis.customerType === 'B2B' && devis.clientInfo?.nif ? `<p style="margin: 8px 0;"><strong>NIF:</strong> ${devis.clientInfo.nif}</p>` : ''}
            </div>
          </div>
        </div>

        <!-- Articles -->
        <h3 style="color: #333; font-size: 16px; margin: 0 0 15px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">ARTICLES</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <thead>
            <tr style="background-color: #f63b42; color: white;">
              <th style="padding: 10px; text-align: left; font-weight: 600;">Référence</th>
              <th style="padding: 10px; text-align: left; font-weight: 600;">Désignation</th>
              <th style="padding: 10px; text-align: right; font-weight: 600;">Prix Unitaire</th>
              <th style="padding: 10px; text-align: center; font-weight: 600;">Qté</th>
              <th style="padding: 10px; text-align: right; font-weight: 600;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${devis.items?.length > 0 ? 
              devis.items.map((item: any, index: number) => `
                <tr style="${index % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.reference || 'N/A'}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <div style="font-weight: 500;">${item.productName || 'Non spécifié'}</div>
                    ${item.marque ? `<div style="font-size: 13px; color: #666;">Marque: ${item.marque}</div>` : ''}
                  </td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.unitPrice || 0).toLocaleString('fr-FR')} MGA</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 0}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">
                    ${((item.unitPrice || 0) * (item.quantity || 0)).toLocaleString('fr-FR')} MGA
                  </td>
                </tr>
              `).join('') 
              : `
                <tr>
                  <td colspan="5" style="padding: 15px; text-align: center; color: #666; border-bottom: 1px solid #eee;">
                    Aucun article dans ce devis
                  </td>
                </tr>
              `
            }
          </tbody>
        </table>

        <!-- Totaux -->
        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 300px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
            <div style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #ddd;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: 500;">Total:</span>
                <span>${(devis.subtotal || 0).toLocaleString('fr-FR')} MGA</span>
              </div>
              
            </div>
            
            <div style="padding: 15px; background-color: #f63b42; color: white;">
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 17px;">
                <span>NET À PAYER:</span>
                <span>${(devis.subtotal || 0).toLocaleString('fr-FR')} MGA</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mentions -->
        <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
          <p>Devis valable 30 jours - TVA non applicable, article 8 de la Loi de Finances</p>
          <p style="margin-top: 5px;">kaleoPARTS - NIF 6018289282 - STAT 46101112023011160</p>
        </div>
      </div>
    `;
  }

    private generateFactureHtml(facture: any): string {
    return `
      <div id="pdf-content" style="padding: 20px; font-family: Arial; width: 210mm; background: white; box-sizing: border-box;">
        <!-- En-tête -->
        <div style="border: 1px solid #ddd; padding: 20px; display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div style="display: flex; gap: 20px; align-items: center;">
                    ${this.logoBase64 ? 
            `<img src="${this.logoBase64}" alt="Logo" style="height: 60px; margin-right: 20px;">` : 
            '<div style="height: 60px; width: 60px; background: #f63b42; color: white; display: flex; align-items: center; justify-content: center; margin-right: 20px;">KP</div>'
          }
            <div>
              <h1 style="color: #f63b42; font-weight: 800; font-size: 18px; margin: 0 0 5px 0;">
                kaleo<span style="color: black;">PARTS</span>
              </h1>
              <p style="margin: 2px 0;">Tél : 038 66 332 82</p>
              <p style="margin: 2px 0;">Email : kaleoparts@gmail.com</p>
              <p style="margin: 2px 0;">NIF 6018289282</p>
              <p style="margin: 2px 0;">STAT 46101112023011160</p>
            </div>
          </div>
          <div style="text-align: right;">
            <p style="margin: 2px 0; font-weight: 600; font-size: 18px;">FACTURE</p>
            <p style="margin: 2px 0;"><strong>N° :</strong> ${facture.referenceFacture || 'PRO-FORMA'}</p>
            <p style="margin: 2px 0;"><strong>Date :</strong> ${new Date(facture.createdAt || Date.now()).toLocaleDateString('fr-FR')}</p>
            ${facture.commandeVente?.reference ? `<p style="margin: 2px 0;"><strong>Commande :</strong> ${facture.commandeVente.reference}</p>` : ''}
          </div>
        </div>

        <!-- Bloc client -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
          <div style="width: 300px; padding: 15px; background: #f9fafb; border-radius: 8px; border: 1px solid #eee;">
            <h4 style="font-size: 16px; font-weight: 600; margin: 0 0 10px 0; color: #333;">CLIENT</h4>
            
            ${facture.commandeVente?.customer ? `
              <p style="margin: 5px 0; font-weight: 500;">${facture.commandeVente.customer.nom}</p>
              <p style="margin: 5px 0;"><strong>Contact :</strong> ${facture.commandeVente.customer.telephone || 'Non renseigné'}</p>
              ${facture.commandeVente.customer.email ? `<p style="margin: 5px 0;"><strong>Email :</strong> ${facture.commandeVente.customer.email}</p>` : ''}
              ${facture.commandeVente.customer.adresse ? `<p style="margin: 5px 0;"><strong>Adresse :</strong> ${facture.commandeVente.customer.adresse}</p>` : ''}
              ${facture.commandeVente.customer.siret ? `<p style="margin: 5px 0;"><strong>NIF :</strong> ${facture.commandeVente.customer.siret}</p>` : ''}
            ` : facture.commandeVente?.libelle ? `
              <p style="margin: 5px 0; font-weight: 500;">${facture.commandeVente.libelle.replace('Client occasionnel: ', '')}</p>
            ` : `
              <p style="margin: 5px 0; color: #666;">Client non spécifié</p>
            `}
          </div>
        </div>

        <!-- Tableau des articles -->
        <h4 style="font-size: 16px; font-weight: 600; margin: 0 0 10px 0; color: #333;">ARTICLES</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 12px;">Référence</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 12px;">Désignation</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 12px;">Marque</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd; font-size: 12px;">Prix Unitaire</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd; font-size: 12px;">Quantité</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd; font-size: 12px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${facture.commandeVente?.pieces?.length > 0 ? 
              facture.commandeVente.pieces.map((piece: any) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #eee; font-size: 12px;">${piece.product?.codeArt || piece.reference || 'N/A'}</td>
                  <td style="padding: 8px; border: 1px solid #eee; font-size: 12px;">${piece.product?.libelle || piece.designation || 'Pièce non spécifiée'}</td>
                  <td style="padding: 8px; border: 1px solid #eee; font-size: 12px;">${piece.product?.marque || piece.marque || '-'}</td>
                  <td style="padding: 8px; border: 1px solid #eee; text-align: right; font-size: 12px;">${(piece.prixArticle || 0).toLocaleString('fr-FR')} MGA</td>
                  <td style="padding: 8px; border: 1px solid #eee; text-align: center; font-size: 12px;">${piece.quantite || 0}</td>
                  <td style="padding: 8px; border: 1px solid #eee; text-align: right; font-weight: 600; font-size: 12px;">
                    ${((piece.prixArticle || 0) * (piece.quantite || 0)).toLocaleString('fr-FR')} MGA
                  </td>
                </tr>
              `).join('') 
              : `
                <tr>
                  <td colspan="6" style="padding: 10px; text-align: center; color: #666;">Aucun article</td>
                </tr>
              `
            }
          </tbody>
        </table>

        <!-- Totaux et règlement -->
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <!-- Paiement -->
          <div style="width: 48%; padding: 15px; background: #f9fafb; border-radius: 8px; border: 1px solid #eee;">
            <h4 style="font-size: 15px; font-weight: 600; margin: 0 0 10px 0; color: #333;">REGLEMENT</h4>
            ${facture.paymentDetails ? `
              <p style="margin: 5px 0;"><strong>Méthode :</strong> ${this.getPaymentMethodLabel(facture.paymentDetails.method)}</p>
              <p style="margin: 5px 0;"><strong>Montant :</strong> ${(facture.paymentDetails.amount || 0).toLocaleString('fr-FR')} MGA</p>
              ${facture.paymentDetails.reference ? `<p style="margin: 5px 0;"><strong>Référence :</strong> ${facture.paymentDetails.reference}</p>` : ''}
            ` : `
              <p style="margin: 5px 0; color: #666;">Aucun paiement enregistré</p>
            `}
          </div>
          
          <!-- Totaux -->
          <div style="width: 48%; padding: 15px; background: #f9fafb; border-radius: 8px; border: 1px solid #eee;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 500;">Total:</span>
              <span>${(facture.subtotal || 0).toLocaleString('fr-FR')} MGA</span>
            </div>
            
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ef4444;">
                <span style="font-weight: 500;">Remise:</span>
                <span>-${(facture.remises).toLocaleString('fr-FR')} MGA</span>
              </div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; font-weight: 800;">
              <span>NET À PAYER:</span>
              <span>${(facture.prixTotal || 0).toLocaleString('fr-FR')} MGA</span>
            </div>
          </div>
        </div>

        <!-- Mentions légales -->
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 11px; color: #666; text-align: center;">
          <p>Facture établie par KaleoParts - NIF 6018289282 - STAT 46101112023011160</p>
          <p>Paiement attendu sous 30 jours - Pas d'escompte pour paiement anticipé</p>
        </div>
      </div>
    `;
  }

  private createTempElement(html: string): HTMLElement {
    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '0';
    element.style.zIndex = '9999';
    document.body.appendChild(element);
    return element;
  }

  private async generateCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
    return await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      scrollX: 0,
      scrollY: 0
    });
  }

  private generatePdf(canvas: HTMLCanvasElement, fileName: string): void {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${fileName}.pdf`);
  }

  private downloadImage(canvas: HTMLCanvasElement, fileName: string, format: 'png' | 'jpeg'): void {
    const link = document.createElement('a');
    link.download = `${fileName}.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

    private getPaymentMethodLabel(method: string): string {
    const methods: {[key: string]: string} = {
      'CASH': 'Espèces',
      'CARD': 'Carte bancaire',
      'CHECK': 'Chèque',
      'TRANSFER': 'Virement',
      'MOBILE_MONEY': 'Mobile Money'
    };
    return methods[method] || method;
  }

  //   private calculateRemiseTotale(facture: any): number {
  //   if (!facture.remises?.length) return 0;
    
  //   return facture.remises.reduce((total: number, remise: any) => {
  //     if (remise.type === 'POURCENTAGE' && remise.taux) {
  //       return total + ((facture.prixTotal || 0) * remise.taux / 100);
  //     }
  //     return total + (remise.montant || 0);
  //   }, 0);
  // }

 private calculateRemiseTotale(discounts: any[], subtotal: number): number {
  return discounts?.reduce((sum, discount) => {
    if (discount.type === 'POURCENTAGE' || discount.type === 'percentage') {
      // Pour les remises en pourcentage, on calcule sur le sous-total
      const taux = discount.taux || discount.value; // Prend soit 'taux' (BDD) soit 'value' (composant)
      return sum + (subtotal * (taux / 100));
    } else {
      // Pour les remises fixes, on prend soit 'montant' (BDD) soit 'value' (composant)
      const montant = discount.montant || discount.value;
      return sum + (montant || 0);
    }
  }, 0) || 0;
}
}