import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Utensils, Pizza, ChefHat, IceCream, Wine, Plus, Edit2, Trash2, ExternalLink, Settings, Image as ImageIcon, X, CheckCircle, Ban } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MenuItem, MenuTag } from '../../data/menu';
import { usePublicMenu } from '../../context/PublicMenuContext';
import { compressImage } from '../../lib/imageUtils';

export default function RestaurantMenuManagementPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    menuItems,
    categories,
    tags,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    addCategory,
    updateCategory,
    addTag,
    updateTag,
  } = usePublicMenu();
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{id?: string, label: string, icon: string} | null>(null);
  const [editingTag, setEditingTag] = useState<{id?: string, label: string, icon: string, color: string} | null>(null);
  const [manageTab, setManageTab] = useState<'create' | 'edit'>('create');

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'menuItem' | 'category' | 'tag') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      if (type === 'menuItem') {
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
      await updateMenuItem(editingItem.id, editingItem);
    } else {
      await addMenuItem({
        ...editingItem,
        isAvailable: true,
        image: editingItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
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
      category: categories[0]?.id || 'entradas',
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Platos</h1>
          <p className="text-sm sm:text-base text-gray-500">Administra los platos, categorías y etiquetas de tu menú.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link to="/public-menu" className="flex-1 sm:flex-none">
            <Button variant="secondary" className="w-full bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm h-11">
              <ExternalLink className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Vista Cliente</span>
              <span className="xs:hidden">Vista</span>
            </Button>
          </Link>
          <Button onClick={openNewItemModal} className="flex-1 sm:flex-none bg-tuplato text-white hover:bg-tuplato-dark shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Nuevo Plato</span>
            <span className="xs:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gray-900 h-48 flex items-center justify-center text-center shadow-lg">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80" 
            alt="Restaurant Ambience" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 p-6">
          <h2 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">
            Menú del Restaurante
          </h2>
          <p className="text-gray-200 font-light">
            Configura la oferta gastronómica que verán tus clientes.
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 w-full md:w-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-tuplato text-white shadow-lg shadow-tuplato/30 transform scale-105'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
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
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato bg-gray-50 shadow-sm transition-all"
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
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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

      {/* Modals (Category, Tag, Item) */}
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

        {/* Category Modal */}
        {isCategoryModalOpen && editingCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">Gestionar Categorías</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button 
                    onClick={() => setManageTab('create')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${manageTab === 'create' ? 'bg-white shadow-sm text-tuplato' : 'text-gray-500'}`}
                  >
                    Nueva
                  </button>
                  <button 
                    onClick={() => setManageTab('edit')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${manageTab === 'edit' ? 'bg-white shadow-sm text-tuplato' : 'text-gray-500'}`}
                  >
                    Editar Existentes
                  </button>
                </div>

                {manageTab === 'create' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <Input 
                        value={editingCategory.label}
                        onChange={(e) => setEditingCategory({ ...editingCategory, label: e.target.value })}
                        placeholder="Ej: Postres"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icono (Nombre Lucide o Imagen)</label>
                      <div className="flex gap-2">
                        <Input 
                          value={editingCategory.icon}
                          onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                          placeholder="Ej: Utensils"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'category')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button variant="secondary" className="h-10 px-3">
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleSaveCategory} className="w-full">Crear Categoría</Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100 overflow-hidden">
                            {cat.icon.startsWith('data:') || cat.icon.startsWith('http') ? (
                              <img src={cat.icon} alt={cat.label} className="w-full h-full object-cover" />
                            ) : (
                              /* @ts-ignore */
                              React.createElement(LucideIcons[cat.icon] || Utensils, { className: "w-4 h-4 text-tuplato" })
                            )}
                          </div>
                          <span className="font-medium text-sm">{cat.label}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => {setEditingCategory(cat); setManageTab('create');}} className="p-1.5 text-gray-400 hover:text-tuplato"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => usePublicMenu().removeCategory(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Tag Modal */}
        {isTagModalOpen && editingTag && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">Gestionar Etiquetas</h3>
                <button onClick={() => setIsTagModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button 
                    onClick={() => setManageTab('create')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${manageTab === 'create' ? 'bg-white shadow-sm text-tuplato' : 'text-gray-500'}`}
                  >
                    Nueva
                  </button>
                  <button 
                    onClick={() => setManageTab('edit')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${manageTab === 'edit' ? 'bg-white shadow-sm text-tuplato' : 'text-gray-500'}`}
                  >
                    Editar Existentes
                  </button>
                </div>

                {manageTab === 'create' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <Input 
                        value={editingTag.label}
                        onChange={(e) => setEditingTag({ ...editingTag, label: e.target.value })}
                        placeholder="Ej: Picante"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <select
                          value={editingTag.color}
                          onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                          className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="red">Rojo</option>
                          <option value="green">Verde</option>
                          <option value="blue">Azul</option>
                          <option value="yellow">Amarillo</option>
                          <option value="purple">Púrpura</option>
                          <option value="gray">Gris</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                        <div className="flex gap-2">
                          <Input 
                            value={editingTag.icon}
                            onChange={(e) => setEditingTag({ ...editingTag, icon: e.target.value })}
                            placeholder="Ej: Flame"
                          />
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'tag')}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Button variant="secondary" className="h-10 px-3">
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleSaveTag} className="w-full">Crear Etiqueta</Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {tags.map(tag => (
                      <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100 overflow-hidden text-${tag.color}-500`}>
                            {tag.icon.startsWith('data:') || tag.icon.startsWith('http') ? (
                              <img src={tag.icon} alt={tag.label} className="w-full h-full object-cover" />
                            ) : (
                              /* @ts-ignore */
                              React.createElement(LucideIcons[tag.icon] || LucideIcons.Tag, { className: "w-4 h-4" })
                            )}
                          </div>
                          <span className="font-medium text-sm">{tag.label}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => {setEditingTag(tag); setManageTab('create');}} className="p-1.5 text-gray-400 hover:text-tuplato"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => usePublicMenu().removeTag(tag.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
