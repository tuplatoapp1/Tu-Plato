import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { LogOut, Menu, X, ChefHat, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type MenuItemType = {
  path?: string;
  key: string;
  label: string;
  defaultIcon: string;
  children?: MenuItemType[];
};

function SidebarItem({ item, setIsMenuOpen, level = 0 }: { key?: string, item: MenuItemType, setIsMenuOpen: (v: boolean) => void, level?: number }) {
  const { getIconComponent } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isChildActive = React.useMemo(() => {
    if (!item.children) return false;
    const checkActive = (children: MenuItemType[]): boolean => {
      return children.some(child => 
        child.path === location.pathname || (child.children && checkActive(child.children))
      );
    };
    return checkActive(item.children);
  }, [item.children, location.pathname]);

  React.useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  const IconComponent = getIconComponent(item.key, item.defaultIcon);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between py-3 text-sm font-medium rounded-xl transition-all duration-200",
            "text-gray-600 hover:bg-gray-50 hover:text-tuplato",
            isChildActive && !isOpen ? "text-tuplato bg-tuplato/5" : ""
          )}
          style={{ paddingLeft: `${1 + level * 1}rem`, paddingRight: '1rem' }}
        >
          <div className="flex items-center gap-3">
            {/* @ts-ignore */}
            <IconComponent className={cn("w-5 h-5", isChildActive && !isOpen ? "text-tuplato" : "text-gray-400")} />
            {item.label}
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 mt-1">
                {item.children!.map((child) => (
                  <SidebarItem key={child.key} item={child} setIsMenuOpen={setIsMenuOpen} level={level + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink 
      to={item.path!} 
      onClick={() => setIsMenuOpen(false)}
      className={({ isActive }) => cn(
        "flex items-center gap-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
        isActive 
          ? "bg-tuplato text-white shadow-md shadow-tuplato/20" 
          : "text-gray-600 hover:bg-gray-50 hover:text-tuplato"
      )}
      style={{ paddingLeft: `${1 + level * 1}rem`, paddingRight: '1rem' }}
    >
      {({ isActive }) => (
        <>
          {/* @ts-ignore */}
          <IconComponent className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400 group-hover:text-tuplato")} />
          {item.label}
        </>
      )}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { getIconComponent, appLogo } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems: MenuItemType[] = [
    { path: '/', key: 'home', label: 'Inicio', defaultIcon: 'Home' },
    { path: '/dashboard', key: 'dashboard', label: 'Panel de Control', defaultIcon: 'BarChart3' },
    { path: '/restaurant/menu', key: 'menu', label: 'Menú del Restaurante', defaultIcon: 'BookOpen' },
    { path: '/movements', key: 'history', label: 'Historial de Movimientos', defaultIcon: 'History' },
    { 
      key: 'departments', 
      label: 'Departamentos', 
      defaultIcon: 'Briefcase',
      children: [
        {
          key: 'caja',
          label: 'Caja',
          defaultIcon: 'DollarSign',
          children: [
            { path: '/inventory/caja', key: 'inventory-caja', label: 'Inventario', defaultIcon: 'Package' },
            { path: '/tips', key: 'tips', label: 'Propinas', defaultIcon: 'Coins' },
          ]
        },
        {
          key: 'servicio',
          label: 'Servicio',
          defaultIcon: 'Coffee',
          children: [
            { path: '/inventory/servicio', key: 'inventory-servicio', label: 'Inventario', defaultIcon: 'Package' },
          ]
        },
        {
          key: 'barra',
          label: 'Barra',
          defaultIcon: 'Wine',
          children: [
            { path: '/inventory/barra', key: 'inventory-barra', label: 'Inventario', defaultIcon: 'Package' },
          ]
        },
        {
          key: 'cocina',
          label: 'Cocina',
          defaultIcon: 'ChefHat',
          children: [
            { path: '/inventory/cocina', key: 'inventory-cocina', label: 'Inventario', defaultIcon: 'Package' },
          ]
        },
        {
          key: 'deposito',
          label: 'Depósito',
          defaultIcon: 'Archive',
          children: [
            { path: '/inventory/deposito', key: 'inventory-deposito', label: 'Inventario', defaultIcon: 'Package' },
          ]
        }
      ]
    },
  ];

  const SettingsIcon = getIconComponent('settings', 'Settings');
  
  const renderLogo = (iconClassName: string, imageClassName: string = "w-full h-full object-cover") => {
    if (appLogo.type === 'custom') {
      return <img src={appLogo.value} alt="Logo" className={imageClassName} />;
    }
    // @ts-ignore
    const Icon = LucideIcons[appLogo.value] || ChefHat;
    return <Icon className={iconClassName} />;
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith('/inventory/')) {
      const dept = location.pathname.split('/')[2];
      return `Inventario - ${dept.charAt(0).toUpperCase() + dept.slice(1)}`;
    }
    switch (location.pathname) {
      case '/': return 'Inicio';
      case '/menu': return 'Menú del Restaurante';
      case '/inventory': return 'Inventario General';
      case '/movements': return 'Historial de Movimientos';
      case '/tips': return 'Propinas';
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
            <div className="w-8 h-8 rounded-full bg-tuplato/10 flex items-center justify-center overflow-hidden shrink-0">
              {renderLogo("w-5 h-5 text-tuplato")}
            </div>
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
                  <div className={`rounded-full flex items-center justify-center overflow-hidden shrink-0 ${appLogo.type === 'custom' ? 'w-10 h-10 bg-white' : 'bg-white/20 p-2 w-10 h-10'}`}>
                    {renderLogo("w-6 h-6 text-white")}
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
                {menuItems.map((item) => (
                  <SidebarItem key={item.key} item={item} setIsMenuOpen={setIsMenuOpen} />
                ))}
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
