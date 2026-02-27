import React, { useState, useRef } from 'react';
import { useUI, IconConfig } from '../context/UIContext';
import { useDepartments } from '../context/DepartmentContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Upload, X, Check, Search, Plus, Trash2, Settings, Briefcase, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// List of common icons to choose from
const PRESET_ICONS = [
  'Home', 'Package', 'History', 'Settings', 'User', 'ShoppingCart', 
  'Truck', 'Box', 'Clipboard', 'Calendar', 'BarChart', 'PieChart',
  'Activity', 'AlertTriangle', 'CheckCircle', 'Clock', 'CreditCard',
  'DollarSign', 'FileText', 'Gift', 'Grid', 'Heart', 'Image',
  'Layout', 'List', 'MapPin', 'Menu', 'MessageCircle', 'MoreHorizontal',
  'Phone', 'Plus', 'Printer', 'Save', 'Search', 'Send', 'Share',
  'Star', 'Tag', 'Trash', 'TrendingUp', 'Users', 'Video', 'Zap',
  'ChefHat', 'Utensils', 'Coffee', 'Pizza', 'Sandwich', 'Beer', 'Wine',
  'Warehouse', 'Briefcase', 'Monitor', 'Smartphone', 'Wifi', 'Lock'
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('icons');
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-tuplato tracking-tight">Configuración</h1>
          <p className="text-gray-500 mt-2 text-lg">Personalice la apariencia y estructura de su aplicación.</p>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex relative">
        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-gray-100/50" />
        {['icons', 'departments'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 z-10 flex items-center gap-2 ${
              activeTab === tab ? 'text-tuplato shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-tuplato/10 rounded-xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {tab === 'icons' && <LayoutGrid className="w-4 h-4" />}
            {tab === 'departments' && <Briefcase className="w-4 h-4" />}
            {tab === 'icons' ? 'Iconos de la Web' : 'Departamentos'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'icons' && <IconsSettings />}
          {activeTab === 'departments' && <DepartmentsSettings />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DepartmentsSettings() {
  const { departments, addDepartment, removeDepartment } = useDepartments();
  const [isAdding, setIsAdding] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<{type: 'lucide' | 'custom', value: string}>({ type: 'lucide', value: 'Briefcase' });
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDeptName.trim()) {
      addDepartment(newDeptName, selectedIcon.value, selectedIcon.type);
      setNewDeptName('');
      setSelectedIcon({ type: 'lucide', value: 'Briefcase' });
      setIsAdding(false);
    }
  };

  // Helper to render icon
  const renderIcon = (icon: string, type: 'lucide' | 'custom') => {
    if (type === 'custom') {
      return <img src={icon} alt="icon" className="w-full h-full object-contain" />;
    }
    // @ts-ignore
    const Icon = LucideIcons[icon] || LucideIcons.HelpCircle;
    return <Icon className="w-full h-full" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Áreas de Trabajo</h2>
          <p className="text-sm text-gray-500">Gestione los departamentos operativos de su negocio.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)} 
          className="bg-tuplato hover:bg-tuplato-dark text-white shadow-lg shadow-tuplato/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" /> Nuevo Departamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <motion.div 
            key={dept.id} 
            layoutId={dept.id}
            className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-tuplato/30 transition-all overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button 
                onClick={() => {
                  if(confirm(`¿Eliminar departamento ${dept.name}?`)) {
                    removeDepartment(dept.id);
                  }
                }}
                className="p-2 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl shadow-sm border border-gray-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tuplato/10 to-tuplato/5 flex items-center justify-center text-tuplato shadow-inner p-3.5">
                {renderIcon(dept.icon, dept.type)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-tuplato transition-colors">{dept.name}</h3>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">Departamento</p>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-tuplato to-tuplato-light transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-tuplato to-tuplato-dark p-6 flex justify-between items-center text-white">
                <div>
                  <h3 className="font-bold text-xl">Crear Departamento</h3>
                  <p className="text-tuplato-light text-sm opacity-90">Añada una nueva área de trabajo</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleAdd} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Departamento</label>
                  <Input 
                    value={newDeptName}
                    onChange={e => setNewDeptName(e.target.value)}
                    placeholder="Ej. Cocina, Barra..."
                    required
                    className="bg-gray-50 border-gray-200 focus:bg-white h-12 text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Icono Representativo</label>
                  <button 
                    type="button"
                    onClick={() => setIsIconSelectorOpen(true)}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:border-tuplato hover:bg-tuplato/5 transition-all group bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 group-hover:text-tuplato group-hover:bg-white transition-colors p-2.5 shadow-sm">
                        {renderIcon(selectedIcon.value, selectedIcon.type)}
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-gray-900 group-hover:text-tuplato transition-colors">
                          {selectedIcon.type === 'custom' ? 'Imagen personalizada' : selectedIcon.value}
                        </span>
                        <span className="text-xs text-gray-500">Click para cambiar</span>
                      </div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-full group-hover:bg-tuplato group-hover:text-white transition-colors">
                      <Settings className="w-4 h-4" />
                    </div>
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setIsAdding(false)} className="px-6">Cancelar</Button>
                  <Button type="submit" className="bg-tuplato text-white px-8 shadow-lg shadow-tuplato/20">Crear</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isIconSelectorOpen && (
          <IconSelectorModal 
            itemKey="new-dept"
            currentConfig={selectedIcon}
            onClose={() => setIsIconSelectorOpen(false)}
            onSave={(type, value) => {
              setSelectedIcon({ type, value });
              setIsIconSelectorOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function IconsSettings() {
  const { icons, updateIcon, getIconComponent } = useUI();
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const menuItems = [
    { key: 'home', label: 'Inicio', default: 'Home', desc: 'Página principal del sistema' },
    { key: 'history', label: 'Historial de Movimientos', default: 'History', desc: 'Registro de entradas y salidas' },
    { key: 'inventory', label: 'Inventario', default: 'Package', desc: 'Gestión de productos y stock' },
    { key: 'settings', label: 'Configuración', default: 'Settings', desc: 'Ajustes de la aplicación' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {menuItems.map((item) => {
        const IconComponent = getIconComponent(item.key, item.default);
        const currentConfig = icons[item.key] || { type: 'lucide', value: item.default };

        return (
          <motion.div 
            key={item.key} 
            layoutId={item.key}
            className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-tuplato/30 transition-all overflow-hidden"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-tuplato/5 flex items-center justify-center text-tuplato group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  {/* @ts-ignore */}
                  <IconComponent className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-tuplato transition-colors">{item.label}</h3>
                  <p className="text-sm text-gray-500 mb-1">{item.desc}</p>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {currentConfig.type === 'custom' ? (
                      <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Imagen Personalizada</span>
                    ) : (
                      <span className="flex items-center gap-1"><LayoutGrid className="w-3 h-3" /> {currentConfig.value}</span>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="secondary" 
                onClick={() => setEditingKey(item.key)}
                className="shrink-0 h-10 w-10 p-0 rounded-full flex items-center justify-center border-gray-200 hover:border-tuplato hover:text-tuplato"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-tuplato to-tuplato-light transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </motion.div>
        );
      })}

      <AnimatePresence>
        {editingKey && (
          <IconSelectorModal 
            itemKey={editingKey}
            currentConfig={icons[editingKey]}
            onClose={() => setEditingKey(null)}
            onSave={(type, value) => {
              updateIcon(editingKey, type, value);
              setEditingKey(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function IconSelectorModal({ itemKey, currentConfig, onClose, onSave }: {
  itemKey: string;
  currentConfig: IconConfig;
  onClose: () => void;
  onSave: (type: 'lucide' | 'custom', value: string) => void;
}) {
  const [selectedType, setSelectedType] = useState<'lucide' | 'custom'>('lucide');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const filteredIcons = PRESET_ICONS.filter(iconName => 
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        setSelectedType('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="bg-gradient-to-r from-tuplato to-tuplato-dark p-6 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="font-bold text-xl tracking-tight">Seleccionar Icono</h2>
            <p className="text-tuplato-light text-sm opacity-90">Personalice la identidad visual</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-2 bg-gray-50 border-b border-gray-100 flex gap-2">
          <button 
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${selectedType === 'lucide' ? 'bg-white text-tuplato shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}
            onClick={() => setSelectedType('lucide')}
          >
            <LayoutGrid className="w-4 h-4" />
            Iconos Predefinidos
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${selectedType === 'custom' ? 'bg-white text-tuplato shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}
            onClick={() => setSelectedType('custom')}
          >
            <ImageIcon className="w-4 h-4" />
            Subir Imagen
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
          {selectedType === 'lucide' ? (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  placeholder="Buscar icono por nombre..." 
                  className="pl-12 h-12 rounded-xl border-gray-200 bg-white shadow-sm text-base"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                {filteredIcons.map(iconName => {
                  // @ts-ignore
                  const Icon = LucideIcons[iconName];
                  if (!Icon) return null;
                  return (
                    <button
                      key={iconName}
                      onClick={() => onSave('lucide', iconName)}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-gray-100 hover:border-tuplato hover:bg-tuplato/5 hover:shadow-md transition-all gap-3 group aspect-square"
                    >
                      <Icon className="w-8 h-8 text-gray-400 group-hover:text-tuplato transition-colors" />
                      <span className="text-[10px] font-medium text-gray-400 group-hover:text-tuplato truncate w-full text-center">{iconName}</span>
                    </button>
                  );
                })}
              </div>
              {filteredIcons.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No se encontraron iconos</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-8 py-10">
              <div 
                className="w-full max-w-sm aspect-square bg-white border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-tuplato hover:bg-tuplato/5 hover:shadow-lg transition-all relative overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                {customImage ? (
                  <>
                    <img src={customImage} alt="Custom" className="w-full h-full object-contain p-8" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <p className="text-white font-bold flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                        <Upload className="w-5 h-5" /> Cambiar imagen
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                      <Upload className="w-10 h-10 text-tuplato" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Subir imagen personalizada</h3>
                    <p className="text-sm text-gray-500">Soporta JPG, PNG y WebP</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
              
              {customImage && (
                <Button 
                  onClick={() => onSave('custom', customImage)} 
                  className="w-full max-w-sm bg-tuplato hover:bg-tuplato-dark text-white h-12 shadow-lg shadow-tuplato/20 rounded-xl font-bold"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Confirmar y Usar
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
