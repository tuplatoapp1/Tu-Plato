import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'react-qr-code';
import { Search, Filter, Utensils, Coffee, Wine, Pizza, IceCream, ChefHat, Plus, Edit2, Trash2, ExternalLink, Settings, Image as ImageIcon, Type, Palette, X, Upload, Phone, MapPin, Instagram, Facebook, Clock, Ban, CheckCircle, Share2, Copy, Trophy } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MenuItem, MenuTag } from '../data/menu';
import { usePublicMenu, Offer } from '../context/PublicMenuContext';
import { compressImage } from '../lib/imageUtils';
import RewardsConfigTab from '../components/RewardsConfigTab';

const CATEGORIES = [
  { id: 'all', label: 'Todo', icon: Utensils },
  { id: 'entradas', label: 'Entradas', icon: Pizza },
  { id: 'principales', label: 'Principales', icon: ChefHat },
  { id: 'postres', label: 'Postres', icon: IceCream },
  { id: 'bebidas', label: 'Bebidas', icon: Wine },
];

export default function RestaurantMenuPage() {
  const [activeTab, setActiveTab] = useState<'menu' | 'config' | 'rewards'>('menu');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Config Context
  const { 
    branding, 
    offers, 
    menuItems,
    categories,
    tags,
    deliveryZones,
    updateBranding, 
    addOffer, 
    removeOffer, 
    updateOffer, 
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    addCategory,
    updateCategory,
    removeCategory,
    addTag,
    updateTag,
    removeTag,
    addDeliveryZone,
    removeDeliveryZone,
    resetConfig 
  } = usePublicMenu();
  
  // Local state for draft configuration
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

  // Categories & Tags Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{id?: string, label: string, icon: string} | null>(null);
  const [editingTag, setEditingTag] = useState<{id?: string, label: string, icon: string, color: string} | null>(null);
  const [newZone, setNewZone] = useState({ name: '', price: '' });
  const [manageTab, setManageTab] = useState<'create' | 'edit'>('create'); // For inside modals

  // Menu Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

  // Sync local state when context changes (initial load)
  React.useEffect(() => {
    setLocalBranding(branding);
  }, [branding]);

  // Reset status after 3 seconds
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
      setLocalBranding(branding); // Will be updated by useEffect, but safe to do here
      alert('Configuración reseteada correctamente.');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'offer' | 'menuItem' | 'category' | 'tag') => {
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
      } else if (type === 'menuItem') {
        setEditingItem(prev => prev ? ({ ...prev, image: compressed }) : null);
      } else if (type === 'category') {
        setEditingCategory(prev => prev ? ({ ...prev, icon: compressed }) : null);
      } else if (type === 'tag') {
        setEditingTag(prev => prev ? ({ ...prev, icon: compressed }) : null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al procesar la imagen. Intenta con otra.');
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

  const openEditOfferModal = (offer: Offer) => {
    setEditingOffer(offer);
  };

  const handleSaveCategory = async () => {
    if (!editingCategory || !editingCategory.label) return;
    
    if (editingCategory.id) {
      await updateCategory(editingCategory.id, editingCategory);
    } else {
      await addCategory(editingCategory as any);
    }
    setEditingCategory(null);
    setIsCategoryModalOpen(false);
  };

  const handleSaveTag = async () => {
    if (!editingTag || !editingTag.label) return;
    
    if (editingTag.id) {
      await updateTag(editingTag.id, editingTag);
    } else {
      await addTag(editingTag as any);
    }
    setEditingTag(null);
    setIsTagModalOpen(false);
  };

  const openNewCategoryModal = () => {
    setEditingCategory({ label: '', icon: 'Utensils' });
    setManageTab('create');
    setIsCategoryModalOpen(true);
  };

  const openNewTagModal = () => {
    setEditingTag({ label: '', icon: 'Tag', color: 'blue' });
    setManageTab('create');
    setIsTagModalOpen(true);
  };

  const handleSaveMenuItem = async () => {
    if (!editingItem || !editingItem.name || !editingItem.price || !editingItem.category) return;

    if (editingItem.id) {
      // Update
      await updateMenuItem(editingItem.id, editingItem);
    } else {
      // Create
      await addMenuItem({
        ...editingItem,
        isAvailable: true,
        image: editingItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' // Default image
      } as Omit<MenuItem, 'id'>);
    }
    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  const openNewItemModal = () => {
    setEditingItem({
      name: '',
      description: '',
      price: 0,
      category: 'entradas',
      image: '',
      isAvailable: true,
      tags: []
    });
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este plato?')) {
      await removeMenuItem(id);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
  };

  const toggleTag = (tag: MenuTag) => {
    if (!editingItem) return;
    const currentTags = editingItem.tags || [];
    const newTags = currentTags.includes(tag) 
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setEditingItem({ ...editingItem, tags: newTags });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Tabs Header */}
      <div className="relative mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all snap-start whitespace-nowrap ${
              activeTab === 'menu' 
                ? 'bg-tuplato text-white shadow-md shadow-tuplato/20' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Menú del Restaurante
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all snap-start whitespace-nowrap ${
              activeTab === 'config' 
                ? 'bg-tuplato text-white shadow-md shadow-tuplato/20' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configuración Pública
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all snap-start whitespace-nowrap ${
              activeTab === 'rewards' 
                ? 'bg-tuplato text-white shadow-md shadow-tuplato/20' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Niveles, XP y Premios
          </button>
        </div>
        {/* Gradient fade for scroll indication on mobile */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none md:hidden" />
      </div>

      {activeTab === 'menu' ? (
        <>
          {/* Hero Section */}
          <div className="relative rounded-3xl overflow-hidden bg-gray-900 h-64 md:h-80 flex items-center justify-center text-center shadow-2xl">
            <div className="absolute inset-0 opacity-40">
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80" 
                alt="Restaurant Ambience" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 p-6 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
                  Menú Degustación
                </h1>
                <p className="text-lg md:text-xl text-gray-200 font-light">
                  Una experiencia culinaria diseñada para despertar tus sentidos.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 sticky top-20 z-20 bg-tuplato-bg/95 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent">
            {/* Category Tabs */}
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 w-full md:w-auto no-scrollbar">
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-tuplato text-white shadow-lg shadow-tuplato/30 transform scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Utensils className={`w-4 h-4 ${activeCategory === 'all' ? 'text-white' : 'text-gray-400'}`} />
                Todo
              </button>
                  {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-tuplato text-white shadow-lg shadow-tuplato/30 transform scale-105'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {cat.icon.startsWith('data:') || cat.icon.startsWith('http') ? (
                    <img src={cat.icon} alt={cat.label} className="w-4 h-4 object-cover rounded-sm" />
                  ) : (
                    /* @ts-ignore */
                    React.createElement(LucideIcons[cat.icon] || Utensils, { className: `w-4 h-4 ${activeCategory === cat.id ? 'text-white' : 'text-gray-400'}` })
                  )}
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar plato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato bg-white shadow-sm transition-all"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={openNewCategoryModal} variant="secondary" className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm h-11 px-3" title="Gestionar Categorías">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button onClick={openNewTagModal} variant="secondary" className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm h-11 px-3" title="Gestionar Etiquetas">
                  <LucideIcons.Tag className="w-4 h-4" />
                </Button>
              </div>

              <Link to="/public-menu">
                <Button variant="secondary" className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm h-11">
                  <ExternalLink className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Vista Cliente</span>
                </Button>
              </Link>

              <Button onClick={openNewItemModal} className="bg-gray-900 text-white hover:bg-black shadow-lg">
                <Plus className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Nuevo Plato</span>
              </Button>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layoutId={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                className={`bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl border transition-all group flex gap-4 md:gap-6 ${
                  !item.isAvailable ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                }`}
              >
                {/* Image */}
                <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-xl overflow-hidden relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className={`w-full h-full object-cover transition-transform duration-500 ${item.isAvailable ? 'group-hover:scale-110' : 'grayscale'}`}
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-wider border border-white/50 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">Agotado</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight group-hover:text-tuplato transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-lg font-serif font-bold text-tuplato shrink-0">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      {item.category}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleAvailability(item)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.isAvailable 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-red-500 hover:bg-red-50 bg-red-50'
                        }`}
                        title={item.isAvailable ? "Marcar como agotado" : "Marcar como disponible"}
                      >
                        {item.isAvailable ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => openEditItemModal(item)}
                        className="p-1.5 text-gray-400 hover:text-tuplato hover:bg-tuplato/5 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No se encontraron platos</h3>
              <p className="text-gray-500 mt-2">Intenta ajustar los filtros o tu búsqueda.</p>
            </div>
          )}

          {/* Add/Edit Menu Item Modal */}
          <AnimatePresence>
            {isItemModalOpen && editingItem && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="font-bold text-lg">{editingItem.id ? 'Editar Plato' : 'Nuevo Plato'}</h3>
                    <button onClick={() => setIsItemModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plato</label>
                        <Input 
                          value={editingItem.name}
                          onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                          placeholder="Ej: Hamburguesa Clásica"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                        <Input 
                          type="number"
                          value={editingItem.price}
                          onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, price: parseFloat(e.target.value) }) : null)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                        <select
                          value={editingItem.category}
                          onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, category: e.target.value }) : null)}
                          className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                          value={editingItem.description}
                          onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                          placeholder="Descripción detallada del plato..."
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Etiquetas</label>
                        <div className="flex flex-wrap gap-2">
                          {tags.map(tag => (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.id as MenuTag)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${
                                editingItem.tags?.includes(tag.id as MenuTag)
                                  ? 'bg-tuplato text-white border-tuplato'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {/* @ts-ignore */}
                              <span>{React.createElement(LucideIcons[tag.icon] || LucideIcons.Tag, { className: "w-3 h-3" })}</span> {tag.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'menuItem')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                            {editingItem.image ? (
                              <img src={editingItem.image} alt="Preview" className="h-40 w-full object-cover rounded-lg mx-auto" />
                            ) : (
                              <div className="py-8 text-gray-400">
                                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                <span className="text-sm">Click para subir imagen</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
                    <Button variant="secondary" onClick={() => setIsItemModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveMenuItem} disabled={!editingItem.name || !editingItem.price}>
                      {editingItem.id ? 'Guardar Cambios' : 'Crear Plato'}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      ) : activeTab === 'config' ? (
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
                  <p className="text-xs text-gray-500 mt-1">Variables disponibles: {'{restaurantName}'}, {'{customerName}'}, {'{customerPhone}'}, {'{address}'}, {'{mapLink}'}, {'{orderItems}'}, {'{totalPrice}'}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Redes Sociales (URLs)</h3>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    value={localBranding.socialLinks?.instagram || ''}
                    onChange={(e) => setLocalBranding(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value } 
                    }))}
                    placeholder="Instagram URL"
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
                    placeholder="Facebook URL"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    value={localBranding.socialLinks?.whatsapp || ''}
                    onChange={(e) => setLocalBranding(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, whatsapp: e.target.value } 
                    }))}
                    placeholder="WhatsApp Link (ej: https://wa.me/57...)"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden md:col-span-2">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-tuplato/10 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-tuplato" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Horarios de Atención</h2>
              </div>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => setLocalBranding(prev => ({
                  ...prev,
                  schedule: [...prev.schedule, { id: Date.now().toString(), days: '', hours: '' }]
                }))}
              >
                <Plus className="w-4 h-4 mr-1" /> Agregar Horario
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {localBranding.schedule?.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input 
                      value={item.days}
                      onChange={(e) => {
                        const newSchedule = localBranding.schedule.map((s, i) => 
                          i === index ? { ...s, days: e.target.value } : s
                        );
                        setLocalBranding(prev => ({ ...prev, schedule: newSchedule }));
                      }}
                      placeholder="Días (ej: Lunes - Viernes)"
                    />
                  </div>
                  <div className="flex-1">
                    <Input 
                      value={item.hours}
                      onChange={(e) => {
                        const newSchedule = localBranding.schedule.map((s, i) => 
                          i === index ? { ...s, hours: e.target.value } : s
                        );
                        setLocalBranding(prev => ({ ...prev, schedule: newSchedule }));
                      }}
                      placeholder="Horas (ej: 12:00 - 22:00)"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const newSchedule = localBranding.schedule.filter(s => s.id !== item.id);
                      setLocalBranding(prev => ({ ...prev, schedule: newSchedule }));
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {localBranding.schedule?.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No hay horarios configurados.</p>
              )}
            </div>
          </div>

          {/* Delivery Zones Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden md:col-span-2">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-tuplato/10 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-tuplato" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Zonas de Reparto (Lista)</h2>
              </div>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => {
                  setNewZone({ name: '', price: '' });
                  setIsZoneModalOpen(true);
                }}
              >
                <Settings className="w-4 h-4 mr-1" /> Gestionar Zonas
              </Button>
            </div>
            <div className="p-6">
              {deliveryZones.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">No hay zonas configuradas.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {deliveryZones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="font-medium text-gray-700">{zone.name}</span>
                      <span className="font-bold text-green-600">${zone.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Offers Carousel Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden md:col-span-2">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-tuplato/10 p-2 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-tuplato" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Carrusel de Ofertas</h2>
              </div>
              <Button size="sm" onClick={() => setIsAddingOffer(true)}>
                <Plus className="w-4 h-4 mr-1" /> Agregar
              </Button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-tuplato/30 transition-colors group relative">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                      <h4 className="font-bold text-gray-900 truncate">{offer.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{offer.subtitle}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button 
                        onClick={() => openEditOfferModal(offer)}
                        className="p-1.5 bg-white rounded-full shadow-sm text-gray-400 hover:text-tuplato border border-gray-100"
                        title="Editar Oferta"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar esta oferta?')) removeOffer(offer.id);
                        }}
                        className="p-1.5 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 border border-gray-100"
                        title="Eliminar Oferta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {offers.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No hay ofertas activas. Agrega una para mostrar en el carrusel.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="md:col-span-2 sticky bottom-6 z-10 flex flex-col items-center gap-4">
            <AnimatePresence>
              {saveStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-100 text-green-800 px-6 py-3 rounded-full shadow-lg border border-green-200 flex items-center gap-2"
                >
                  <LucideIcons.CheckCircle className="w-5 h-5" />
                  <span className="font-bold">¡Cambios guardados correctamente!</span>
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-100 text-red-800 px-6 py-3 rounded-full shadow-lg border border-red-200 flex items-center gap-2"
                >
                  <LucideIcons.AlertCircle className="w-5 h-5" />
                  <span className="font-bold">Error al guardar. Posiblemente la imagen es muy pesada.</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveConfig}
                className="bg-tuplato text-white px-8 py-4 rounded-full shadow-xl shadow-tuplato/30 font-bold text-lg flex items-center gap-2 hover:bg-tuplato-dark transition-colors"
              >
                <Upload className="w-5 h-5" />
                Subir Cambios al Menú Público
              </motion.button>
              
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-400 hover:text-red-500 text-sm underline"
              >
                Resetear Configuración
              </button>
            </div>
          </div>

          {/* Share Menu Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden md:col-span-2 mt-8">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
              <div className="bg-tuplato/10 p-2 rounded-lg">
                <Share2 className="w-5 h-5 text-tuplato" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Compartir Menú</h2>
            </div>
            <div className="p-6 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enlace del Menú Público</label>
                  <div className="flex gap-2">
                    <Input 
                      value={`${window.location.origin}/public-menu`} 
                      readOnly 
                      className="bg-gray-50 text-gray-500"
                    />
                    <Button onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/public-menu`);
                      alert('Enlace copiado al portapapeles');
                    }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                  <p className="font-bold mb-1">💡 Tip:</p>
                  Comparte este enlace en tus redes sociales (Instagram Bio, Facebook) o envíalo por WhatsApp a tus clientes.
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="bg-white p-2">
                  <QRCode value={`${window.location.origin}/public-menu`} size={150} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Escanea para ver el menú</span>
              </div>
            </div>
          </div>

          {/* Add Offer Modal */}
          <AnimatePresence>
            {isAddingOffer && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Nueva Oferta</h3>
                    <button onClick={() => setIsAddingOffer(false)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <Input 
                        value={newOffer.title}
                        onChange={(e) => setNewOffer(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ej: 2x1 en Cervezas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                      <Input 
                        value={newOffer.subtitle}
                        onChange={(e) => setNewOffer(prev => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Ej: Todos los viernes de 18:00 a 20:00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'offer')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                          {newOffer.image ? (
                            <div className="relative h-32 w-full rounded-lg overflow-hidden mx-auto">
                              <img src={newOffer.image} alt="Preview" className="h-full w-full object-cover" />
                              {newOffer.overlayEnabled && (
                                <div className={`absolute inset-0 bg-gradient-to-t ${newOffer.color} mix-blend-multiply opacity-60`} />
                              )}
                              <div className="absolute bottom-2 left-2 text-white text-xs font-bold drop-shadow-md">Vista Previa</div>
                            </div>
                          ) : (
                            <div className="py-4 text-gray-400">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                              <span className="text-sm">Click para subir imagen</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sombra / Color</label>
                        <select 
                          value={newOffer.color}
                          onChange={(e) => setNewOffer(prev => ({ ...prev, color: e.target.value }))}
                          disabled={!newOffer.overlayEnabled}
                          className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="from-purple-600 to-blue-600">Morado - Azul</option>
                          <option value="from-orange-600 to-red-600">Naranja - Rojo</option>
                          <option value="from-green-600 to-emerald-600">Verde - Esmeralda</option>
                          <option value="from-gray-900 to-black">Negro (Oscuro)</option>
                        </select>
                      </div>
                      <div className="flex items-center h-full pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newOffer.overlayEnabled !== false}
                            onChange={(e) => setNewOffer(prev => ({ ...prev, overlayEnabled: e.target.checked }))}
                            className="w-4 h-4 text-tuplato rounded border-gray-300 focus:ring-tuplato"
                          />
                          <span className="text-sm text-gray-700">Activar Sombra de Color</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setIsAddingOffer(false)}>Cancelar</Button>
                    <Button onClick={handleAddOffer} disabled={!newOffer.title || !newOffer.image}>
                      Crear Oferta
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Edit Offer Modal */}
          <AnimatePresence>
            {editingOffer && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Editar Oferta</h3>
                    <button onClick={() => setEditingOffer(null)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <Input 
                        value={editingOffer.title}
                        onChange={(e) => setEditingOffer(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                        placeholder="Ej: 2x1 en Cervezas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                      <Input 
                        value={editingOffer.subtitle}
                        onChange={(e) => setEditingOffer(prev => prev ? ({ ...prev, subtitle: e.target.value }) : null)}
                        placeholder="Ej: Todos los viernes de 18:00 a 20:00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'offer')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                          {editingOffer.image ? (
                            <div className="relative h-32 w-full rounded-lg overflow-hidden mx-auto">
                              <img src={editingOffer.image} alt="Preview" className="h-full w-full object-cover" />
                              {editingOffer.overlayEnabled !== false && (
                                <div className={`absolute inset-0 bg-gradient-to-t ${editingOffer.color} mix-blend-multiply opacity-60`} />
                              )}
                              <div className="absolute bottom-2 left-2 text-white text-xs font-bold drop-shadow-md">Vista Previa</div>
                            </div>
                          ) : (
                            <div className="py-4 text-gray-400">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                              <span className="text-sm">Click para subir imagen</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sombra / Color</label>
                        <select 
                          value={editingOffer.color}
                          onChange={(e) => setEditingOffer(prev => prev ? ({ ...prev, color: e.target.value }) : null)}
                          disabled={editingOffer.overlayEnabled === false}
                          className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="from-purple-600 to-blue-600">Morado - Azul</option>
                          <option value="from-orange-600 to-red-600">Naranja - Rojo</option>
                          <option value="from-green-600 to-emerald-600">Verde - Esmeralda</option>
                          <option value="from-gray-900 to-black">Negro (Oscuro)</option>
                        </select>
                      </div>
                      <div className="flex items-center h-full pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editingOffer.overlayEnabled !== false}
                            onChange={(e) => setEditingOffer(prev => prev ? ({ ...prev, overlayEnabled: e.target.checked }) : null)}
                            className="w-4 h-4 text-tuplato rounded border-gray-300 focus:ring-tuplato"
                          />
                          <span className="text-sm text-gray-700">Activar Sombra de Color</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setEditingOffer(null)}>Cancelar</Button>
                    <Button onClick={handleUpdateOffer}>
                      Guardar Cambios
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : activeTab === 'rewards' ? (
        <RewardsConfigTab />
      ) : null}

      {/* Category Management Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">Gestionar Categorías</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex border-b border-gray-100">
                <button 
                  onClick={() => setManageTab('create')}
                  className={`flex-1 py-3 text-sm font-medium ${manageTab === 'create' ? 'text-tuplato border-b-2 border-tuplato' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Crear / Editar
                </button>
                <button 
                  onClick={() => setManageTab('edit')}
                  className={`flex-1 py-3 text-sm font-medium ${manageTab === 'edit' ? 'text-tuplato border-b-2 border-tuplato' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Lista de Categorías
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {manageTab === 'create' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría</label>
                      <Input 
                        value={editingCategory?.label || ''}
                        onChange={(e) => setEditingCategory(prev => prev ? ({ ...prev, label: e.target.value }) : null)}
                        placeholder="Ej: Sopas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icono de Categoría</label>
                      <div className="flex gap-4 items-start">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
                          {editingCategory?.icon && (editingCategory.icon.startsWith('data:') || editingCategory.icon.startsWith('http')) ? (
                            <img src={editingCategory.icon} alt="Icon" className="w-full h-full object-cover" />
                          ) : (
                            // @ts-ignore
                            React.createElement(LucideIcons[editingCategory?.icon] || Utensils, { className: "w-8 h-8 text-gray-400" })
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-2">
                            <Button 
                              variant={!(editingCategory?.icon?.startsWith('data:') || editingCategory?.icon?.startsWith('http')) ? 'primary' : 'secondary'}
                              onClick={() => setEditingCategory(prev => prev ? ({ ...prev, icon: 'Utensils' }) : null)}
                              className="flex-1 text-xs h-8"
                              type="button"
                            >
                              <Type className="w-3 h-3 mr-1" /> Icono
                            </Button>
                            <Button 
                              variant={(editingCategory?.icon?.startsWith('data:') || editingCategory?.icon?.startsWith('http')) ? 'primary' : 'secondary'}
                              onClick={() => {
                                // Trigger file input click via ref or just show the input
                              }}
                              className="flex-1 text-xs h-8"
                              type="button"
                            >
                              <ImageIcon className="w-3 h-3 mr-1" /> Imagen
                            </Button>
                          </div>
                          
                          {!(editingCategory?.icon?.startsWith('data:') || editingCategory?.icon?.startsWith('http')) ? (
                            <div>
                              <Input 
                                value={editingCategory?.icon || ''}
                                onChange={(e) => setEditingCategory(prev => prev ? ({ ...prev, icon: e.target.value }) : null)}
                                placeholder="Ej: Soup, Pizza, Coffee"
                              />
                              <p className="text-xs text-gray-500 mt-1">Usa nombres de iconos en inglés (Lucide Icons)</p>
                            </div>
                          ) : (
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'category')}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <Button variant="secondary" className="w-full h-10" type="button">
                                <Upload className="w-4 h-4 mr-2" /> Subir Imagen
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button onClick={handleSaveCategory} disabled={!editingCategory?.label} className="w-full">
                        {editingCategory?.id ? 'Actualizar Categoría' : 'Crear Categoría'}
                      </Button>
                      {editingCategory?.id && (
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            setEditingCategory({ label: '', icon: 'Utensils' });
                            setManageTab('create');
                          }} 
                          className="w-full mt-2"
                        >
                          Cancelar Edición
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-md shadow-sm w-8 h-8 flex items-center justify-center overflow-hidden">
                            {cat.icon.startsWith('data:') || cat.icon.startsWith('http') ? (
                              <img src={cat.icon} alt={cat.label} className="w-full h-full object-cover" />
                            ) : (
                              /* @ts-ignore */
                              React.createElement(LucideIcons[cat.icon] || Utensils, { className: "w-4 h-4 text-gray-600" })
                            )}
                          </div>
                          <span className="font-medium">{cat.label}</span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              setEditingCategory(cat);
                              setManageTab('create');
                            }}
                            className="p-1.5 text-gray-400 hover:text-tuplato hover:bg-tuplato/5 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('¿Eliminar esta categoría?')) removeCategory(cat.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zone Management Modal */}
      <AnimatePresence>
        {isZoneModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">Gestionar Zonas de Reparto</h3>
                <button onClick={() => setIsZoneModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Add New Zone */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                  <h4 className="font-bold text-sm text-gray-700">Agregar Nueva Zona</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del Barrio/Zona</label>
                      <Input 
                        value={newZone.name}
                        onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: San Carlos"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Precio de Envío ($)</label>
                      <Input 
                        type="number"
                        value={newZone.price}
                        onChange={(e) => setNewZone(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      if (newZone.name && newZone.price) {
                        addDeliveryZone({ name: newZone.name, price: parseFloat(newZone.price) });
                        setNewZone({ name: '', price: '' });
                      }
                    }}
                    disabled={!newZone.name || !newZone.price}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Agregar Zona
                  </Button>
                </div>

                {/* Zone List */}
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-3">Zonas Existentes ({deliveryZones.length})</h4>
                  <div className="space-y-2">
                    {deliveryZones.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No hay zonas configuradas. Agrega una arriba.
                      </div>
                    ) : (
                      deliveryZones.map((zone) => (
                        <div key={zone.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-gray-200 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-gray-900">{zone.name}</div>
                              <div className="text-xs text-gray-500">Costo de envío: <span className="font-bold text-green-600">${zone.price.toFixed(2)}</span></div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              if (confirm(`¿Eliminar la zona "${zone.name}"?`)) removeDeliveryZone(zone.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tag Management Modal */}
      <AnimatePresence>
        {isTagModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">Gestionar Etiquetas</h3>
                <button onClick={() => setIsTagModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex border-b border-gray-100">
                <button 
                  onClick={() => setManageTab('create')}
                  className={`flex-1 py-3 text-sm font-medium ${manageTab === 'create' ? 'text-tuplato border-b-2 border-tuplato' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Crear / Editar
                </button>
                <button 
                  onClick={() => setManageTab('edit')}
                  className={`flex-1 py-3 text-sm font-medium ${manageTab === 'edit' ? 'text-tuplato border-b-2 border-tuplato' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Lista de Etiquetas
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {manageTab === 'create' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Etiqueta</label>
                      <Input 
                        value={editingTag?.label || ''}
                        onChange={(e) => setEditingTag(prev => prev ? ({ ...prev, label: e.target.value }) : null)}
                        placeholder="Ej: Sin Gluten"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icono de Etiqueta</label>
                      <div className="flex gap-4 items-start">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
                          {editingTag?.icon && (editingTag.icon.startsWith('data:') || editingTag.icon.startsWith('http')) ? (
                            <img src={editingTag.icon} alt="Icon" className="w-full h-full object-cover" />
                          ) : (
                            // @ts-ignore
                            React.createElement(LucideIcons[editingTag?.icon] || LucideIcons.Tag, { className: "w-8 h-8 text-gray-400" })
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-2">
                            <Button 
                              variant={!(editingTag?.icon?.startsWith('data:') || editingTag?.icon?.startsWith('http')) ? 'primary' : 'secondary'}
                              onClick={() => setEditingTag(prev => prev ? ({ ...prev, icon: 'Tag' }) : null)}
                              className="flex-1 text-xs h-8"
                              type="button"
                            >
                              <Type className="w-3 h-3 mr-1" /> Icono
                            </Button>
                            <Button 
                              variant={(editingTag?.icon?.startsWith('data:') || editingTag?.icon?.startsWith('http')) ? 'primary' : 'secondary'}
                              onClick={() => {
                                // Trigger file input click via ref or just show the input
                              }}
                              className="flex-1 text-xs h-8"
                              type="button"
                            >
                              <ImageIcon className="w-3 h-3 mr-1" /> Imagen
                            </Button>
                          </div>
                          
                          {!(editingTag?.icon?.startsWith('data:') || editingTag?.icon?.startsWith('http')) ? (
                            <div>
                              <Input 
                                value={editingTag?.icon || ''}
                                onChange={(e) => setEditingTag(prev => prev ? ({ ...prev, icon: e.target.value }) : null)}
                                placeholder="Ej: WheatOff, Flame, Leaf"
                              />
                            </div>
                          ) : (
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'tag')}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <Button variant="secondary" className="w-full h-10" type="button">
                                <Upload className="w-4 h-4 mr-2" /> Subir Imagen
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <select 
                        value={editingTag?.color || 'blue'}
                        onChange={(e) => setEditingTag(prev => prev ? ({ ...prev, color: e.target.value }) : null)}
                        className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="red">Rojo</option>
                        <option value="green">Verde</option>
                        <option value="blue">Azul</option>
                        <option value="yellow">Amarillo</option>
                        <option value="purple">Morado</option>
                        <option value="gray">Gris</option>
                      </select>
                    </div>
                    <div className="pt-4">
                      <Button onClick={handleSaveTag} disabled={!editingTag?.label} className="w-full">
                        {editingTag?.id ? 'Actualizar Etiqueta' : 'Crear Etiqueta'}
                      </Button>
                      {editingTag?.id && (
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            setEditingTag({ label: '', icon: 'Tag', color: 'blue' });
                            setManageTab('create');
                          }} 
                          className="w-full mt-2"
                        >
                          Cancelar Edición
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tags.map(tag => (
                      <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-${tag.color}-100 text-${tag.color}-700 flex items-center gap-1`}>
                            {tag.icon.startsWith('data:') || tag.icon.startsWith('http') ? (
                              <img src={tag.icon} alt={tag.label} className="w-3 h-3 object-cover rounded-sm" />
                            ) : (
                              /* @ts-ignore */
                              React.createElement(LucideIcons[tag.icon] || LucideIcons.Tag, { className: "w-3 h-3" })
                            )}
                            {tag.label}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              setEditingTag(tag);
                              setManageTab('create');
                            }}
                            className="p-1.5 text-gray-400 hover:text-tuplato hover:bg-tuplato/5 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('¿Eliminar esta etiqueta?')) removeTag(tag.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
