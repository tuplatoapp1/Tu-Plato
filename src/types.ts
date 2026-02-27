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
}
