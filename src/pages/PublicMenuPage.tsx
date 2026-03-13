import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, ShoppingCart, Star, Clock, Info, ChevronRight, Phone, MapPin, Instagram, Facebook, Plus, Minus, X, Utensils, ArrowLeft, CheckCircle, Navigation, Search, Flame, Leaf, Sparkles, User, LogOut, Sun, Moon, ClipboardList } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { MENU_ITEMS, MenuItem, MenuTag } from '../data/menu';
import { usePublicMenu } from '../context/PublicMenuContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: 'entradas', label: 'Entradas' },
  { id: 'principales', label: 'Platos Fuertes' },
  { id: 'postres', label: 'Postres' },
  { id: 'bebidas', label: 'Bebidas' },
];

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export default function PublicMenuPage() {
  const { branding, offers, menuItems, categories, tags, deliveryZones, xpConfig, isLoading, exchangeRate } = usePublicMenu();
  const { isAuthenticated, user, logout, updateCustomer } = useAuth();
  const navigate = useNavigate();
  const [currentOffer, setCurrentOffer] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'entradas');
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Cart, 1: Info, 2: Location
  const [customerInfo, setCustomerInfo] = useState({
    firstName: user?.name || '',
    lastName: user?.lastName || '',
    documentId: user?.documentId || '',
    phone: user?.phone || ''
  });
  const [locationInfo, setLocationInfo] = useState({
    address: ''
  });
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [zoneSearch, setZoneSearch] = useState('');
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
  const zoneDropdownRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('menu_theme_mode');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('menu_theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('menu_theme_mode', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (user) {
      setCustomerInfo({
        firstName: user.name || '',
        lastName: user.lastName || '',
        documentId: user.documentId || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (zoneDropdownRef.current && !zoneDropdownRef.current.contains(event.target as Node)) {
        setIsZoneDropdownOpen(false);
        // If they didn't select a zone but typed something, maybe clear it or leave it
        if (!selectedZoneId && zoneSearch) {
          // Optionally clear or keep
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedZoneId, zoneSearch]);

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);
  const filteredZones = deliveryZones.filter(z => 
    z.name.toLowerCase().includes(zoneSearch.toLowerCase())
  );

  const handleFinishOrder = () => {
    // Use configured template or default
    const template = branding.whatsappMessageTemplate || 
      "*Nuevo Pedido - {restaurantName}*\n\n" +
      "*Cliente:* {customerName}\n" +
      "*Cédula:* {customerDocumentId}\n" +
      "*Teléfono:* {customerPhone}\n\n" +
      "*Dirección:* {address}\n" +
      "\n*Pedido:*\n" +
      "{orderItems}\n" +
      "\n*Zona de Entrega:* {zoneName}\n" +
      "*Costo de Envío:* ${shippingCost}\n" +
      "*Total a Pagar:* ${finalTotal}\n\n" +
      "Adjuntaré mi ubicación GPS actual en el siguiente mensaje para facilitar la entrega.";

    const orderItemsText = cart.map(c => {
      let text = `- ${c.quantity}x ${c.menuItem.name} ($${(c.menuItem.price * c.quantity).toFixed(2)})`;
      if (c.notes) {
        text += `\n  *Notas: ${c.notes}*`;
      }
      return text;
    }).join('\n');
    const shippingCost = selectedZone ? selectedZone.price : 0;
    const finalTotal = totalPrice + shippingCost;
    
    let message = template
      .replace('{restaurantName}', branding.restaurantName)
      .replace('{customerName}', `${customerInfo.firstName} ${customerInfo.lastName}`)
      .replace('{customerDocumentId}', customerInfo.documentId)
      .replace('{customerPhone}', customerInfo.phone)
      .replace('{address}', locationInfo.address || 'No especificada')
      .replace('{mapLink}', '')
      .replace('{orderItems}', orderItemsText)
      .replace('{totalPrice}', totalPrice.toFixed(2)) // Keep for backward compatibility if template uses it
      .replace('{zoneName}', selectedZone ? selectedZone.name : 'No seleccionada')
      .replace('{shippingCost}', shippingCost.toFixed(2))
      .replace('{finalTotal}', finalTotal.toFixed(2));

    const encodedText = encodeURIComponent(message);
    
    // Save order to history if user is logged in
    if (user) {
      const newOrder = {
        id: Date.now().toString(),
        userId: user.username, // using username as unique ID
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        date: new Date().toISOString(),
        items: cart.map(c => ({
          menuItemId: c.menuItem.id,
          name: c.menuItem.name,
          quantity: c.quantity,
          price: c.menuItem.price,
          notes: c.notes || ''
        })),
        total: finalTotal,
        zoneId: selectedZoneId,
        address: locationInfo.address
      };
      
      const existingOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      localStorage.setItem('customer_orders', JSON.stringify([...existingOrders, newOrder]));

      // Update user XP and Points
      const pointsEarned = Math.floor(finalTotal * (xpConfig?.xpPerDollar || 10));
      
      // Award referral bonus if it's the first order
      let referralBonus = 0;
      if (user.isFirstOrder && user.referredBy) {
        // Find the referrer and give them points
        const registeredCustomers = JSON.parse(localStorage.getItem('registered_customers') || '[]');
        const referrer = registeredCustomers.find((c: any) => c.id === user.referredBy || c.username === user.referredBy);
        
        if (referrer) {
          const updatedReferrer = {
            ...referrer,
            points: (referrer.points || 0) + 200, // 200 points bonus for referring
            xp: (referrer.xp || 0) + 200
          };
          
          const newRegisteredCustomers = registeredCustomers.map((c: any) => 
            c.username === referrer.username ? updatedReferrer : c
          );
          localStorage.setItem('registered_customers', JSON.stringify(newRegisteredCustomers));
          
          // If the referrer is currently logged in (unlikely but possible in same browser), we'd need to update their session too
          // But usually they are different users.
        }
      }

      // We need to update the user in AuthContext and also in the registered_customers list
      const updatedUser = {
        ...user,
        xp: (user.xp || 0) + pointsEarned,
        points: (user.points || 0) + pointsEarned,
        isFirstOrder: false // No longer first order
      };
      
      // This updates the current session
      if (updateCustomer) {
        updateCustomer({ xp: updatedUser.xp, points: updatedUser.points, isFirstOrder: false });
      }
      
      // Update in registered_customers list
      const registeredCustomers = JSON.parse(localStorage.getItem('registered_customers') || '[]');
      const updatedCustomers = registeredCustomers.map((c: any) => 
        c.username === user.username ? { ...c, xp: updatedUser.xp, points: updatedUser.points, isFirstOrder: false } : c
      );
      localStorage.setItem('registered_customers', JSON.stringify(updatedCustomers));
    }

    // Use configured number or default
    const targetNumber = branding.whatsappNumber || '584243556185';
    const waLink = `https://wa.me/${targetNumber}?text=${encodedText}`;
    
    window.open(waLink, '_blank');
    
    // Reset
    setCart([]);
    setCheckoutStep(0);
    setIsCartOpen(false);
    setCustomerInfo({ firstName: '', lastName: '', documentId: '', phone: '' });
    setLocationInfo({ address: '' });
    setSelectedZoneId('');
    setZoneSearch('');
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(c => {
        if (c.menuItem.id === id) {
          return { ...c, quantity: c.quantity + delta };
        }
        return c;
      }).filter(c => c.quantity > 0);
    });
  };

  const updateNotes = (id: string, notes: string) => {
    setCart(prev => prev.map(c => c.menuItem.id === id ? { ...c, notes } : c));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== id));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  useEffect(() => {
    if (offers.length === 0) return;
    const timer = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % offers.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [offers.length]);

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = categoryRefs.current[categoryId];
    if (element) {
      const yOffset = -140; // Adjust for sticky header and category nav
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Intersection Observer for Scrollspy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { rootMargin: '-150px 0px -60% 0px' }
    );

    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref && ref instanceof Element) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const renderTagBadge = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return null;

    const colorClasses = {
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };

    const colorClass = colorClasses[tag.color as keyof typeof colorClasses] || colorClasses.gray;

    return (
      <span key={tag.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
        {tag.icon && (tag.icon.startsWith('data:') || tag.icon.startsWith('http')) ? (
          <img src={tag.icon} alt={tag.label} className="w-3 h-3 object-cover rounded-sm" />
        ) : (
          /* @ts-ignore */
          React.createElement(LucideIcons[tag.icon] || LucideIcons.Tag, { className: "w-3 h-3" })
        )}
        {tag.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tuplato"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-20 relative transition-colors duration-200">
      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="bg-tuplato text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-3 hover:bg-tuplato-dark transition-transform hover:scale-105"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <span className="font-bold text-sm">Ver Pedido (${totalPrice.toFixed(2)})</span>
          </button>
        </div>
      )}

      {/* Top Banner - Tu Plato */}
      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logoType === 'image' && branding.logoValue ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                <img src={branding.logoValue} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="bg-tuplato/10 p-2 rounded-xl">
                {/* @ts-ignore */}
                {React.createElement(LucideIcons[branding.logoValue] || ChefHat, { className: "w-6 h-6 text-tuplato" })}
              </div>
            )}
            <span className="font-black text-xl text-gray-900 dark:text-white tracking-tight">{branding.restaurantName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-tuplato/10 hover:text-tuplato transition-all"
              title={isDarkMode ? "Cambiar a modo día" : "Cambiar a modo noche"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAuthenticated ? (
              <button onClick={() => navigate('/customer-profile')} className="relative p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-tuplato/10 hover:text-tuplato transition-all" title="Mi Perfil">
                <User className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={() => navigate('/customer-auth')} className="relative p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-tuplato/10 hover:text-tuplato transition-all" title="Iniciar sesión">
                <User className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-tuplato text-white rounded-xl hover:bg-tuplato-dark transition-all shadow-lg shadow-tuplato/20">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-900 pb-4 px-4 relative z-30 transition-colors duration-200">
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="¿Qué te apetece hoy?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-12 rounded-2xl border-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-tuplato/30 transition-all shadow-inner"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Carousel */}
      {offers.length > 0 ? (
        <div className="relative h-64 sm:h-80 overflow-hidden bg-gray-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentOffer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img 
                src={offers[currentOffer].image} 
                alt={offers[currentOffer].title}
                className={`w-full h-full object-cover ${offers[currentOffer].overlayEnabled !== false ? 'opacity-60' : ''}`}
              />
              {offers[currentOffer].overlayEnabled !== false && (
                <div className={`absolute inset-0 bg-gradient-to-t ${offers[currentOffer].color} mix-blend-multiply opacity-60`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white z-10">
            <motion.div
              key={`text-${currentOffer}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-white/30">
                Oferta Especial
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-1">
                {offers[currentOffer].title}
              </h2>
              <p className="text-white/90 text-lg font-light">
                {offers[currentOffer].subtitle}
              </p>
            </motion.div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 right-4 flex gap-2 z-20">
            {offers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentOffer(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentOffer ? 'w-6 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="h-20 bg-gray-900 flex items-center justify-center text-white/50 text-sm">
          Sin ofertas activas
        </div>
      )}

      {/* Category Navigation */}
      <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-md mx-auto overflow-x-auto no-scrollbar py-4 px-4 flex gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-black transition-all transform flex items-center gap-2.5 ${
                activeCategory === cat.id
                  ? 'bg-tuplato text-white shadow-xl shadow-tuplato/30 scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <div className={`p-1 rounded-lg ${activeCategory === cat.id ? 'bg-white/20' : 'bg-white dark:bg-gray-700 shadow-sm'}`}>
                {cat.icon && (cat.icon.startsWith('data:') || cat.icon.startsWith('http')) ? (
                  <img src={cat.icon} alt={cat.label} className="w-4 h-4 object-cover rounded-sm" />
                ) : (
                  /* @ts-ignore */
                  React.createElement(LucideIcons[cat.icon] || Utensils, { className: `w-4 h-4 ${activeCategory === cat.id ? 'text-white' : 'text-tuplato'}` })
                )}
              </div>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-10">
        {categories.map(category => {
          const categoryItems = menuItems.filter(item => 
            item.category === category.id && 
            (searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );

          if (categoryItems.length === 0) return null;

          return (
            <div 
              key={category.id} 
              id={category.id} 
              ref={el => categoryRefs.current[category.id] = el}
              className="scroll-mt-40"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white capitalize tracking-tight">
                  {category.label}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {categoryItems.length} opciones
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                  {categoryItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layoutId={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedMenuItem(item)}
                      className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4 overflow-hidden relative group cursor-pointer hover:shadow-2xl hover:shadow-tuplato/5 transition-all duration-300"
                    >
                      {/* Image Container */}
                      <div className="w-full aspect-[4/3] rounded-[2rem] overflow-hidden relative bg-gray-100 dark:bg-gray-700">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/20">
                            <span className="font-black text-gray-900 dark:text-white text-lg">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-red-500 text-white text-xs font-black px-4 py-2 rounded-2xl uppercase tracking-widest shadow-xl">
                              Agotado
                            </span>
                          </div>
                        )}

                        {/* Quick Add Button */}
                        {item.isAvailable && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="absolute bottom-4 right-4 w-14 h-14 bg-tuplato text-white rounded-[1.25rem] shadow-2xl shadow-tuplato/40 flex items-center justify-center hover:bg-tuplato-dark hover:scale-110 active:scale-95 transition-all z-10"
                          >
                            <Plus className="w-7 h-7" />
                          </button>
                        )}
                      </div>

                      {/* Content */}
                      <div className="px-2 pb-2">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="font-black text-gray-900 dark:text-white leading-tight text-xl group-hover:text-tuplato transition-colors">{item.name}</h4>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                          {item.description}
                        </p>
                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map(tag => renderTagBadge(tag))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {searchTerm && categories.every(category => 
          menuItems.filter(item => 
            item.category === category.id && 
            (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase()))
          ).length === 0
        ) && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-lg font-bold text-gray-900 dark:text-white">No se encontraron resultados</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Intenta con otra búsqueda</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-white dark:bg-gray-900 mt-8 py-8 border-t border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-md mx-auto px-6 space-y-6">
          <div className="flex justify-center gap-6">
            {branding.socialLinks?.instagram && (
              <a href={branding.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:text-tuplato dark:hover:text-tuplato hover:bg-tuplato/10 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {branding.socialLinks?.facebook && (
              <a href={branding.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:text-tuplato dark:hover:text-tuplato hover:bg-tuplato/10 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {branding.socialLinks?.whatsapp && (
              <a href={branding.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:text-tuplato dark:hover:text-tuplato hover:bg-tuplato/10 transition-colors">
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
          
          <div className="text-center space-y-3">
            {branding.schedule?.map((item, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 text-tuplato" />
                <span><span className="font-bold dark:text-gray-300">{item.days}:</span> {item.hours}</span>
              </div>
            ))}
            
            {branding.address && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-2">
                <MapPin className="w-4 h-4 text-tuplato" />
                <span>{branding.address}</span>
              </div>
            )}
          </div>

          <div className="text-center pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">© 2024 {branding.restaurantName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedMenuItem && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMenuItem(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden relative flex flex-col max-h-[95vh] shadow-2xl"
            >
              <button 
                onClick={() => setSelectedMenuItem(null)}
                className="absolute top-6 right-6 z-10 p-3 bg-black/20 backdrop-blur-md rounded-2xl text-white hover:bg-black/40 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative h-72 sm:h-80 shrink-0">
                <img src={selectedMenuItem.image} alt={selectedMenuItem.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-transparent to-transparent" />
              </div>

              <div className="p-8 -mt-12 relative bg-white dark:bg-gray-900 rounded-t-[3rem] flex-1 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2">{selectedMenuItem.name}</h2>
                    <div className="flex flex-wrap gap-2">
                      {selectedMenuItem.tags?.map(tag => renderTagBadge(tag))}
                    </div>
                  </div>
                  <div className="bg-tuplato/10 px-4 py-2 rounded-2xl">
                    <span className="text-2xl font-black text-tuplato">${selectedMenuItem.price.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 text-lg">
                  {selectedMenuItem.description}
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
                      <Clock className="w-4 h-4 text-tuplato" />
                      <span className="font-bold">15-20 min</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-bold">450 kcal</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                {cart.find(c => c.menuItem.id === selectedMenuItem.id) ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-6 bg-white dark:bg-gray-900 rounded-[2rem] p-2 border border-gray-100 dark:border-gray-700 shadow-sm flex-1 justify-between">
                      <button 
                        onClick={() => updateQuantity(selectedMenuItem.id, -1)}
                        className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 transition-all active:scale-90"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <span className="font-black text-2xl dark:text-white">
                        {cart.find(c => c.menuItem.id === selectedMenuItem.id)?.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(selectedMenuItem.id, 1)}
                        className="w-12 h-12 rounded-2xl bg-tuplato text-white flex items-center justify-center hover:bg-tuplato-dark transition-all active:scale-90"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(selectedMenuItem)}
                    disabled={!selectedMenuItem.isAvailable}
                    className="w-full bg-tuplato text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-tuplato/30 hover:bg-tuplato-dark active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    Agregar al Pedido
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md h-full flex flex-col shadow-2xl transition-colors duration-200"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  {checkoutStep > 0 && (
                    <button onClick={() => setCheckoutStep(prev => prev - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                      <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  )}
                  <h2 className="text-xl font-black flex items-center gap-2 dark:text-white tracking-tight">
                    {checkoutStep === 0 && <><ShoppingCart className="w-6 h-6 text-tuplato" /> Tu Pedido</>}
                    {checkoutStep === 1 && <><Info className="w-6 h-6 text-tuplato" /> Tus Datos</>}
                    {checkoutStep === 2 && <><MapPin className="w-6 h-6 text-tuplato" /> Tu Ubicación</>}
                  </h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                  <X className="w-5 h-5 dark:text-gray-300" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {checkoutStep === 0 && (
                  cart.length === 0 ? (
                    <div className="text-center text-gray-400 dark:text-gray-600 py-20">
                      <div className="bg-gray-50 dark:bg-gray-800 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-10 h-10 text-gray-300 dark:text-gray-700" />
                      </div>
                      <p className="text-lg font-bold">Tu carrito está vacío</p>
                      <p className="text-sm mt-1">¡Agrega algo delicioso para empezar!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(c => (
                        <div key={c.menuItem.id} className="flex flex-col gap-3 bg-white dark:bg-gray-800 p-4 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                          <div className="flex gap-4 items-center">
                            <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                              <img src={c.menuItem.image} alt={c.menuItem.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-gray-900 dark:text-white truncate pr-6">{c.menuItem.name}</h4>
                              <p className="text-tuplato font-black text-lg">${(c.menuItem.price * c.quantity).toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-2xl p-1">
                              <button onClick={() => updateQuantity(c.menuItem.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded-xl shadow-sm text-gray-600 dark:text-gray-300 hover:text-tuplato transition-all active:scale-90">
                                <Plus className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-black w-6 text-center dark:text-white py-1">{c.quantity}</span>
                              <button onClick={() => updateQuantity(c.menuItem.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded-xl shadow-sm text-gray-600 dark:text-gray-300 hover:text-red-500 transition-all active:scale-90">
                                <Minus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Notas especiales (sin cebolla, extra salsa...)"
                              value={c.notes || ''}
                              onChange={(e) => updateNotes(c.menuItem.id, e.target.value)}
                              className="w-full text-xs p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-tuplato/20 outline-none transition-all"
                            />
                          </div>
                          <button 
                            onClick={() => removeFromCart(c.menuItem.id)}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {checkoutStep === 1 && (
                  <div className="space-y-6">
                    <div className="bg-tuplato/5 p-6 rounded-[2rem] border border-tuplato/10">
                      <p className="text-sm text-tuplato font-bold leading-relaxed">
                        Necesitamos tus datos básicos para procesar el pedido y que ganes tus puntos de recompensa.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-2">Nombre</label>
                          <input 
                            type="text" 
                            value={customerInfo.firstName} 
                            onChange={e => setCustomerInfo({...customerInfo, firstName: e.target.value})} 
                            className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-tuplato/10 focus:border-tuplato outline-none transition-all" 
                            placeholder="Tu nombre" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-2">Apellido</label>
                          <input 
                            type="text" 
                            value={customerInfo.lastName} 
                            onChange={e => setCustomerInfo({...customerInfo, lastName: e.target.value})} 
                            className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-tuplato/10 focus:border-tuplato outline-none transition-all" 
                            placeholder="Tu apellido" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-2">Cédula / ID</label>
                        <input 
                          type="text" 
                          value={customerInfo.documentId} 
                          onChange={e => setCustomerInfo({...customerInfo, documentId: e.target.value})} 
                          className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-tuplato/10 focus:border-tuplato outline-none transition-all" 
                          placeholder="Número de documento" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-2">Teléfono de Contacto</label>
                        <input 
                          type="tel" 
                          value={customerInfo.phone} 
                          onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} 
                          className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-tuplato/10 focus:border-tuplato outline-none transition-all" 
                          placeholder="Tu número de celular" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {checkoutStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-2">Zona de Entrega</label>
                      <div className="relative" ref={zoneDropdownRef}>
                        {!isZoneDropdownOpen ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsZoneDropdownOpen(true);
                              if (selectedZone) setZoneSearch('');
                            }}
                            className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-tuplato/10 focus:border-tuplato outline-none transition-all flex justify-between items-center"
                          >
                            {selectedZone ? (
                              <span className="block truncate pr-10">{selectedZone.name}</span>
                            ) : zoneSearch ? (
                              <span className="block truncate pr-10">{zoneSearch}</span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 block truncate pr-10">¿Dónde te lo llevamos?</span>
                            )}
                            <ChevronRight className={`w-5 h-5 transition-transform ${isZoneDropdownOpen ? 'rotate-90' : ''}`} />
                          </button>
                        ) : (
                          <input
                            type="text"
                            autoFocus
                            value={zoneSearch}
                            onChange={(e) => {
                              setZoneSearch(e.target.value);
                              if (selectedZoneId) setSelectedZoneId(''); 
                            }}
                            placeholder="Buscar tu barrio o zona..."
                            className="w-full p-4 rounded-2xl border border-tuplato dark:border-tuplato bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-tuplato/10 outline-none transition-all shadow-xl"
                          />
                        )}
                        {isZoneDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto no-scrollbar"
                          >
                            {filteredZones.length > 0 ? (
                              filteredZones.map(zone => (
                                <button
                                  key={zone.id}
                                  onClick={() => {
                                    setSelectedZoneId(zone.id);
                                    setZoneSearch(zone.name);
                                    setIsZoneDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-5 py-4 hover:bg-tuplato/5 dark:hover:bg-tuplato/10 flex justify-between items-center border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors"
                                >
                                  <span className="font-bold text-gray-900 dark:text-white">{zone.name}</span>
                                  <span className="text-sm font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-lg">+${zone.price.toFixed(2)}</span>
                                </button>
                              ))
                            ) : (
                              <div className="p-8 text-center text-gray-400 dark:text-gray-600">
                                <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm font-bold">No encontramos esa zona</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                        {selectedZone && !isZoneDropdownOpen && (
                          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-400 font-black text-sm pointer-events-none bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg">
                            +${selectedZone.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-2">Dirección Exacta</label>
                      <textarea 
                        rows={3} 
                        value={locationInfo.address} 
                        onChange={e => setLocationInfo({...locationInfo, address: e.target.value})} 
                        className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-tuplato/10 focus:border-tuplato outline-none resize-none transition-all" 
                        placeholder="Ej: Calle 123, Casa 4. Referencia: Frente al parque." 
                      />
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                  {checkoutStep === 0 && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Subtotal de productos</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">Sin incluir delivery</p>
                        </div>
                        <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">${totalPrice.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => setCheckoutStep(1)}
                        className="w-full bg-tuplato text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-tuplato/30 hover:bg-tuplato-dark hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Continuar Pedido
                      </button>
                    </div>
                  )}
                  
                  {checkoutStep === 1 && (
                    <button 
                      onClick={() => setCheckoutStep(2)}
                      disabled={!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone}
                      className="w-full bg-tuplato text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-tuplato/30 hover:bg-tuplato-dark hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente Paso
                    </button>
                  )}

                  {checkoutStep === 2 && (
                    <button 
                      onClick={() => setCheckoutStep(3)}
                      disabled={!locationInfo.address || !selectedZoneId}
                      className="w-full bg-tuplato text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-tuplato/30 hover:bg-tuplato-dark hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente Paso
                    </button>
                  )}

                  {checkoutStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 ml-2">
                        <button onClick={() => setCheckoutStep(2)} className="p-2 -ml-2">
                          <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                        </button>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Facturación</h2>
                      </div>
                      
                      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-5">
                        <h3 className="font-black text-gray-900 dark:text-white text-lg">Resumen de tu pedido</h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Productos</p>
                            <div className="space-y-3">
                              {cart.map((c) => (
                                <div key={c.menuItem.id} className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                  <div className="flex justify-between">
                                    <span>{c.quantity}x {c.menuItem.name}</span>
                                  </div>
                                  {c.notes && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">
                                      {c.notes}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-xl h-fit">
                              <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entrega en {selectedZone?.name || '...'}</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{locationInfo.address}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-5 border-t border-gray-200 dark:border-gray-700 space-y-3">
                          <div className="flex justify-between items-center text-sm font-bold text-gray-500 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span>${totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-bold text-gray-500 dark:text-gray-400">
                            <span>Envío</span>
                            <span className="text-green-600 dark:text-green-400">
                              {selectedZone ? `+$${selectedZone.price.toFixed(2)}` : '$0.00'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="font-black text-xl text-gray-900 dark:text-white">Total</span>
                            <span className="font-black text-3xl text-gray-900 dark:text-white tracking-tighter">
                              ${(totalPrice + (selectedZone?.price || 0)).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl">
                            <span className="font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Bs.</span>
                            <span className="font-black text-xl text-gray-900 dark:text-white">
                              Bs. {((totalPrice + (selectedZone?.price || 0)) * exchangeRate).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={handleFinishOrder}
                        disabled={!locationInfo.address || !selectedZoneId}
                        className="w-full bg-green-800 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-green-900 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        <Phone className="w-5 h-5" />
                        Pedir por WhatsApp
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
