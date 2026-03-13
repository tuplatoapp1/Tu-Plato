import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Settings, Utensils, MapPin, Trophy, Users, ClipboardList, ChefHat, LogOut, Menu, X, Image as ImageIcon, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { usePublicMenu } from '../context/PublicMenuContext';
import { motion, AnimatePresence } from 'motion/react';

export default function RestaurantAdminLayout() {
  const { logout } = useAuth();
  const { exchangeRate, updateExchangeRate } = usePublicMenu();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isEditingRate, setIsEditingRate] = useState(false);
  const [newRate, setNewRate] = useState(exchangeRate.toString());

  const handleUpdateRate = async () => {
    const rate = parseFloat(newRate);
    if (!isNaN(rate)) {
      await updateExchangeRate(rate);
      setIsEditingRate(false);
    }
  };

  const menuItems = [
    { path: '/restaurant/branding', label: 'Configuración Pública', icon: Settings },
    { path: '/restaurant/menu', label: 'Platos y Menú', icon: Utensils },
    { path: '/restaurant/delivery', label: 'Zonas de Entrega', icon: MapPin },
    { path: '/restaurant/rewards', label: 'Premios y XP', icon: Trophy },
    { path: '/restaurant/mascots', label: 'Mascotas por Nivel', icon: ImageIcon },
    { path: '/restaurant/users', label: 'Lista de Usuarios', icon: Users },
    { path: '/restaurant/surveys', label: 'Encuestas', icon: ClipboardList },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-tuplato text-white">
        <div className="bg-white/20 p-2 rounded-xl">
          <ChefHat className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Admin Menú</h1>
          <p className="text-xs text-white/70">Gestión de Restaurante</p>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-tuplato bg-tuplato/5 rounded-xl hover:bg-tuplato/10 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </Link>
        <Link
          to="/restaurant/menu"
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-tuplato bg-tuplato/5 rounded-xl hover:bg-tuplato/10 transition-all duration-200"
        >
          <Utensils className="w-5 h-5" />
          Menú de Cliente
        </Link>
        <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm font-bold text-tuplato bg-tuplato/5 rounded-xl">
          {isEditingRate ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="w-20 px-2 py-1 rounded text-sm bg-white border border-tuplato/30 focus:outline-none"
              />
              <button
                onClick={handleUpdateRate}
                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                title="Guardar"
              >
                Guardar
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5" />
                Tasa: {exchangeRate} VES
              </div>
              <button
                onClick={() => {
                  setNewRate(exchangeRate.toString());
                  setIsEditingRate(true);
                }}
                className="text-xs bg-tuplato/20 px-2 py-1 rounded hover:bg-tuplato/30 transition-colors"
                title="Cambiar tasa"
              >
                Editar
              </button>
            </>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Módulos</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              isActive
                ? "bg-tuplato text-white shadow-md shadow-tuplato/20"
                : "text-gray-600 hover:bg-gray-50 hover:text-tuplato"
            )}
          >
            <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-white" : "text-gray-400")} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-tuplato"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-tuplato">Admin Menú</span>
        </div>
        <Link to="/" className="p-2 text-gray-400 hover:text-tuplato">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen shadow-sm z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 flex flex-col lg:hidden"
            >
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-6xl mx-auto p-4 sm:p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
