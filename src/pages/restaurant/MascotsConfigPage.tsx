import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, X, Star, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePublicMenu } from '../../context/PublicMenuContext';
import { toast } from 'sonner';
import { BurgerMascot } from '../../components/BurgerMascot';

export default function MascotsConfigPage() {
  const { xpConfig, updateXPConfig } = usePublicMenu();

  const [isMascotModalOpen, setIsMascotModalOpen] = useState(false);
  const [editingMascotLevel, setEditingMascotLevel] = useState<number | null>(null);
  const [mascotImageUrl, setMascotImageUrl] = useState('');
  const [mascotVideoUrl, setMascotVideoUrl] = useState('');

  const handleSaveMascot = () => {
    if (editingMascotLevel === null) return;
    
    const newCustomMascots = { ...(xpConfig.customMascots || {}) };
    if (mascotImageUrl.trim() === '') {
      delete newCustomMascots[editingMascotLevel];
    } else {
      newCustomMascots[editingMascotLevel] = mascotImageUrl;
    }

    const newCustomVideos = { ...(xpConfig.customVideos || {}) };
    if (mascotVideoUrl.trim() === '') {
      delete newCustomVideos[editingMascotLevel];
    } else {
      newCustomVideos[editingMascotLevel] = mascotVideoUrl;
    }
    
    updateXPConfig({ 
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
      
      if (file.size <= 1024 * 1024 * 2) {
        setMascotImageUrl(base64String);
        return;
      }

      if (file.type === 'image/gif') {
        toast.warning('El GIF es muy pesado y se convertirá en imagen estática para poder guardarlo.');
      } else {
        toast.info('Comprimiendo imagen...');
      }

      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement('canvas');
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
          
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (r > 240 && g > 240 && b > 240) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imageData, 0, 0);

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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mascotas por Nivel</h1>
          <p className="text-sm sm:text-base text-gray-500">Configura la mascota que representará cada nivel de experiencia.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <ImageIcon className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Mascotas por Nivel</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => {
              const level = i + 1;
              const customImage = xpConfig.customMascots?.[level];
              const customVideo = xpConfig.customVideos?.[level];
              
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
                    {customImage || customVideo ? 'Personalizada' : 'Por Defecto'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
                  <ImageIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
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
              
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsMascotModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveMascot}>
                  Guardar Mascota
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
