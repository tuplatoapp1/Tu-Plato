import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Plus, Edit2, Trash2, X, Star, Gift, Zap, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePublicMenu } from '../../context/PublicMenuContext';

export default function RewardsConfigPage() {
  const { rewards, addReward, removeReward, updateReward, xpConfig, updateXPConfig } = usePublicMenu();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    xpRequired: 0,
    icon: 'Gift',
    image: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateReward(editingId, formData);
      setEditingId(null);
    } else {
      addReward({ ...formData, id: crypto.randomUUID() });
      setIsAdding(false);
    }
    setFormData({ title: '', description: '', xpRequired: 0, icon: 'Gift', image: '' });
  };

  const handleEdit = (reward: any) => {
    setEditingId(reward.id);
    setFormData({
      title: reward.title,
      description: reward.description,
      xpRequired: reward.xpRequired,
      icon: reward.icon,
      image: reward.image || ''
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Premios y XP</h1>
          <p className="text-sm sm:text-base text-gray-500">Configura el sistema de gamificación para fidelizar a tus clientes.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Premio
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* XP Configuration */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-tuplato/10 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-tuplato" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Configuración de XP</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">XP por cada $1 gastado</label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number"
                    value={xpConfig.xpPerDollar || 0}
                    onChange={(e) => updateXPConfig({ xpPerDollar: parseInt(e.target.value) || 0 })}
                    className="flex-1"
                  />
                  <div className="bg-tuplato/10 text-tuplato px-3 py-1 rounded-full text-xs font-bold">
                    {xpConfig.xpPerDollar} XP/$
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Define cuántos puntos de experiencia recibe el cliente por cada dólar en su pedido.</p>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Niveles sugeridos</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Bronce', xp: 0, color: 'bg-amber-700' },
                    { name: 'Plata', xp: 500, color: 'bg-gray-400' },
                    { name: 'Oro', xp: 1500, color: 'bg-yellow-500' },
                    { name: 'Platino', xp: 5000, color: 'bg-blue-400' },
                  ].map((level) => (
                    <div key={level.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${level.color}`} />
                        <span className="text-sm font-medium text-gray-700">{level.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500">{level.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rewards.map((reward) => (
              <motion.div 
                layout
                key={reward.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      {reward.image ? (
                        <img 
                          src={reward.image} 
                          alt={reward.title} 
                          className="w-16 h-16 rounded-xl object-contain bg-gray-50 border border-gray-100 p-1"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="bg-tuplato/10 p-3 rounded-xl">
                          <Trophy className="w-6 h-6 text-tuplato" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(reward)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => removeReward(reward.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{reward.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{reward.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center text-tuplato font-bold">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      {reward.xpRequired} XP
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                      Requerido para canje
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {rewards.length === 0 && (
              <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No hay premios configurados</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-2">Crea incentivos para que tus clientes acumulen XP y vuelvan a pedir.</p>
                <Button variant="secondary" onClick={() => setIsAdding(true)} className="mt-6">
                  <Plus className="w-4 h-4 mr-2" /> Agregar primer premio
                </Button>
              </div>
            )}
          </div>
        </div>
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
                <h3 className="font-bold text-lg">{editingId ? 'Editar Premio' : 'Nuevo Premio'}</h3>
                <button onClick={() => {setIsAdding(false); setEditingId(null);}} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título del Premio</label>
                    <Input 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ej: Hamburguesa Gratis, 20% de Descuento"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe qué obtiene el cliente..."
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">XP Requerido</label>
                    <Input 
                      required
                      type="number"
                      value={formData.xpRequired || 0}
                      onChange={(e) => setFormData({...formData, xpRequired: parseInt(e.target.value) || 0})}
                      placeholder="Ej: 500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Premio (Opcional)</label>
                    <div className="flex items-center gap-4">
                      {formData.image && (
                        <div className="relative w-20 h-20 shrink-0">
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="w-full h-full object-contain bg-gray-50 rounded-xl border border-gray-200 p-1"
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, image: ''})}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <label className="flex-1 flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-2 pb-2">
                          <Upload className="w-5 h-5 mb-1 text-gray-400" />
                          <p className="text-[10px] text-gray-500"><span className="font-semibold">Subir imagen</span></p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({...formData, image: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }} 
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex justify-end gap-3">
                  <Button variant="secondary" type="button" onClick={() => {setIsAdding(false); setEditingId(null);}}>Cancelar</Button>
                  <Button type="submit">
                    {editingId ? 'Guardar Cambios' : 'Crear Premio'}
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
