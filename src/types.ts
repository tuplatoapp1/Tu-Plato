export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  total: number;
  zoneId?: string;
  address?: string;
}

export interface User {
  username: string;
  name: string;
  lastName?: string;
  documentId?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  role?: 'admin' | 'customer';
  points?: number;
  xp?: number;
  completedSurveys?: string[];
  prizes?: { id: string; name: string; description: string; date: string; status: 'active' | 'used' }[];
  id?: string;
  referredBy?: string;
  isFirstOrder?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  minStock: number;
  location: string;
  image?: string;
  department?: string;
  unit?: string;
}

export type MovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'CREACION' | 'ELIMINACION';

export interface Movement {
  id: string;
  itemId: string;
  itemName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  date: string;
  user: string;
  reason?: string;
  department?: string;
  unit?: string;
}

export type TipCurrency = 'USD' | 'BS';
export type TipMethod = 'EFECTIVO' | 'PAGO_MOVIL' | 'PUNTO_VENTA' | 'ZELLE' | 'OTRO';
export type TipStatus = 'PENDIENTE' | 'LIQUIDADA';

export interface Tip {
  id: string;
  amount: number;
  currency: TipCurrency;
  method: TipMethod;
  reference?: string;
  date: string;
  user: string;
  status: TipStatus;
}
