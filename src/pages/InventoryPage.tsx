import React, { useState, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, Search, ArrowUpRight, ArrowDownLeft, Trash2, Package, MapPin, AlertTriangle, Activity, X, Upload, Image as ImageIcon, Camera, Minus } from 'lucide-react';
import { InventoryItem, Movement } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export default function InventoryPage() {
  const { items, movements, addItem, deleteItem, addMovement } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGlobalMovementModalOpen, setIsGlobalMovementModalOpen] = useState(false);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = items.filter(i => i.quantity <= i.minStock);
  const lowStockCount = lowStockItems.length;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-tuplato tracking-tight">Inventario</h1>
          <p className="text-gray-500 mt-1">Gestione sus productos y existencias de forma eficiente</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => setIsGlobalMovementModalOpen(true)} 
            className="flex-1 sm:flex-none bg-white text-tuplato border-2 border-tuplato hover:bg-tuplato hover:text-white shadow-sm hover:shadow-md transition-all h-12 sm:h-11"
          >
            <Activity className="w-5 h-5 mr-2" />
            INGRESO/SALIDA
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="flex-1 sm:flex-none bg-tuplato text-white shadow-lg shadow-tuplato/30 hover:shadow-tuplato/50 hover:bg-tuplato-dark border-0 transition-all transform hover:-translate-y-0.5 h-12 sm:h-11"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Stats Cards (Moved from Home, Responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-tuplato shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Productos</p>
              <h3 className="text-2xl font-extrabold text-tuplato mt-1">{items.length}</h3>
            </div>
            <div className="p-3 bg-tuplato/10 rounded-xl">
              <Package className="w-6 h-6 text-tuplato" />
            </div>
          </CardContent>
        </Card>
        <Card 
          onClick={() => setIsLowStockModalOpen(true)}
          className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-orange-50/30"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Bajo</p>
              <h3 className="text-2xl font-extrabold text-orange-600 mt-1">{lowStockCount}</h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-tuplato transition-colors" />
        </div>
        <Input 
          placeholder="Buscar por nombre o categoría..." 
          className="pl-10 py-6 border-gray-200 bg-white shadow-sm focus:border-tuplato focus:ring-4 focus:ring-tuplato/10 transition-all rounded-xl text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No se encontraron productos</h3>
          <p className="text-gray-500 mt-1">Intente con otra búsqueda o agregue un nuevo producto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layoutId={item.id}
              onClick={() => setSelectedItem(item)}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-tuplato/30 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
              whileHover={{ y: -8 }}
            >
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                <img 
                  src={item.image || `https://picsum.photos/seed/${item.id}/400/400`} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {item.quantity <= item.minStock && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-white/20 backdrop-blur-md">
                    {item.quantity === 0 ? 'AGOTADO' : 'BAJO STOCK'}
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-tuplato uppercase tracking-wider mb-1">{item.category}</p>
                  <h3 className="font-bold text-gray-900 line-clamp-1 text-lg group-hover:text-tuplato transition-colors" title={item.name}>{item.name}</h3>
                </div>
                
                <div className="mt-auto pt-3 border-t border-gray-50 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Stock</p>
                    <p className={`font-mono text-xl font-bold ${item.quantity <= item.minStock ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      <MapPin className="w-3 h-3 mr-1" />
                      {item.location || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddItemModal onClose={() => setIsAddModalOpen(false)} onAdd={addItem} />
        )}
        {isGlobalMovementModalOpen && (
          <GlobalMovementModal 
            items={items} 
            onClose={() => setIsGlobalMovementModalOpen(false)} 
            onConfirm={addMovement} 
          />
        )}
        {isLowStockModalOpen && (
          <LowStockModal 
            items={lowStockItems}
            onClose={() => setIsLowStockModalOpen(false)}
            onSelect={(item) => {
              setIsLowStockModalOpen(false);
              setSelectedItem(item);
            }}
          />
        )}
        {selectedItem && (
          <ProductDetailModal 
            item={selectedItem} 
            movements={movements.filter(m => m.itemId === selectedItem.id)}
            onClose={() => setSelectedItem(null)} 
            onDelete={() => {
              if(confirm('¿Eliminar este producto?')) {
                deleteItem(selectedItem.id);
                setSelectedItem(null);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LowStockModal({ items, onClose, onSelect }: { items: InventoryItem[], onClose: () => void, onSelect: (item: InventoryItem) => void }) {
  // Sort items: Out of stock first, then by quantity ascending
  const sortedItems = [...items].sort((a, b) => {
    if (a.quantity === 0 && b.quantity !== 0) return -1;
    if (a.quantity !== 0 && b.quantity === 0) return 1;
    return a.quantity - b.quantity;
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-xl">Atención Requerida</h2>
              <p className="text-white/90 text-sm font-medium">{items.length} productos con stock crítico</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
          {sortedItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">¡Todo en orden!</h3>
              <p>No hay productos con stock bajo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedItems.map(item => {
                const isOutOfStock = item.quantity === 0;
                return (
                  <div 
                    key={item.id} 
                    onClick={() => onSelect(item)}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${
                      isOutOfStock 
                        ? 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300' 
                        : 'bg-white border-gray-100 hover:border-orange-200 hover:bg-orange-50'
                    }`}
                  >
                    {isOutOfStock && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                    )}
                    
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                      <img 
                        src={item.image || `https://picsum.photos/seed/${item.id}/100/100`} 
                        alt={item.name}
                        className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`font-bold truncate text-sm ${isOutOfStock ? 'text-red-700' : 'text-gray-900 group-hover:text-orange-700'}`}>
                          {item.name}
                        </h3>
                        {isOutOfStock && (
                          <span className="bg-red-100 text-red-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                            Agotado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    
                    <div className="text-right">
                      <span className={`block text-lg font-bold font-mono ${isOutOfStock ? 'text-red-600' : 'text-orange-600'}`}>
                        {item.quantity}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase font-medium">Mín: {item.minStock}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

import { compressImage } from '../lib/imageUtils';

function AddItemModal({ onClose, onAdd }: { onClose: () => void, onAdd: (item: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    quantity: 0,
    minStock: 5,
    image: ''
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        // Compress image to max 800px width and 0.7 quality
        const compressedImage = await compressImage(file, 800, 0.7);
        setFormData(prev => ({ ...prev, image: compressedImage }));
      } catch (error) {
        console.error("Error compressing image:", error);
        alert("Error al procesar la imagen. Intente con otra.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="bg-gradient-to-r from-tuplato to-tuplato-dark p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl tracking-tight">Nuevo Producto</h2>
              <p className="text-tuplato-light text-sm opacity-90 font-medium">Complete la información del inventario</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto custom-scrollbar bg-gray-50/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column: Image Upload */}
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <label className="block text-sm font-bold text-gray-700">Imagen del Producto</label>
                
                {/* Preview Area - Compact */}
                <div className="relative w-full h-40 bg-white border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center p-4 text-center">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-medium">Sin imagen seleccionada</span>
                    </div>
                  )}
                </div>

                {/* Dual Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-tuplato/5 hover:border-tuplato/50 hover:text-tuplato transition-all shadow-sm group"
                  >
                    <Upload className="w-5 h-5 mb-1 text-gray-500 group-hover:text-tuplato" />
                    <span className="text-xs font-bold text-gray-600 group-hover:text-tuplato">Galería</span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-tuplato/5 hover:border-tuplato/50 hover:text-tuplato transition-all shadow-sm group"
                  >
                    <Camera className="w-5 h-5 mb-1 text-gray-500 group-hover:text-tuplato" />
                    <span className="text-xs font-bold text-gray-600 group-hover:text-tuplato">Cámara</span>
                  </button>
                </div>

                {/* Hidden Inputs */}
                <input 
                  type="file" 
                  ref={galleryInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <input 
                  type="file" 
                  ref={cameraInputRef}
                  className="hidden" 
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                />
              </div>

              {/* Right Column: Form Fields */}
              <div className="w-full md:w-2/3 space-y-5">
                <div className="space-y-5">
                  <Input 
                    label="Nombre del Producto" 
                    placeholder="Ej. Arroz Premium 5kg"
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="bg-white border-gray-200 focus:border-tuplato focus:ring-tuplato/20 h-12 text-lg shadow-sm"
                  />
                  
                  <div className="grid grid-cols-2 gap-5">
                     <Input 
                      label="Categoría" 
                      placeholder="Ej. Granos"
                      required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="bg-white border-gray-200 focus:border-tuplato focus:ring-tuplato/20 h-11 shadow-sm"
                    />
                    <Input 
                      label="Ubicación" 
                      placeholder="Ej. Estante A1"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="bg-white border-gray-200 focus:border-tuplato focus:ring-tuplato/20 h-11 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <Input 
                      label="Stock Inicial" 
                      type="number" 
                      min="0"
                      required
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      className="bg-gray-50 border-gray-200 focus:bg-white focus:border-tuplato focus:ring-tuplato/20 font-mono font-bold text-lg text-center h-12"
                    />
                    <Input 
                      label="Stock Mínimo" 
                      type="number" 
                      min="0"
                      required
                      value={formData.minStock}
                      onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                      className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 font-mono font-bold text-lg text-center h-12 text-orange-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Descripción (Opcional)</label>
              <textarea 
                className="w-full min-h-[100px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tuplato focus:border-transparent shadow-sm transition-all resize-none"
                placeholder="Detalles adicionales, proveedor, fecha de caducidad, etc..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onClose} 
                className="px-6 h-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-tuplato to-tuplato-dark hover:from-tuplato-dark hover:to-tuplato text-white px-8 h-12 shadow-lg shadow-tuplato/20 rounded-xl font-bold tracking-wide transition-all transform hover:-translate-y-0.5"
              >
                Guardar Producto
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function GlobalMovementModal({ items, onClose, onConfirm }: { 
  items: InventoryItem[], 
  onClose: () => void, 
  onConfirm: (itemId: string, type: 'ENTRADA' | 'SALIDA', qty: number, reason: string) => void 
}) {
  const [activeTab, setActiveTab] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [batchItems, setBatchItems] = useState<{itemId: string, quantity: number}[]>([]);
  
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  const selectedItem = items.find(i => i.id === selectedItemId);

  const handleAddToBatch = () => {
    if (!selectedItemId || quantity <= 0) return;

    if (activeTab === 'SALIDA' && selectedItem) {
      const existingBatchItem = batchItems.find(i => i.itemId === selectedItemId);
      const currentBatchQty = existingBatchItem ? existingBatchItem.quantity : 0;
      const totalRequested = quantity + currentBatchQty;

      if (totalRequested > selectedItem.quantity) {
        alert(`Error: No puedes retirar ${totalRequested} unidades. El stock disponible es de ${selectedItem.quantity}.`);
        return;
      }
    }

    setBatchItems(prev => {
      const existing = prev.find(i => i.itemId === selectedItemId);
      if (existing) {
        return prev.map(i => i.itemId === selectedItemId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { itemId: selectedItemId, quantity }];
    });

    // Reset fields
    setSelectedItemId('');
    setQuantity(1);
  };

  const handleRemoveFromBatch = (itemId: string) => {
    setBatchItems(prev => prev.filter(i => i.itemId !== itemId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchItems.length > 0) {
      batchItems.forEach(item => {
        onConfirm(item.itemId, activeTab, item.quantity, reason);
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex shrink-0">
          <button 
            className={`flex-1 py-5 text-sm font-bold text-center transition-all relative ${activeTab === 'ENTRADA' ? 'text-green-700 bg-green-50' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
            onClick={() => { setActiveTab('ENTRADA'); setBatchItems([]); }}
          >
            REGISTRAR INGRESO
            {activeTab === 'ENTRADA' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-green-600" />}
          </button>
          <button 
            className={`flex-1 py-5 text-sm font-bold text-center transition-all relative ${activeTab === 'SALIDA' ? 'text-blue-700 bg-blue-50' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
            onClick={() => { setActiveTab('SALIDA'); setBatchItems([]); }}
          >
            REGISTRAR SALIDA
            {activeTab === 'SALIDA' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="space-y-6">
            {/* Add Item Section */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Agregar Producto a la Lista
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Producto</label>
                  <select 
                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tuplato focus:border-transparent transition-all"
                    value={selectedItemId}
                    onChange={e => setSelectedItemId(e.target.value)}
                  >
                    <option value="">Seleccionar producto...</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} (Stock: {item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItemId && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-bold text-gray-700">Cantidad</label>
                      {selectedItem && (
                        <div className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
                          Stock: {selectedItem.quantity}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between gap-4">
                      <button 
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all active:scale-95 border border-gray-200"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      
                      <div className="flex-1">
                        <input 
                          type="number" 
                          min="1"
                          max={activeTab === 'SALIDA' && selectedItem ? selectedItem.quantity : undefined}
                          value={quantity}
                          onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                          className="w-full h-12 text-center bg-gray-50 rounded-xl border-2 border-transparent focus:border-tuplato focus:bg-white text-2xl font-bold text-gray-900 outline-none transition-all"
                        />
                      </div>

                      <button 
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 shadow-lg transform hover:-translate-y-0.5 ${activeTab === 'ENTRADA' ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30'}`}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <Button 
                      onClick={handleAddToBatch}
                      className="w-full mt-4 bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Agregar a la lista
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Batch List */}
            {batchItems.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                  <span>Productos Seleccionados</span>
                  <span className="bg-tuplato/10 text-tuplato px-2 py-0.5 rounded-full text-xs">{batchItems.length} items</span>
                </h3>
                <div className="space-y-2">
                  {batchItems.map((batchItem, index) => {
                    const item = items.find(i => i.id === batchItem.itemId);
                    if (!item) return null;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                             <img 
                                src={item.image || `https://picsum.photos/seed/${item.id}/100/100`} 
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                                referrerPolicy="no-referrer"
                              />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-mono font-bold text-lg ${activeTab === 'ENTRADA' ? 'text-green-600' : 'text-blue-600'}`}>
                            {activeTab === 'ENTRADA' ? '+' : '-'}{batchItem.quantity}
                          </span>
                          <button 
                            onClick={() => handleRemoveFromBatch(batchItem.itemId)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-100">
              <Input 
                label="Motivo / Notas (General)" 
                placeholder={activeTab === 'ENTRADA' ? 'Ej. Compra de proveedor #123...' : 'Ej. Consumo del día...'}
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="bg-white border-gray-200 focus:border-tuplato focus:ring-tuplato/20"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <Button type="button" variant="secondary" onClick={onClose} className="px-6">Cancelar</Button>
          <Button 
            onClick={handleSubmit}
            disabled={batchItems.length === 0}
            className={`text-white px-8 shadow-lg transition-transform hover:-translate-y-0.5 ${activeTab === 'ENTRADA' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
          >
            Confirmar {batchItems.length} {batchItems.length === 1 ? 'Movimiento' : 'Movimientos'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function ProductDetailModal({ item, movements, onClose, onDelete }: { 
  item: InventoryItem, 
  movements: Movement[],
  onClose: () => void,
  onDelete: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div 
        layoutId={item.id}
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="relative h-48 sm:h-64 bg-gray-100">
          <img 
            src={item.image || `https://picsum.photos/seed/${item.id}/800/400`} 
            alt={item.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h2 className="text-2xl font-bold text-white">{item.name}</h2>
            <p className="text-white/80">{item.category}</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Stock Actual</p>
              <p className={`text-2xl font-bold ${item.quantity <= item.minStock ? 'text-red-600' : 'text-tuplato'}`}>
                {item.quantity} <span className="text-sm font-normal text-gray-500">unidades</span>
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Ubicación</p>
              <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                {item.location || 'No asignada'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {item.description || 'Sin descripción disponible.'}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-tuplato" />
              Últimos Movimientos
            </h3>
            <div className="space-y-3">
              {movements.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay movimientos registrados.</p>
              ) : (
                movements.slice(0, 5).map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${m.type === 'ENTRADA' ? 'bg-green-100 text-green-700' : m.type === 'SALIDA' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {m.type === 'ENTRADA' ? <ArrowUpRight size={14} /> : m.type === 'SALIDA' ? <ArrowDownLeft size={14} /> : <Activity size={14} />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{m.type}</p>
                        <p className="text-xs text-gray-500">{format(new Date(m.date), "d MMM yyyy, HH:mm", { locale: es })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold ${m.type === 'ENTRADA' ? 'text-green-600' : m.type === 'SALIDA' ? 'text-blue-600' : 'text-gray-600'}`}>
                        {m.type === 'SALIDA' ? '-' : '+'}{m.quantity}
                      </span>
                      <p className="text-xs text-gray-500">{m.user}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <Button 
            variant="danger" 
            onClick={onDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Producto
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
