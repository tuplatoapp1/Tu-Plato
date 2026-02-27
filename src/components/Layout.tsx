import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { LogOut, Menu, X, ChefHat, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { getIconComponent } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', key: 'home', label: 'Inicio', defaultIcon: 'Home' },
    { path: '/menu', key: 'menu', label: 'Menú del Restaurante', defaultIcon: 'BookOpen' },
    { path: '/movements', key: 'history', label: 'Historial de Movimientos', defaultIcon: 'History' },
    { path: '/inventory', key: 'inventory', label: 'Inventario', defaultIcon: 'Package' },
  ];

  const SettingsIcon = getIconComponent('settings', 'Settings');

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Inicio';
      case '/menu': return 'Menú del Restaurante';
      case '/inventory': return 'Inventario';
      case '/movements': return 'Historial de Movimientos';
      case '/settings': return 'Configuración';
      default: return 'Tu Plato';
    }
  };

  return (
    <div className="min-h-screen bg-tuplato-bg flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-tuplato focus:outline-none focus:ring-2 focus:ring-tuplato/50"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-tuplato" />
            <span className="font-bold text-xl text-tuplato hidden sm:inline-block">Tu Plato</span>
            <span className="text-gray-300 hidden sm:inline-block">|</span>
            <span className="text-gray-600 font-medium">{getPageTitle()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900">{user?.name}</span>
            <span className="text-xs text-gray-500">Administrador</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-tuplato text-white flex items-center justify-center font-bold text-sm">
            {user?.username.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Mobile/Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-tuplato text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-xl">Tu Plato</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                  const IconComponent = getIconComponent(item.key, item.defaultIcon);
                  return (
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
                      {/* @ts-ignore */}
                      <IconComponent className={cn("w-5 h-5", ({ isActive }: { isActive: boolean }) => isActive ? "text-white" : "text-gray-400 group-hover:text-tuplato")} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
                <NavLink 
                  to="/settings" 
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-tuplato text-white shadow-md shadow-tuplato/20" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-tuplato"
                  )}
                >
                  {/* @ts-ignore */}
                  <SettingsIcon className={cn("w-5 h-5", ({ isActive }: { isActive: boolean }) => isActive ? "text-white" : "text-gray-400 group-hover:text-tuplato")} />
                  Configuración
                </NavLink>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
