
export interface InventoryItem {
  id: number;
  date: string; // ISO Date (Entry)
  purchaseDate: string; // ISO Date (Warranty Start)
  warrantyEnd: string; // ISO Date
  model: string;
  capacity: string;
  color: string;
  condition: string;
  imei: string;
  battery: string;
  supplier: string;
  costNoFreight: number;
  cost: number;
  retailPrice: number;
  wholesalePrice: number;
  retailProfit: number;
  wholesaleProfit: number;
  // ERP New Fields
  status: 'available' | 'sold';
  soldDate?: string;
  soldPrice?: number;
  customerId?: string;
}

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
}

// --- NEW SALES STRUCTURE (V4.0) ---
export interface SaleItem {
  inventoryId: number;
  model: string;
  imei: string;
  price: number;
  capacity: string;
  color: string;
  condition: string;
  battery: string;
}

export interface SalePayment {
  id: string;
  method: 'PIX' | 'Dinheiro' | 'Crédito' | 'Débito' | 'Troca';
  amount: number;
  details?: string; // ex: "1x", "12x", "iPhone 11 como parte"
}

export interface Sale {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  payments: SalePayment[];
  totalPrice: number;
  soldByUserId: string;
  soldByUserName: string;
}

// --- USER & AUTH (V4.0) ---
export type UserRole = 'admin' | 'manager' | 'seller';

export interface UserPermissions {
  canManageInventory: boolean; // Compras/Entrada + Edição
  canViewDashboard: boolean;   // Ver lucros e custos
  canManageTeam: boolean;      // Criar/Editar usuários
  canAccessCalculator: boolean;// Acessar calculadora
  canManageSuppliers: boolean; // Fornecedores e Lista de Compras
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, hash this.
  role: UserRole;
  permissions: UserPermissions;
  active: boolean;
}

export interface MarketPriceData {
  avg: number;
  min: number;
  max: number;
  insight: string;
}

export interface CalculatorSettings {
  dollarPrice: string;
  exchangeRate: string;
  freightPercent: string;
  retailMarkup: string;
  wholesaleMarkup: string;
}

export type PrintMode = 'none' | 'labels' | 'report' | 'receipt';
export type ViewMode = 'purchases' | 'inventory' | 'sales' | 'customers' | 'dashboard' | 'calculator' | 'management' | 'team';

export interface Supplier {
  id: string;
  name: string;
  contact: string; // WhatsApp/Phone
  pixKey: string;
  notes: string;
}

export interface ShoppingItem {
  id: string;
  description: string; // ex: "iPhone 13 128 Rosa"
  targetPrice: string;
  status: 'pending' | 'buying' | 'bought';
  supplierId?: string;
}

export interface SecurityCheckResult {
  identifiedModel: string;
  riskAssessment: string;
}

export interface PaymentRate {
  installments: number; // 1 a 18
  costPercent: number; // Taxa da Maquininha (Custo Real)
  passPercent: number; // Taxa cobrada do cliente (Repasse)
}

// Dropdown Options
export const IPHONE_MODELS = [
  "iPhone 8", "iPhone 8 Plus", "iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max",
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12", "iPhone 12 Mini", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13", "iPhone 13 Mini", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
  "iPhone SE (2ª Ger)", "iPhone SE (3ª Ger)"
];

export const APPLE_COLORS = [
  "Preto / Black", "Branco / White", "Prata / Silver", "Dourado / Gold", 
  "Cinza Espacial / Space Gray", "Grafite / Graphite", 
  "Meia-noite / Midnight", "Estelar / Starlight", 
  "Roxo / Purple", "Roxo Profundo / Deep Purple",
  "Azul / Blue", "Azul Sierra / Sierra Blue", "Azul Pacífico / Pacific Blue",
  "Verde / Green", "Verde Alpino / Alpine Green",
  "Rosa / Pink", "Amarelo / Yellow", "Vermelho / (PRODUCT)RED",
  "Titânio Natural", "Titânio Azul", "Titânio Branco", "Titânio Preto", "Titânio Deserto"
];
