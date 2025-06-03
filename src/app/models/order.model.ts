export interface OrderItem {
  id: number;
  productId: number;
  product: {
    id: number;
    referenceCode: string;
    libelle: string;
    importDetails: Array<{
      purchasePrice: number;
      salePrice: number;
    }>;
    stocks: Array<{
      quantite: number;
    }>;
  };
  quantite: number;
  prixArticle: number;
  createdAt: string;
}

export interface Order {
  id: number;
  reference: string;
  status: 'EN_ATTENTE' | 'VALIDE' | 'ANNULE' | 'LIVRE';
  totalAmount: number;
  type: 'B2B' | 'RETAIL' | 'WHOLESALE';
  createdAt: string;
  updatedAt: string;
  manager: {
    name: string;
    email: string;
  };
  pieces: {
    quantite: number;
    prixArticle: number;
    product: {
      codeArt: string;
      libelle: string;
      marque: string;
    };
  }[];
}

export interface OrderDetails {
  id: number;
  reference: string;
  status: 'EN_ATTENTE' | 'TRAITEMENT' | 'LIVREE' | 'ANNULEE';
  createdAt: string; // ou Date si vous utilisez des transformations
  totalAmount: number;
  customer?: {
    id: number;
    nom: string;
    telephone: string;
    email?: string;
    adresse?: string;
  };
  pieces: Array<{
    id: number;
    productId: number;
    quantite: number;
    prixArticle: number;
    product: {
      id: number;
      referenceCode: string;
      oem?: string;
      marque?: string;
      libelle?: string;
      importDetails: Array<{
        purchasePrice: number;
        salePrice: number;
        codeArt: string;
      }>;
      stocks: Array<{
        quantite: number;
        status: string;
      }>;
    };
  }>;
  factures: Array<{
    id: number;
    referenceFacture: string;
    prixTotal: number;
    status: string;
    createdAt: string;
  }>;
  totals: {
    subtotal: number;
    itemsCount: number;
    alreadyInvoiced: number;
    remainingAmount?: number;
  };
}

export interface CartItem {
  productId: number;
  reference: string;
  description: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
}

export interface InvoicePreview {
  items: {
    productName: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }[];
  subtotal: number;
  discounts: {
    label: string;
    amount: number;
  }[];
  total: number;
  tax?: number;
}

export enum CustomerType {
  RETAIL = 'RETAIL',
  B2B = 'B2B',
  WHOLESALE = 'WHOLESALE'
}