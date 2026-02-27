export interface User {
  username: string;
  name: string;
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
