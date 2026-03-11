import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Gift, Plus, Edit2, Trash2, Save, X, Image, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useRewards, Prize } from '../context/RewardsContext';
import { toast } from 'sonner';
import { BurgerMascot } from './BurgerMascot';

export default function RewardsConfigTab() {
  const { config, updateConfig, addPrize, updatePrize, removePrize } = useRewards();
  const [xpPerDollar, setXpPerDollar] = useState(config.xpPerDollar.toString());
  const [xpLevels, setXpLevels] = useState([...config.xpLevels]);
  
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Partial<Prize> | null>(null);

  const [isMascotModalOpen, setIsMascotModalOpen] = useState(false);
  const [editingMascotLevel, setEditingMascotLevel] = useState<number | null>(null);
  const [mascotImageUrl, setMascotImageUrl] = useState('');
  const [mascotVideoUrl, setMascotVideoUrl] = useState('');

  const handleSaveConfig = () => {
    const parsedXp = parseFloat(xpPerDollar);
    if (isNaN(parsedXp) || parsedXp <= 0) {
      toast.error('La experiencia por dólar debe ser un número válido mayor a 0');
      return;
    }

    // Ensure levels are strictly increasing
    let isValid = true;
    for (let i = 1; i < xpLevels.length; i++) {
      if (xpLevels[i] <= xpLevels[i - 1]) {
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      toast.error('Los niveles de experiencia deben ir en aumento progresivo');
      return;
    }

    updateConfig({
      xpPerDollar: parsedXp,
      xpLevels: xpLevels
    });
    toast.success('Configuración de niveles guardada');
  };

  const handleLevelChange = (index: number, value: string) => {
    const newLevels = [...xpLevels];
    newLevels[index] = parseInt(value) || 0;
    setXpLevels(newLevels);
  };

  const handleSavePrize = () => {
    if (!editingPrize?.name || !editingPrize?.description || !editingPrize?.pointsRequired) {
      toast.error('Por favor completa todos los campos del premio');
      return;
    }

    if (editingPrize.id) {
      updatePrize(editingPrize.id, editingPrize);
      toast.success('Premio actualizado');
    } else {
      addPrize(editingPrize as Omit<Prize, 'id'>);
      toast.success('Premio creado');
    }
    setIsPrizeModalOpen(false);
    setEditingPrize(null);
  };

  const handleSaveMascot = () => {
    if (editingMascotLevel === null) return;
    
    const newCustomMascots = { ...(config.customMascots || {}) };
    if (mascotImageUrl.trim() === '') {
      delete newCustomMascots[editingMascotLevel];
    } else {
      newCustomMascots[editingMascotLevel] = mascotImageUrl;
    }

    const newCustomVideos = { ...(config.customVideos || {}) };
    if (mascotVideoUrl.trim() === '') {
      delete newCustomVideos[editingMascotLevel];
    } else {
      newCustomVideos[editingMascotLevel] = mascotVideoUrl;
    }
    
    updateConfig({ 
      customMascots: newCustomMascots,
      customVideos: newCustomVideos
    });
    toast.success(`Mascota del Nivel ${editingMascotLevel} actualizada`);
    setIsMascotModalOpen(false);
    setEditingMascotLevel(null);
    setMascotImageUrl('');
    setMascotVideoUrl('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      // Si pesa menos de 2MB, la usamos tal cual (mantiene animación si es GIF)
      if (file.size <= 1024 * 1024 * 2) {
        setMascotImageUrl(base64String);
        return;
      }

      // Si pesa más de 2MB, la comprimimos
      if (file.type === 'image/gif') {
        toast.warning('El GIF es muy pesado y se convertirá en imagen estática para poder guardarlo.');
      } else {
        toast.info('Comprimiendo imagen...');
      }

      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Tamaño máximo ideal para las mascotas (son pequeñas en la UI)
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // --- Algoritmo de eliminación de fondo blanco ---
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Si el píxel es muy cercano al blanco (umbral de 240)
            if (r > 240 && g > 240 && b > 240) {
              data[i + 3] = 0; // Hacerlo transparente
            }
          }
          ctx.putImageData(imageData, 0, 0);
          // -----------------------------------------------

          // Comprimir a WebP con soporte de transparencia
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
          setMascotImageUrl(compressedDataUrl);
          toast.success('Imagen procesada: Fondo blanco eliminado y redimensionada');
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 5) {
      toast.error('El video es demasiado pesado (máx. 5MB). Por favor usa un archivo más pequeño.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMascotVideoUrl(reader.result as string);
      toast.success('Video cargado exitosamente');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* XP & Levels Config */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Niveles de Experiencia</h2>
          </div>
          <Button onClick={handleSaveConfig} size="sm" className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Guardar
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-sm font-bold text-blue-900 mb-2">
              Experiencia (XP) por cada $1 gastado
            </label>
            <div className="flex items-center gap-3">
              <Input 
                type="number" 
                value={xpPerDollar}
                onChange={(e) => setXpPerDollar(e.target.value)}
                className="w-32"
                min="0.1"
                step="0.1"
              />
              <span className="text-blue-700 font-medium">XP</span>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Ejemplo: Si el cliente gasta $20 y configuras 1 XP, ganará 20 XP.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">XP Requerida por Nivel</h3>
            <div className="space-y-3">
              {xpLevels.map((xp, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 font-bold text-gray-500 text-sm">
                    Nivel {index + 1}
                  </div>
                  <div className="flex-1">
                    <Input 
                      type="number" 
                      value={xp}
                      onChange={(e) => handleLevelChange(index, e.target.value)}
                      disabled={index === 0} // Level 1 is always 0
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-400 font-medium">XP</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prizes Config */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-tuplato/10 p-2 rounded-lg">
              <Gift className="w-5 h-5 text-tuplato" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Premios Canjeables</h2>
          </div>
          <Button 
            onClick={() => {
              setEditingPrize({ name: '', description: '', pointsRequired: 100 });
              setIsPrizeModalOpen(true);
            }} 
            size="sm" 
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Premio
          </Button>
        </div>

        <div className="p-6">
          {config.prizes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No hay premios configurados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {config.prizes.map((prize) => (
                <div key={prize.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-tuplato/30 transition-colors">
                  <div>
                    <h4 className="font-bold text-gray-900">{prize.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{prize.description}</p>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                      <Trophy className="w-3 h-3" />
                      {prize.pointsRequired} Puntos
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingPrize(prize);
                        setIsPrizeModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-tuplato hover:bg-tuplato/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('¿Eliminar este premio?')) removePrize(prize.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mascots Config */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden md:col-span-2">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Image className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Mascotas por Nivel</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => {
              const level = i + 1;
              const customImage = config.customMascots?.[level];
              const customVideo = config.customVideos?.[level];
              
              return (
                <div key={level} className="border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center hover:border-tuplato/30 transition-colors relative group">
                  <div className="absolute top-2 right-2 z-10">
                    <button 
                      onClick={() => {
                        setEditingMascotLevel(level);
                        setMascotImageUrl(customImage || '');
                        setMascotVideoUrl(customVideo || '');
                        setIsMascotModalOpen(true);
                      }}
                      className="p-1.5 bg-white text-gray-600 hover:text-tuplato rounded-lg shadow-sm border border-gray-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="h-28 flex items-center justify-center mb-3 transform scale-[0.35] origin-center">
                    <BurgerMascot 
                      level={level} 
                      className="w-64 h-64"
                      customImage={customImage} 
                      customVideo={customVideo}
                    />
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 mb-1">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    NIVEL {level}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {customImage ? 'Personalizada' : 'Por Defecto'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prize Modal */}
      <AnimatePresence>
        {isPrizeModalOpen && editingPrize && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingPrize.id ? 'Editar Premio' : 'Nuevo Premio'}
                </h3>
                <button 
                  onClick={() => setIsPrizeModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <Input 
                  label="Nombre del Premio"
                  value={editingPrize.name || ''}
                  onChange={(e) => setEditingPrize({...editingPrize, name: e.target.value})}
                  placeholder="Ej: Hamburguesa Gratis"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tuplato focus:border-transparent outline-none transition-all resize-none"
                    rows={3}
                    value={editingPrize.description || ''}
                    onChange={(e) => setEditingPrize({...editingPrize, description: e.target.value})}
                    placeholder="Ej: Válido en tu próxima compra"
                  />
                </div>

                <Input 
                  label="Puntos Requeridos"
                  type="number"
                  value={editingPrize.pointsRequired || ''}
                  onChange={(e) => setEditingPrize({...editingPrize, pointsRequired: parseInt(e.target.value) || 0})}
                  min="1"
                />
              </div>

              <div className="p-6 bg-gray-50 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsPrizeModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSavePrize}>
                  {editingPrize.id ? 'Guardar Cambios' : 'Crear Premio'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mascot Modal */}
      <AnimatePresence>
        {isMascotModalOpen && editingMascotLevel !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Editar Mascota - Nivel {editingMascotLevel}
                </h3>
                <button 
                  onClick={() => setIsMascotModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                  <Image className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Personaliza la mascota de este nivel. Puedes subir una imagen estática o un video WebM con transparencia.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Image Section */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Imagen Estática (PNG/JPG/GIF)</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-2 pb-2">
                          <Upload className="w-6 h-6 mb-1 text-gray-400" />
                          <p className="text-xs text-gray-500"><span className="font-semibold">Subir imagen</span></p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <Input 
                      value={mascotImageUrl}
                      onChange={(e) => setMascotImageUrl(e.target.value)}
                      placeholder="O pega una URL de imagen"
                      className="mt-2"
                    />
                  </div>

                  {/* Video Section */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Video Animado (WebM)</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-2 pb-2">
                          <Upload className="w-6 h-6 mb-1 text-gray-400" />
                          <p className="text-xs text-gray-500"><span className="font-semibold">Subir video WebM</span></p>
                        </div>
                        <input type="file" className="hidden" accept="video/webm" onChange={handleVideoUpload} />
                      </label>
                    </div>
                    <Input 
                      value={mascotVideoUrl}
                      onChange={(e) => setMascotVideoUrl(e.target.value)}
                      placeholder="O pega una URL de video"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="mt-4 border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50">
                  <span className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Vista Previa</span>
                  <div className="h-48 flex items-center justify-center">
                    <BurgerMascot 
                      level={editingMascotLevel} 
                      className="w-64 h-64"
                      customImage={mascotImageUrl.trim() !== '' ? mascotImageUrl : undefined} 
                      customVideo={mascotVideoUrl.trim() !== '' ? mascotVideoUrl : undefined}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsMascotModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveMascot}>Guardar Mascota</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
