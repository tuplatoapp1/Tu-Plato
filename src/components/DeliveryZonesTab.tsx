import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Plus, Edit2, Trash2, X, Save, DollarSign } from 'lucide-react';
import { usePublicMenu, DeliveryZone } from '../context/PublicMenuContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export default function DeliveryZonesTab() {
  const { deliveryZones, addDeliveryZone, updateDeliveryZone, removeDeliveryZone } = usePublicMenu();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DeliveryZone>>({ name: '', price: 0 });

  const handleAdd = () => {
    setIsEditing('new');
    setFormData({ name: '', price: 0 });
  };

  const handleEdit = (zone: DeliveryZone) => {
    setIsEditing(zone.id);
    setFormData(zone);
  };

  const handleSave = async () => {
    if (!formData.name || formData.price === undefined) return;

    if (isEditing === 'new') {
      await addDeliveryZone({ name: formData.name, price: Number(formData.price) });
    } else if (isEditing) {
      await updateDeliveryZone(isEditing, { name: formData.name, price: Number(formData.price) });
    }
    
    setIsEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta zona de entrega?')) {
      await removeDeliveryZone(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-tuplato/10 p-3 rounded-xl">
            <MapPin className="w-6 h-6 text-tuplato" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Zonas de Entrega</h2>
            <p className="text-sm text-gray-500">Configura las zonas y precios de delivery</p>
          </div>
        </div>
        
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Zona
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {deliveryZones.map((zone) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative group"
            >
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(zone)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(zone.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{zone.name}</h3>
                  <div className="flex items-center gap-1 text-tuplato font-medium mt-1">
                    <DollarSign className="w-4 h-4" />
                    {zone.price.toFixed(2)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {deliveryZones.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">No hay zonas de entrega configuradas</p>
              <p>Agrega zonas para permitir pedidos a domicilio.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal for Add/Edit */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditing === 'new' ? 'Nueva Zona de Entrega' : 'Editar Zona'}
                </h3>
                <button 
                  onClick={() => setIsEditing(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Zona</label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Centro, Norte, Barrio Sur..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Delivery ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price || 0}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsEditing(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!formData.name}>
                  <Save className="w-5 h-5 mr-2" />
                  Guardar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
