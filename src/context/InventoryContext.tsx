import React, { createContext, useContext, useState, useEffect } from 'react';
import { InventoryItem, Movement, MovementType } from '../types';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  items: InventoryItem[];
  movements: Movement[];
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  addMovement: (itemId: string, type: MovementType, quantity: number, reason?: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const { user } = useAuth();

  // Cargar datos iniciales
  useEffect(() => {
    const storedItems = localStorage.getItem('inventory_items');
    const storedMovements = localStorage.getItem('inventory_movements');
    
    if (storedItems) {
      try {
        setItems(JSON.parse(storedItems));
      } catch (e) {
        console.error("Failed to parse inventory items", e);
        // Optional: clear corrupted data or set empty
      }
    }
    
    if (storedMovements) {
      try {
        setMovements(JSON.parse(storedMovements));
      } catch (e) {
        console.error("Failed to parse inventory movements", e);
      }
    }
  }, []);

  // Guardar datos cuando cambian
  useEffect(() => {
    try {
      localStorage.setItem('inventory_items', JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save inventory items", e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert("¡Alerta! El almacenamiento local está lleno. Es posible que los últimos cambios no se guarden. Intente eliminar productos antiguos o imágenes grandes.");
      }
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('inventory_movements', JSON.stringify(movements));
    } catch (e) {
      console.error("Failed to save inventory movements", e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        // Silent fail for history if full, prioritizing items
        console.warn("Storage full, movements history not saved");
      }
    }
  }, [movements]);

  const addItem = (newItemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...newItemData,
      id: crypto.randomUUID(),
    };
    setItems(prev => [...prev, newItem]);
    
    // Registrar movimiento de creación
    logMovement(newItem.id, newItem.name, 'CREACION', newItem.quantity, 0, newItem.quantity, 'Inventario inicial');
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const deleteItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      logMovement(id, item.name, 'ELIMINACION', item.quantity, item.quantity, 0, 'Eliminado del sistema');
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const addMovement = (itemId: string, type: MovementType, quantity: number, reason?: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    let newStock = item.quantity;
    if (type === 'ENTRADA') {
      newStock += quantity;
    } else if (type === 'SALIDA') {
      newStock -= quantity;
    } else if (type === 'AJUSTE') {
      newStock = quantity; // En ajuste, quantity es el nuevo valor absoluto
    }

    // Actualizar item
    updateItem(itemId, { quantity: newStock });

    // Registrar en historial
    logMovement(itemId, item.name, type, Math.abs(newStock - item.quantity), item.quantity, newStock, reason);
  };

  const logMovement = (
    itemId: string, 
    itemName: string, 
    type: MovementType, 
    quantity: number, 
    previousStock: number, 
    newStock: number, 
    reason?: string
  ) => {
    const newMovement: Movement = {
      id: crypto.randomUUID(),
      itemId,
      itemName,
      type,
      quantity,
      previousStock,
      newStock,
      date: new Date().toISOString(),
      user: user?.username || 'Desconocido',
      reason
    };
    setMovements(prev => [newMovement, ...prev]);
  };

  return (
    <InventoryContext.Provider value={{ items, movements, addItem, updateItem, deleteItem, addMovement }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
