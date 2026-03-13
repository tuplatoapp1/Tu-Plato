import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Plus, Edit2, Trash2, X, CheckCircle, AlertCircle, DollarSign, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePublicMenu } from '../../context/PublicMenuContext';

export default function DeliveryZonesPage() {
  const { deliveryZones, addDeliveryZone, removeDeliveryZone, updateDeliveryZone } = usePublicMenu();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    estimatedTime: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateDeliveryZone(editingId, formData);
      setEditingId(null);
    } else {
      addDeliveryZone({ ...formData, id: crypto.randomUUID() });
      setIsAdding(false);
    }
    setFormData({ name: '', price: 0, estimatedTime: '' });
  };

  const handleEdit = (zone: any) => {
    setEditingId(zone.id);
    setFormData({
      name: zone.name,
      price: zone.price,
      estimatedTime: zone.estimatedTime
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Zonas de Entrega</h1>
          <p className="text-sm sm:text-base text-gray-500">Gestiona las áreas de cobertura y los costos de envío de tu restaurante.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Nueva Zona
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliveryZones.map((zone) => (
          <motion.div 
            layout
            key={zone.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-tuplato/10 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-tuplato" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(zone)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => removeDeliveryZone(zone.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{zone.name}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  Costo de envío: <span className="font-bold text-gray-900 ml-1">${zone.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  Tiempo estimado: <span className="font-bold text-gray-900 ml-1">{zone.estimatedTime}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {deliveryZones.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay zonas configuradas</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">Agrega zonas de entrega para que tus clientes sepan cuánto cuesta el envío a su ubicación.</p>
            <Button variant="secondary" onClick={() => setIsAdding(true)} className="mt-6">
              <Plus className="w-4 h-4 mr-2" /> Agregar primera zona
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">{editingId ? 'Editar Zona' : 'Nueva Zona'}</h3>
                <button onClick={() => {setIsAdding(false); setEditingId(null);}} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Zona</label>
                    <Input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: Zona Norte, Centro, etc."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Costo de Envío ($)</label>
                      <Input 
                        required
                        type="number"
                        step="0.01"
                        value={formData.price || 0}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo Estimado</label>
                      <Input 
                        required
                        value={formData.estimatedTime}
                        onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
                        placeholder="Ej: 30-45 min"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex justify-end gap-3">
                  <Button variant="secondary" type="button" onClick={() => {setIsAdding(false); setEditingId(null);}}>Cancelar</Button>
                  <Button type="submit">
                    {editingId ? 'Guardar Cambios' : 'Crear Zona'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
