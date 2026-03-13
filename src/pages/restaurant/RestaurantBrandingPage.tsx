import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Image as ImageIcon, Type, Upload, Phone, MapPin, Instagram, Facebook, Plus, Edit2, Trash2, X, ChefHat, CheckCircle, AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePublicMenu, Offer } from '../../context/PublicMenuContext';
import { compressImage } from '../../lib/imageUtils';

export default function RestaurantBrandingPage() {
  const { 
    branding, 
    offers, 
    updateBranding, 
    addOffer, 
    removeOffer, 
    updateOffer, 
    resetConfig 
  } = usePublicMenu();
  
  const [localBranding, setLocalBranding] = useState(branding);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error' | 'saving'>('idle');
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    title: '',
    subtitle: '',
    image: '',
    color: 'from-purple-600 to-blue-600',
    overlayEnabled: true
  });

  React.useEffect(() => {
    setLocalBranding(branding);
  }, [branding]);

  React.useEffect(() => {
    if (saveStatus === 'success' || saveStatus === 'error') {
      const timer = setTimeout(() => setSaveStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleSaveConfig = async () => {
    setSaveStatus('saving');
    const success = await updateBranding(localBranding);
    if (success) {
      setSaveStatus('success');
    } else {
      setSaveStatus('error');
    }
  };

  const handleReset = async () => {
    if (confirm('¿Estás seguro de borrar toda la configuración y volver a los valores por defecto?')) {
      await resetConfig();
      setLocalBranding(branding);
      alert('Configuración reseteada correctamente.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'offer') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      if (type === 'logo') {
        setLocalBranding(prev => ({ 
          ...prev, 
          logoType: 'image', 
          logoValue: compressed 
        }));
      } else if (type === 'offer') {
        if (editingOffer) {
          setEditingOffer(prev => prev ? ({ ...prev, image: compressed }) : null);
        } else {
          setNewOffer(prev => ({ ...prev, image: compressed }));
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al procesar la imagen.');
    }
  };

  const handleAddOffer = () => {
    if (newOffer.title && newOffer.subtitle && newOffer.image) {
      addOffer(newOffer as Omit<Offer, 'id'>);
      setIsAddingOffer(false);
      setNewOffer({ title: '', subtitle: '', image: '', color: 'from-purple-600 to-blue-600' });
    }
  };

  const handleUpdateOffer = () => {
    if (editingOffer && editingOffer.id && editingOffer.title && editingOffer.subtitle && editingOffer.image) {
      updateOffer(editingOffer.id, editingOffer);
      setEditingOffer(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configuración Pública</h1>
          <p className="text-sm sm:text-base text-gray-500">Personaliza la apariencia y la información de contacto de tu menú digital.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" onClick={handleReset} className="flex-1 sm:flex-none text-red-600 border-red-100 hover:bg-red-50">
            Resetear
          </Button>
          <Button 
            onClick={handleSaveConfig} 
            disabled={saveStatus === 'saving'}
            className="flex-1 sm:flex-none min-w-[140px]"
          >
            {saveStatus === 'saving' ? 'Guardando...' : 
             saveStatus === 'success' ? <><CheckCircle className="w-4 h-4 mr-2" /> Guardado</> : 
             saveStatus === 'error' ? <><AlertCircle className="w-4 h-4 mr-2" /> Error</> : 
             'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branding Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="bg-tuplato/10 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-tuplato" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Identidad de Marca</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Restaurante</label>
              <Input 
                value={localBranding.restaurantName}
                onChange={(e) => setLocalBranding(prev => ({ ...prev, restaurantName: e.target.value }))}
                placeholder="Ej: Tu Plato"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                  {localBranding.logoType === 'image' ? (
                    <img src={localBranding.logoValue} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    // @ts-ignore
                    React.createElement(LucideIcons[localBranding.logoValue] || ChefHat, { className: "w-8 h-8 text-gray-400" })
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <Button 
                      variant={localBranding.logoType === 'icon' ? 'primary' : 'secondary'}
                      onClick={() => setLocalBranding(prev => ({ ...prev, logoType: 'icon' }))}
                      className="flex-1 text-xs"
                    >
                      <Type className="w-3 h-3 mr-1" /> Icono
                    </Button>
                    <Button 
                      variant={localBranding.logoType === 'image' ? 'primary' : 'secondary'}
                      onClick={() => setLocalBranding(prev => ({ ...prev, logoType: 'image' }))}
                      className="flex-1 text-xs"
                    >
                      <ImageIcon className="w-3 h-3 mr-1" /> Imagen
                    </Button>
                  </div>
                  
                  {localBranding.logoType === 'icon' ? (
                    <Input 
                      value={localBranding.logoValue}
                      onChange={(e) => setLocalBranding(prev => ({ ...prev, logoValue: e.target.value }))}
                      placeholder="Nombre del icono (ej: ChefHat)"
                    />
                  ) : (
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="secondary" className="w-full">
                        <Upload className="w-4 h-4 mr-2" /> Subir Imagen
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Social Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="bg-tuplato/10 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-tuplato" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Contacto y Redes</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  value={localBranding.address}
                  onChange={(e) => setLocalBranding(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ej: Av. Principal 123"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">WhatsApp para Pedidos</h3>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  value={localBranding.whatsappNumber || ''}
                  onChange={(e) => setLocalBranding(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  placeholder="Número de WhatsApp (ej: 58424...)"
                  className="pl-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plantilla de Mensaje</label>
                <textarea
                  value={localBranding.whatsappMessageTemplate || ''}
                  onChange={(e) => setLocalBranding(prev => ({ ...prev, whatsappMessageTemplate: e.target.value }))}
                  placeholder="Plantilla del mensaje..."
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Redes Sociales (URLs)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    value={localBranding.socialLinks?.instagram || ''}
                    onChange={(e) => setLocalBranding(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value } 
                    }))}
                    placeholder="Instagram"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    value={localBranding.socialLinks?.facebook || ''}
                    onChange={(e) => setLocalBranding(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, facebook: e.target.value } 
                    }))}
                    placeholder="Facebook"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offers Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-tuplato/10 p-2 rounded-lg">
              <Plus className="w-5 h-5 text-tuplato" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Ofertas y Banners</h2>
          </div>
          <Button onClick={() => setIsAddingOffer(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Nueva Oferta
          </Button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-video">
                <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${offer.color} opacity-60`} />
                <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                  <h3 className="font-bold text-lg leading-tight">{offer.title}</h3>
                  <p className="text-sm opacity-90">{offer.subtitle}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingOffer(offer)} className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => removeOffer(offer.id)} className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Offer Modals */}
      <AnimatePresence>
        {(isAddingOffer || editingOffer) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">{editingOffer ? 'Editar Oferta' : 'Nueva Oferta'}</h3>
                <button onClick={() => {setIsAddingOffer(false); setEditingOffer(null);}} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <Input 
                    value={editingOffer ? editingOffer.title : newOffer.title}
                    onChange={(e) => editingOffer ? setEditingOffer({...editingOffer, title: e.target.value}) : setNewOffer({...newOffer, title: e.target.value})}
                    placeholder="Ej: 2x1 en Hamburguesas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                  <Input 
                    value={editingOffer ? editingOffer.subtitle : newOffer.subtitle}
                    onChange={(e) => editingOffer ? setEditingOffer({...editingOffer, subtitle: e.target.value}) : setNewOffer({...newOffer, subtitle: e.target.value})}
                    placeholder="Ej: Solo los jueves"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'offer')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="secondary" className="w-full">
                      <Upload className="w-4 h-4 mr-2" /> {(editingOffer?.image || newOffer.image) ? 'Cambiar Imagen' : 'Subir Imagen'}
                    </Button>
                  </div>
                  {(editingOffer?.image || newOffer.image) && (
                    <img src={editingOffer?.image || newOffer.image} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-lg" />
                  )}
                </div>
              </div>
              <div className="p-6 bg-gray-50 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => {setIsAddingOffer(false); setEditingOffer(null);}}>Cancelar</Button>
                <Button onClick={editingOffer ? handleUpdateOffer : handleAddOffer}>
                  {editingOffer ? 'Guardar Cambios' : 'Crear Oferta'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
